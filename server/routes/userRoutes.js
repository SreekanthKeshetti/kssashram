const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers, // <--- Import
  resetUserPassword, // <--- Import
  deleteUser,
  createUser, // <--- Import
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
// --- ADMIN USER MANAGEMENT ROUTES ---
router
  .route("/")
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser); // View All

router
  .route("/:id")
  .put(protect, admin, resetUserPassword) // Reset Pass
  .delete(protect, admin, deleteUser); // Delete User

module.exports = router;
