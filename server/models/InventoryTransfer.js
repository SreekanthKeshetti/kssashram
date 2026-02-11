const mongoose = require("mongoose");

const transferSchema = mongoose.Schema(
  {
    transferNo: { type: String, required: true, unique: true }, // e.g., SLIP-1001

    // Movement Details
    fromBranch: { type: String, required: true }, // Usually "Headquarters"
    toBranch: { type: String, required: true }, // KSA or KBA

    // The Goods List
    items: [
      {
        itemName: String, // e.g., "Sona Masoori Rice"
        quantity: Number, // e.g., 50
        unit: String, // e.g., kg
      },
    ],

    // Workflow
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Warden KSS
    issuedDate: { type: Date, default: Date.now },

    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Warden KSA/KBA
    receivedDate: { type: Date },

    status: {
      type: String,
      enum: ["In-Transit", "Received", "Cancelled"],
      default: "In-Transit",
    },

    remarks: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("InventoryTransfer", transferSchema);
