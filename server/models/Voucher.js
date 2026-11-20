// const mongoose = require("mongoose");

// const voucherSchema = mongoose.Schema(
//   {
//     voucherType: {
//       type: String,
//       enum: ["Debit", "Credit", "Journal"],
//       required: true,
//     },
//     voucherNo: { type: String, required: true, unique: true },
//     date: { type: Date, default: Date.now },

//     accountHead: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "AccountHead",
//       required: true,
//     },
//     amount: { type: Number, required: true },
//     description: { type: String },

//     recipientName: { type: String },
//     paymentMode: {
//       type: String,
//       enum: ["Cash", "Bank Transfer", "Cheque", "DD", "UPI", "Bank Deduction"],
//       default: "Cash",
//     },

//     paymentDetails: {
//       chequeNo: String,
//       chequeDate: Date,
//       bankName: String,
//       transactionId: String,
//     },

//     // Approval Hierarchy
//     approvals: {
//       level1: {
//         approver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         date: Date,
//         status: {
//           type: String,
//           enum: ["Pending", "Approved", "Rejected"],
//           default: "Pending",
//         },
//       },
//       level2: {
//         approver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         date: Date,
//         status: {
//           type: String,
//           enum: ["Pending", "Approved", "Rejected"],
//           default: "Pending",
//         },
//       },
//     },

//     // Voucher Status
//     status: {
//       type: String,
//       enum: [
//         "Pending",
//         "Partially Approved",
//         "Approved",
//         "Rejected",
//         "Cancelled",
//       ],
//       default: "Pending",
//     },

//     // Supporting Bills / Invoices (Cloudinary URLs)
//     attachments: [
//       {
//         type: String,
//       },
//     ],

//     cancellationReason: { type: String },
//     cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

//     preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     approvedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     branch: { type: String, default: "KarunaSri Seva Samithi" },
//   },
//   {
//     timestamps: true,
//   },
// );

// module.exports = mongoose.model("Voucher", voucherSchema);
const mongoose = require("mongoose");

const voucherSchema = mongoose.Schema(
  {
    voucherType: {
      type: String,
      enum: ["Debit", "Credit", "Journal"],
      required: true,
    },
    // Subtype formally distinguishes operational petty cash floats from standard ledger entries
    voucherSubtype: {
      type: String,
      enum: ["Standard", "Petty_Cash_Disbursement"],
      default: "Standard",
    },
    voucherNo: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },

    accountHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountHead",
      required: true,
    },
    amount: { type: Number, required: true },
    description: { type: String },

    recipientName: { type: String },
    paymentMode: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Cheque", "DD", "UPI", "Bank Deduction"],
      default: "Cash",
    },

    paymentDetails: {
      chequeNo: String,
      chequeDate: Date,
      bankName: String,
      transactionId: String,
    },

    // Approval Hierarchy
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

    // Voucher Status
    status: {
      type: String,
      enum: [
        "Pending",
        "Partially Approved",
        "Approved",
        "Rejected",
        "Cancelled",
      ],
      default: "Pending",
    },

    // Supporting Bills / Invoices (Cloudinary URLs)
    attachments: [
      {
        type: String,
      },
    ],

    cancellationReason: { type: String },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    branch: { type: String, default: "KarunaSri Seva Samithi" },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Voucher", voucherSchema);