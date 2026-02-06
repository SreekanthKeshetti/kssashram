const Member = require("../models/Member");
const Voucher = require("../models/Voucher"); // <--- Import Voucher
const { logAudit } = require("../utils/auditLogger"); // Ensure this is imported
const AccountHead = require("../models/AccountHead"); // <--- Import AccountHead
const { buildMemberProfile } = require("../utils/generateMemberPDF"); // <--- IMPORT

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
      pan,
      aadhaar,
      category,
      spouseName,
      dob,
      qualification,
      profession,
      otherOrgPositions,
      references,
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
      pan,
      aadhaar,
      category, // Save new fields
      spouseName,
      dob,
      qualification,
      profession,
      otherOrgPositions,
      references,
      membershipStatus: "Pending",
      approvals: {
        president: { status: "Pending" },
        secretary: { status: "Pending" },
        treasurer: { status: "Pending" },
      },
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
// --- NEW FUNCTION: APPROVE MEMBER ---
// @route   PUT /api/members/:id/approve
const approveMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    const { role } = req.user;
    const { status, remark } = req.body; // 'Approved' or 'Rejected'

    // 1. Update Specific Approval based on Role
    if (role === "president" || role === "admin") {
      member.approvals.president = { status, date: Date.now(), remark };
    } else if (role === "secretary") {
      member.approvals.secretary = { status, date: Date.now(), remark };
    } else if (role === "treasurer") {
      member.approvals.treasurer = { status, date: Date.now(), remark };
    } else {
      return res
        .status(403)
        .json({ message: "Not authorized to approve members." });
    }

    // 2. Check Consensus
    const p = member.approvals.president.status;
    const s = member.approvals.secretary.status;
    const t = member.approvals.treasurer.status;

    if (p === "Approved" && s === "Approved" && t === "Approved") {
      member.membershipStatus = "Active"; // All 3 said Yes
    } else if (p === "Rejected" || s === "Rejected" || t === "Rejected") {
      member.membershipStatus = "Rejected"; // At least one said No
    }

    await member.save();

    await logAudit(
      req,
      "APPROVE",
      "Member",
      member._id,
      `Membership Approval by ${role}: ${status}`,
    );

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
// @desc    Download Member Application Form
// @route   GET /api/members/:id/download
const downloadMemberForm = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    const filename = `Application_${member.firstName}.pdf`;
    res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-type", "application/pdf");

    buildMemberProfile(
      member,
      (chunk) => res.write(chunk),
      () => res.end(),
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Download Blank Membership Form (For offline filling)
// @route   GET /api/members/blank-form
const downloadBlankForm = async (req, res) => {
  try {
    // Create a "Dummy" member object with lines for writing
    const blankMember = {
      firstName: "_______________________",
      lastName: "_______________________",
      spouseName: "_______________________________________",
      dob: null, // Logic in PDF generator handles null dates
      qualification: "_______________________",
      profession: "_______________________",
      otherOrgPositions: "_______________________________________",
      references: "_______________________________________",
      aadhaar: "_______________________",
      pan: "_______________________",
      phone: "_______________________",
      email: "_______________________",
      address:
        "______________________________________________________________________________\n______________________________________________________________________________",
      branch: "_______________________",
      category: "_______________",
      membershipType: "_______________",
      feeAmount: "_______",
      feeStatus: "_______",
      joinDate: new Date(), // Uses today's date for "Date" field
      createdAt: new Date(),
    };

    const filename = "Blank_Membership_Application.pdf";
    res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-type", "application/pdf");

    // Reuse the existing PDF generator!
    // It works perfectly because it just expects an object with these keys.
    const { buildMemberProfile } = require("../utils/generateMemberPDF");

    buildMemberProfile(
      blankMember,
      (chunk) => res.write(chunk),
      () => res.end(),
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export
module.exports = {
  getMembers,
  createMember,
  addMemberActivity,
  getMemberById,
  downloadMemberForm,
  downloadBlankForm,
  approveMember,
};
