const mongoose = require("mongoose");

const memberSchema = mongoose.Schema(
  {
    // Personal Details
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    // --- NEW FIELDS FROM PHYSICAL FORM ---
    spouseName: { type: String }, // Father's or Spouse's Name
    dob: { type: Date },
    qualification: { type: String },
    profession: { type: String },
    otherOrgPositions: { type: String }, // Positions held in other orgs
    references: { type: String }, // Names of references (e.g. "Sri R. Satyanarayana")
    // -------------------------------------
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    pan: { type: String },
    aadhaar: { type: String },
    category: {
      type: String,
      enum: ["Permanent", "Ordinary", "EC"], // Executive Committee
      default: "Ordinary",
    },

    // Membership Details
    membershipType: {
      type: String,
      enum: ["Annual", "Life", "Patron", "Volunteer"],
      default: "Annual",
    },

    joinDate: { type: Date, default: Date.now },
    validUntil: { type: Date }, // For Annual members

    // Fee Details (KSS_MEM_3)
    feeAmount: { type: Number, default: 0 },
    feeStatus: {
      type: String,
      enum: ["Paid", "Pending", "Waived"],
      default: "Pending",
    },

    // Activity Tracking (KSS_MEM_4)
    activities: [
      {
        eventName: String,
        date: Date,
        role: String, // e.g., "Food Server", "Crowd Control"
      },
    ],

    branch: { type: String, default: "Headquarters" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // --- NEW: 3-TIER APPROVAL SYSTEM ---
    membershipStatus: {
      type: String,
      enum: ["Pending", "Active", "Rejected"],
      default: "Pending", // Starts as Pending
    },
    approvals: {
      president: {
        status: {
          type: String,
          enum: ["Pending", "Approved", "Rejected"],
          default: "Pending",
        },
        date: Date,
        remark: String,
      },
      secretary: {
        status: {
          type: String,
          enum: ["Pending", "Approved", "Rejected"],
          default: "Pending",
        },
        date: Date,
        remark: String,
      },
      treasurer: {
        status: {
          type: String,
          enum: ["Pending", "Approved", "Rejected"],
          default: "Pending",
        },
        date: Date,
        remark: String,
      },
    },
    // -----------
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Member", memberSchema);
