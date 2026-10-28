// const Scheme = require("../models/Scheme");

// // @desc    Get all schemes
// // @route   GET /api/schemes
// const getSchemes = async (req, res) => {
//   try {
//     const schemes = await Scheme.find({ isActive: true }).populate(
//       "accountHead",
//       "code name"
//     );
//     res.json(schemes);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Add new scheme (Admin Only)
// // @route   POST /api/schemes
// const createScheme = async (req, res) => {
//   try {
//     const { name, description, accountHead } = req.body;
//     const scheme = await Scheme.create({ name, description, accountHead });
//     res.status(201).json(scheme);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // @desc    Delete scheme
// // @route   DELETE /api/schemes/:id
// const deleteScheme = async (req, res) => {
//   try {
//     await Scheme.findByIdAndDelete(req.params.id);
//     res.json({ message: "Scheme removed" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = { getSchemes, createScheme, deleteScheme };
const Scheme = require("../models/Scheme");

// @desc    Get all schemes
const getSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find({ isActive: true }).populate(
      "accountHead",
      "code name",
    );
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new scheme
const createScheme = async (req, res) => {
  try {
    const { name, description, accountHead, defaultRate } = req.body;
    const scheme = await Scheme.create({
      name,
      description,
      accountHead,
      defaultRate: Number(defaultRate) || 0,
    });
    res.status(201).json(scheme);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- NEW: Edit existing scheme ---
// @desc    Update scheme
const updateScheme = async (req, res) => {
  try {
    const { name, description, accountHead, defaultRate } = req.body;
    const scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      { name, description, accountHead, defaultRate: Number(defaultRate) || 0 },
      { new: true },
    );
    res.json(scheme);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete scheme
const deleteScheme = async (req, res) => {
  try {
    await Scheme.findByIdAndDelete(req.params.id);
    res.json({ message: "Scheme removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSchemes, createScheme, updateScheme, deleteScheme };
