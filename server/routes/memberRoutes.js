const express = require("express");
const router = express.Router();
const {
  getMembers,
  createMember,
  addMemberActivity,
} = require("../controllers/memberController");
const { protect, staff } = require("../middleware/authMiddleware");

router
  .route("/")
  .get(protect, staff, getMembers)
  .post(protect, staff, createMember);
router.post("/:id/activity", protect, staff, addMemberActivity);

module.exports = router;
