const Inventory = require("../models/Inventory");
const { logAudit } = require("../utils/auditLogger");

// @desc    Get all inventory items
// @route   GET /api/inventory
const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find({}).sort({ itemName: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new item or Update stock (With History & Cost Tracking)
// @route   POST /api/inventory
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
      // --- NEW FIELDS (KSS_INV_7, 8) ---
      sourceType, // 'Purchase' or 'Donation'
      vendor, // Shop Name or Donor Name
      unitCost,
      totalCost,
      invoiceNo,
    } = req.body;

    const qtyNum = Number(quantity);

    // 1. Prepare History Object (The Ledger Entry)
    const historyEntry = {
      changeType: sourceType || "Adjustment",
      quantityChange: qtyNum,
      vendor: vendor || "",
      unitCost: Number(unitCost) || 0,
      totalCost: Number(totalCost) || 0,
      invoiceNo: invoiceNo || "",
      addedBy: req.user._id,
      date: new Date(),
    };

    // 2. Check if item exists in that branch
    let item = await Inventory.findOne({
      itemName,
      branch: branch || "Headquarters",
    });

    if (item) {
      // --- SCENARIO A: UPDATE EXISTING ITEM ---
      item.quantity += qtyNum;
      item.lastUpdatedBy = req.user._id;

      // Update expiry only if a date is provided (for new batch)
      if (expiryDate) item.expiryDate = expiryDate;

      // PUSH TO HISTORY ARRAY (This is the key update)
      if (!item.stockHistory) item.stockHistory = []; // Safety check
      item.stockHistory.push(historyEntry);

      await item.save();

      // Audit Log
      await logAudit(
        req,
        "UPDATE",
        "Inventory",
        item._id,
        `Added ${qtyNum} ${unit} to ${itemName} via ${
          sourceType || "Adjustment"
        }`
      );
      return res.status(200).json(item);
    }

    // --- SCENARIO B: CREATE NEW ITEM ---
    // --- SCENARIO B: CREATE NEW ITEM ---
    const newItem = await Inventory.create({
      itemName,
      category,
      isPerishable,
      expiryDate,
      quantity: qtyNum,
      unit,
      branch: branch || "Headquarters",
      lastUpdatedBy: req.user._id,
      // FIX HERE: Change "Initial Stock" to "Initial" matches the Model Enum
      stockHistory: [{ ...historyEntry, changeType: "Initial" }],
    });

    await logAudit(
      req,
      "CREATE",
      "Inventory",
      newItem._id,
      `Created Item: ${itemName} (${qtyNum} ${unit})`
    );

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Inventory Add Error:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getInventory, addInventoryItem };
