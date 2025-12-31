const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createStudent,
  getStudents,
  approveStudent,
  updateStudent,
  getStudentById,
  deleteStudent,
  uploadDocuments,
  deleteDocument,
  addStudentLeave,
  updateLeaveStatus,
  emailProgressReport,
  updateStatutoryInfo,
} = require("../controllers/studentController");
const { protect, admin, staff } = require("../middleware/authMiddleware");
// --- MULTER CONFIG (Same as Donation) ---
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(null, `STU-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const checkFileType = (file, cb) => {
  const filetypes = /jpg|jpeg|png|pdf|doc|docx/; // Added doc/docx support
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) return cb(null, true);
  cb("Images or Documents only!");
};

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});
// ----------------------------------------

router.route("/").post(protect, createStudent).get(protect, getStudents);

router
  .route("/:id")
  .get(protect, getStudentById)
  .put(protect, updateStudent)
  .delete(protect, admin, deleteStudent); // For updating profile
router.route("/:id/approve").put(protect, approveStudent);
// --- NEW DOCUMENT ROUTES ---
router.post("/:id/upload", protect, upload.array("files", 5), uploadDocuments);
router.delete("/:id/documents", protect, deleteDocument);

// Leave Management Routes
router.post("/:id/leave", protect, addStudentLeave);
router.put("/:id/leave/:leaveId", protect, updateLeaveStatus);
// Email Sponsor Route
router.post("/:id/email-sponsor", protect, emailProgressReport);
// New Route for Legal/Statutory Updates
router.put("/:id/statutory", protect, staff, updateStatutoryInfo);

module.exports = router;
