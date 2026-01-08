// const express = require("express");
// const router = express.Router();
// const {
//   createDonation,
//   getDonations,
// } = require("../controllers/donationController");
// const { protect } = require("../middleware/authMiddleware");

// // Protect these routes so only logged-in users can access
// router.route("/").post(protect, createDonation).get(protect, getDonations);

// module.exports = router;
// const express = require("express");
// const router = express.Router();

// // IMPORTANT: Ensure you are destructuring all 4 functions from the controller
// const {
//   createDonation,
//   getDonations,
//   downloadReceipt,
//   emailReceipt,
// } = require("../controllers/donationController");

// const { protect } = require("../middleware/authMiddleware");

// // Standard Routes
// router.route("/").post(protect, createDonation).get(protect, getDonations);

// // Receipt Routes
// // If downloadReceipt is undefined, the app will crash here
// router.get("/:id/receipt", protect, downloadReceipt);
// router.post("/:id/email", protect, emailReceipt);

// module.exports = router;

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  createDonation,
  getDonations,
  downloadReceipt,
  emailReceipt,
  createPublicDonation, // <--- Import
  uploadMedia,
  deleteMedia,
  getMyDonations,
  getDonorByPhone, // <--- Import
  generateTaxCertificate, // <--- Import
  getDailySevaList,
  importDonations,
} = require("../controllers/donationController");

const { protect } = require("../middleware/authMiddleware");
// --- MULTER CONFIGURATION ---
// const storage = multer.diskStorage({
//   destination(req, file, cb) {
//     cb(null, "uploads/"); // Save to 'uploads' folder
//   },
//   filename(req, file, cb) {
//     // Rename file to: donationID-timestamp.ext
//     cb(
//       null,
//       `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
//     );
//   },
// });

// --- 2. UPDATED MULTER CONFIGURATION (Auto-Create Folder) ---
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadPath = "uploads/";

    // Check if folder exists, if not, create it
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
// -------------------------------------------------------------
// Allow only Images and Videos
const checkFileType = (file, cb) => {
  // --- FIX: ADDED 'csv' TO ALLOWED EXTENSIONS ---
  const filetypes = /jpg|jpeg|png|mp4|mov|pdf|csv|xlsx|xls/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // We relax mimetype checking for CSVs as they vary greatly (text/csv, application/vnd.ms-excel, etc)

  if (extname) {
    return cb(null, true);
  } else {
    cb("Images, Videos, PDFs, or CSVs only!"); // Updated error message
  }
};

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});
// 1. Search Route (Must be before /:id routes to avoid conflict)
router.get("/search", protect, getDonorByPhone);

// 2. Tax Certificate Route
router.get("/tax-certificate", protect, generateTaxCertificate);

// 1. Protected Routes (For Admin/Employee Dashboard)
router.route("/").post(protect, createDonation).get(protect, getDonations);

router.get("/:id/receipt", protect, downloadReceipt);
router.post("/:id/email", protect, emailReceipt);

// 2. Public Route (For Guest Website) - NO PROTECT MIDDLEWARE
router.post("/public", createPublicDonation);
// --- NEW UPLOAD ROUTE ---
// Allows uploading up to 5 files at once
router.post("/:id/upload", protect, upload.array("files", 5), uploadMedia);
router.delete("/:id/media", protect, deleteMedia); // <--- Add this
router.get("/my", protect, getMyDonations); // <--- Add this
router.get("/daily-seva", protect, getDailySevaList);
router.post("/import", protect, upload.single("file"), importDonations);

module.exports = router;
