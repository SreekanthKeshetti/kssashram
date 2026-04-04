const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

// 1. Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Set up the Storage Engine (This replaces your local disk storage)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "karunasri_erp_uploads", // All files will go into this folder in your Cloudinary account
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "pdf",
      "doc",
      "docx",
      "csv",
      "xls",
      "xlsx",
    ],
    // resource_type: "auto" allows non-image files (like PDFs and CSVs) to be uploaded
    resource_type: "auto",
  },
});

const uploadCloud = multer({ storage });

module.exports = { cloudinary, uploadCloud };
