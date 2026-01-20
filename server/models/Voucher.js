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
    // NEW: Recipient Name (Who received the money?)
    recipientName: { type: String },
    paymentMode: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Cheque", "DD", "UPI"],
      default: "Cash",
    },
    // NEW: Detailed Payment Info
    paymentDetails: {
      chequeNo: String,
      chequeDate: Date,
      bankName: String,
      transactionId: String, // For RTGS/UPI
    },
    // UPDATED: Approval Hierarchy (Level 1 -> Level 2)
    // Level 1: Secretary OR President
    // Level 2: Treasurer
    approvals: {
      level1: {
        approver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: Date,
        status: {
          type: String,
          enum: ["Pending", "Approved", "Rejected"],
          default: "Pending",
        },
      },
      level2: {
        approver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: Date,
        status: {
          type: String,
          enum: ["Pending", "Approved", "Rejected"],
          default: "Pending",
        },
      },
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
  },
);

module.exports = mongoose.model("Voucher", voucherSchema);
