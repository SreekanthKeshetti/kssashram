const Donation = require("../models/Donation");
const Voucher = require("../models/Voucher");
const Student = require("../models/Student");
const Inventory = require("../models/Inventory");
const AccountHead = require("../models/AccountHead");
const Scheme = require("../models/Scheme");
const Member = require("../models/Member");
const PDFDocument = require("pdfkit");

// @desc    Get Real-Time Dashboard Stats
// @route   GET /api/reports/stats
const getDashboardStats = async (req, res) => {
  try {
    const { role, branch } = req.user;

    // --- 1. DEFINE VISIBILITY SCOPE ---
    let query = {};
    let isGlobalView = false;

    if (["admin", "president", "secretary", "treasurer"].includes(role)) {
      isGlobalView = true;
    } else if (role === "kba_manager") {
      query.branch = "Karunya Bharathi";
    } else if (role === "ksa_manager") {
      query.branch = "Karunya Sindhu";
    } else {
      query.branch = branch || "KarunaSri Seva Samithi";
    }

    // --- 2. FETCH DATA ---
    const donations = await Donation.find({ ...query, status: "Active" });
    const allVouchers = await Voucher.find({
      ...query,
      status: "Approved",
    });

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

    // --- HELPER: Calculate Fee Income (Credit Vouchers that are NOT Transfers) ---
    const getFeeIncome = (branchName) => {
      return allVouchers
        .filter(
          (v) =>
            v.voucherType === "Credit" &&
            v.branch === branchName &&
            v.description &&
            !v.description.includes("Funds Received from HQ"), // Exclude internal transfers
        )
        .reduce((acc, v) => acc + v.amount, 0);
    };

    // A. Donations (Income)
    const totalDonations = donations.reduce(
      (acc, item) => acc + item.amount,
      0,
    );

    // B. Calculate Branch Specifics (Donation + Fees)
    // KSA (Sindhu)
    const donationSindu = donations
      .filter((d) => d.branch && d.branch.includes("Sindhu"))
      .reduce((acc, item) => acc + item.amount, 0);
    const feeSindu = getFeeIncome("Karunya Sindhu");
    const totalSindu = donationSindu + feeSindu;

    // KBA (Bharathi)
    const donationBharathi = donations
      .filter((d) => d.branch && d.branch.includes("Bharathi"))
      .reduce((acc, item) => acc + item.amount, 0);
    const feeBharathi = getFeeIncome("Karunya Bharathi");
    const totalBharathi = donationBharathi + feeBharathi;

    // Jyothi
    const donationJyothi = donations
      .filter((d) => d.branch && d.branch.includes("Jyothi"))
      .reduce((acc, item) => acc + item.amount, 0);
    const feeJyothi = getFeeIncome("Karunya Jyothi");
    const totalJyothi = donationJyothi + feeJyothi;

    // HQ (KarunaSri)
    const donationKarunaSree = donations
      .filter((d) => d.branch && d.branch.includes("KarunaSri"))
      .reduce((acc, item) => acc + item.amount, 0);
    const feeKarunaSree =
      getFeeIncome("KarunaSri Seva Samithi") + getFeeIncome("Headquarters");

    // C. TOTAL SYSTEM INCOME (Donations + All Operational Fees)
    const totalFeeIncome = allVouchers
      .filter(
        (v) =>
          v.voucherType === "Credit" &&
          v.description &&
          !v.description.includes("Funds Received from HQ"),
      )
      .reduce((acc, v) => acc + v.amount, 0);

    const grandTotalIncome = totalDonations + totalFeeIncome;

    // D. EXPENSES
    // Filter Debit Vouchers
    const approvedDebit = allVouchers.filter((v) => v.voucherType === "Debit");

    // Calculate Total Expense
    const totalExpense = approvedDebit
      .filter((v) => {
        // If Global View, exclude "Fund Transfer to" (it's internal movement)
        if (
          isGlobalView &&
          v.description &&
          v.description.includes("Fund Transfer to")
        )
          return false;
        return true;
      })
      .reduce((acc, item) => acc + item.amount, 0);

    // Pending Expenses
    const pendingVouchers = await Voucher.find({
      ...query,
      voucherType: "Debit",
      status: "Pending",
    });
    const totalPendingExpense = pendingVouchers.reduce(
      (acc, item) => acc + item.amount,
      0,
    );

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

    // Recent Activity
    const recentDonations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .select("donorName amount scheme createdAt branch");

    // ===================================================
    // 5. RESPONSE
    // ===================================================
    res.json({
      financials: {
        income: grandTotalIncome,
        incomeSindu: totalSindu,
        incomeBharathi: totalBharathi,
        incomeJyothi: totalJyothi,
        incomeKarunaSree: donationKarunaSree + feeKarunaSree,

        expense: totalExpense,
        pendingExpense: totalPendingExpense,
        // Balance = Total Income - Total Expense
        balance: grandTotalIncome - totalExpense,
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

// @desc    Advanced Custom Finance Report (Summary & Ledger)
const getCustomFinanceReport = async (req, res) => {
  try {
    const { startDate, endDate, reportType, accountHeadId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Please select a date range" });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // --- SCENARIO 1: SPECIFIC LEDGER (Account Head Selected) ---
    if (accountHeadId && accountHeadId !== "All") {
      // 1. Calculate Opening Balance (Before Start Date)
      const prevDonations = await Donation.find({
        accountHead: accountHeadId,
        createdAt: { $lt: start },
        status: "Active",
      });
      const prevVouchers = await Voucher.find({
        accountHead: accountHeadId,
        status: "Approved",
        createdAt: { $lt: start },
      });

      let openingBalance = 0;
      prevDonations.forEach((d) => (openingBalance += d.amount));
      prevVouchers.forEach((v) => {
        if (v.voucherType === "Credit") openingBalance += v.amount;
        if (v.voucherType === "Debit") openingBalance -= v.amount;
      });

      // 2. Get Transactions (In Date Range)
      const rangeDonations = await Donation.find({
        accountHead: accountHeadId,
        createdAt: { $gte: start, $lte: end },
        status: "Active",
      });
      const rangeVouchers = await Voucher.find({
        accountHead: accountHeadId,
        status: "Approved",
        createdAt: { $gte: start, $lte: end },
      });

      // 3. Merge & Sort
      const transactions = [
        ...rangeDonations.map((d) => ({
          date: d.createdAt,
          desc: `Donation: ${d.donorName} (${d.paymentMode})`,
          ref: d.receiptNo || "N/A",
          debit: 0,
          credit: d.amount,
        })),
        ...rangeVouchers.map((v) => ({
          date: v.createdAt,
          desc: `Voucher: ${v.description} (${v.recipientName || ""})`,
          ref: v.voucherNo,
          debit: v.voucherType === "Debit" ? v.amount : 0,
          credit: v.voucherType === "Credit" ? v.amount : 0,
        })),
      ].sort((a, b) => new Date(a.date) - new Date(b.date));

      // 4. Calculate Running Balance
      let runningBalance = openingBalance;
      const ledger = transactions.map((t) => {
        runningBalance = runningBalance + t.credit - t.debit;
        return { ...t, balance: runningBalance };
      });

      return res.json({
        type: "Ledger",
        openingBalance,
        closingBalance: runningBalance,
        transactions: ledger,
      });
    }

    // --- SCENARIO 2: SUMMARY REPORT (Existing Logic Enhanced) ---
    let incomeItems = [];
    let expenseItems = [];

    // Filter Logic based on User Role (Hub & Spoke)
    let branchFilter = {};
    if (req.user.role === "kba_manager")
      branchFilter = { branch: "Karunya Bharathi" };
    else if (req.user.role === "ksa_manager")
      branchFilter = { branch: "Karunya Sindhu" };

    if (reportType === "Income" || reportType === "All") {
      const donations = await Donation.find({
        createdAt: { $gte: start, $lte: end },
        status: "Active",
        ...branchFilter,
      }).populate("accountHead", "name code");

      const creditVouchers = await Voucher.find({
        voucherType: "Credit",
        status: "Approved",
        createdAt: { $gte: start, $lte: end },
        ...branchFilter,
      }).populate("accountHead", "name code");

      incomeItems = [
        ...donations.map((d) => ({
          date: d.createdAt,
          type: "Donation",
          head: d.accountHead ? d.accountHead.name : "General",
          amount: d.amount,
          desc: d.donorName,
        })),
        ...creditVouchers.map((v) => ({
          date: v.createdAt,
          type: "Credit Voucher",
          head: v.accountHead ? v.accountHead.name : "Misc",
          amount: v.amount,
          desc: v.description,
        })),
      ];
    }

    if (reportType === "Expense" || reportType === "All") {
      const debitVouchers = await Voucher.find({
        voucherType: "Debit",
        status: "Approved",
        createdAt: { $gte: start, $lte: end },
        ...branchFilter,
      }).populate("accountHead", "name code");

      expenseItems = debitVouchers.map((v) => ({
        date: v.createdAt,
        type: "Expense",
        head: v.accountHead ? v.accountHead.name : "General",
        amount: v.amount,
        desc: v.description,
      }));
    }

    // Group By Head
    const groupByHead = (items) => {
      const map = {};
      items.forEach((item) => {
        if (!map[item.head]) map[item.head] = 0;
        map[item.head] += item.amount;
      });
      return Object.keys(map).map((k) => ({ head: k, amount: map[k] }));
    };

    res.json({
      type: "Summary",
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

// @desc    Download PDF Report (Ledger Only)
const downloadReportPDF = async (req, res) => {
  try {
    const { startDate, endDate, accountHeadId } = req.query;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const account = await AccountHead.findById(accountHeadId);
    if (!account) return res.status(404).json({ message: "Account not found" });

    // Calculate Opening
    const prevDonations = await Donation.find({
      accountHead: accountHeadId,
      status: "Active",
      createdAt: { $lt: start },
    });
    const prevVouchers = await Voucher.find({
      accountHead: accountHeadId,
      status: "Approved",
      createdAt: { $lt: start },
    });

    let opening = 0;
    prevDonations.forEach((d) => (opening += d.amount));
    prevVouchers.forEach((v) => {
      if (v.voucherType === "Credit") opening += v.amount;
      if (v.voucherType === "Debit") opening -= v.amount;
    });

    // Transactions
    const rangeDonations = await Donation.find({
      accountHead: accountHeadId,
      status: "Active",
      createdAt: { $gte: start, $lte: end },
    });
    const rangeVouchers = await Voucher.find({
      accountHead: accountHeadId,
      status: "Approved",
      createdAt: { $gte: start, $lte: end },
    });

    const transactions = [
      ...rangeDonations.map((d) => ({
        date: d.createdAt,
        desc: `Donation: ${d.donorName}`,
        debit: 0,
        credit: d.amount,
      })),
      ...rangeVouchers.map((v) => ({
        date: v.createdAt,
        desc: v.description,
        debit: v.voucherType === "Debit" ? v.amount : 0,
        credit: v.voucherType === "Credit" ? v.amount : 0,
      })),
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    // --- GENERATE PDF ---
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    res.setHeader(
      "Content-disposition",
      `attachment; filename="Ledger_${account.name}.pdf"`,
    );
    res.setHeader("Content-type", "application/pdf");
    doc.pipe(res);

    // Header
    doc.fontSize(16).text("KARUNASRI SEVA SAMITHI", { align: "center" });
    doc.fontSize(10).text("Account Ledger Report", { align: "center" });
    doc.moveDown();
    doc.text(`Account Head: ${account.name} (${account.code})`);
    doc.text(
      `Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(
        endDate,
      ).toLocaleDateString()}`,
    );
    doc.moveDown();

    // Table Header
    let y = doc.y;
    doc.font("Helvetica-Bold").text("Date", 40, y);
    doc.text("Particulars", 120, y);
    doc.text("Debit", 350, y);
    doc.text("Credit", 420, y);
    doc.text("Balance", 490, y);
    doc
      .moveTo(40, y + 15)
      .lineTo(550, y + 15)
      .stroke();
    y += 20;

    // Opening Balance
    doc.font("Helvetica").text(new Date(startDate).toLocaleDateString(), 40, y);
    doc.text("Opening Balance", 120, y);
    doc.text(opening.toFixed(2), 490, y);
    y += 20;

    // Rows
    let balance = opening;
    transactions.forEach((t) => {
      balance = balance + t.credit - t.debit;
      if (y > 700) {
        doc.addPage();
        y = 50;
      } // Auto page break

      doc.text(new Date(t.date).toLocaleDateString(), 40, y);
      doc.text(t.desc.substring(0, 35), 120, y, { width: 220 });
      doc.text(t.debit > 0 ? t.debit : "-", 350, y);
      doc.text(t.credit > 0 ? t.credit : "-", 420, y);
      doc.text(balance.toFixed(2), 490, y);
      y += 20;
    });

    doc.moveTo(40, y).lineTo(550, y).stroke();
    doc.font("Helvetica-Bold").text("Closing Balance:", 350, y + 10);
    doc.text(balance.toFixed(2), 490, y + 10);

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Detailed Ledger Report (API JSON)
const getLedgerReport = async (req, res) => {
  try {
    const { startDate, endDate, accountId } = req.query;
    // (Reuse the logic from getCustomFinanceReport -> Specific Ledger Scenario)
    // Or redirect to that function. For now, let's keep it separate if needed
    // but the logic is identical to getCustomFinanceReport scenario 1.
    // We can just call that or copy paste for safety.
    // COPY PASTING THE CORE LOGIC:

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const account = await AccountHead.findById(accountId);
    if (!account) return res.status(404).json({ message: "Account not found" });

    // 1. Opening
    const prevDonations = await Donation.find({
      accountHead: accountId,
      status: "Active",
      createdAt: { $lt: start },
    });
    const prevVouchers = await Voucher.find({
      accountHead: accountId,
      status: "Approved",
      createdAt: { $lt: start },
    });

    let openingBalance = 0;
    prevDonations.forEach((d) => (openingBalance += d.amount));
    prevVouchers.forEach((v) => {
      if (v.voucherType === "Credit") openingBalance += v.amount;
      if (v.voucherType === "Debit") openingBalance -= v.amount;
    });

    // 2. Transactions
    const rangeDonations = await Donation.find({
      accountHead: accountId,
      status: "Active",
      createdAt: { $gte: start, $lte: end },
    });
    const rangeVouchers = await Voucher.find({
      accountHead: accountId,
      status: "Approved",
      createdAt: { $gte: start, $lte: end },
    });

    const transactions = [
      ...rangeDonations.map((d) => ({
        _id: d._id,
        date: d.createdAt,
        type: "Donation",
        refNo: d.receiptNo || "N/A",
        description: `Received from ${d.donorName}`,
        credit: d.amount,
        debit: 0,
      })),
      ...rangeVouchers.map((v) => ({
        _id: v._id,
        date: v.createdAt,
        type: `Voucher (${v.voucherType})`,
        refNo: v.voucherNo,
        description: v.description,
        credit: v.voucherType === "Credit" ? v.amount : 0,
        debit: v.voucherType === "Debit" ? v.amount : 0,
      })),
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    // 3. Running Balance
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
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getCustomFinanceReport,
  downloadReportPDF,
  getLedgerReport,
};
