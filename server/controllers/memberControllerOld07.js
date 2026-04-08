// const Member = require("../models/Member");
// const Voucher = require("../models/Voucher"); // <--- Import Voucher
// const { logAudit } = require("../utils/auditLogger"); // Ensure this is imported
// const AccountHead = require("../models/AccountHead"); // <--- Import AccountHead
// const { buildMemberProfile } = require("../utils/generateMemberPDF"); // <--- IMPORT

// // @desc    Get all members
// // @route   GET /api/members
// const getMembers = async (req, res) => {
//   try {
//     const members = await Member.find({}).sort({ createdAt: -1 });
//     res.json(members);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Register new member & Auto-Journal Fee
// // @route   POST /api/members
// const createMember = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       phone,
//       email,
//       address,
//       membershipType,
//       feeAmount,
//       feeStatus,
//       branch, // <--- Destructure Branch
//       pan,
//       aadhaar,
//       category,
//       spouseName,
//       dob,
//       qualification,
//       profession,
//       otherOrgPositions,
//       references,
//     } = req.body;

//     // Calculate Validity (e.g., 1 year for Annual)
//     let validUntil = null;
//     if (membershipType === "Annual") {
//       const d = new Date();
//       d.setFullYear(d.getFullYear() + 1);
//       validUntil = d;
//     }

//     const member = await Member.create({
//       firstName,
//       lastName,
//       phone,
//       email,
//       address,
//       membershipType,
//       feeAmount,
//       feeStatus,
//       validUntil,
//       branch: branch || "Headquarters", // <--- Save Branch
//       pan,
//       aadhaar,
//       category, // Save new fields
//       spouseName,
//       dob,
//       qualification,
//       profession,
//       otherOrgPositions,
//       references,
//       membershipStatus: "Pending",
//       approvals: {
//         president: { status: "Pending" },
//         secretary: { status: "Pending" },
//         treasurer: { status: "Pending" },
//       },
//       createdBy: req.user._id,
//     });

//     // --- AUTO-CREATE VOUCHER IF PAID ---
//     if (feeStatus === "Paid" && Number(feeAmount) > 0) {
//       // 1. Find Account Code for Membership (Usually "220" - Corpus Fund or General)
//       // If code 220 not found, fallback to any Credit account
//       let account = await AccountHead.findOne({ code: "220" });
//       if (!account) account = await AccountHead.findOne({ type: "Credit" });

//       if (account) {
//         await Voucher.create({
//           voucherType: "Credit",
//           voucherNo: "VCH-MEM-" + Date.now().toString().slice(-6), // Unique Voucher ID
//           accountHead: account._id,
//           amount: Number(feeAmount),
//           description: `Membership Fee: ${firstName} ${lastName} (${membershipType})`,

//           paymentMode: "Cash", // Assuming Cash collection at counter
//           branch: branch || "Headquarters",
//           status: "Approved", // Auto-approve since money is collected
//           preparedBy: req.user._id,
//           approvedBy: [req.user._id], // Auto-sign by creator
//         });
//         console.log("✅ Auto-Voucher created for Membership Fee");
//       }
//     }
//     // -----------------------------------

//     res.status(201).json(member);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };
// // --- NEW FUNCTION: APPROVE MEMBER ---
// // @route   PUT /api/members/:id/approve
// const approveMember = async (req, res) => {
//   try {
//     const member = await Member.findById(req.params.id);
//     if (!member) return res.status(404).json({ message: "Member not found" });

//     const { role } = req.user;
//     const { status, remark } = req.body; // 'Approved' or 'Rejected'

//     // 1. Update Specific Approval based on Role
//     if (role === "president" || role === "admin") {
//       member.approvals.president = { status, date: Date.now(), remark };
//     } else if (role === "secretary") {
//       member.approvals.secretary = { status, date: Date.now(), remark };
//     } else if (role === "treasurer") {
//       member.approvals.treasurer = { status, date: Date.now(), remark };
//     } else {
//       return res
//         .status(403)
//         .json({ message: "Not authorized to approve members." });
//     }

//     // 2. Check Consensus
//     const p = member.approvals.president.status;
//     const s = member.approvals.secretary.status;
//     const t = member.approvals.treasurer.status;

//     if (p === "Approved" && s === "Approved" && t === "Approved") {
//       member.membershipStatus = "Active"; // All 3 said Yes
//     } else if (p === "Rejected" || s === "Rejected" || t === "Rejected") {
//       member.membershipStatus = "Rejected"; // At least one said No
//     }

//     await member.save();

//     await logAudit(
//       req,
//       "APPROVE",
//       "Member",
//       member._id,
//       `Membership Approval by ${role}: ${status}`,
//     );

//     res.json(member);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Add Activity to Member
// // @route   POST /api/members/:id/activity
// const addMemberActivity = async (req, res) => {
//   try {
//     const member = await Member.findById(req.params.id);
//     if (!member) return res.status(404).json({ message: "Member not found" });

//     const { eventName, role, date } = req.body;

//     member.activities.push({
//       eventName,
//       role,
//       date: date || Date.now(),
//     });

//     await member.save();
//     res.json(member);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // @desc    Get Single Member by ID
// // @route   GET /api/members/:id
// const getMemberById = async (req, res) => {
//   try {
//     const member = await Member.findById(req.params.id);
//     if (member) {
//       res.json(member);
//     } else {
//       res.status(404).json({ message: "Member not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// // @desc    Download Member Application Form
// // @route   GET /api/members/:id/download
// const downloadMemberForm = async (req, res) => {
//   try {
//     const member = await Member.findById(req.params.id);
//     if (!member) return res.status(404).json({ message: "Member not found" });

//     const filename = `Application_${member.firstName}.pdf`;
//     res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
//     res.setHeader("Content-type", "application/pdf");

//     buildMemberProfile(
//       member,
//       (chunk) => res.write(chunk),
//       () => res.end(),
//     );
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// // @desc    Download Blank Membership Form (For offline filling)
// // @route   GET /api/members/blank-form
// const downloadBlankForm = async (req, res) => {
//   try {
//     // Create a "Dummy" member object with lines for writing
//     const blankMember = {
//       firstName: "_______________________",
//       lastName: "_______________________",
//       spouseName: "_______________________________________",
//       dob: null, // Logic in PDF generator handles null dates
//       qualification: "_______________________",
//       profession: "_______________________",
//       otherOrgPositions: "_______________________________________",
//       references: "_______________________________________",
//       aadhaar: "_______________________",
//       pan: "_______________________",
//       phone: "_______________________",
//       email: "_______________________",
//       address:
//         "______________________________________________________________________________\n______________________________________________________________________________",
//       branch: "_______________________",
//       category: "_______________",
//       membershipType: "_______________",
//       feeAmount: "_______",
//       feeStatus: "_______",
//       joinDate: new Date(), // Uses today's date for "Date" field
//       createdAt: new Date(),
//     };

//     const filename = "Blank_Membership_Application.pdf";
//     res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
//     res.setHeader("Content-type", "application/pdf");

//     // Reuse the existing PDF generator!
//     // It works perfectly because it just expects an object with these keys.
//     const { buildMemberProfile } = require("../utils/generateMemberPDF");

//     buildMemberProfile(
//       blankMember,
//       (chunk) => res.write(chunk),
//       () => res.end(),
//     );
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Export
// module.exports = {
//   getMembers,
//   createMember,
//   addMemberActivity,
//   getMemberById,
//   downloadMemberForm,
//   downloadBlankForm,
//   approveMember,
// };
// Above is code before we implement the import button for the memebers import.
const fs = require("fs");
const csv = require("csv-parser");
const Member = require("../models/Member");
const Voucher = require("../models/Voucher");
const { logAudit } = require("../utils/auditLogger");
const AccountHead = require("../models/AccountHead");
const { buildMemberProfile } = require("../utils/generateMemberPDF");

const getMembers = async (req, res) => {
  try {
    const members = await Member.find({}).sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
      branch,
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
      branch: branch || "Headquarters",
      pan,
      aadhaar,
      category,
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

    if (feeStatus === "Paid" && Number(feeAmount) > 0) {
      let account = await AccountHead.findOne({ code: "220" });
      if (!account) account = await AccountHead.findOne({ type: "Credit" });

      if (account) {
        await Voucher.create({
          voucherType: "Credit",
          voucherNo: "VCH-MEM-" + Date.now().toString().slice(-6),
          accountHead: account._id,
          amount: Number(feeAmount),
          description: `Membership Fee: ${firstName} ${lastName} (${membershipType})`,
          paymentMode: "Cash",
          branch: branch || "Headquarters",
          status: "Approved",
          preparedBy: req.user._id,
          approvedBy: [req.user._id],
        });
      }
    }

    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const approveMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    const { role } = req.user;
    const { status, remark } = req.body;

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

    const p = member.approvals.president.status;
    const s = member.approvals.secretary.status;
    const t = member.approvals.treasurer.status;

    if (p === "Approved" && s === "Approved" && t === "Approved") {
      member.membershipStatus = "Active";
    } else if (p === "Rejected" || s === "Rejected" || t === "Rejected") {
      member.membershipStatus = "Rejected";
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

const downloadBlankForm = async (req, res) => {
  try {
    const blankMember = {
      firstName: "_______________________",
      lastName: "_______________________",
      spouseName: "_______________________________________",
      dob: null,
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
      joinDate: new Date(),
      createdAt: new Date(),
    };

    const filename = "Blank_Membership_Application.pdf";
    res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-type", "application/pdf");

    buildMemberProfile(
      blankMember,
      (chunk) => res.write(chunk),
      () => res.end(),
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- NEW IMPORT FUNCTION ---
const importMembers = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const results = [];
  const filePath = req.file.path;

  try {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        // Helper to grab values flexibly based on possible column headers
        const getValue = (keywords) => {
          const rowKeys = Object.keys(row);
          const match = rowKeys.find((key) =>
            keywords.some((k) => key.toLowerCase().includes(k.toLowerCase())),
          );
          return match ? row[match] : "";
        };

        // Names
        let fName =
          getValue(["FirstName", "First", "Name", "Applicant Name"]) ||
          "Unknown";
        let lName = getValue(["LastName", "Last", "Surname"]) || ".";

        // If they only provided one "Name" column, split it
        if (fName !== "Unknown" && lName === ".") {
          const parts = fName.trim().split(" ");
          if (parts.length > 1) {
            lName = parts.pop();
            fName = parts.join(" ");
          }
        }

        // Categories & Enums
        let category = "Ordinary";
        const rawCat = getValue(["Category", "Type"]);
        if (rawCat) {
          if (rawCat.toLowerCase().includes("permanent"))
            category = "Permanent";
          else if (rawCat.toLowerCase().includes("ec")) category = "EC";
        }

        let membershipType = "Annual";
        const rawMemType = getValue(["Membership", "Plan"]);
        if (rawMemType) {
          if (rawMemType.toLowerCase().includes("life"))
            membershipType = "Life";
          else if (rawMemType.toLowerCase().includes("patron"))
            membershipType = "Patron";
          else if (rawMemType.toLowerCase().includes("volunteer"))
            membershipType = "Volunteer";
        }

        // Branch
        let branch = "Headquarters";
        const rawBranch = getValue(["Branch"]);
        if (rawBranch) {
          if (
            rawBranch.toLowerCase().includes("sindhu") ||
            rawBranch.toLowerCase().includes("sindu")
          )
            branch = "Karunya Sindhu";
          else if (rawBranch.toLowerCase().includes("bharathi"))
            branch = "Karunya Bharathi";
        }

        // Dates
        let joinDate = new Date();
        const rawJoin = getValue(["Join", "Date"]);
        if (rawJoin && !isNaN(new Date(rawJoin))) joinDate = new Date(rawJoin);

        let dob = null;
        const rawDob = getValue(["DOB", "Birth"]);
        if (rawDob && !isNaN(new Date(rawDob))) dob = new Date(rawDob);

        // Only add if there is at least a name
        if (fName !== "Unknown") {
          results.push({
            firstName: fName,
            lastName: lName,
            spouseName: getValue(["Spouse", "Father"]),
            dob: dob,
            qualification: getValue(["Qualification", "Edu"]),
            profession: getValue(["Profession", "Job", "Work"]),
            otherOrgPositions: getValue([
              "Other",
              "Org",
              "Positions",
              "Designation",
            ]),
            references: getValue(["Reference", "Introduced"]),
            aadhaar: getValue(["Aadhaar", "UID"]),
            pan: getValue(["PAN", "PAN No."]),
            phone: getValue(["Phone", "Mobile", "Contact"]) || "0000000000",
            email: getValue(["Email", "Mail"]),
            address: getValue(["Address", "Location"]) || "Not Provided",
            category: category,
            membershipType: membershipType,
            feeAmount: Number(getValue(["Fee", "Amount"])) || 0,
            feeStatus: "Paid", // Auto-set imported members to paid
            branch: branch,
            joinDate: joinDate,

            // --- AUTOMATIC APPROVAL FOR LEGACY IMPORTS ---
            membershipStatus: "Active",
            approvals: {
              president: {
                status: "Approved",
                date: new Date(),
                remark: "Legacy Import",
              },
              secretary: {
                status: "Approved",
                date: new Date(),
                remark: "Legacy Import",
              },
              treasurer: {
                status: "Approved",
                date: new Date(),
                remark: "Legacy Import",
              },
            },
            createdBy: req.user._id,
          });
        }
      })
      .on("end", async () => {
        try {
          if (results.length > 0) {
            await Member.insertMany(results);
            fs.unlinkSync(filePath);
            res.json({
              message: `Success! Imported ${results.length} members.`,
            });
          } else {
            fs.unlinkSync(filePath);
            res.status(400).json({ message: "No valid data found in CSV." });
          }
        } catch (dbError) {
          res
            .status(500)
            .json({ message: "Database Error: " + dbError.message });
        }
      });
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMembers,
  createMember,
  addMemberActivity,
  getMemberById,
  downloadMemberForm,
  downloadBlankForm,
  approveMember,
  importMembers, // <--- Exported
};
