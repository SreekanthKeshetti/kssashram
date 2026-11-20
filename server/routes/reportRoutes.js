// const express = require("express");
// const router = express.Router();
// const {
//   getDashboardStats,
//   getCustomFinanceReport,
//   getLedgerReport,
// } = require("../controllers/reportController");
// const { protect, staff } = require("../middleware/authMiddleware");

// // Only Staff (Admin/Manager) can see reports
// router.get("/stats", protect, staff, getDashboardStats);
// // NEW: Custom Report Route
// router.get("/custom", protect, staff, getCustomFinanceReport);
// router.get("/ledger", protect, staff, getLedgerReport); // <--- New Route

// module.exports = router;
const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getDailyClosingSummary,
  getCustomFinanceReport,
  getLedgerReport,
} = require("../controllers/reportController");
const { protect, staff } = require("../middleware/authMiddleware");

// Dashboard KPIs
router.get("/stats", protect, staff, getDashboardStats);

// NEW: Daily Settlement / Day-Close Summary
router.get("/daily-closing", protect, staff, getDailyClosingSummary);

// Financial Reports
router.get("/custom", protect, staff, getCustomFinanceReport);
router.get("/ledger", protect, staff, getLedgerReport);

module.exports = router;