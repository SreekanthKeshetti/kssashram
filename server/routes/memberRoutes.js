const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// 1. Local Uploader (For temporary CSV imports)
const storageLocal = multer.diskStorage({
  destination(req, file, cb) {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath))
      fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    cb(null, `TEMP-MEM-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const uploadLocal = multer({ storage: storageLocal });

const {
  getMembers,
  createMember,
  addMemberActivity,
  getMemberById,
  downloadMemberForm,
  downloadBlankForm,
  approveMember,
  importMembers,
} = require("../controllers/memberController");

const { protect, staff, committee } = require("../middleware/authMiddleware");

// --- ROUTES ---
router
  .route("/")
  .get(protect, staff, getMembers)
  .post(protect, staff, createMember);

// Local for temporary CSV reading
router.post(
  "/import",
  protect,
  staff,
  uploadLocal.single("file"),
  importMembers,
);

router.post("/:id/activity", protect, staff, addMemberActivity);
router.get("/blank-form", protect, staff, downloadBlankForm);
router.get("/:id", protect, staff, getMemberById);
router.get("/:id/download", protect, staff, downloadMemberForm);
router.put("/:id/approve", protect, committee, approveMember);

module.exports = router;
