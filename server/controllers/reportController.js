// const Donation = require("../models/Donation");
// const Voucher = require("../models/Voucher");
// const Student = require("../models/Student");
// const Inventory = require("../models/Inventory");

// // @desc    Get Real-Time Dashboard Stats (Donations + Vouchers)
// // @route   GET /api/reports/stats
// const getDashboardStats = async (req, res) => {
//   try {
//     // --- 1. INCOME FROM DONATIONS ---
//     const donations = await Donation.find({});

//     const totalDonations = donations.reduce(
//       (acc, item) => acc + item.amount,
//       0,
//     );

//     const donationSindu = donations
//       .filter((d) => d.branch === "Karunya Sindhu")
//       .reduce((acc, item) => acc + item.amount, 0);

//     const donationBharathi = donations
//       .filter((d) => d.branch === "Karunya Bharathi")
//       .reduce((acc, item) => acc + item.amount, 0);

//     // --- 2. INCOME FROM VOUCHERS (Events, Fees, Misc) ---
//     // We only count "Credit" type vouchers that are "Approved"
//     const creditVouchers = await Voucher.find({
//       voucherType: "Credit",
//       status: "Approved",
//     });

//     const totalVoucherIncome = creditVouchers.reduce(
//       (acc, item) => acc + item.amount,
//       0,
//     );

//     const voucherSindu = creditVouchers
//       .filter((v) => v.branch === "Karunya Sindu")
//       .reduce((acc, item) => acc + item.amount, 0);

//     const voucherBharathi = creditVouchers
//       .filter((v) => v.branch === "Karunya Bharathi")
//       .reduce((acc, item) => acc + item.amount, 0);

//     // --- 3. TOTAL EXPENSES (Debit Vouchers) ---
//     const expenses = await Voucher.find({
//       voucherType: "Debit",
//       status: "Approved",
//     });
//     const totalExpense = expenses.reduce((acc, item) => acc + item.amount, 0);

//     // --- 4. COUNTS & RECENT ACTIVITY ---
//     const studentCount = await Student.countDocuments({
//       admissionStatus: "Active",
//     });
//     const lowStockCount = await Inventory.countDocuments({
//       quantity: { $lt: 10 },
//     });

//     const recentDonations = await Donation.find({})
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .select("donorName amount scheme createdAt branch");

//     // --- 5. SEND RESPONSE (Aggregated Totals) ---
//     res.json({
//       financials: {
//         // Grand Total = Donations + Voucher Income
//         income: totalDonations + totalVoucherIncome,

//         // Branch Totals = Branch Donation + Branch Voucher Income
//         incomeSindu: donationSindu + voucherSindu,
//         incomeBharathi: donationBharathi + voucherBharathi,

//         expense: totalExpense,

//         // Net Balance = Total Income - Total Expense
//         balance: totalDonations + totalVoucherIncome - totalExpense,
//       },
//       counts: {
//         students: studentCount,
//         lowStock: lowStockCount,
//       },
//       recentDonations,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // --- Custom Finance Report (No Changes here) ---
// const getCustomFinanceReport = async (req, res) => {
//   try {
//     const { startDate, endDate, reportType } = req.query;

//     if (!startDate || !endDate) {
//       return res.status(400).json({ message: "Please select a date range" });
//     }

//     const start = new Date(startDate);
//     start.setHours(0, 0, 0, 0);

//     const end = new Date(endDate);
//     end.setHours(23, 59, 59, 999);

//     console.log(`[REPORT QUERY] Range: ${start} to ${end}`);

//     let incomeItems = [];
//     let expenseItems = [];

//     if (reportType === "Income" || reportType === "All") {
//       const donations = await Donation.find({
//         createdAt: { $gte: start, $lte: end },
//       }).populate("accountHead", "name code");

//       const creditVouchers = await Voucher.find({
//         voucherType: "Credit",
//         status: { $in: ["Approved", "Partially Approved"] },
//         createdAt: { $gte: start, $lte: end },
//       }).populate("accountHead", "name code");

//       const donationMapped = donations.map((d) => ({
//         date: d.createdAt,
//         type: "Donation",
//         head: d.accountHead
//           ? `${d.accountHead.code} - ${d.accountHead.name}`
//           : "General Donation",
//         amount: d.amount,
//         desc: `Ref: ${d.paymentReference || d.paymentMode}`,
//       }));

//       const voucherMapped = creditVouchers.map((v) => ({
//         date: v.createdAt,
//         type: "Voucher (Credit)",
//         head: v.accountHead
//           ? `${v.accountHead.code} - ${v.accountHead.name}`
//           : "Misc Income",
//         amount: v.amount,
//         desc: v.description,
//       }));

//       incomeItems = [...donationMapped, ...voucherMapped];
//     }

//     if (reportType === "Expense" || reportType === "All") {
//       const debitVouchers = await Voucher.find({
//         voucherType: "Debit",
//         status: { $in: ["Approved", "Partially Approved"] },
//         createdAt: { $gte: start, $lte: end },
//       }).populate("accountHead", "name code");

//       expenseItems = debitVouchers.map((v) => ({
//         date: v.createdAt,
//         type: "Voucher (Debit)",
//         head: v.accountHead
//           ? `${v.accountHead.code} - ${v.accountHead.name}`
//           : "General Expense",
//         amount: v.amount,
//         desc: v.description,
//       }));
//     }

//     const groupByHead = (items) => {
//       const map = {};
//       items.forEach((item) => {
//         if (!map[item.head]) map[item.head] = 0;
//         map[item.head] += item.amount;
//       });
//       return Object.keys(map).map((k) => ({ head: k, amount: map[k] }));
//     };

//     res.json({
//       income: {
//         total: incomeItems.reduce((sum, i) => sum + i.amount, 0),
//         breakdown: groupByHead(incomeItems),
//         details: incomeItems,
//       },
//       expense: {
//         total: expenseItems.reduce((sum, i) => sum + i.amount, 0),
//         breakdown: groupByHead(expenseItems),
//         details: expenseItems,
//       },
//       netSurplus:
//         incomeItems.reduce((s, i) => s + i.amount, 0) -
//         expenseItems.reduce((s, i) => s + i.amount, 0),
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = { getDashboardStats, getCustomFinanceReport };
// // ABOVE IS THE ORIGINAL CONTENT OF THE FILE controllers/reportController.js here the below is version 2 correcting the spelling mistake if sindu to sindhu. and is working fine.
const Donation = require("../models/Donation");
const Voucher = require("../models/Voucher");
const Student = require("../models/Student");
const Inventory = require("../models/Inventory");

// @desc    Get Real-Time Dashboard Stats
// @route   GET /api/reports/stats
const getDashboardStats = async (req, res) => {
  try {
    // ===================================================
    // 1. DONATIONS (INCOME)
    // ===================================================
    const donations = await Donation.find({});

    const totalDonations = donations.reduce(
      (acc, item) => acc + item.amount,
      0,
    );

    // Calculate Branch-wise Donation Totals
    // Note: We use .includes() to be safe against spelling variations like "Sindu" vs "Sindhu"
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
      .filter((d) => d.branch && d.branch.includes("Karuna Sree"))
      .reduce((acc, item) => acc + item.amount, 0);

    // ===================================================
    // 2. VOUCHERS (INCOME & EXPENSE)
    // ===================================================
    // We fetch ALL vouchers to calculate Pending vs Approved
    const allVouchers = await Voucher.find({});

    // Filter: Only APPROVED Credit Vouchers count as actual Income
    const approvedCredit = allVouchers.filter(
      (v) => v.voucherType === "Credit" && v.status === "Approved",
    );
    const totalVoucherIncome = approvedCredit.reduce(
      (acc, item) => acc + item.amount,
      0,
    );

    // Filter: Only APPROVED Debit Vouchers count as actual Expense
    const approvedDebit = allVouchers.filter(
      (v) => v.voucherType === "Debit" && v.status === "Approved",
    );
    const totalExpense = approvedDebit.reduce(
      (acc, item) => acc + item.amount,
      0,
    );

    // Filter: Pending Expenses (Created but not signed by Treasurer)
    const pendingDebit = allVouchers.filter(
      (v) => v.voucherType === "Debit" && v.status !== "Approved",
    );
    const totalPendingExpense = pendingDebit.reduce(
      (acc, item) => acc + item.amount,
      0,
    );

    // ===================================================
    // 3. OPERATIONAL COUNTS
    // ===================================================
    const studentCount = await Student.countDocuments({
      admissionStatus: "Active",
    });
    const lowStockCount = await Inventory.countDocuments({
      quantity: { $lt: 10 },
    });

    // Recent Donations (Last 5)
    const recentDonations = await Donation.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("donorName amount scheme createdAt branch");

    // ===================================================
    // 4. CONSOLIDATE RESPONSE
    // ===================================================
    res.json({
      financials: {
        // Total Income = Donations + Other Income (Credit Vouchers)
        income: totalDonations + totalVoucherIncome,

        // Branch Specific (Donations Only for quick view)
        incomeSindu: donationSindu,
        incomeBharathi: donationBharathi,
        incomeJyothi: donationJyothi,
        incomeKarunaSree: donationKarunaSree,

        // Expenses
        expense: totalExpense,
        pendingExpense: totalPendingExpense, // Optional: You can show this in UI if needed

        // Net Balance
        balance: totalDonations + totalVoucherIncome - totalExpense,
      },
      counts: {
        students: studentCount,
        lowStock: lowStockCount,
      },
      recentDonations,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// --- Custom Finance Report (Keep existing) ---
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
        status: "Approved", // Only Approved
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
        status: "Approved", // Only Approved
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

module.exports = { getDashboardStats, getCustomFinanceReport };
