const express = require("express");
const router = express.Router();
const {
  getSchemes,
  createScheme,
  deleteScheme,
} = require("../controllers/schemeController");
const { protect, admin, staff } = require("../middleware/authMiddleware");

router
  .route("/")
  .get(getSchemes) // Public/Employees can view
  .post(protect, staff, createScheme); // Only Admin can add

router.route("/:id").delete(protect, staff, deleteScheme); // Only Admin can delete

module.exports = router;
