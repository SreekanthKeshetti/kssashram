// const mongoose = require("mongoose");

// const eventSchema = mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     description: { type: String, required: true },
//     date: { type: Date, required: true },
//     time: { type: String, required: true },
//     location: { type: String, required: true },

//     // Requirement KSS_EVE_2: Event Types
//     eventType: {
//       type: String,
//       enum: ["Celebration", "Training", "Workshop", "Puja", "Other"],
//       default: "Celebration",
//     },

//     // Requirement KSS_EVE_3: Track Registrations
//     registrations: [
//       {
//         user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional link
//         name: { type: String, required: true },
//         phone: { type: String, required: true },
//         registeredAt: { type: Date, default: Date.now },
//         // --- NEW FIELD ---
//         attended: { type: Boolean, default: false },
//         // ----------------
//       },
//     ],

//     branch: { type: String, default: "Headquarters" },

//     // Track who created it (Manager or Admin)
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("Event", eventSchema);
const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },

    eventType: {
      type: String,
      enum: ["Celebration", "Training", "Workshop", "Puja", "Other"],
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
      },
    ],

    branch: { type: String, default: "Headquarters" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
