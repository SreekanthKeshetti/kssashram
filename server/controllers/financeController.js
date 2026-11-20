// const Voucher = require("../models/Voucher");
// const Donation = require("../models/Donation");
// const { buildVoucherPDF } = require("../utils/generateVoucherPDF");
// const { logAudit } = require("../utils/auditLogger");
// const AccountHead = require("../models/AccountHead");

// // @desc    Create a new Voucher (Supports Direct Bill Attachments)
// // @route   POST /api/finance/vouchers
// const createVoucher = async (req, res) => {
//   try {
//     const {
//       voucherType,
//       accountHead,
//       amount,
//       description,
//       paymentMode,
//       branch,
//       recipientName,
//       paymentDetails,
//     } = req.body;

//     let finalBranch = "KarunaSri Seva Samithi";
//     if (req.user.role === "kba_manager") finalBranch = "Karunya Bharathi";
//     else if (req.user.role === "ksa_manager") finalBranch = "Karunya Sindhu";
//     else finalBranch = branch || "KarunaSri Seva Samithi";

//     const voucherNo = "VCH-" + Date.now().toString().slice(-6);

//     // Parse paymentDetails safely if passed via FormData as string
//     let parsedPaymentDetails = paymentDetails;
//     if (typeof paymentDetails === "string") {
//       try {
//         parsedPaymentDetails = JSON.parse(paymentDetails);
//       } catch (e) {
//         parsedPaymentDetails = {};
//       }
//     }

//     // Collect uploaded bill images/PDFs if attached during creation (Option B)
//     let initialAttachments = [];
//     if (req.files && req.files.length > 0) {
//       initialAttachments = req.files.map((file) => file.path);
//     }

//     const voucher = await Voucher.create({
//       voucherType,
//       voucherNo,
//       accountHead,
//       amount: Number(amount),
//       description,
//       paymentMode,
//       paymentDetails: parsedPaymentDetails,
//       branch: finalBranch,
//       recipientName,
//       preparedBy: req.user._id,
//       status: "Pending",
//       attachments: initialAttachments,
//     });

//     await logAudit(
//       req,
//       "CREATE",
//       "Finance",
//       voucher._id,
//       `Created Voucher ${voucherNo} for Rs.${amount} with ${initialAttachments.length} bill attachment(s)`,
//     );

//     res.status(201).json(voucher);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // @desc    Get all vouchers
// // @route   GET /api/finance/vouchers
// const getVouchers = async (req, res) => {
//   try {
//     const { role, branch } = req.user;
//     let query = {};

//     if (["admin", "president", "secretary", "treasurer"].includes(role)) {
//       // Global View
//     } else if (role === "kba_manager") {
//       query.branch = "Karunya Bharathi";
//     } else if (role === "ksa_manager") {
//       query.branch = "Karunya Sindhu";
//     } else {
//       query.branch = branch || "KarunaSri Seva Samithi";
//     }

//     const vouchers = await Voucher.find(query)
//       .populate("accountHead", "code name")
//       .populate("preparedBy", "name")
//       .populate("approvals.level1.approver", "name")
//       .populate("approvals.level2.approver", "name")
//       .sort({ createdAt: -1 });

//     res.json(vouchers);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Approve Voucher (Strict Hierarchy: L1 Secretary/President -> L2 Treasurer)
// // @route   PUT /api/finance/vouchers/:id/approve
// const approveVoucher = async (req, res) => {
//   try {
//     const voucher = await Voucher.findById(req.params.id);
//     if (!voucher) return res.status(404).json({ message: "Voucher not found" });

//     const { role } = req.user;

//     // --- LEVEL 1 APPROVAL (Secretary OR President OR Admin) ---
//     if (role === "secretary" || role === "president" || role === "admin") {
//       if (voucher.approvals.level1.status === "Approved") {
//         return res.status(400).json({ message: "Level 1 already approved." });
//       }

//       voucher.approvals.level1 = {
//         approver: req.user._id,
//         date: Date.now(),
//         status: "Approved",
//       };

//       voucher.status = "Partially Approved";
//     }
//     // --- LEVEL 2 APPROVAL (Treasurer) ---
//     else if (role === "treasurer") {
//       if (voucher.approvals.level1.status !== "Approved") {
//         return res.status(400).json({
//           message:
//             "Cannot approve: Waiting for President/Secretary approval first.",
//         });
//       }

//       voucher.approvals.level2 = {
//         approver: req.user._id,
//         date: Date.now(),
//         status: "Approved",
//       };

//       voucher.status = "Approved"; // Fully Approved
//     } else {
//       return res
//         .status(403)
//         .json({ message: "Not authorized to approve vouchers." });
//     }

//     await logAudit(
//       req,
//       "APPROVE",
//       "Finance",
//       voucher._id,
//       `Voucher Signed by ${role} (${req.user.name})`,
//     );

//     await voucher.save();

//     const updatedVoucher = await Voucher.findById(req.params.id)
//       .populate("accountHead", "code name")
//       .populate("preparedBy", "name")
//       .populate("approvals.level1.approver", "name")
//       .populate("approvals.level2.approver", "name");

//     res.json(updatedVoucher);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Download Voucher PDF
// // @route   GET /api/finance/vouchers/:id/pdf
// const downloadVoucherPDF = async (req, res) => {
//   try {
//     const voucher = await Voucher.findById(req.params.id)
//       .populate("accountHead", "code name")
//       .populate("preparedBy", "name")
//       .populate("approvals.level1.approver", "name")
//       .populate("approvals.level2.approver", "name");

//     if (!voucher) return res.status(404).json({ message: "Voucher not found" });

//     const filename = `${voucher.voucherNo}.pdf`;
//     res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
//     res.setHeader("Content-type", "application/pdf");

//     buildVoucherPDF(
//       voucher,
//       (chunk) => res.write(chunk),
//       () => res.end(),
//     );
//   } catch (error) {
//     console.error("PDF Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Get Current Cash Balance
// // @route   GET /api/finance/cash-balance
// const getCashBalance = async (req, res) => {
//   try {
//     const { role, branch } = req.user;
//     let queryBranch = "KarunaSri Seva Samithi";

//     if (role === "kba_manager") {
//       queryBranch = "Karunya Bharathi";
//     } else if (role === "ksa_manager") {
//       queryBranch = "Karunya Sindhu";
//     } else {
//       queryBranch = branch || "KarunaSri Seva Samithi";
//     }

//     let totalDonationCash = 0;

//     if (queryBranch === "KarunaSri Seva Samithi") {
//       const donations = await Donation.find({
//         paymentMode: "Cash",
//         status: "Active",
//       });
//       totalDonationCash = donations.reduce((acc, item) => acc + item.amount, 0);
//     } else {
//       totalDonationCash = 0;
//     }

//     const vouchers = await Voucher.find({
//       branch: queryBranch,
//       status: "Approved",
//     });

//     const voucherIncome = vouchers
//       .filter((v) => {
//         if (v.voucherType !== "Credit") return false;
//         if (queryBranch === "KarunaSri Seva Samithi") return true;
//         return (
//           v.description && v.description.includes("Funds Received from HQ")
//         );
//       })
//       .reduce((acc, v) => acc + v.amount, 0);

//     const voucherExpense = vouchers
//       .filter((v) => v.voucherType === "Debit")
//       .reduce((acc, v) => acc + v.amount, 0);

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

// // @desc    Reconcile Cash (Create Adjustment Voucher)
// // @route   POST /api/finance/reconcile
// const reconcileCash = async (req, res) => {
//   try {
//     const { systemBalance, physicalBalance, remark } = req.body;
//     const difference = physicalBalance - systemBalance;

//     if (difference === 0) {
//       return res
//         .status(400)
//         .json({ message: "Balances match. No adjustment needed." });
//     }

//     const type = difference < 0 ? "Debit" : "Credit";
//     const amount = Math.abs(difference);

//     // Safely retrieve an account head to prevent CastError
//     let adjustmentHead = await AccountHead.findOne({
//       name: { $regex: /adjustment|reconciliation|cash/i },
//     });
//     if (!adjustmentHead) {
//       adjustmentHead = await AccountHead.findOne({ type: type });
//     }

//     const voucherNo = "ADJ-" + Date.now().toString().slice(-6);

//     const adjustmentVoucher = await Voucher.create({
//       voucherType: type,
//       voucherNo,
//       accountHead: adjustmentHead ? adjustmentHead._id : null,
//       amount,
//       description: `Cash Reconciliation | System: ${systemBalance} | Physical: ${physicalBalance} | Reason: ${remark}`,
//       paymentMode: "Cash",
//       branch: "KarunaSri Seva Samithi",
//       status: "Approved",
//       preparedBy: req.user._id,
//       approvals: {
//         level1: {
//           status: "Approved",
//           date: Date.now(),
//           approver: req.user._id,
//         },
//         level2: {
//           status: "Approved",
//           date: Date.now(),
//           approver: req.user._id,
//         },
//       },
//     });

//     res.status(201).json(adjustmentVoucher);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Transfer Funds from HQ to Branch
// // @route   POST /api/finance/transfer
// const transferFunds = async (req, res) => {
//   try {
//     const { toBranch, amount, paymentMode, description, paymentDetails } =
//       req.body;
//     const fromBranch = "KarunaSri Seva Samithi";

//     let transferHead = await AccountHead.findOne({ code: "220" });
//     if (!transferHead)
//       transferHead = await AccountHead.findOne({ type: "Credit" });

//     if (!transferHead) {
//       return res.status(500).json({
//         message: "System Error: No Account Head found for Transfer logic.",
//       });
//     }

//     const debitVoucherNo = "TRF-DR-" + Date.now().toString().slice(-6);
//     await Voucher.create({
//       voucherType: "Debit",
//       voucherNo: debitVoucherNo,
//       accountHead: transferHead._id,
//       amount: Number(amount),
//       description: `Fund Transfer to ${toBranch} | ${description}`,
//       paymentMode,
//       paymentDetails,
//       branch: fromBranch,
//       status: "Approved",
//       preparedBy: req.user._id,
//       recipientName: toBranch,
//       approvals: {
//         level1: {
//           status: "Approved",
//           date: Date.now(),
//           approver: req.user._id,
//         },
//         level2: {
//           status: "Approved",
//           date: Date.now(),
//           approver: req.user._id,
//         },
//       },
//     });

//     const creditVoucherNo = "TRF-CR-" + Date.now().toString().slice(-6);
//     await Voucher.create({
//       voucherType: "Credit",
//       voucherNo: creditVoucherNo,
//       accountHead: transferHead._id,
//       amount: Number(amount),
//       description: `Funds Received from HQ | ${description}`,
//       paymentMode,
//       paymentDetails,
//       branch: toBranch,
//       status: "Approved",
//       preparedBy: req.user._id,
//       recipientName: "KarunaSri Seva Samithi",
//       approvals: {
//         level1: {
//           status: "Approved",
//           date: Date.now(),
//           approver: req.user._id,
//         },
//         level2: {
//           status: "Approved",
//           date: Date.now(),
//           approver: req.user._id,
//         },
//       },
//     });

//     await logAudit(
//       req,
//       "CREATE",
//       "Finance",
//       debitVoucherNo,
//       `Transferred ${amount} to ${toBranch}`,
//     );

//     res
//       .status(201)
//       .json({ message: `Successfully transferred ₹${amount} to ${toBranch}` });
//   } catch (error) {
//     console.error("Transfer Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Cancel a Voucher
// // @route   PUT /api/finance/vouchers/:id/cancel
// const cancelVoucher = async (req, res) => {
//   try {
//     const { reason } = req.body;
//     if (!reason) return res.status(400).json({ message: "Reason required" });

//     const voucher = await Voucher.findById(req.params.id);
//     if (!voucher) return res.status(404).json({ message: "Voucher not found" });

//     voucher.status = "Cancelled";
//     voucher.cancellationReason = reason;
//     voucher.cancelledBy = req.user._id;

//     await voucher.save();

//     await logAudit(
//       req,
//       "CANCEL",
//       "Finance",
//       voucher.voucherNo,
//       `Cancelled Voucher. Reason: ${reason}`,
//     );

//     res.json({ message: "Voucher Cancelled" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // =========================================================
// // NEW: UPLOAD BILL ATTACHMENTS (Cloudinary)
// // =========================================================
// // @desc    Upload Bill Images/PDFs to a Voucher
// // @route   POST /api/finance/vouchers/:id/upload
// const uploadVoucherBills = async (req, res) => {
//   try {
//     const voucher = await Voucher.findById(req.params.id);
//     if (!voucher) {
//       return res.status(404).json({ message: "Voucher not found" });
//     }

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: "No files uploaded" });
//     }

//     const filePaths = req.files.map((file) => file.path);
//     if (!voucher.attachments) voucher.attachments = [];
//     voucher.attachments.push(...filePaths);

//     await voucher.save();

//     await logAudit(
//       req,
//       "UPLOAD",
//       "Finance",
//       voucher._id,
//       `Uploaded ${filePaths.length} bill document(s) to Voucher ${voucher.voucherNo}`,
//     );

//     res.json({
//       message: "Bills uploaded successfully",
//       attachments: voucher.attachments,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // =========================================================
// // NEW: DELETE BILL ATTACHMENT (WITH STRICT APPROVAL LOCK)
// // =========================================================
// // @desc    Delete a Bill Attachment from a Voucher
// // @route   DELETE /api/finance/vouchers/:id/attachment
// const deleteVoucherBill = async (req, res) => {
//   try {
//     const { filePath } = req.body;
//     const voucher = await Voucher.findById(req.params.id);
//     if (!voucher) {
//       return res.status(404).json({ message: "Voucher not found" });
//     }

//     // STRICT SAFETY RULE: Cannot delete bills from a fully approved voucher unless Admin
//     if (voucher.status === "Approved" && req.user.role !== "admin") {
//       return res.status(403).json({
//         message:
//           "Security Lock: Bills cannot be removed from a fully approved voucher. Contact Admin for authorization.",
//       });
//     }

//     voucher.attachments = (voucher.attachments || []).filter(
//       (path) => path !== filePath,
//     );
//     await voucher.save();

//     await logAudit(
//       req,
//       "DELETE",
//       "Finance",
//       voucher._id,
//       `Removed bill attachment from Voucher ${voucher.voucherNo}`,
//     );

//     res.json({
//       message: "Bill attachment removed",
//       attachments: voucher.attachments,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = {
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
// };
const Voucher = require("../models/Voucher");
const Donation = require("../models/Donation");
const { buildVoucherPDF } = require("../utils/generateVoucherPDF");
const { logAudit } = require("../utils/auditLogger");
const AccountHead = require("../models/AccountHead");

// Helper: Calculate branch live petty cash balance and spending limit
const calculateBranchPettyCash = async (branchName) => {
  const vouchers = await Voucher.find({
    branch: branchName,
    status: { $ne: "Cancelled" },
  });

  // Total Petty Cash Inflow received from HQ
  const pettyCashReceived = vouchers
    .filter(
      (v) =>
        v.voucherType === "Credit" &&
        v.status === "Approved" &&
        (v.voucherSubtype === "Petty_Cash_Disbursement" ||
          (v.description && v.description.includes("Funds Received from HQ"))),
    )
    .reduce((acc, v) => acc + v.amount, 0);

  // Total Approved Expenses
  const approvedSpent = vouchers
    .filter((v) => v.voucherType === "Debit" && v.status === "Approved")
    .reduce((acc, v) => acc + v.amount, 0);

  // Total Pending Expenses in review pipeline
  const pendingSpent = vouchers
    .filter(
      (v) =>
        v.voucherType === "Debit" &&
        (v.status === "Pending" || v.status === "Partially Approved"),
    )
    .reduce((acc, v) => acc + v.amount, 0);

  const systemBalance = pettyCashReceived - approvedSpent; // Physical cash on books
  const availableToSpend = systemBalance - pendingSpent; // Safe balance remaining

  return {
    pettyCashReceived,
    approvedSpent,
    pendingSpent,
    systemBalance,
    availableToSpend,
  };
};

// @desc    Create a new Voucher (Supports Direct Bill Attachments + Overdraft Guard)
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

    const voucherAmount = Number(amount);

    // --- OVERDRAFT GUARD: BRANCH CAN ONLY SPEND WITHIN THEIR ALLOCATED PETTY CASH ---
    if (
      voucherType === "Debit" &&
      finalBranch !== "KarunaSri Seva Samithi" &&
      finalBranch !== "Headquarters" &&
      req.user.role !== "admin"
    ) {
      const { availableToSpend, systemBalance } =
        await calculateBranchPettyCash(finalBranch);

      if (voucherAmount > availableToSpend) {
        return res.status(400).json({
          message: `Overdraft Protection: Insufficient Petty Cash in ${finalBranch}! Available balance is ₹${availableToSpend.toLocaleString(
            "en-IN",
          )} (Total in Hand: ₹${systemBalance.toLocaleString(
            "en-IN",
          )}). Please submit your vouchers and request a float replenishment from KSS Headquarters.`,
        });
      }
    }

    const voucherNo = "VCH-" + Date.now().toString().slice(-6);

    let parsedPaymentDetails = paymentDetails;
    if (typeof paymentDetails === "string") {
      try {
        parsedPaymentDetails = JSON.parse(paymentDetails);
      } catch (e) {
        parsedPaymentDetails = {};
      }
    }

    let initialAttachments = [];
    if (req.files && req.files.length > 0) {
      initialAttachments = req.files.map((file) => file.path);
    }

    const voucher = await Voucher.create({
      voucherType,
      voucherNo,
      accountHead,
      amount: voucherAmount,
      description,
      paymentMode,
      paymentDetails: parsedPaymentDetails,
      branch: finalBranch,
      recipientName,
      preparedBy: req.user._id,
      status: "Pending",
      attachments: initialAttachments,
    });

    await logAudit(
      req,
      "CREATE",
      "Finance",
      voucher._id,
      `Created Voucher ${voucherNo} for Rs.${voucherAmount} with ${initialAttachments.length} bill attachment(s)`,
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

    if (["admin", "president", "secretary", "treasurer"].includes(role)) {
      // Global View
    } else if (role === "kba_manager") {
      query.branch = "Karunya Bharathi";
    } else if (role === "ksa_manager") {
      query.branch = "Karunya Sindhu";
    } else {
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

// @desc    Approve Voucher (Strict Hierarchy: L1 Secretary/President -> L2 Treasurer)
// @route   PUT /api/finance/vouchers/:id/approve
const approveVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Voucher not found" });

    const { role } = req.user;

    // --- LEVEL 1 APPROVAL (Secretary OR President OR Admin) ---
    if (role === "secretary" || role === "president" || role === "admin") {
      if (voucher.approvals.level1.status === "Approved") {
        return res.status(400).json({ message: "Level 1 already approved." });
      }

      voucher.approvals.level1 = {
        approver: req.user._id,
        date: Date.now(),
        status: "Approved",
      };

      voucher.status = "Partially Approved";
    }
    // --- LEVEL 2 APPROVAL (Treasurer) ---
    else if (role === "treasurer") {
      if (voucher.approvals.level1.status !== "Approved") {
        return res.status(400).json({
          message:
            "Cannot approve: Waiting for President/Secretary approval first.",
        });
      }

      voucher.approvals.level2 = {
        approver: req.user._id,
        date: Date.now(),
        status: "Approved",
      };

      voucher.status = "Approved";
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
const downloadVoucherPDF = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id)
      .populate("accountHead", "code name")
      .populate("preparedBy", "name")
      .populate("approvals.level1.approver", "name")
      .populate("approvals.level2.approver", "name");

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

// @desc    Get Current Cash & Petty Cash Balance
// @route   GET /api/finance/cash-balance
const getCashBalance = async (req, res) => {
  try {
    const { role, branch } = req.user;
    let queryBranch = "KarunaSri Seva Samithi";

    if (role === "kba_manager") {
      queryBranch = "Karunya Bharathi";
    } else if (role === "ksa_manager") {
      queryBranch = "Karunya Sindhu";
    } else {
      queryBranch = branch || "KarunaSri Seva Samithi";
    }

    // --- RULE: RING-FENCED DONATIONS ---
    // Only KSS (HQ) pools donations. Branches see ZERO from donations for spending.
    if (queryBranch === "KarunaSri Seva Samithi" || queryBranch === "Headquarters") {
      const donations = await Donation.find({
        paymentMode: "Cash",
        status: "Active",
      });
      const totalDonationCash = donations.reduce((acc, item) => acc + item.amount, 0);

      const vouchers = await Voucher.find({
        branch: { $in: ["KarunaSri Seva Samithi", "Headquarters"] },
        status: "Approved",
      });

      const voucherIncome = vouchers
        .filter((v) => v.voucherType === "Credit")
        .reduce((acc, v) => acc + v.amount, 0);

      const voucherExpense = vouchers
        .filter((v) => v.voucherType === "Debit")
        .reduce((acc, v) => acc + v.amount, 0);

      const systemBalance = totalDonationCash + voucherIncome - voucherExpense;

      return res.json({
        branch: queryBranch,
        isBranch: false,
        systemBalance,
        availableToSpend: systemBalance,
        totalDonations: totalDonationCash,
      });
    } else {
      // BRANCH OPERATION: PURE PETTY CASH ADVANCE
      const {
        pettyCashReceived,
        approvedSpent,
        pendingSpent,
        systemBalance,
        availableToSpend,
      } = await calculateBranchPettyCash(queryBranch);

      return res.json({
        branch: queryBranch,
        isBranch: true,
        systemBalance, // Cash in drawer
        availableToSpend, // Safe to spend (accounting for pending vouchers)
        pettyCashReceived,
        approvedSpent,
        pendingSpent,
      });
    }
  } catch (error) {
    console.error("Balance Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Central Leadership Monitor: Petty Cash Overview Across All Branches
// @route   GET /api/finance/petty-cash-overview
const getPettyCashOverview = async (req, res) => {
  try {
    const branches = [
      "Karunya Sindhu",
      "Karunya Bharathi",
      "Karunya Jyothi",
    ];

    const branchReports = [];

    for (const bName of branches) {
      const stats = await calculateBranchPettyCash(bName);
      branchReports.push({
        branch: bName,
        floatReceived: stats.pettyCashReceived,
        spentApproved: stats.approvedSpent,
        pendingApproval: stats.pendingSpent,
        cashInHand: stats.systemBalance,
        availableToSpend: stats.availableToSpend,
      });
    }

    res.json(branchReports);
  } catch (error) {
    console.error("Petty Cash Overview Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reconcile Cash (Create Adjustment Voucher)
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

    const type = difference < 0 ? "Debit" : "Credit";
    const amount = Math.abs(difference);

    let adjustmentHead = await AccountHead.findOne({
      name: { $regex: /adjustment|reconciliation|cash/i },
    });
    if (!adjustmentHead) {
      adjustmentHead = await AccountHead.findOne({ type: type });
    }

    const voucherNo = "ADJ-" + Date.now().toString().slice(-6);

    const adjustmentVoucher = await Voucher.create({
      voucherType: type,
      voucherNo,
      accountHead: adjustmentHead ? adjustmentHead._id : null,
      amount,
      description: `Cash Reconciliation | System: ${systemBalance} | Physical: ${physicalBalance} | Reason: ${remark}`,
      paymentMode: "Cash",
      branch: "KarunaSri Seva Samithi",
      status: "Approved",
      preparedBy: req.user._id,
      approvals: {
        level1: { status: "Approved", date: Date.now(), approver: req.user._id },
        level2: { status: "Approved", date: Date.now(), approver: req.user._id },
      },
    });

    res.status(201).json(adjustmentVoucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Transfer Funds / Monthly Petty Cash Float from HQ to Branch
// @route   POST /api/finance/transfer
const transferFunds = async (req, res) => {
  try {
    const { toBranch, amount, paymentMode, description, paymentDetails } =
      req.body;
    const fromBranch = "KarunaSri Seva Samithi";

    let transferHead = await AccountHead.findOne({ code: "220" });
    if (!transferHead)
      transferHead = await AccountHead.findOne({ type: "Credit" });

    if (!transferHead) {
      return res.status(500).json({
        message: "System Error: No Account Head found for Transfer logic.",
      });
    }

    const debitVoucherNo = "TRF-DR-" + Date.now().toString().slice(-6);
    await Voucher.create({
      voucherType: "Debit",
      voucherSubtype: "Petty_Cash_Disbursement",
      voucherNo: debitVoucherNo,
      accountHead: transferHead._id,
      amount: Number(amount),
      description: `Monthly Petty Cash Disbursed to ${toBranch} | ${description}`,
      paymentMode,
      paymentDetails,
      branch: fromBranch,
      status: "Approved",
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

    const creditVoucherNo = "TRF-CR-" + Date.now().toString().slice(-6);
    await Voucher.create({
      voucherType: "Credit",
      voucherSubtype: "Petty_Cash_Disbursement",
      voucherNo: creditVoucherNo,
      accountHead: transferHead._id,
      amount: Number(amount),
      description: `Funds Received from HQ (Petty Cash Float) | ${description}`,
      paymentMode,
      paymentDetails,
      branch: toBranch,
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
      `Disbursed Petty Cash Float of ₹${amount} to ${toBranch}`,
    );

    res
      .status(201)
      .json({ message: `Successfully transferred ₹${amount} Petty Cash to ${toBranch}` });
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
    voucher.cancelledBy = req.user._id;

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

// @desc    Upload Bill Images/PDFs to a Voucher
// @route   POST /api/finance/vouchers/:id/upload
const uploadVoucherBills = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const filePaths = req.files.map((file) => file.path);
    if (!voucher.attachments) voucher.attachments = [];
    voucher.attachments.push(...filePaths);

    await voucher.save();

    await logAudit(
      req,
      "UPLOAD",
      "Finance",
      voucher._id,
      `Uploaded ${filePaths.length} bill document(s) to Voucher ${voucher.voucherNo}`,
    );

    res.json({
      message: "Bills uploaded successfully",
      attachments: voucher.attachments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a Bill Attachment from a Voucher (Protected by Treasurer Approval Lock)
// @route   DELETE /api/finance/vouchers/:id/attachment
const deleteVoucherBill = async (req, res) => {
  try {
    const { filePath } = req.body;
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    if (voucher.status === "Approved" && req.user.role !== "admin") {
      return res.status(403).json({
        message:
          "Security Lock: Bills cannot be removed from a fully approved voucher. Contact Admin for authorization.",
      });
    }

    voucher.attachments = (voucher.attachments || []).filter(
      (path) => path !== filePath,
    );
    await voucher.save();

    await logAudit(
      req,
      "DELETE",
      "Finance",
      voucher._id,
      `Removed bill attachment from Voucher ${voucher.voucherNo}`,
    );

    res.json({
      message: "Bill attachment removed",
      attachments: voucher.attachments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};