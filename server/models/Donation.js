const mongoose = require("mongoose");
const Counter = require("./Counter"); // <--- Import the Counter model

const donationSchema = mongoose.Schema(
  {
    // Link to a registered user (optional, can be Guest)
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    // --- NEW: SYSTEM GENERATED RECEIPT ID ---
    receiptNo: { type: String, unique: true },

    // Basic Details
    donorName: { type: String, required: true },
    donorPhone: { type: String, required: true },
    donorEmail: { type: String },
    donorPan: { type: String }, // For Tax Benefit (80G)
    donorAadhaar: { type: String },

    // Billing Address
    address: { type: String },

    // Donation Details
    amount: { type: Number, required: true },
    scheme: { type: String, required: true }, // e.g. Nitya Annadhana

    // Account Head Link
    accountHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountHead",
    },
    depositBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountHead",
      required: false, // Optional for now to support old records
    },

    paymentMode: {
      type: String,
      enum: [
        "Cash",
        "Online",
        "Cheque",
        "DD",
        "UPI",
        "Foreign Currency",
        "Bank Transfer",
      ],
      required: true,
    },

    // Detailed Payment Info (For Cheque/DD/UPI)
    paymentDetails: {
      chequeNo: String,
      chequeDate: Date,
      bankName: String,
      ddNo: String,
      ddDate: Date,
      transactionId: String, // For UPI/Online
    },

    // Manual Receipt Logging (Legacy Sync)
    manualReceiptNo: { type: String },
    manualReceiptDate: { type: Date },
    paymentReference: { type: String },

    // Donation Category
    category: {
      type: String,
      enum: ["Household", "Organizational"],
      default: "Household",
    },

    // Reminders
    isRecurring: { type: Boolean, default: false },
    reminderFrequency: {
      type: String,
      enum: ["Annual", "Monthly"],
      default: "Annual",
    },
    nextReminderDate: { type: Date },

    // Expiry for Permanent Schemes
    schemeExpiryDate: { type: Date },

    // Special Occasion Fields (Tithi/Seva)
    occasion: { type: String }, // e.g. "Birthday", "Wedding Anniversary"
    inNameOf: { type: String }, // e.g. "Sairam" or "Late Father Name"
    calendarType: {
      type: String,
      enum: ["Gregorian", "Telugu"],
      default: "Gregorian",
    },
    programDate: { type: Date }, // English Date
    tithi: { type: String }, // Telugu Tithi string
    interestPeriod: {
      startDate: { type: Date },
      endDate: { type: Date },
    },

    // System Details
    branch: {
      type: String,
      required: true,
      enum: [
        "Headquarters",
        "Karunya Sindhu",
        "Karunya Bharathi",
        "Karunya Jyothi",
        "KarunaSri Seva Samithi", // <--- Corrected Spelling
      ],
      default: "Headquarters",
    },
    receiptStatus: {
      type: String,
      enum: ["Generated", "Sent", "Pending"],
      default: "Pending",
    },
    // --- NEW FIELDS FOR CANCELLATION ---
    status: {
      type: String,
      enum: ["Active", "Cancelled"],
      default: "Active",
    },
    cancellationReason: { type: String },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // -----------------------------------
    media: [
      {
        type: String, // Stores the URL/Path of the file
      },
    ],

    // Audit Trail
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// --- PRE-SAVE HOOK FOR AUTO-INCREMENT RECEIPT NO ---
// donationSchema.pre("save", async function (next) {
//   // Only generate if it's a new document
//   if (!this.isNew) return next();

//   try {
//     const counter = await Counter.findOneAndUpdate(
//       { id: "donation_id" }, // Identifier for this sequence
//       { $inc: { seq: 1 } }, // Increment by 1
//       { new: true, upsert: true }, // Create if doesn't exist
//     );

//     // Format: "KSS-0001", "KSS-0002"
//     // padStart(4, "0") ensures we get 0001 instead of 1
//     this.receiptNo = `KSS-${counter.seq.toString().padStart(4, "0")}`;
//     next();
//   } catch (error) {
//     next(error);
//   }
// });
// --- PRE-SAVE HOOK FOR AUTO-INCREMENT RECEIPT NO ---
donationSchema.pre("save", async function () {
  // 1. Remove 'next' from arguments above ^^^

  // Only generate if it's a new document
  if (!this.isNew) return; // Just return, don't call next()

  try {
    const counter = await Counter.findOneAndUpdate(
      { id: "donation_id" }, // Identifier for this sequence
      { $inc: { seq: 1 } }, // Increment by 1
      { new: true, upsert: true }, // Create if doesn't exist
    );

    // Format: "KSS-0001", "KSS-0002"
    this.receiptNo = `KSS-${counter.seq.toString().padStart(4, "0")}`;

    // No need to call next() here, the async function resolving acts as next()
  } catch (error) {
    throw error; // Just throw the error, Mongoose will catch it
  }
});

module.exports = mongoose.model("Donation", donationSchema);
