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
        "user",
        "employee",
        "admin",
        "president",
        "secretary",
        "treasurer",
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
  }
);

module.exports = mongoose.model("User", userSchema);
