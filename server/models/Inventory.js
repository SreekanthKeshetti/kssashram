const mongoose = require("mongoose");

const inventorySchema = mongoose.Schema(
  {
    itemName: { type: String, required: true },

    category: {
      type: String,
      enum: ["Food", "Non-Food", "Medical", "General"],
      required: true,
    }, // KSS_INV_1, KSS_INV_2

    isPerishable: { type: Boolean, default: false }, // KSS_INV_3 (Track perishables)
    expiryDate: { type: Date }, // Only for perishable items

    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true }, // e.g., kg, liters, pieces, bags

    minStockLevel: { type: Number, default: 10 }, // Alert when stock is low

    branch: { type: String, required: true, default: "Headquarters" },

    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // --- NEW: Stock History (Ledger) ---
    stockHistory: [
      {
        date: { type: Date, default: Date.now },
        changeType: {
          type: String,
          enum: ["Purchase", "Donation", "Adjustment", "Initial"],
        },
        quantityChange: Number, // Amount added
        vendor: String, // e.g., "Ratnadeep Supermarket" or "Donor Name"
        unitCost: Number, // Cost per kg/unit
        totalCost: Number, // Total Bill Amount
        invoiceNo: String, // Bill Number
        remarks: String,
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    // -----------------------------------
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inventory", inventorySchema);
