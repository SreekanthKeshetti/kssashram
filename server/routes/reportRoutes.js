const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getCustomFinanceReport,
} = require("../controllers/reportController");
const { protect, staff } = require("../middleware/authMiddleware");

// Only Staff (Admin/Manager) can see reports
router.get("/stats", protect, staff, getDashboardStats);
// NEW: Custom Report Route
router.get("/custom", protect, staff, getCustomFinanceReport);
module.exports = router;
