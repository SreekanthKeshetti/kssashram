const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },

    // Requirement KSS_EVE_2: Event Types
    eventType: {
      type: String,
      enum: ["Celebration", "Training", "Workshop", "Puja", "Other"],
      default: "Celebration",
    },

    // Requirement KSS_EVE_3: Track Registrations
    registrations: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional link
        name: { type: String, required: true },
        phone: { type: String, required: true },
        registeredAt: { type: Date, default: Date.now },
      },
    ],

    branch: { type: String, default: "Headquarters" },

    // Track who created it (Manager or Admin)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);
