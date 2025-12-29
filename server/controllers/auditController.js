const Inventory = require("../models/Inventory");
const InventoryAudit = require("../models/InventoryAudit");
const AuditLog = require("../models/AuditLog"); // <--- MAKE SURE THIS IS HERE

// ==========================================
// 1. INVENTORY RECONCILIATION FUNCTIONS
// ==========================================

// @desc    Create Stock Audit & Adjust Inventory
// @route   POST /api/inventory/audit
const createAudit = async (req, res) => {
  try {
    const { items, branch } = req.body;

    const audit = await InventoryAudit.create({
      items: items.map((i) => ({
        inventoryItem: i.itemId,
        itemName: i.itemName,
        systemQty: i.systemQty,
        physicalQty: i.physicalQty,
        difference: i.physicalQty - i.systemQty,
        remark: i.remark,
      })),
      branch: branch || "Headquarters",
      auditedBy: req.user._id,
    });

    for (const item of items) {
      if (item.systemQty !== item.physicalQty) {
        await Inventory.findByIdAndUpdate(item.itemId, {
          quantity: item.physicalQty,
          lastUpdatedBy: req.user._id,
        });
      }
    }

    res.status(201).json({ message: "Audit saved", audit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Past Inventory Audits
// @route   GET /api/inventory/audit
const getAudits = async (req, res) => {
  try {
    const audits = await InventoryAudit.find({})
      .populate("auditedBy", "name")
      .sort({ createdAt: -1 });
    res.json(audits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Inventory Audit
// @route   DELETE /api/inventory/audit/:id
const deleteAudit = async (req, res) => {
  try {
    const audit = await InventoryAudit.findById(req.params.id);
    if (!audit)
      return res.status(404).json({ message: "Audit record not found" });
    await InventoryAudit.findByIdAndDelete(req.params.id);
    res.json({ message: "Audit record removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 2. SYSTEM AUDIT TRAIL FUNCTIONS (KSS_GEN_7)
// ==========================================

// @desc    Get System-wide Audit Logs
// @route   GET /api/audit/system
const getSystemLogs = async (req, res) => {
  try {
    // Ensure AuditLog model is imported correctly at the top
    const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching system logs:", error); // Log error to terminal
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Export ALL functions
module.exports = { createAudit, getAudits, deleteAudit, getSystemLogs };
