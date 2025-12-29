const express = require("express");
const router = express.Router();
const AccountHead = require("../models/AccountHead");
const { protect } = require("../middleware/authMiddleware");

// @desc    Get All Account Heads
// @route   GET /api/accounts
router.get("/", protect, async (req, res) => {
  try {
    const accounts = await AccountHead.find({}).sort({ code: 1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
