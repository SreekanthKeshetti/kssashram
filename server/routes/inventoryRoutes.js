// const express = require("express");
// const router = express.Router();
// const {
//   getInventory,
//   addInventoryItem,
// } = require("../controllers/inventoryController");
// const { protect } = require("../middleware/authMiddleware");

// router.route("/").get(protect, getInventory).post(protect, addInventoryItem);

// module.exports = router;
const express = require("express");
const router = express.Router();
const {
  getInventory,
  addInventoryItem,
} = require("../controllers/inventoryController");
// Import the new controller functions
const {
  createAudit,
  getAudits,
  deleteAudit,
} = require("../controllers/auditController"); // Import deleteAudit
const { protect, admin } = require("../middleware/authMiddleware"); // Import admin middleware
// Existing Routes
router.route("/").get(protect, getInventory).post(protect, addInventoryItem);

// --- NEW AUDIT ROUTES ---
router
  .route("/audit")
  .post(protect, createAudit) // Submit Audit
  .get(protect, getAudits); // View History

router.delete("/audit/:id", protect, admin, deleteAudit);

module.exports = router;
