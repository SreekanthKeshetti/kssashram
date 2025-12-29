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

module.exports = { getDashboardStats };
