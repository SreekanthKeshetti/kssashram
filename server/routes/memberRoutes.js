const express = require("express");
const router = express.Router();
const { getMembers, createMember } = require("../controllers/memberController");
const { protect, staff } = require("../middleware/authMiddleware");

router
  .route("/")
  .get(protect, staff, getMembers)
  .post(protect, staff, createMember);

module.exports = router;
