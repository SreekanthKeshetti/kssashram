const mongoose = require("mongoose");

const donationSchema = mongoose.Schema(
  {
    // Link to a registered user (optional, can be Guest)
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    // Basic Details
    donorName: { type: String, required: true },
    donorPhone: { type: String, required: true },
    donorEmail: { type: String },
    donorPan: { type: String }, // For Tax Benefit (KSS_DON_8)
    donorAadhaar: { type: String },

    // --- NEW FIELD: BILLING ADDRESS ---
    address: { type: String },
    // ---------------------------------

    // Donation Details
    amount: { type: Number, required: true },
    scheme: { type: String, required: true }, // e.g. Nitya Annadhana
    // --- NEW FIELD: Account Head Link ---
    accountHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountHead",
      // Not required yet, to support legacy data, but highly recommended
    },
    // ------------------------------------

    // Payment Details (KSS_DON_1)
    paymentMode: {
      type: String,
      enum: ["Cash", "Online", "Cheque", "DD", "Foreign Currency"],
      required: true,
    },
    paymentReference: { type: String }, // Cheque No or Transaction ID

    // --- NEW FIELD: DONATION CATEGORY ---
    category: {
      type: String,
      enum: ["Household", "Organizational"],
      default: "Household",
    },
    // ------------------------------------

    // --- NEW FIELDS FOR REMINDERS (KSS_DON_12, 13) ---
    isRecurring: { type: Boolean, default: false },
    reminderFrequency: {
      type: String,
      enum: ["Annual", "Monthly"],
      default: "Annual",
    },
    nextReminderDate: { type: Date }, // The date of the NEXT donation (e.g. Next Year)
    // -------------------------------------------
    // --- NEW: SPECIAL OCCASION FIELDS (Tithi/Seva) ---
    occasion: { type: String }, // e.g. "Birthday", "Wedding Anniversary", "In Memory Of"
    inNameOf: { type: String }, // e.g. "Sairam" or "Late Father Name"
    programDate: { type: Date }, // The actual date to perform the seva (e.g., Feb 14)
    // -------------------------------------------

    // System Details
    branch: { type: String, required: true, default: "Headquarters" }, // KSS_GEN_2
    receiptStatus: {
      type: String,
      enum: ["Generated", "Sent", "Pending"],
      default: "Pending",
    },
    media: [
      {
        type: String, // Stores the URL/Path of the file
      },
    ],

    // Who entered this record? (Audit Trail)
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Donation", donationSchema);
