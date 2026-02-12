const Voucher = require("../models/Voucher");
const Donation = require("../models/Donation"); // Import Donation model
const { buildVoucherPDF } = require("../utils/generateVoucherPDF"); // Import utility
const { logAudit } = require("../utils/auditLogger");
const AccountHead = require("../models/AccountHead"); // Import AccountHead
// @desc    Create a new Voucher (Employee/Admin)
// @route   POST /api/finance/vouchers
const createVoucher = async (req, res) => {
  try {
    const {
      voucherType,
      accountHead,
      amount,
      description,
      paymentMode,
      branch,
      recipientName,
      paymentDetails,
    } = req.body;

    let finalBranch = "KarunaSri Seva Samithi";
    if (req.user.role === "kba_manager") finalBranch = "Karunya Bharathi";
    else if (req.user.role === "ksa_manager") finalBranch = "Karunya Sindhu";
    else finalBranch = branch || "KarunaSri Seva Samithi";

    // Auto-generate Voucher Number (VCH + Timestamp)
    const voucherNo = "VCH-" + Date.now().toString().slice(-6);

    const voucher = await Voucher.create({
      voucherType,
      voucherNo,
      accountHead,
      amount,
      description,
      paymentMode,
      // branch: branch || "KarunaSri Seva Samithi",
      branch: finalBranch,
      recipientName,
      preparedBy: req.user._id, // The Warden/Employee logging in
      status: "Pending", // Always starts as Pending
    });
    await logAudit(
      req,
      "CREATE",
      "Finance",
      voucher._id,
      `Created Voucher ${voucherNo} for Rs.${amount}`,
    );

    res.status(201).json(voucher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all vouchers
// @route   GET /api/finance/vouchers
const getVouchers = async (req, res) => {
  try {
    const { role, branch } = req.user;
    let query = {};

    // 1. CENTRAL COMMAND (KSS - HQ)
    // Admin, President, Secretary, Treasurer can see EVERYTHING.
    if (["admin", "president", "secretary", "treasurer"].includes(role)) {
      // No filter applied, they get all documents from DB
    }
    // 2. KARUNYA BHARATHI MANAGER
    else if (role === "kba_manager") {
      query.branch = "Karunya Bharathi";
    }
    // 3. KARUNYA SINDHU MANAGER
    else if (role === "ksa_manager") {
      query.branch = "Karunya Sindhu";
    }
    // 4. OTHER STAFF (Warden/Clerk)
    // They only see what belongs to their assigned branch profile
    else {
      query.branch = branch || "KarunaSri Seva Samithi";
    }

    const vouchers = await Voucher.find(query)
      .populate("accountHead", "code name")
      .populate("preparedBy", "name")
      .populate("approvals.level1.approver", "name")
      .populate("approvals.level2.approver", "name")
      .sort({ createdAt: -1 });

    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve Voucher (Strict Hierarchy)
// Route: PUT /api/finance/vouchers/:id/approve
const approveVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Voucher not found" });

    const { role } = req.user;

    // --- LEVEL 1 APPROVAL (Secretary OR President) ---
    if (role === "secretary" || role === "president" || role === "admin") {
      // Check if already approved at Level 1
      if (voucher.approvals.level1.status === "Approved") {
        return res.status(400).json({ message: "Level 1 already approved." });
      }

      voucher.approvals.level1 = {
        approver: req.user._id,
        date: Date.now(),
        status: "Approved",
      };

      voucher.status = "Partially Approved"; // Waiting for Treasurer
    }

    // --- LEVEL 2 APPROVAL (Treasurer) ---
    else if (role === "treasurer") {
      // Check Prerequisite: Level 1 MUST be done
      if (voucher.approvals.level1.status !== "Approved") {
        return res.status(400).json({
          message:
            "Cannot approve: Waiting for President/Secretary approval first.",
        });
      }

      // Approve Level 2
      voucher.approvals.level2 = {
        approver: req.user._id,
        date: Date.now(),
        status: "Approved",
      };

      voucher.status = "Approved"; // Fully Approved
    } else {
      return res
        .status(403)
        .json({ message: "Not authorized to approve vouchers." });
    }
    await logAudit(
      req,
      "APPROVE",
      "Finance",
      voucher._id,
      `Voucher Signed by ${role} (${req.user.name})`,
    );

    await voucher.save();

    // Populate for frontend update
    const updatedVoucher = await Voucher.findById(req.params.id)
      .populate("accountHead", "code name")
      .populate("preparedBy", "name")
      .populate("approvals.level1.approver", "name")
      .populate("approvals.level2.approver", "name");

    res.json(updatedVoucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download Voucher PDF
// @route   GET /api/finance/vouchers/:id/pdf
// @desc    Download Voucher PDF
// @route   GET /api/finance/vouchers/:id/pdf
const downloadVoucherPDF = async (req, res) => {
  try {
    // FIX: Added .populate() calls to get the actual names/codes
    const voucher = await Voucher.findById(req.params.id)
      .populate("accountHead", "code name") // <--- CRITICAL FIX
      .populate("preparedBy", "name")
      .populate("approvedBy", "name");

    if (!voucher) return res.status(404).json({ message: "Voucher not found" });

    const filename = `${voucher.voucherNo}.pdf`;
    res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-type", "application/pdf");

    buildVoucherPDF(
      voucher,
      (chunk) => res.write(chunk),
      () => res.end(),
    );
  } catch (error) {
    console.error("PDF Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Current Cash Balance (System Calculated)
// @route   GET /api/finance/cash-balance
// @desc    Get Current Cash Balance (Branch Specific)
// @route   GET /api/finance/cash-balance
// const getCashBalance = async (req, res) => {
//   try {
//     const { role, branch } = req.user;

//     // 1. Determine Scope based on Role
//     let queryBranch = "KarunaSri Seva Samithi"; // Default for Admin/HQ

//     if (role === "kba_manager") {
//       queryBranch = "Karunya Bharathi";
//     } else if (role === "ksa_manager") {
//       queryBranch = "Karunya Sindhu";
//     } else {
//       // For Admin/President/Warden, use their assigned branch or default to HQ
//       // If Admin wants to see TOTAL trust balance, that's a report.
//       // Here we want "Cash in Hand" for operations.
//       queryBranch = branch || "KarunaSri Seva Samithi";
//     }

//     // 2. Calculate Cash from DONATIONS for this Branch
//     // (Only 'Cash' payment mode increases physical cash in hand)
//     const donations = await Donation.find({
//       paymentMode: "Cash",
//       branch: queryBranch,
//     });
//     const totalDonationCash = donations.reduce(
//       (acc, item) => acc + item.amount,
//       0,
//     );

//     // 3. Calculate Cash from VOUCHERS for this Branch
//     // (Funds Transfer is usually 'Bank Transfer', but if it's 'Cash' or if we track Bank Balances too, we include approved vouchers)
//     // NOTE: To track Total Funds (Bank + Cash), remove paymentMode: "Cash".
//     // Assuming we want TOTAL AVAILABLE FUNDS (Bank + Cash):
//     const vouchers = await Voucher.find({
//       branch: queryBranch,
//       status: "Approved",
//     });

//     const voucherIncome = vouchers
//       .filter((v) => v.voucherType === "Credit")
//       .reduce((acc, v) => acc + v.amount, 0);

//     const voucherExpense = vouchers
//       .filter((v) => v.voucherType === "Debit")
//       .reduce((acc, v) => acc + v.amount, 0);

//     // 4. Net Balance Calculation
//     // Balance = (Donations + Credits) - Debits
//     const systemBalance = totalDonationCash + voucherIncome - voucherExpense;

//     res.json({
//       branch: queryBranch,
//       systemBalance,
//     });
//   } catch (error) {
//     console.error("Balance Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };
const getCashBalance = async (req, res) => {
  try {
    const { role, branch } = req.user;

    // 1. Determine Scope based on Role
    let queryBranch = "KarunaSri Seva Samithi"; // Default (Headquarters)

    if (role === "kba_manager") {
      queryBranch = "Karunya Bharathi";
    } else if (role === "ksa_manager") {
      queryBranch = "Karunya Sindhu";
    } else {
      queryBranch = branch || "KarunaSri Seva Samithi";
    }

    // 2. Calculate Cash from DONATIONS
    let totalDonationCash = 0;

    // --- THE FIX IS HERE ---
    // Rule: Only KSS (Headquarters) considers Donations as "Funds Available".
    // Branches cannot spend the donations they collect; they exist only on the income record.
    // Branches only operate on Funds Transferred from KSS.

    if (queryBranch === "KarunaSri Seva Samithi") {
      // Admin/HQ sees ALL cash donations as their main pool
      const donations = await Donation.find({
        paymentMode: "Cash",
        status: "Active",
      });
      totalDonationCash = donations.reduce((acc, item) => acc + item.amount, 0);
    } else {
      // Branches see 0 from donations for their "Spending Balance"
      totalDonationCash = 0;
    }

    // 3. Calculate Cash from VOUCHERS
    // (Funds Transfer & Expenses)
    const vouchers = await Voucher.find({
      branch: queryBranch,
      status: "Approved",
    });

    // with this voucherINcome the training amont is adding to the total current balance in finance.

    // const voucherIncome = vouchers
    //   .filter((v) => v.voucherType === "Credit")
    //   .reduce((acc, v) => acc + v.amount, 0);
    // --- SPENDING LOGIC FIX ---
    const voucherIncome = vouchers
      .filter((v) => {
        if (v.voucherType !== "Credit") return false;

        // If it is HQ, they can spend all Credit money
        if (queryBranch === "KarunaSri Seva Samithi") return true;

        // If it is a BRANCH, they can ONLY spend money Transferred from HQ.
        // We filter by checking if it's a Transfer, NOT a Training Fee.
        // Training Fees usually start with "Training Fee:" (set in eventController)
        // Transfers usually start with "Funds Received from HQ" (set in financeController)
        return (
          v.description && v.description.includes("Funds Received from HQ")
        );
      })
      .reduce((acc, v) => acc + v.amount, 0);
    // -----

    const voucherExpense = vouchers
      .filter((v) => v.voucherType === "Debit")
      .reduce((acc, v) => acc + v.amount, 0);

    // 4. Net Balance Calculation
    // For Branch: 0 (Donations) + Transfer (Credit) - Expense (Debit)
    const systemBalance = totalDonationCash + voucherIncome - voucherExpense;

    res.json({
      branch: queryBranch,
      systemBalance,
    });
  } catch (error) {
    console.error("Balance Error:", error);
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
      accountHead: "Cash Reconciliation Adjustment",
      amount,
      description: `System: ${systemBalance} | Physical: ${physicalBalance} | Reason: ${remark}`,
      paymentMode: "Cash",
      branch: "KarunaSri Seva Samithi",
      status: "Approved", // Auto-approve adjustments made by authorized staff
      createdBy: req.user._id,
      approvedBy: req.user._id,
    });

    res.status(201).json(adjustmentVoucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// =========================================================
// NEW: TRANSFER FUNDS (The Missing Function)
// =========================================================
const transferFunds = async (req, res) => {
  try {
    const { toBranch, amount, paymentMode, description, paymentDetails } =
      req.body;
    const fromBranch = "KarunaSri Seva Samithi";

    // 1. Find Account Heads for Bookkeeping
    // We use "220 - CORPUS FUND" or "RESERVES" as the internal transfer head
    let transferHead = await AccountHead.findOne({ code: "220" });
    if (!transferHead)
      transferHead = await AccountHead.findOne({ type: "Credit" });

    if (!transferHead) {
      return res.status(500).json({
        message: "System Error: No Account Head found for Transfer logic.",
      });
    }

    // 2. Create DEBIT Voucher for HQ (Money Leaving)
    const debitVoucherNo = "TRF-DR-" + Date.now().toString().slice(-6);
    await Voucher.create({
      voucherType: "Debit",
      voucherNo: debitVoucherNo,
      accountHead: transferHead._id,
      amount: Number(amount),
      description: `Fund Transfer to ${toBranch} | ${description}`,
      paymentMode,
      paymentDetails,
      branch: fromBranch,
      status: "Approved", // Auto-approve internal transfer
      preparedBy: req.user._id,
      recipientName: toBranch,
      approvals: {
        level1: {
          status: "Approved",
          date: Date.now(),
          approver: req.user._id,
        },
        level2: {
          status: "Approved",
          date: Date.now(),
          approver: req.user._id,
        },
      },
    });

    // 3. Create CREDIT Voucher for Branch (Money Entering)
    const creditVoucherNo = "TRF-CR-" + Date.now().toString().slice(-6);
    await Voucher.create({
      voucherType: "Credit",
      voucherNo: creditVoucherNo,
      accountHead: transferHead._id,
      amount: Number(amount),
      description: `Funds Received from HQ | ${description}`,
      paymentMode,
      paymentDetails,
      branch: toBranch, // <--- Assigned to Destination Branch
      status: "Approved",
      preparedBy: req.user._id,
      recipientName: "KarunaSri Seva Samithi",
      approvals: {
        level1: {
          status: "Approved",
          date: Date.now(),
          approver: req.user._id,
        },
        level2: {
          status: "Approved",
          date: Date.now(),
          approver: req.user._id,
        },
      },
    });

    await logAudit(
      req,
      "CREATE",
      "Finance",
      debitVoucherNo,
      `Transferred ${amount} to ${toBranch}`,
    );

    res
      .status(201)
      .json({ message: `Successfully transferred ₹${amount} to ${toBranch}` });
  } catch (error) {
    console.error("Transfer Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a Voucher
// @route   PUT /api/finance/vouchers/:id/cancel
const cancelVoucher = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: "Reason required" });

    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Voucher not found" });

    voucher.status = "Cancelled";
    voucher.cancellationReason = reason;

    await voucher.save();

    await logAudit(
      req,
      "CANCEL",
      "Finance",
      voucher.voucherNo,
      `Cancelled Voucher. Reason: ${reason}`,
    );

    res.json({ message: "Voucher Cancelled" });
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
  transferFunds,
  cancelVoucher,
};
