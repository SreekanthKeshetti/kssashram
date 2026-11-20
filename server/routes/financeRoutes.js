// const express = require("express");
// const router = express.Router();
// const { uploadCloud } = require("../config/cloudinaryConfig");

// const {
//   createVoucher,
//   getVouchers,
//   approveVoucher,
//   downloadVoucherPDF,
//   getCashBalance,
//   reconcileCash,
//   transferFunds,
//   cancelVoucher,
//   uploadVoucherBills,
//   deleteVoucherBill,
// } = require("../controllers/financeController");
// const { protect, committee, staff } = require("../middleware/authMiddleware");

// // Voucher Creation (Supports direct bill uploads during creation - Option B)
// router
//   .route("/vouchers")
//   .post(protect, uploadCloud.array("files", 5), createVoucher)
//   .get(protect, getVouchers);

// router.route("/vouchers/:id/approve").put(protect, committee, approveVoucher);

// // PDF & Financial Tools
// router.get("/vouchers/:id/pdf", protect, downloadVoucherPDF);
// router.get("/cash-balance", protect, getCashBalance);
// router.post("/reconcile", protect, reconcileCash);
// router.post("/transfer", protect, staff, transferFunds);
// router.put("/vouchers/:id/cancel", protect, committee, cancelVoucher);

// // BILLS & INVOICE ATTACHMENTS
// router.post(
//   "/vouchers/:id/upload",
//   protect,
//   staff,
//   uploadCloud.array("files", 5),
//   uploadVoucherBills,
// );
// router.delete("/vouchers/:id/attachment", protect, staff, deleteVoucherBill);

// module.exports = router;
const express = require("express");
const router = express.Router();
const { uploadCloud } = require("../config/cloudinaryConfig");

const {
  createVoucher,
  getVouchers,
  approveVoucher,
  downloadVoucherPDF,
  getCashBalance,
  getPettyCashOverview,
  reconcileCash,
  transferFunds,
  cancelVoucher,
  uploadVoucherBills,
  deleteVoucherBill,
} = require("../controllers/financeController");
const { protect, committee, staff } = require("../middleware/authMiddleware");

// Voucher Creation (Supports direct bill uploads during creation - Option B)
router
  .route("/vouchers")
  .post(protect, uploadCloud.array("files", 5), createVoucher)
  .get(protect, getVouchers);

router.route("/vouchers/:id/approve").put(protect, committee, approveVoucher);

// PDF & Financial Tools
router.get("/vouchers/:id/pdf", protect, downloadVoucherPDF);
router.get("/cash-balance", protect, getCashBalance);
router.get("/petty-cash-overview", protect, committee, getPettyCashOverview);
router.post("/reconcile", protect, reconcileCash);
router.post("/transfer", protect, staff, transferFunds);
router.put("/vouchers/:id/cancel", protect, committee, cancelVoucher);

// BILLS & INVOICE ATTACHMENTS
router.post(
  "/vouchers/:id/upload",
  protect,
  staff,
  uploadCloud.array("files", 5),
  uploadVoucherBills,
);
router.delete("/vouchers/:id/attachment", protect, staff, deleteVoucherBill);

module.exports = router;