const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    faculty: {
      name: { type: String }, // e.g. "Sri. Rajesh Kumar"
      phone: { type: String },
      organization: { type: String }, // e.g. "Infosys CSR" or "Veda Patashala"
      designation: { type: String }, // e.g. "Senior Trainer" or "Volunteer"
    },
    // --- DATE & DURATION ---
    startDate: { type: Date, required: true }, // Was 'date'
    endDate: { type: Date }, // NEW: For multi-day trainings
    time: { type: String, required: true },

    location: { type: String, required: true },
    eventType: {
      type: String,
      enum: [
        "Celebration",
        "Training",
        "Workshop",
        "Puja",
        "Tailoring",
        "Computer Training",
        "Mana Varasatwa Sampada",
        "Other",
      ],
      default: "Celebration",
    },

    // --- NEW: Paid Event Fields ---
    isPaid: { type: Boolean, default: false },
    feeAmount: { type: Number, default: 0 },
    // -----------------------------

    registrations: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        registeredAt: { type: Date, default: Date.now },
        attended: { type: Boolean, default: false },
        // --- NEW: Payment Status for this person ---
        paymentStatus: {
          type: String,
          enum: ["Pending", "Paid", "Free", "Waived"],
          default: "Free",
        },
        // --- UPDATED ATTENDANCE TRACKING ---
        // Instead of boolean, we store DATES attended
        attendanceLog: [{ type: Date }],
        // -----------------------------------
      },
    ],

    branch: { type: String, default: "Headquarters" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Event", eventSchema);
