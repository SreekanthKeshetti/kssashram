// const mongoose = require("mongoose");

// const auditLogSchema = mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     userName: { type: String }, // Store name snapshot in case user is deleted later

//     action: {
//       type: String,
//       required: true,
//       enum: ["CREATE", "UPDATE", "DELETE", "LOGIN", "APPROVE", "REJECT"],
//     },

//     module: {
//       type: String,
//       required: true,
//     }, // e.g., "Donation", "Inventory", "Student"

//     recordId: { type: String }, // The ID of the item changed

//     details: { type: String }, // Description of change (e.g., "Changed Stock from 50 to 45")

//     ipAddress: { type: String }, // Optional security feature
//   },
//   {
//     timestamps: true, // Automatically captures Date & Time
//   }
// );

// module.exports = mongoose.model("AuditLog", auditLogSchema);
const mongoose = require("mongoose");

const auditLogSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String },
    action: { type: String, required: true },
    module: { type: String, required: true },
    recordId: { type: String },
    details: { type: String },
    ipAddress: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
