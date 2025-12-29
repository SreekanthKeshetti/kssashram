// const express = require("express");
// const router = express.Router();
// const { getSystemLogs } = require("../controllers/auditController");
// const { protect, admin } = require("../middleware/authMiddleware");

// // Only Admin can see the full system trail
// router.get("/system", protect, admin, getSystemLogs);

// module.exports = router;
const express = require("express");
const router = express.Router();
// Import getSystemLogs from the controller
const { getSystemLogs } = require("../controllers/auditController");
const { protect, admin } = require("../middleware/authMiddleware");

// Check if getSystemLogs is undefined (Common error)
if (!getSystemLogs) {
  console.error(
    "Error: getSystemLogs function is missing in auditController export!"
  );
}

router.get("/system", protect, admin, getSystemLogs);

module.exports = router;
