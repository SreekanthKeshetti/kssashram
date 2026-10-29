const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// --- Import Cloudinary Storage ---
const { uploadCloud } = require("../config/cloudinaryConfig");

// Local Uploader (For temporary CSV imports)
const storageLocal = multer.diskStorage({
  destination(req, file, cb) {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath))
      fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    cb(null, `TEMP-DON-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const uploadLocal = multer({ storage: storageLocal });

const {
  createDonation,
  getDonations,
  downloadReceipt,
  emailReceipt,
  createPublicDonation,
  uploadMedia,
  deleteMedia,
  getMyDonations,
  getDonorByPhone,
  generateTaxCertificate,
  getDailySevaList,
  importDonations,
  cancelDonation,
  updateDonation,
} = require("../controllers/donationController");

const { protect } = require("../middleware/authMiddleware");

// --- ROUTES ---

// 1. Search Route (Must be before /:id routes to avoid conflict)
router.get("/search", protect, getDonorByPhone);

// 2. Tax Certificate Route
router.get("/tax-certificate", protect, generateTaxCertificate);

// 3. Protected Dashboard Routes
router.route("/").post(protect, createDonation).get(protect, getDonations);

router.get("/:id/receipt", protect, downloadReceipt);

// --- NEW: PUBLIC ROUTE FOR WHATSAPP RECEIPT DOWNLOADS ---
// Allows donors to download their PDF receipt directly on mobile without needing an ERP login
router.get("/public/receipt/:id", downloadReceipt);

router.post("/:id/email", protect, emailReceipt);

// 4. Public Route (For Guest Website)
router.post("/public", createPublicDonation);

// 5. Cloudinary Media Uploads
router.post("/:id/upload", protect, uploadCloud.array("files", 5), uploadMedia);
router.delete("/:id/media", protect, deleteMedia);

router.get("/my", protect, getMyDonations);
router.get("/daily-seva", protect, getDailySevaList);

// 6. CSV & Management
router.post("/import", protect, uploadLocal.single("file"), importDonations);
router.put("/:id/cancel", protect, cancelDonation);
router.put("/:id", protect, updateDonation);

module.exports = router;
