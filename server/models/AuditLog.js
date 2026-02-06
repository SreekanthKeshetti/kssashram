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
  },
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
