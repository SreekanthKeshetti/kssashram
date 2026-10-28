// const mongoose = require("mongoose");

// const transferSchema = mongoose.Schema(
//   {
//     transferNo: { type: String, required: true, unique: true }, // e.g., SLIP-1001

//     // Movement Details
//     fromBranch: { type: String, required: true }, // Usually "Headquarters"
//     toBranch: { type: String, required: true }, // KSA or KBA

//     // The Goods List
//     items: [
//       {
//         itemName: String, // e.g., "Sona Masoori Rice"
//         quantity: Number, // e.g., 50
//         unit: String, // e.g., kg
//       },
//     ],

//     // Workflow
//     issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Warden KSS
//     issuedDate: { type: Date, default: Date.now },

//     receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Warden KSA/KBA
//     receivedDate: { type: Date },

//     status: {
//       type: String,
//       enum: ["In-Transit", "Received", "Cancelled"],
//       default: "In-Transit",
//     },

//     remarks: String,
//   },
//   { timestamps: true },
// );

// module.exports = mongoose.model("InventoryTransfer", transferSchema);
const mongoose = require("mongoose");

const transferSchema = mongoose.Schema(
  {
    transferNo: { type: String, required: true, unique: true },

    fromBranch: { type: String, required: true },
    toBranch: { type: String, required: true },

    items: [
      {
        itemName: String,
        itemCode: String,
        quantity: Number,
        unit: String,
      },
    ],

    // --- NEW: 3-TIER APPROVAL FOR TRANSFERS ---
    approvals: {
      president: {
        status: {
          type: String,
          enum: ["Pending", "Approved", "Rejected"],
          default: "Pending",
        },
        date: Date,
      },
      secretary: {
        status: {
          type: String,
          enum: ["Pending", "Approved", "Rejected"],
          default: "Pending",
        },
        date: Date,
      },
      treasurer: {
        status: {
          type: String,
          enum: ["Pending", "Approved", "Rejected"],
          default: "Pending",
        },
        date: Date,
      },
    },

    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    issuedDate: { type: Date, default: Date.now },

    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receivedDate: { type: Date },

    status: {
      type: String,
      enum: ["Pending Approval", "In-Transit", "Received", "Cancelled"],
      default: "Pending Approval", // Changed default to require approval first
    },

    remarks: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("InventoryTransfer", transferSchema);
