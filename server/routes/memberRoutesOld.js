// const express = require("express");
// const router = express.Router();
// const {
//   getMembers,
//   createMember,
//   addMemberActivity,
//   getMemberById,
//   downloadMemberForm,
//   downloadBlankForm,
//   approveMember,
// } = require("../controllers/memberController");
// const { protect, staff, committee } = require("../middleware/authMiddleware");

// router
//   .route("/")
//   .get(protect, staff, getMembers)
//   .post(protect, staff, createMember);
// router.post("/:id/activity", protect, staff, addMemberActivity);
// router.get("/blank-form", protect, staff, downloadBlankForm);
// router.get("/:id", protect, staff, getMemberById);
// router.get("/:id/download", protect, staff, downloadMemberForm);
// // Add Approval Route (Restricted to Committee/Admin)
// router.put("/:id/approve", protect, committee, approveMember);

// module.exports = router;
// Above is cide before we implement the import button for the memebers import.
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  getMembers,
  createMember,
  addMemberActivity,
  getMemberById,
  downloadMemberForm,
  downloadBlankForm,
  approveMember,
  importMembers, // <--- New Import Function
} = require("../controllers/memberController");
const {
  protect,
  staff,
  committee,
  admin,
} = require("../middleware/authMiddleware");

// --- MULTER CONFIGURATION FOR CSV IMPORT ---
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    cb(null, `MEM-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const checkFileType = (file, cb) => {
  const filetypes = /csv|xlsx|xls/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) return cb(null, true);
  cb("CSVs only!");
};

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});
// ------------------------------------------

router
  .route("/")
  .get(protect, staff, getMembers)
  .post(protect, staff, createMember);

// --- NEW IMPORT ROUTE ---
router.post("/import", protect, staff, upload.single("file"), importMembers);

router.post("/:id/activity", protect, staff, addMemberActivity);
router.get("/blank-form", protect, staff, downloadBlankForm);
router.get("/:id", protect, staff, getMemberById);
router.get("/:id/download", protect, staff, downloadMemberForm);
router.put("/:id/approve", protect, committee, approveMember);

module.exports = router;
