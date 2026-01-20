const express = require("express");
const router = express.Router();
const {
  getOccasions,
  createOccasion,
  deleteOccasion,
} = require("../controllers/occasionController");
const { protect, admin } = require("../middleware/authMiddleware");

// Anyone logged in can VIEW, but only Admin/Staff can ADD/DELETE
router.route("/").get(protect, getOccasions).post(protect, createOccasion);
router.route("/:id").delete(protect, deleteOccasion);

module.exports = router;
