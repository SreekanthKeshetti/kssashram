const AuditLog = require("../models/AuditLog");

const logAudit = async (req, action, module, recordId, details) => {
  try {
    // If no user is logged in (e.g. public donation), we log as 'System' or 'Guest'
    const userId = req.user ? req.user._id : null;
    const userName = req.user ? req.user.name : "Guest/System";
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    await AuditLog.create({
      user: userId, // Might be null for public actions
      userName: userName,
      action,
      module,
      recordId: recordId ? recordId.toString() : null,
      details,
      ipAddress: ip,
    });

    console.log(`[AUDIT] ${action} on ${module} by ${userName}`);
  } catch (error) {
    console.error("Audit Log Failed:", error.message);
    // We don't stop the main process if logging fails
  }
};

module.exports = { logAudit };
