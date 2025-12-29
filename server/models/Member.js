const mongoose = require("mongoose");

const memberSchema = mongoose.Schema(
  {
    // Personal Details
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
    address: { type: String, required: true },

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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Member", memberSchema);
