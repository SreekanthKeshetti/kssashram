const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const { uploadCloud } = require("../config/cloudinaryConfig");

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
  getPublicDonationInfo,
  getRenewals,
  addFollowUpNote,
} = require("../controllers/donationController");

const { protect, staff } = require("../middleware/authMiddleware");

// --- ROUTES ---

router.get("/search", protect, getDonorByPhone);
router.get("/tax-certificate", protect, generateTaxCertificate);

// --- SPRINT 2 CRM ROUTES ---
router.get("/renewals", protect, staff, getRenewals);
router.post("/:id/followup", protect, staff, addFollowUpNote);

router.route("/").post(protect, createDonation).get(protect, getDonations);
router.get("/:id/receipt", protect, downloadReceipt);

router.get("/public/info/:id", getPublicDonationInfo);
router.get("/public/receipt/:id", downloadReceipt);
router.post("/public", createPublicDonation);

router.post("/:id/email", protect, emailReceipt);

router.post("/:id/upload", protect, uploadCloud.array("files", 5), uploadMedia);
router.delete("/:id/media", protect, deleteMedia);

router.get("/my", protect, getMyDonations);
router.get("/daily-seva", protect, getDailySevaList);

router.post("/import", protect, uploadLocal.single("file"), importDonations);
router.put("/:id/cancel", protect, cancelDonation);
router.put("/:id", protect, updateDonation);

module.exports = router;
