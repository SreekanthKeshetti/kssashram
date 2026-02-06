const mongoose = require("mongoose");

const counterSchema = mongoose.Schema({
  id: { type: String, required: true }, // e.g., "donation_id"
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model("Counter", counterSchema);
