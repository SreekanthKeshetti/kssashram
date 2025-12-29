const mongoose = require("mongoose");

const studentSchema = mongoose.Schema(
  {
    // --- Personal Details ---
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    guardianName: { type: String, required: true }, // KSS_STU_8
    contactNumber: { type: String, required: true },
    address: { type: String, required: true },
    branch: { type: String, required: true },

    // --- Statutory Forms (Checklist KSS_STU_8 to KSS_STU_13) ---
    // We store 'true' if the form is submitted/verified
    formsStatus: {
      form20: { type: Boolean, default: false }, // Undertaking by guardian
      form44: { type: Boolean, default: false }, // Release order
      form37: { type: Boolean, default: false }, // After care placement
      form17: { type: Boolean, default: false }, // Report at production
      form18: { type: Boolean, default: false }, // Order of placement
      form7: { type: Boolean, default: false }, // Individual care plan
    },

    // --- Education & Health (KSS_STU_14) ---
    schoolName: { type: String },
    currentClass: { type: String },
    healthIssues: { type: String },

    // --- The 3-Tier Approval System (KSS_STU_3, 4, 5) ---
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

    // Overall Status (Only 'Active' if all 3 approve)
    admissionStatus: {
      type: String,
      enum: ["Draft", "In Review", "Active", "Rejected", "Alumni"],
      default: "In Review",
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sponsor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation", // Link to a specific Donor/Donation record
      default: null,
    },

    // --- KSS_STU_14: Education & Health Details ---
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
        checkupType: String, // e.g., "General", "Dental"
        doctorName: String,
        observation: String,
      },
    ],

    // --- KSS_STU_7: Expenses ---
    // We can track specific expenses for this student
    expenses: [
      {
        amount: Number,
        description: String, // e.g., "School Fees", "Uniform"
        date: { type: Date, default: Date.now },
      },
    ],
    // --- NEW FIELD: ALUMNI TRACKING (KSS_FUT_1) ---
    alumniDetails: {
      jobTitle: String,
      company: String,
      currentLocation: String,
      email: String,
      phone: String, // Current phone (might differ from guardian contact)
      linkedIn: String,
    },
    // --- NEW FIELD: DOCUMENTS (KSS_STU_11, 12, 16) ---
    documents: [
      {
        type: String, // Stores file path e.g., "/uploads/student-123-aadhar.jpg"
      },
    ],
    // ----------------------------------------------

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);
