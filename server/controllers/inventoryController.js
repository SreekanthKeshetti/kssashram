const Inventory = require("../models/Inventory");
const { logAudit } = require("../utils/auditLogger"); // <--- Import

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

// @desc    Add new item or Update stock
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
    } = req.body;

    // Check if item exists in that branch
    const existingItem = await Inventory.findOne({
      itemName,
      branch: branch || "Headquarters",
    });

    if (existingItem) {
      // If item exists, just update the quantity (KSS_INV_4)
      existingItem.quantity += Number(quantity);
      existingItem.lastUpdatedBy = req.user._id;
      await existingItem.save();
      // --- LOG UPDATE ---
      await logAudit(
        req,
        "UPDATE",
        "Inventory",
        existingItem._id,
        `Updated ${itemName}: Changed Qty from ${oldQty} to ${existingItem.quantity}`
      );
      return res.status(200).json(existingItem);
    }

    // Create new item
    const newItem = await Inventory.create({
      itemName,
      category,
      isPerishable,
      expiryDate,
      quantity,
      unit,
      branch: branch || "Headquarters",
      lastUpdatedBy: req.user._id,
    });
    await logAudit(
      req,
      "CREATE",
      "Inventory",
      newItem._id,
      `Added new item: ${itemName} (${quantity} ${unit})`
    );

    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getInventory, addInventoryItem };
