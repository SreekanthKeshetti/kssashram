const express = require("express");
const router = express.Router();
const {
  createVoucher,
  getVouchers,
  approveVoucher,
  downloadVoucherPDF, // Import
  getCashBalance,
  reconcileCash,
} = require("../controllers/financeController");
const { protect, admin } = require("../middleware/authMiddleware");

router
  .route("/vouchers")
  .post(protect, createVoucher)
  .get(protect, getVouchers);

router.route("/vouchers/:id/approve").put(protect, admin, approveVoucher);

// New Route for PDF
router.get("/vouchers/:id/pdf", protect, downloadVoucherPDF);
// Reconciliation Routes
router.get("/cash-balance", protect, getCashBalance);
router.post("/reconcile", protect, reconcileCash);
module.exports = router;
