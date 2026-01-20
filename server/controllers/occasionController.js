const Occasion = require("../models/Occasion");

// @desc    Get all occasions
// @route   GET /api/occasions
const getOccasions = async (req, res) => {
  try {
    const occasions = await Occasion.find({}).sort({ name: 1 });
    res.json(occasions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new occasion
// @route   POST /api/occasions
const createOccasion = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const occasion = await Occasion.create({ name });
    res.status(201).json(occasion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete occasion
// @route   DELETE /api/occasions/:id
const deleteOccasion = async (req, res) => {
  try {
    await Occasion.findByIdAndDelete(req.params.id);
    res.json({ message: "Occasion removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getOccasions, createOccasion, deleteOccasion };
