const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Temp storage for zip upload
const {
  downloadBackup,
  restoreBackup,
} = require("../controllers/backupController");
const { protect, admin } = require("../middleware/authMiddleware");

// Only Admin can Download or Restore
router.get("/download", protect, admin, downloadBackup);
router.post(
  "/restore",
  protect,
  admin,
  upload.single("backupFile"),
  restoreBackup,
);

module.exports = router;
