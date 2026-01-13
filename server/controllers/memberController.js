const Member = require("../models/Member");
const Voucher = require("../models/Voucher"); // <--- Import Voucher
const AccountHead = require("../models/AccountHead"); // <--- Import AccountHead

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

// @desc    Register new member & Auto-Journal Fee
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
      branch, // <--- Destructure Branch
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
      branch: branch || "Headquarters", // <--- Save Branch
      createdBy: req.user._id,
    });

    // --- AUTO-CREATE VOUCHER IF PAID ---
    if (feeStatus === "Paid" && Number(feeAmount) > 0) {
      // 1. Find Account Code for Membership (Usually "220" - Corpus Fund or General)
      // If code 220 not found, fallback to any Credit account
      let account = await AccountHead.findOne({ code: "220" });
      if (!account) account = await AccountHead.findOne({ type: "Credit" });

      if (account) {
        await Voucher.create({
          voucherType: "Credit",
          voucherNo: "VCH-MEM-" + Date.now().toString().slice(-6), // Unique Voucher ID
          accountHead: account._id,
          amount: Number(feeAmount),
          description: `Membership Fee: ${firstName} ${lastName} (${membershipType})`,
          paymentMode: "Cash", // Assuming Cash collection at counter
          branch: branch || "Headquarters",
          status: "Approved", // Auto-approve since money is collected
          preparedBy: req.user._id,
          approvedBy: [req.user._id], // Auto-sign by creator
        });
        console.log("✅ Auto-Voucher created for Membership Fee");
      }
    }
    // -----------------------------------

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

// @desc    Get Single Member by ID
// @route   GET /api/members/:id
const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (member) {
      res.json(member);
    } else {
      res.status(404).json({ message: "Member not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export
module.exports = { getMembers, createMember, addMemberActivity, getMemberById };
