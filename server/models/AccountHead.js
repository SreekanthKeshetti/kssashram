const mongoose = require("mongoose");

const accountHeadSchema = mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // e.g., "201", "10"
    name: { type: String, required: true }, // e.g., "Nitya Annadhana"
    type: { type: String, enum: ["Credit", "Debit"], required: true }, // Credit = Income, Debit = Expense
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AccountHead", accountHeadSchema);
