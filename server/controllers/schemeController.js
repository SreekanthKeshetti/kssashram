const Scheme = require("../models/Scheme");

// @desc    Get all schemes
// @route   GET /api/schemes
const getSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find({ isActive: true });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new scheme (Admin Only)
// @route   POST /api/schemes
const createScheme = async (req, res) => {
  try {
    const { name, description } = req.body;
    const scheme = await Scheme.create({ name, description });
    res.status(201).json(scheme);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete scheme
// @route   DELETE /api/schemes/:id
const deleteScheme = async (req, res) => {
  try {
    await Scheme.findByIdAndDelete(req.params.id);
    res.json({ message: "Scheme removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSchemes, createScheme, deleteScheme };
