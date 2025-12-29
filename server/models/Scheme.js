const mongoose = require("mongoose");

const schemeSchema = mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scheme", schemeSchema);
