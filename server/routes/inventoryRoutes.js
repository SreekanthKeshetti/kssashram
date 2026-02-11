const express = require("express");
const router = express.Router();
const {
  getInventory,
  addInventoryItem,
  issueStock, // <--- New
  receiveStock, // <--- New
  getTransfers, // <--- New
  consumeStock, // <--- Import
  getInventoryReport, // <--- Import
} = require("../controllers/inventoryController");

const {
  createAudit,
  getAudits,
  deleteAudit,
} = require("../controllers/auditController");
const { protect, admin, staff } = require("../middleware/authMiddleware");

// --- EXISTING ROUTES ---
router.route("/").get(protect, getInventory).post(protect, addInventoryItem);

// Report Route (Must be before :id routes to avoid conflict)
router.get("/report", protect, staff, getInventoryReport); // <--- New Report Route

// Consumption Route
router.post("/consume", protect, staff, consumeStock); // <--- New Consumption Route

// --- NEW TRANSFER ROUTES ---
router.post("/transfer/issue", protect, staff, issueStock); // Create Slip
router.put("/transfer/receive", protect, staff, receiveStock); // Close Slip
router.get("/transfer", protect, staff, getTransfers); // View Slips

// --- AUDIT ROUTES ---
router.route("/audit").post(protect, createAudit).get(protect, getAudits);

router.delete("/audit/:id", protect, admin, deleteAudit);

module.exports = router;
