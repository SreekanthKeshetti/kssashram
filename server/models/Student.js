const mongoose = require("mongoose");

const studentSchema = mongoose.Schema(
  {
    // --- 1. NEW FIELDS FROM LEGACY DATA ---
    admissionNumber: { type: String },
    caseNumber: { type: String },
    studentType: {
      type: String,
      enum: ["BPL", "Orphan", "Semi_Orphan", "General"],
      default: "General",
    },
    alternateContact: { type: String },

    // --- 2. EXISTING FIELDS (Updated) ---
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    dob: { type: Date },
    gender: { type: String, enum: ["Male", "Female"], default: "Male" },

    guardianName: { type: String, default: "Not Recorded" },
    contactNumber: { type: String },

    address: { type: String, default: "Ashram Address" },
    branch: { type: String, required: true },

    // --- NEW FIELDS: AADHAAR & CASTE ---
    aadhaarNumber: { type: String },
    caste: { type: String },
    // --- NEW FIELDS: HEALTH ---
    bloodGroup: { type: String, default: "Unknown" },
    healthDocuments: [{ type: String }], // Array of Cloudinary URLs

    // --- 3. EXISTING FUNCTIONALITY FIELDS ---
    formsStatus: {
      form20: { type: Boolean, default: false },
      form44: { type: Boolean, default: false },
      form37: { type: Boolean, default: false },
      form17: { type: Boolean, default: false },
      form18: { type: Boolean, default: false },
      form7: { type: Boolean, default: false },
    },

    inspections: [
      {
        date: { type: Date, default: Date.now },
        officialName: String,
        department: String,
        remarks: String,
        status: { type: String, default: "Satisfactory" },
      },
    ],

    schoolName: { type: String },
    currentClass: { type: String },
    educationHistory: [
      {
        year: String,
        class: String,
        school: String,
        examName: String,
        maxMarks: Number,
        marksObtained: Number,
        percentage: String,
        remarks: String,
      },
    ],
    healthIssues: { type: String },

    approvals: {
      president: {
        status: { type: String, default: "Pending" },
        date: Date,
        remark: String,
      },
      secretary: {
        status: { type: String, default: "Pending" },
        date: Date,
        remark: String,
      },
      treasurer: {
        status: { type: String, default: "Pending" },
        date: Date,
        remark: String,
      },
    },

    admissionStatus: {
      type: String,
      enum: [
        "Draft",
        "In Review",
        "Active",
        "Rejected",
        "Exit_Pending",
        "Alumni",
        "Transferred",
      ],
      default: "In Review",
    },

    exitRequest: {
      requestedDate: Date,
      reason: String,
      approvals: {
        president: { status: { type: String, default: "Pending" }, date: Date },
        secretary: { status: { type: String, default: "Pending" }, date: Date },
        treasurer: { status: { type: String, default: "Pending" }, date: Date },
      },
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sponsor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      default: null,
    },

    activities: [
      {
        activityType: {
          type: String,
          enum: ["Sports", "Arts", "Vedic/Spiritual", "Vocational", "Other"],
        },
        name: String,
        participationLevel: String,
        achievement: String,
        date: { type: Date, default: Date.now },
      },
    ],

    healthRecords: [
      {
        date: { type: Date, default: Date.now },
        checkupType: String,
        doctorName: String,
        observation: String,
      },
    ],
    expenses: [
      {
        amount: Number,
        description: String,
        date: { type: Date, default: Date.now },
      },
    ],
    alumniDetails: {
      jobTitle: String,
      company: String,
      currentLocation: String,
      email: String,
      phone: String,
    },
    transferRequest: {
      targetBranch: String,
      reason: String,
      initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      requestDate: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
      },
      approvals: {
        president: {
          status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
          },
          date: Date,
        },
        secretary: {
          status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
          },
          date: Date,
        },
        treasurer: {
          status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
          },
          date: Date,
        },
      },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    documents: [{ type: String }],
    leaves: [
      {
        startDate: Date,
        endDate: Date,
        actualReturnDate: Date,
        reason: String,
        status: { type: String, default: "On Leave" },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Student", studentSchema);
