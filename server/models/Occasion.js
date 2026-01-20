const mongoose = require("mongoose");

const occasionSchema = mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. "Birthday", "Death Anniversary"
  },
  { timestamps: true },
);

module.exports = mongoose.model("Occasion", occasionSchema);
