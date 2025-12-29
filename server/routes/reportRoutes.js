const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/reportController");
const { protect, staff } = require("../middleware/authMiddleware");

// Only Staff (Admin/Manager) can see reports
router.get("/stats", protect, staff, getDashboardStats);

module.exports = router;
