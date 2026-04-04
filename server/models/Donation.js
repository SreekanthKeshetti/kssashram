const mongoose = require("mongoose");
const Counter = require("./Counter");

const donationSchema = mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    receiptNo: { type: String, unique: true },

    donorName: { type: String, required: true },
    donorPhone: { type: String, required: true },
    donorLandline: { type: String },
    donorEmail: { type: String },
    donorPan: { type: String },
    donorAadhaar: { type: String },

    address: { type: String },
    amount: { type: Number, required: true },
    scheme: { type: String, required: true },

    accountHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountHead",
    },
    depositBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountHead",
      required: false,
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

    paymentDetails: {
      chequeNo: String,
      chequeDate: Date,
      bankName: String,
      ddNo: String,
      ddDate: Date,
      transactionId: String,
    },

    manualReceiptNo: { type: String },
    manualReceiptDate: { type: Date },
    paymentReference: { type: String },

    category: {
      type: String,
      enum: ["Household", "Organizational"],
      default: "Household",
    },

    isRecurring: { type: Boolean, default: false },
    reminderFrequency: {
      type: String,
      enum: ["Annual", "Monthly"],
      default: "Annual",
    },
    nextReminderDate: { type: Date },

    schemeExpiryDate: { type: Date },

    occasion: { type: String },
    inNameOf: { type: String },
    calendarType: {
      type: String,
      enum: ["Gregorian", "Telugu"],
      default: "Gregorian",
    },
    programDate: { type: Date },
    tithi: { type: String },
    interestPeriod: {
      startDate: { type: Date },
      endDate: { type: Date },
    },

    comments: { type: String },

    branch: {
      type: String,
      required: true,
      enum: [
        "Headquarters",
        "Karunya Sindhu",
        "Karunya Bharathi",
        "Karunya Jyothi",
        "KarunaSri Seva Samithi",
      ],
      default: "Headquarters",
    },
    receiptStatus: {
      type: String,
      enum: ["Generated", "Sent", "Pending"],
      default: "Pending",
    },
    status: {
      type: String,
      enum: ["Active", "Cancelled"],
      default: "Active",
    },
    cancellationReason: { type: String },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    media: [
      {
        type: String,
      },
    ],
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

donationSchema.pre("save", async function () {
  if (!this.isNew) return;

  try {
    const counter = await Counter.findOneAndUpdate(
      { id: "donation_id" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    this.receiptNo = `KSS-${counter.seq.toString().padStart(4, "0")}`;
  } catch (error) {
    throw error;
  }
});

module.exports = mongoose.model("Donation", donationSchema);
