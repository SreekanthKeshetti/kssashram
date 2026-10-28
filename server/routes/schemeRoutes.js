// const express = require("express");
// const router = express.Router();
// const {
//   getSchemes,
//   createScheme,
//   deleteScheme,
// } = require("../controllers/schemeController");
// const { protect, admin, staff } = require("../middleware/authMiddleware");

// router
//   .route("/")
//   .get(getSchemes) // Public/Employees can view
//   .post(protect, staff, createScheme); // Only Admin can add

// router.route("/:id").delete(protect, staff, deleteScheme); // Only Admin can delete

// module.exports = router;
const express = require("express");
const router = express.Router();
const {
  getSchemes,
  createScheme,
  updateScheme, // <--- New Import
  deleteScheme,
} = require("../controllers/schemeController");
const { protect, staff } = require("../middleware/authMiddleware");

router.route("/").get(getSchemes).post(protect, staff, createScheme);

// --- Added PUT route for editing ---
router
  .route("/:id")
  .put(protect, staff, updateScheme)
  .delete(protect, staff, deleteScheme);

module.exports = router;
