const Member = require("../models/Member");

// @desc    Get all members
// @route   GET /api/members
const getMembers = async (req, res) => {
  try {
    const members = await Member.find({}).sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register new member
// @route   POST /api/members
const createMember = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      address,
      membershipType,
      feeAmount,
      feeStatus,
    } = req.body;

    // Calculate Validity (e.g., 1 year for Annual)
    let validUntil = null;
    if (membershipType === "Annual") {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      validUntil = d;
    }

    const member = await Member.create({
      firstName,
      lastName,
      phone,
      email,
      address,
      membershipType,
      feeAmount,
      feeStatus,
      validUntil,
      createdBy: req.user._id,
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// @desc    Add Activity to Member
// @route   POST /api/members/:id/activity
const addMemberActivity = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    const { eventName, role, date } = req.body;

    member.activities.push({
      eventName,
      role,
      date: date || Date.now(),
    });

    await member.save();
    res.json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Export
module.exports = { getMembers, createMember, addMemberActivity };
