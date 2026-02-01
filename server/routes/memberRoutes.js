const express = require("express");
const router = express.Router();
const {
  getMembers,
  createMember,
  addMemberActivity,
  getMemberById,
  downloadMemberForm,
  downloadBlankForm,
} = require("../controllers/memberController");
const { protect, staff } = require("../middleware/authMiddleware");

router
  .route("/")
  .get(protect, staff, getMembers)
  .post(protect, staff, createMember);
router.post("/:id/activity", protect, staff, addMemberActivity);
router.get("/blank-form", protect, staff, downloadBlankForm);
router.get("/:id", protect, staff, getMemberById);
router.get("/:id/download", protect, staff, downloadMemberForm);

module.exports = router;
