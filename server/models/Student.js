const mongoose = require("mongoose");

const studentSchema = mongoose.Schema(
  {
    // --- 1. NEW FIELDS FROM LEGACY DATA ---
    admissionNumber: { type: String }, // Maps to CCI_Admin__c
    caseNumber: { type: String }, // Maps to Case_Profile_Number__c
    studentType: {
      type: String,
      enum: ["BPL", "Orphan", "Semi_Orphan", "General"],
      default: "General",
    }, // Maps to Student_Type__c
    alternateContact: { type: String }, // Maps to KSS_Mobile_2__c

    // --- 2. EXISTING FIELDS (Updated) ---
    firstName: { type: String, required: true }, // Derived from LastName column
    lastName: { type: String, required: true }, // Derived from LastName column

    dob: { type: Date }, // Made optional to prevent import errors if missing
    gender: { type: String, enum: ["Male", "Female"], default: "Male" },

    guardianName: { type: String, default: "Not Recorded" }, // CSV doesn't have this, so default it
    contactNumber: { type: String }, // Maps to PersonMobilePhone

    address: { type: String, default: "Ashram Address" }, // Default if missing
    branch: { type: String, required: true }, // Maps to Branch__c (KS Sindhu -> Karunya Sindu)

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
    currentClass: { type: String }, // Maps to class
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
      enum: ["Draft", "In Review", "Active", "Rejected", "Alumni"],
      default: "In Review",
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sponsor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      default: null,
    },
    // --- NEW: EXTRA-CURRICULAR ACTIVITIES ---
    activities: [
      {
        activityType: {
          type: String,
          enum: ["Sports", "Arts", "Vedic/Spiritual", "Vocational", "Other"],
        },
        name: String, // e.g. "Yoga", "Cricket", "Painting"
        participationLevel: String, // e.g. "School Level", "District", "Daily Practice"
        achievement: String, // e.g. "Won Gold Medal", "Completed Level 1"
        date: { type: Date, default: Date.now }, // Date of achievement or entry
      },
    ],
    // ----------------------------------------

    educationHistory: [
      {
        year: String,
        class: String,
        school: String,
        percentage: String,
        remarks: String,
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
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
