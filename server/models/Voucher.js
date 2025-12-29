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

    accountHead: { type: String, ref: "AccountHead", required: true }, // e.g., "Vegetables", "Salary"
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
      enum: ["Pending", "Partially Approved", "Approved", "Rejected"],
      default: "Pending",
    },

    preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // Committee members who approved it (Array allows multiple signatures)
    approvedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    branch: { type: String, default: "Headquarters" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Voucher", voucherSchema);
