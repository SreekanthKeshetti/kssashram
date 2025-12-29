const Voucher = require("../models/Voucher");
const Donation = require("../models/Donation"); // Import Donation model
const { buildVoucherPDF } = require("../utils/generateVoucherPDF"); // Import utility

// @desc    Create a new Voucher (Employee/Admin)
// @route   POST /api/finance/vouchers
const createVoucher = async (req, res) => {
  try {
    const {
      voucherType,
      ledgerName,
      amount,
      description,
      paymentMode,
      branch,
    } = req.body;

    // Auto-generate Voucher Number (VCH + Timestamp)
    const voucherNo = "VCH-" + Date.now().toString().slice(-6);

    const voucher = await Voucher.create({
      voucherType,
      voucherNo,
      ledgerName,
      amount,
      description,
      paymentMode,
      branch: branch || "Headquarters",
      createdBy: req.user._id,
      status: "Pending", // Always starts as Pending
    });

    res.status(201).json(voucher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all vouchers
// @route   GET /api/finance/vouchers
const getVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({}).sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve Voucher (Admin Only)
// @route   PUT /api/finance/vouchers/:id/approve
const approveVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (voucher) {
      voucher.status = "Approved";
      voucher.approvedBy = req.user._id; // Track WHO approved it
      await voucher.save();
      res.json(voucher);
    } else {
      res.status(404).json({ message: "Voucher not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Download Voucher PDF
// @route   GET /api/finance/vouchers/:id/pdf
const downloadVoucherPDF = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Voucher not found" });

    const filename = `${voucher.voucherNo}.pdf`;
    res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-type", "application/pdf");

    buildVoucherPDF(
      voucher,
      (chunk) => res.write(chunk),
      () => res.end()
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Current Cash Balance (System Calculated)
// @route   GET /api/finance/cash-balance
const getCashBalance = async (req, res) => {
  try {
    // 1. Total Cash Donations
    const donations = await Donation.find({ paymentMode: "Cash" });
    const totalDonationCash = donations.reduce(
      (acc, item) => acc + item.amount,
      0
    );

    // 2. Finance Vouchers (Cash Only)
    // Credit = Income, Debit = Expense
    const vouchers = await Voucher.find({
      paymentMode: "Cash",
      status: "Approved",
    });

    const voucherIncome = vouchers
      .filter((v) => v.voucherType === "Credit")
      .reduce((acc, v) => acc + v.amount, 0);

    const voucherExpense = vouchers
      .filter((v) => v.voucherType === "Debit")
      .reduce((acc, v) => acc + v.amount, 0);

    // 3. Calculate Net System Balance
    const systemBalance = totalDonationCash + voucherIncome - voucherExpense;

    res.json({ systemBalance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reconcile Cash (Create Adjustment Voucher) - KSS_FIN_7
// @route   POST /api/finance/reconcile
const reconcileCash = async (req, res) => {
  try {
    const { systemBalance, physicalBalance, remark } = req.body;
    const difference = physicalBalance - systemBalance;

    if (difference === 0) {
      return res
        .status(400)
        .json({ message: "Balances match. No adjustment needed." });
    }

    // Determine Voucher Type based on difference
    // If Physical < System (Negative Diff) -> We lost money -> Treat as Expense (Debit) to lower system balance
    // If Physical > System (Positive Diff) -> We found money -> Treat as Income (Credit) to raise system balance

    // Actually, for Reconciliation, we usually use "Journal" type,
    // but to adjust the math in our simple logic:
    // Loss = Debit Voucher
    // Gain = Credit Voucher

    const type = difference < 0 ? "Debit" : "Credit";
    const amount = Math.abs(difference);

    const voucherNo = "ADJ-" + Date.now().toString().slice(-6);

    const adjustmentVoucher = await Voucher.create({
      voucherType: type, // or 'Journal' if you prefer strict accounting
      voucherNo,
      ledgerName: "Cash Reconciliation Adjustment",
      amount,
      description: `System: ${systemBalance} | Physical: ${physicalBalance} | Reason: ${remark}`,
      paymentMode: "Cash",
      branch: "Headquarters",
      status: "Approved", // Auto-approve adjustments made by authorized staff
      createdBy: req.user._id,
      approvedBy: req.user._id,
    });

    res.status(201).json(adjustmentVoucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export new functions
module.exports = {
  createVoucher,
  getVouchers,
  approveVoucher,
  downloadVoucherPDF,
  getCashBalance,
  reconcileCash, // <--- Add these
};
