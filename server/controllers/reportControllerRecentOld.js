const Donation = require("../models/Donation");
const Voucher = require("../models/Voucher");
const Student = require("../models/Student");
const Inventory = require("../models/Inventory");
const AccountHead = require("../models/AccountHead");
const Scheme = require("../models/Scheme");
const Member = require("../models/Member"); // <--- Make sure Member is imported

// @desc    Get Real-Time Dashboard Stats
// @route   GET /api/reports/stats
const getDashboardStats = async (req, res) => {
  try {
    const { role, branch } = req.user;

    // --- 1. DEFINE VISIBILITY SCOPE ---
    let query = {}; // Default: No filter (See Everything)
    let isGlobalView = false;

    if (["admin", "president", "secretary", "treasurer"].includes(role)) {
      isGlobalView = true; // They see the big picture
    } else if (role === "kba_manager") {
      query.branch = "Karunya Bharathi";
    } else if (role === "ksa_manager") {
      query.branch = "Karunya Sindhu";
    } else {
      // Regular employees see their assigned branch
      query.branch = branch || "KarunaSri Seva Samithi";
    }

    // ===================================================
    // 2. FETCH DATA (FILTERED)
    // ===================================================
    const donations = await Donation.find({ ...query, status: "Active" }); // Only active donations
    const allVouchers = await Voucher.find({
      ...query,
      status: { $ne: "Cancelled" },
    }); // Only gets branch vouchers if manager
    const studentCount = await Student.countDocuments({
      ...query,
      admissionStatus: "Active",
    });
    const lowStockCount = await Inventory.countDocuments({
      ...query,
      quantity: { $lt: 10 },
    });

    // ===================================================
    // 3. CALCULATE FINANCIALS
    // ===================================================

    // A. Donations (Income)
    const totalDonations = donations.reduce(
      (acc, item) => acc + item.amount,
      0,
    );

    // Calculate specifics (Only useful if Global View, otherwise these will be 0 or equal to total)
    const donationSindu = donations
      .filter((d) => d.branch && d.branch.includes("Sindhu"))
      .reduce((acc, item) => acc + item.amount, 0);

    const donationBharathi = donations
      .filter((d) => d.branch && d.branch.includes("Bharathi"))
      .reduce((acc, item) => acc + item.amount, 0);

    const donationJyothi = donations
      .filter((d) => d.branch && d.branch.includes("Jyothi"))
      .reduce((acc, item) => acc + item.amount, 0);

    const donationKarunaSree = donations
      .filter((d) => d.branch && d.branch.includes("KarunaSri"))
      .reduce((acc, item) => acc + item.amount, 0);

    // B. Vouchers (Income & Expense)

    // --- SMART FILTERING LOGIC ---
    // If Global Admin: Exclude "Funds Received from HQ" to avoid double counting.
    // If Branch Manager: Include it, because that is their Opening Balance.

    const approvedCredit = allVouchers.filter((v) => {
      if (v.voucherType !== "Credit" || v.status !== "Approved") return false;

      // If Admin, ignore internal movements. If Branch, keep them.
      if (isGlobalView && v.description.includes("Funds Received from HQ"))
        return false;

      return true;
    });

    const totalVoucherIncome = approvedCredit.reduce(
      (acc, item) => acc + item.amount,
      0,
    );

    const approvedDebit = allVouchers.filter((v) => {
      if (v.voucherType !== "Debit" || v.status !== "Approved") return false;

      // If Admin, ignore transfers out (expense happens when branch spends it).
      // If Branch, keep normal expenses.
      if (isGlobalView && v.description.includes("Fund Transfer to"))
        return false;

      return true;
    });

    const totalExpense = approvedDebit.reduce(
      (acc, item) => acc + item.amount,
      0,
    );

    const pendingDebit = allVouchers.filter(
      (v) => v.voucherType === "Debit" && v.status !== "Approved",
    );
    const totalPendingExpense = pendingDebit.reduce(
      (acc, item) => acc + item.amount,
      0,
    );

    // Recent Activity (Filtered)
    const recentDonations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .select("donorName amount scheme createdAt branch");

    // ===================================================
    // 4. ACTION CENTER (TASKS)
    // ===================================================
    let myActions = { students: 0, members: 0, vouchers: 0 };

    if (isGlobalView) {
      const roleKey = role === "admin" ? "president" : role;

      myActions.students = await Student.countDocuments({
        [`approvals.${roleKey}.status`]: "Pending",
        admissionStatus: { $ne: "Draft" },
      });

      myActions.members = await Member.countDocuments({
        [`approvals.${roleKey}.status`]: "Pending",
      });

      if (role === "secretary" || role === "president" || role === "admin") {
        myActions.vouchers = await Voucher.countDocuments({
          "approvals.level1.status": "Pending",
        });
      } else if (role === "treasurer") {
        myActions.vouchers = await Voucher.countDocuments({
          "approvals.level1.status": "Approved",
          "approvals.level2.status": "Pending",
        });
      }
    }

    // ===================================================
    // 5. RESPONSE
    // ===================================================
    res.json({
      financials: {
        income: totalDonations + totalVoucherIncome,
        // Specifics will just be 0 if the manager doesn't have access to that branch
        incomeSindu: donationSindu,
        incomeBharathi: donationBharathi,
        incomeJyothi: donationJyothi,
        incomeKarunaSree: donationKarunaSree,

        expense: totalExpense,
        pendingExpense: totalPendingExpense,
        balance: totalDonations + totalVoucherIncome - totalExpense,
      },
      counts: {
        students: studentCount,
        lowStock: lowStockCount,
      },
      recentDonations,
      myActions,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Custom Finance Report
const getCustomFinanceReport = async (req, res) => {
  try {
    const { startDate, endDate, reportType } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Please select a date range" });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    let incomeItems = [];
    let expenseItems = [];

    if (reportType === "Income" || reportType === "All") {
      const donations = await Donation.find({
        createdAt: { $gte: start, $lte: end },
      }).populate("accountHead", "name code");

      const creditVouchers = await Voucher.find({
        voucherType: "Credit",
        status: "Approved",
        createdAt: { $gte: start, $lte: end },
      }).populate("accountHead", "name code");

      const donationMapped = donations.map((d) => ({
        date: d.createdAt,
        type: "Donation",
        head: d.accountHead
          ? `${d.accountHead.code} - ${d.accountHead.name}`
          : "General Donation",
        amount: d.amount,
        desc: `Ref: ${d.manualReceiptNo || d.paymentMode}`,
      }));

      const voucherMapped = creditVouchers.map((v) => ({
        date: v.createdAt,
        type: "Voucher (Credit)",
        head: v.accountHead
          ? `${v.accountHead.code} - ${v.accountHead.name}`
          : "Misc Income",
        amount: v.amount,
        desc: v.description,
      }));

      incomeItems = [...donationMapped, ...voucherMapped];
    }

    if (reportType === "Expense" || reportType === "All") {
      const debitVouchers = await Voucher.find({
        voucherType: "Debit",
        status: "Approved",
        createdAt: { $gte: start, $lte: end },
      }).populate("accountHead", "name code");

      expenseItems = debitVouchers.map((v) => ({
        date: v.createdAt,
        type: "Voucher (Debit)",
        head: v.accountHead
          ? `${v.accountHead.code} - ${v.accountHead.name}`
          : "General Expense",
        amount: v.amount,
        desc: v.description,
      }));
    }

    const groupByHead = (items) => {
      const map = {};
      items.forEach((item) => {
        if (!map[item.head]) map[item.head] = 0;
        map[item.head] += item.amount;
      });
      return Object.keys(map).map((k) => ({ head: k, amount: map[k] }));
    };

    res.json({
      income: {
        total: incomeItems.reduce((sum, i) => sum + i.amount, 0),
        breakdown: groupByHead(incomeItems),
        details: incomeItems,
      },
      expense: {
        total: expenseItems.reduce((sum, i) => sum + i.amount, 0),
        breakdown: groupByHead(expenseItems),
        details: expenseItems,
      },
      netSurplus:
        incomeItems.reduce((s, i) => s + i.amount, 0) -
        expenseItems.reduce((s, i) => s + i.amount, 0),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Detailed Ledger Report (Smart Lookup)
const getLedgerReport = async (req, res) => {
  try {
    const { startDate, endDate, accountId } = req.query;

    if (!startDate || !endDate || !accountId) {
      return res
        .status(400)
        .json({ message: "Dates and Account Head are required" });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // --- SMART LOOKUP LOGIC ---
    const account = await AccountHead.findById(accountId);
    if (!account) return res.status(404).json({ message: "Account not found" });

    // Find linked scheme for legacy matching
    const linkedScheme = await Scheme.findOne({ accountHead: accountId });
    const schemeName = linkedScheme ? linkedScheme.name : "###NO_MATCH###";

    // Build Query Helpers
    const donationQuery = (dateCondition) => ({
      $and: [
        dateCondition,
        {
          $or: [
            { accountHead: accountId }, // New Data
            { scheme: schemeName }, // Legacy Data
          ],
        },
      ],
    });

    const voucherQuery = (dateCondition) => ({
      accountHead: accountId,
      status: "Approved",
      ...dateCondition,
    });

    // --- 1. OPENING BALANCE ---
    const prevDonations = await Donation.find(
      donationQuery({ createdAt: { $lt: start } }),
    );
    const prevVouchers = await Voucher.find(
      voucherQuery({ createdAt: { $lt: start } }),
    );

    const prevIncome =
      prevDonations.reduce((acc, d) => acc + d.amount, 0) +
      prevVouchers
        .filter((v) => v.voucherType === "Credit")
        .reduce((acc, v) => acc + v.amount, 0);

    const prevExpense = prevVouchers
      .filter((v) => v.voucherType === "Debit")
      .reduce((acc, v) => acc + v.amount, 0);

    const openingBalance = prevIncome - prevExpense;

    // --- 2. CURRENT TRANSACTIONS ---
    const currDonations = await Donation.find(
      donationQuery({ createdAt: { $gte: start, $lte: end } }),
    );
    const currVouchers = await Voucher.find(
      voucherQuery({ createdAt: { $gte: start, $lte: end } }),
    );

    let transactions = [];

    currDonations.forEach((d) => {
      transactions.push({
        _id: d._id,
        date: d.createdAt,
        type: "Donation",
        refNo: d.receiptNo || d.manualReceiptNo || "RCPT",
        description: `Received from ${d.donorName}`,
        credit: d.amount,
        debit: 0,
      });
    });

    currVouchers.forEach((v) => {
      transactions.push({
        _id: v._id,
        date: v.createdAt,
        type: `Voucher (${v.voucherType})`,
        refNo: v.voucherNo,
        description: v.description || `Paid to ${v.recipientName}`,
        credit: v.voucherType === "Credit" ? v.amount : 0,
        debit: v.voucherType === "Debit" ? v.amount : 0,
      });
    });

    // Sort Chronologically
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // --- 3. RUNNING BALANCE ---
    let currentBal = openingBalance;
    const ledger = transactions.map((t) => {
      currentBal = currentBal + t.credit - t.debit;
      return { ...t, balance: currentBal };
    });

    const totalCredits = ledger.reduce((acc, t) => acc + t.credit, 0);
    const totalDebits = ledger.reduce((acc, t) => acc + t.debit, 0);
    const closingBalance = openingBalance + totalCredits - totalDebits;

    res.json({
      accountDetails: account,
      period: { start, end },
      openingBalance,
      transactions: ledger,
      totals: {
        totalCredit: totalCredits,
        totalDebit: totalDebits,
        closingBalance,
      },
    });
  } catch (error) {
    console.error("Ledger Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getCustomFinanceReport, getLedgerReport };
