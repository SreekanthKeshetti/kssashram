const mongoose = require("mongoose");

const voucherSchema = mongoose.Schema(
  {
    voucherType: {
      type: String,
      enum: ["Debit", "Credit", "Journal"],
      required: true,
    },
    voucherNo: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },

    ledgerName: { type: String, required: true }, // e.g., "Vegetables", "Salary"
    amount: { type: Number, required: true },
    description: { type: String },

    paymentMode: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Cheque", "UPI"],
      default: "Cash",
    },

    // Approval Workflow
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    branch: { type: String, default: "Headquarters" },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Voucher", voucherSchema);
