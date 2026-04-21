const Inventory = require("../models/Inventory");
const InventoryTransfer = require("../models/InventoryTransfer");
const { logAudit } = require("../utils/auditLogger");

// Helper to check if a user is allowed to manage a specific category
const hasCategoryPermission = (userRole, itemCategory) => {
  if (userRole === "admin" || userRole === "president") return true;
  if (userRole === "warden_food" && itemCategory === "Food") return true;
  if (userRole === "warden_nonfood" && itemCategory !== "Food") return true; // Non-Food, Medical, General
  return false;
};

// @desc    Get all inventory items (Filtered by Branch)
const getInventory = async (req, res) => {
  try {
    let query = {};

    // Role-based filtering
    if (req.user.role === "kba_manager") query.branch = "Karunya Bharathi";
    else if (req.user.role === "ksa_manager") query.branch = "Karunya Sindhu";
    // Admin/KarunaSri Seva Samithi can see everything, or filter by query param
    else if (req.query.branch) query.branch = req.query.branch;

    const items = await Inventory.find(query)
      .populate("stockHistory.addedBy", "name")
      .sort({ itemName: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add/Update Stock (Procurement/Donation)
const addInventoryItem = async (req, res) => {
  try {
    const {
      itemName,
      category,
      isPerishable,
      expiryDate,
      quantity,
      unit,
      branch,
      sourceType,
      vendor,
      unitCost,
      totalCost,
      invoiceNo,
      donorPhone,
      donorAddress,
    } = req.body;
    // --- NEW: SECURITY CHECK ---
    if (!hasCategoryPermission(req.user.role, category)) {
      return res.status(403).json({
        message: `Access Denied: You are not authorized to manage ${category} items.`,
      });
    }

    let finalBranch = "KarunaSri Seva Samithi";
    if (req.user.role === "kba_manager") finalBranch = "Karunya Bharathi";
    else if (req.user.role === "ksa_manager") finalBranch = "Karunya Sindhu";
    else finalBranch = branch || "KarunaSri Seva Samithi";

    const qtyNum = Number(quantity);

    // Ledger Entry
    const historyEntry = {
      changeType: sourceType || "Adjustment",
      quantityChange: qtyNum,
      vendor: vendor || "",
      unitCost: Number(unitCost) || 0,
      totalCost: Number(totalCost) || 0,
      invoiceNo: invoiceNo || "",
      donorPhone: donorPhone || "", // <--- Save Phone
      donorAddress: donorAddress || "", // <--- Save Address
      addedBy: req.user._id,
      date: new Date(),
    };

    let item = await Inventory.findOne({ itemName, branch: finalBranch });

    if (item) {
      item.quantity += qtyNum;
      item.lastUpdatedBy = req.user._id;
      if (expiryDate) item.expiryDate = expiryDate;
      if (!item.stockHistory) item.stockHistory = [];
      item.stockHistory.push(historyEntry);
      await item.save();
    } else {
      item = await Inventory.create({
        itemName,
        category,
        isPerishable,
        expiryDate,
        quantity: qtyNum,
        unit,
        branch: finalBranch,
        lastUpdatedBy: req.user._id,
        stockHistory: [{ ...historyEntry, changeType: "Initial" }],
      });
    }

    await logAudit(
      req,
      "UPDATE",
      "Inventory",
      item._id,
      `Added ${qtyNum} ${unit} to ${itemName}`,
    );
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// =========================================================
// 3. NEW: ISSUE STOCK (CREATE SLIP & DEDUCT FROM HUB)
// =========================================================
const issueStock = async (req, res) => {
  try {
    const { items, toBranch, remarks } = req.body; // items = [{ itemName, quantity, unit }]
    const fromBranch = req.user.branch || "KarunaSri Seva Samithi";

    // 1. Validate & Deduct Stock from Sender
    for (const i of items) {
      const stockItem = await Inventory.findOne({
        itemName: i.itemName,
        branch: fromBranch,
      });

      if (!stockItem || stockItem.quantity < i.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${i.itemName}` });
      }
      // --- NEW: SECURITY CHECK ---
      if (!hasCategoryPermission(req.user.role, stockItem.category)) {
        return res.status(403).json({
          message: `Access Denied: You cannot issue ${stockItem.category} items.`,
        });
      }

      stockItem.quantity -= Number(i.quantity);
      stockItem.stockHistory.push({
        changeType: "Issue",
        quantityChange: -Number(i.quantity),
        remarks: `Issued to ${toBranch}`,
        addedBy: req.user._id,
        date: new Date(),
      });
      await stockItem.save();
    }

    // 2. Create Transfer Slip
    const transferNo = "SLIP-" + Date.now().toString().slice(-6);
    const transfer = await InventoryTransfer.create({
      transferNo,
      fromBranch,
      toBranch,
      items,
      issuedBy: req.user._id,
      status: "In-Transit",
      remarks,
    });

    await logAudit(
      req,
      "CREATE",
      "InventoryTransfer",
      transfer._id,
      `Issued Slip ${transferNo} to ${toBranch}`,
    );
    res.status(201).json(transfer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================================
// 4. NEW: RECEIVE STOCK (CLOSE SLIP & ADD TO BRANCH)
// =========================================================
const receiveStock = async (req, res) => {
  try {
    const { transferId, remarks } = req.body;
    const transfer = await InventoryTransfer.findById(transferId);

    if (!transfer) return res.status(404).json({ message: "Slip not found" });
    if (transfer.status === "Received")
      return res.status(400).json({ message: "Already received" });

    // 1. Add Stock to Receiver (Branch)
    const receiverBranch = transfer.toBranch;

    for (const i of transfer.items) {
      let item = await Inventory.findOne({
        itemName: i.itemName,
        branch: receiverBranch,
      });
      // --- NEW: SECURITY CHECK ---
      // Note: If item doesn't exist yet, we check the category from the slip (assuming it's passed or we fetch it).
      // To be safe, let's look up the Hub's item category if it's a new item.
      let itemCategory = item ? item.category : "General";
      if (!item) {
        const hubItem = await Inventory.findOne({
          itemName: i.itemName,
          branch: transfer.fromBranch,
        });
        if (hubItem) itemCategory = hubItem.category;
      }

      if (!hasCategoryPermission(req.user.role, itemCategory)) {
        return res.status(403).json({
          message: `Access Denied: You cannot receive ${itemCategory} items.`,
        });
      }

      const historyEntry = {
        changeType: "Transfer-In",
        quantityChange: i.quantity,
        remarks: `Received from ${transfer.fromBranch} (Slip: ${transfer.transferNo})`,
        addedBy: req.user._id,
        date: new Date(),
      };

      if (item) {
        item.quantity += i.quantity;
        item.stockHistory.push(historyEntry);
        await item.save();
      } else {
        // Auto-create item in branch if it doesn't exist
        // Need to fetch category/unit from Hub item or use defaults
        // Simplified: defaulting category to General if not found is risky,
        // ideally we fetch the Hub item details. For now, assuming similar structure.
        await Inventory.create({
          itemName: i.itemName,
          category: "General", // Placeholder, ideally look up master list
          quantity: i.quantity,
          unit: i.unit,
          branch: receiverBranch,
          stockHistory: [historyEntry],
        });
      }
    }

    // 2. Update Slip Status
    transfer.status = "Received";
    transfer.receivedBy = req.user._id;
    transfer.receivedDate = Date.now();
    if (remarks) transfer.remarks += ` | Receiver Note: ${remarks}`;

    await transfer.save();

    await logAudit(
      req,
      "UPDATE",
      "InventoryTransfer",
      transfer._id,
      `Received Stock Slip ${transfer.transferNo}`,
    );
    res.json({ message: "Stock Received Successfully", transfer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================================
// 5. GET TRANSFERS (SLIPS)
// =========================================================
const getTransfers = async (req, res) => {
  try {
    let query = {};
    // If Branch Manager, show slips where they are Sender OR Receiver
    if (req.user.role === "kba_manager") {
      query.$or = [
        { fromBranch: "Karunya Bharathi" },
        { toBranch: "Karunya Bharathi" },
      ];
    } else if (req.user.role === "ksa_manager") {
      query.$or = [
        { fromBranch: "Karunya Sindhu" },
        { toBranch: "Karunya Sindhu" },
      ];
    }
    // Admin sees all

    const transfers = await InventoryTransfer.find(query)
      .populate("issuedBy", "name")
      .populate("receivedBy", "name")
      .sort({ createdAt: -1 });

    res.json(transfers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================================
// 6. NEW: RECORD CONSUMPTION (DAILY USAGE)
// =========================================================
const consumeStock = async (req, res) => {
  try {
    const { itemId, quantity, reason } = req.body;

    // 1. Find Item
    const item = await Inventory.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });
    // --- NEW: SECURITY CHECK ---
    if (!hasCategoryPermission(req.user.role, item.category)) {
      return res
        .status(403)
        .json({
          message: `Access Denied: You cannot consume ${item.category} items.`,
        });
    }

    if (item.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock to consume" });
    }

    // 2. Deduct Stock
    item.quantity -= Number(quantity);

    // 3. Update Ledger
    item.stockHistory.push({
      changeType: "Consumption", // Special type for reports
      quantityChange: -Number(quantity),
      remarks: reason || "Daily Usage",
      addedBy: req.user._id,
      date: new Date(),
    });

    await item.save();

    await logAudit(
      req,
      "UPDATE",
      "Inventory",
      item._id,
      `Consumed ${quantity} ${item.unit} of ${item.itemName}`,
    );
    res.json({ message: "Consumption Recorded", item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================================
// 7. NEW: GENERATE STOCK ANALYSIS REPORT (The "Analyser")
// =========================================================
const getInventoryReport = async (req, res) => {
  try {
    const { startDate, endDate, branch } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Date range required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of day

    // Filter by Branch
    let query = {};
    if (branch) query.branch = branch;
    // Security: Managers can only see their branch
    if (req.user.role === "kba_manager") query.branch = "Karunya Bharathi";
    if (req.user.role === "ksa_manager") query.branch = "Karunya Sindhu";

    const items = await Inventory.find(query);

    const report = items.map((item) => {
      let openingBalance = 0;
      let inward = 0; // Purchase, Donation, Transfer-In
      let outward = 0; // Issue, Consumption

      // We must calculate based on History Logs
      // Note: This relies on the 'Initial' entry being in history.

      // 1. Sort History Chronologically
      const sortedHistory = item.stockHistory.sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      );

      sortedHistory.forEach((log) => {
        const logDate = new Date(log.date);
        const qty = log.quantityChange;

        // A. Before Start Date -> Opening Balance
        if (logDate < start) {
          openingBalance += qty;
        }
        // B. During Period -> Inward / Outward
        else if (logDate >= start && logDate <= end) {
          if (qty > 0) {
            inward += qty; // Purchases, Receipts, Returns
          } else {
            outward += Math.abs(qty); // Issues, Consumption
          }
        }
      });

      const closingBalance = openingBalance + inward - outward;

      return {
        _id: item._id,
        itemName: item.itemName,
        unit: item.unit,
        category: item.category,
        openingBalance,
        inward,
        outward,
        closingBalance,
        // Optional: Send current actual qty to cross-verify
        systemQty: item.quantity,
      };
    });

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Don't forget to export them!
module.exports = {
  getInventory,
  addInventoryItem,
  issueStock,
  receiveStock,
  getTransfers,
  consumeStock, // <--- New
  getInventoryReport, // <--- New
};
