const mongoose = require("mongoose");

const auditSchema = mongoose.Schema(
  {
    auditDate: { type: Date, default: Date.now },

    items: [
      {
        inventoryItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
        },
        itemName: String,
        systemQty: Number, // What the software thought we had
        physicalQty: Number, // What we actually counted
        difference: Number, // Physical - System
        remark: String, // Reason (e.g., "Spoiled", "Theft", "Data Entry Error")
      },
    ],

    branch: { type: String, default: "Headquarters" },
    auditedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("InventoryAudit", auditSchema);
