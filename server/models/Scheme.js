const mongoose = require("mongoose");

const schemeSchema = mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    accountHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountHead",
      required: true, // Every scheme MUST have an accounting code now
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scheme", schemeSchema);
