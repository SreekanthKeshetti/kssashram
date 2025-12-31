// const Donation = require("../models/Donation");
// const Voucher = require("../models/Voucher");
// const Student = require("../models/Student");
// const Inventory = require("../models/Inventory");

// // @desc    Get Dashboard Stats (Admin/Manager)
// // @route   GET /api/reports/stats
// const getDashboardStats = async (req, res) => {
//   try {
//     // 1. Calculate Total Donations (Income)
//     const donations = await Donation.find({});
//     const totalIncome = donations.reduce((acc, item) => acc + item.amount, 0);

//     // 2. Calculate Total Expenses (Debit Vouchers)
//     // We only count 'Approved' vouchers for accurate accounting
//     const expenses = await Voucher.find({
//       voucherType: "Debit",
//       status: "Approved",
//     });
//     const totalExpense = expenses.reduce((acc, item) => acc + item.amount, 0);

//     // 3. Counts
//     const studentCount = await Student.countDocuments({
//       admissionStatus: "Active",
//     });
//     const lowStockCount = await Inventory.countDocuments({
//       quantity: { $lt: 10 },
//     });

//     // 4. Recent Transactions (Last 5 Donations)
//     const recentDonations = await Donation.find({})
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .select("donorName amount scheme createdAt");

//     res.json({
//       financials: {
//         income: totalIncome,
//         expense: totalExpense,
//         balance: totalIncome - totalExpense,
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

// module.exports = { getDashboardStats };
const Donation = require("../models/Donation");
const Voucher = require("../models/Voucher");
const Student = require("../models/Student");
const Inventory = require("../models/Inventory");

// @desc    Get Real-Time Dashboard Stats
// @route   GET /api/reports/stats
const getDashboardStats = async (req, res) => {
  try {
    // 1. Calculate Total Donations (Income)
    const donations = await Donation.find({});
    const totalIncome = donations.reduce((acc, item) => acc + item.amount, 0);

    // 2. Calculate Total Expenses (Only Approved Debit Vouchers)
    const expenses = await Voucher.find({
      voucherType: "Debit",
      status: "Approved",
    });
    const totalExpense = expenses.reduce((acc, item) => acc + item.amount, 0);

    // 3. Count Active Students (Only those with 'Active' status)
    const studentCount = await Student.countDocuments({
      admissionStatus: "Active",
    });

    // 4. Count Low Stock Items (Quantity < 10)
    const lowStockCount = await Inventory.countDocuments({
      quantity: { $lt: 10 },
    });

    // 5. Get Recent 5 Donations for the table
    const recentDonations = await Donation.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("donorName amount scheme createdAt");

    res.json({
      financials: {
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense,
      },
      counts: {
        students: studentCount,
        lowStock: lowStockCount,
      },
      recentDonations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// --- NEW: Custom Finance Report (KSS_FIN_14) ---
const getCustomFinanceReport = async (req, res) => {
  try {
    const { startDate, endDate, reportType } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Please select a date range" });
    }

    // 1. Robust Date Handling
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of day

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of day

    console.log(`[REPORT QUERY] Range: ${start} to ${end}`); // <--- DEBUG LOG

    let incomeItems = [];
    let expenseItems = [];

    // 2. Fetch Income (Donations + Credit Vouchers)
    if (reportType === "Income" || reportType === "All") {
      const donations = await Donation.find({
        createdAt: { $gte: start, $lte: end },
      }).populate("accountHead", "name code");

      console.log(`[REPORT] Found ${donations.length} Donations`); // <--- DEBUG LOG

      // Allow "Partially Approved" as well for easier testing
      const creditVouchers = await Voucher.find({
        voucherType: "Credit",
        status: { $in: ["Approved", "Partially Approved"] },
        createdAt: { $gte: start, $lte: end },
      }).populate("accountHead", "name code");

      const donationMapped = donations.map((d) => ({
        date: d.createdAt,
        type: "Donation",
        head: d.accountHead
          ? `${d.accountHead.code} - ${d.accountHead.name}`
          : "General Donation",
        amount: d.amount,
        desc: `Ref: ${d.paymentReference || d.paymentMode}`,
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

    // 3. Fetch Expense (Debit Vouchers)
    if (reportType === "Expense" || reportType === "All") {
      // Allow "Partially Approved" here too
      const debitVouchers = await Voucher.find({
        voucherType: "Debit",
        status: { $in: ["Approved", "Partially Approved"] },
        createdAt: { $gte: start, $lte: end },
      }).populate("accountHead", "name code");

      console.log(`[REPORT] Found ${debitVouchers.length} Debit Vouchers`); // <--- DEBUG LOG

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
