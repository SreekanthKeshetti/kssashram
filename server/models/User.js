const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // No duplicate emails
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    // This is the magic field for your 3 profiles
    role: {
      type: String,
      // enum: ["user", "employee", "admin"],
      enum: [
        "admin", // IT Admin / Super User
        "president", // Core Committee
        "secretary", // Core Committee
        "treasurer", // Core Committee
        "warden", // Staff (Data Entry)
        "accountant", // Staff (Finance Entry)
        "clerk", // Staff (General Entry)
        "user", // Guest / Donor
        "employee",
      ],
      default: "user", // Everyone starts as a guest user
    },
    // Optional: For employees belonging to a specific branch
    branch: {
      type: String,
      default: "Headquarters",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
