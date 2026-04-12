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

    let query = {};
    let isGlobalView = false;

    if (["admin", "president", "secretary", "treasurer"].includes(role)) {
      isGlobalView = true;
    } else if (role === "kba_manager") {
      query.branch = "Karunya Bharathi";
    } else if (role === "ksa_manager") {
      query.branch = "Karunya Sindhu";
    } else {
      // FIX 3: If staff belongs to HQ, let them see both naming conventions
      query.branch = { $in: ["KarunaSri Seva Samithi", "Headquarters"] };
    }

    // FIX 2: Strictly pull only ACTIVE donations
    const donations = await Donation.find({ ...query, status: "Active" });
    const allVouchers = await Voucher.find({ ...query, status: "Approved" });

    const studentCount = await Student.countDocuments({
      ...query,
      admissionStatus: "Active",
    });
    const lowStockCount = await Inventory.countDocuments({
      ...query,
      quantity: { $lt: 10 },
    });

    const getFeeIncome = (branchName1, branchName2 = null) => {
      return allVouchers
        .filter(
          (v) =>
            v.voucherType === "Credit" &&
            (v.branch === branchName1 || v.branch === branchName2) &&
            v.description &&
            !v.description.includes("Funds Received from HQ"),
        )
        .reduce((acc, v) => acc + v.amount, 0);
    };

    const totalDonations = donations.reduce(
      (acc, item) => acc + item.amount,
      0,
    );

    const donationSindu = donations
      .filter((d) => d.branch && d.branch.includes("Sindhu"))
      .reduce((acc, item) => acc + item.amount, 0);
    const feeSindu = getFeeIncome("Karunya Sindhu");
    const totalSindu = donationSindu + feeSindu;

    const donationBharathi = donations
      .filter((d) => d.branch && d.branch.includes("Bharathi"))
      .reduce((acc, item) => acc + item.amount, 0);
    const feeBharathi = getFeeIncome("Karunya Bharathi");
    const totalBharathi = donationBharathi + feeBharathi;

    const donationJyothi = donations
      .filter((d) => d.branch && d.branch.includes("Jyothi"))
      .reduce((acc, item) => acc + item.amount, 0);
    const feeJyothi = getFeeIncome("Karunya Jyothi");
    const totalJyothi = donationJyothi + feeJyothi;

    // FIX 3: Combine BOTH names for the HQ Card!
    const donationKarunaSree = donations
      .filter(
        (d) =>
          d.branch &&
          (d.branch.includes("KarunaSri") || d.branch.includes("Headquarters")),
      )
      .reduce((acc, item) => acc + item.amount, 0);
    const feeKarunaSree = getFeeIncome(
      "KarunaSri Seva Samithi",
      "Headquarters",
    );

    const totalFeeIncome = allVouchers
      .filter(
        (v) =>
          v.voucherType === "Credit" &&
          v.description &&
          !v.description.includes("Funds Received from HQ"),
      )
      .reduce((acc, v) => acc + v.amount, 0);

    const grandTotalIncome = totalDonations + totalFeeIncome;

    const approvedDebit = allVouchers.filter((v) => v.voucherType === "Debit");

    const totalExpense = approvedDebit
      .filter((v) => {
        if (
          isGlobalView &&
          v.description &&
          v.description.includes("Fund Transfer to")
        )
          return false;
        return true;
      })
      .reduce((acc, item) => acc + item.amount, 0);

    const pendingVouchers = await Voucher.find({
      ...query,
      voucherType: "Debit",
      status: "Pending",
    });
    const totalPendingExpense = pendingVouchers.reduce(
      (acc, item) => acc + item.amount,
      0,
    );

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

    const recentDonations = await Donation.find({ ...query, status: "Active" })
      .sort({ _id: -1 })
      .limit(5)
      .select("donorName amount scheme createdAt branch");

    res.json({
      financials: {
        income: grandTotalIncome,
        incomeSindu: totalSindu,
        incomeBharathi: totalBharathi,
        incomeJyothi: totalJyothi,
        incomeKarunaSree: donationKarunaSree + feeKarunaSree,
        expense: totalExpense,
        pendingExpense: totalPendingExpense,
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

// @desc    Advanced Custom Finance Report (General Summary)
const getCustomFinanceReport = async (req, res) => {
  try {
    const { startDate, endDate, reportType, branch } = req.query;

    if (!startDate || !endDate)
      return res.status(400).json({ message: "Please select a date range" });

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    let branchFilter = {};
    if (req.user.role === "kba_manager") {
      branchFilter = { branch: "Karunya Bharathi" };
    } else if (req.user.role === "ksa_manager") {
      branchFilter = { branch: "Karunya Sindhu" };
    } else if (branch && branch === "KarunaSri Seva Samithi") {
      // FIX 3: Include Headquarters when HQ is selected in the dropdown
      branchFilter = {
        branch: { $in: ["KarunaSri Seva Samithi", "Headquarters"] },
      };
    } else if (branch && branch !== "All Branches") {
      branchFilter = { branch: branch };
    }

    let incomeItems = [];
    let expenseItems = [];

    if (reportType === "Income" || reportType === "All") {
      const donations = await Donation.find({
        createdAt: { $gte: start, $lte: end },
        status: "Active", // FIX 2: Only Active
        ...branchFilter,
      }).populate("accountHead", "name code");

      const creditVouchers = await Voucher.find({
        voucherType: "Credit",
        status: "Approved",
        createdAt: { $gte: start, $lte: end },
        ...branchFilter,
      }).populate("accountHead", "name code");

      incomeItems = [
        ...donations.map((d) => {
          let descText = `${d.donorName} (${d.branch})`;
          if (d.inNameOf)
            descText = `${d.donorName} in name of ${d.inNameOf} (${d.branch})`;
          return {
            date: d.createdAt,
            type: "Donation",
            head: d.accountHead ? d.accountHead.name : "General",
            amount: d.amount,
            desc: descText,
          };
        }),
        ...creditVouchers.map((v) => ({
          date: v.createdAt,
          type: "Credit Voucher",
          head: v.accountHead ? v.accountHead.name : "Misc",
          amount: v.amount,
          desc: `${v.description} (${v.branch})`,
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
        desc: `${v.description} (${v.branch})`,
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

const downloadReportPDF = async (req, res) => {
  try {
    const { startDate, endDate, accountHeadId } = req.query;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const account = await AccountHead.findById(accountHeadId);
    if (!account) return res.status(404).json({ message: "Account not found" });

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
        desc: d.inNameOf
          ? `Donation: ${d.donorName} in name of ${d.inNameOf}`
          : `Donation: ${d.donorName}`,
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

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    res.setHeader(
      "Content-disposition",
      `attachment; filename="Ledger_${account.name}.pdf"`,
    );
    res.setHeader("Content-type", "application/pdf");
    doc.pipe(res);

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

    doc.font("Helvetica").text(new Date(startDate).toLocaleDateString(), 40, y);
    doc.text("Opening Balance", 120, y);
    doc.text(opening.toFixed(2), 490, y);
    y += 20;

    let balance = opening;
    transactions.forEach((t) => {
      balance = balance + t.credit - t.debit;
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
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
    const { startDate, endDate, accountId, branch } = req.query;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const account = await AccountHead.findById(accountId);
    if (!account) return res.status(404).json({ message: "Account not found" });

    // FIX 3: Include Headquarters when HQ is selected in the dropdown
    let branchFilter = {};
    if (req.user.role === "kba_manager") {
      branchFilter = { branch: "Karunya Bharathi" };
    } else if (req.user.role === "ksa_manager") {
      branchFilter = { branch: "Karunya Sindhu" };
    } else if (branch && branch === "KarunaSri Seva Samithi") {
      branchFilter = {
        branch: { $in: ["KarunaSri Seva Samithi", "Headquarters"] },
      };
    } else if (branch && branch !== "All Branches") {
      branchFilter = { branch: branch };
    }

    const prevDonations = await Donation.find({
      accountHead: accountId,
      status: "Active", // FIX 2
      createdAt: { $lt: start },
      ...branchFilter,
    });
    const prevVouchers = await Voucher.find({
      accountHead: accountId,
      status: "Approved",
      createdAt: { $lt: start },
      ...branchFilter,
    });

    let openingBalance = 0;
    prevDonations.forEach((d) => (openingBalance += d.amount));
    prevVouchers.forEach((v) => {
      if (v.voucherType === "Credit") openingBalance += v.amount;
      if (v.voucherType === "Debit") openingBalance -= v.amount;
    });

    const rangeDonations = await Donation.find({
      accountHead: accountId,
      status: "Active", // FIX 2
      createdAt: { $gte: start, $lte: end },
      ...branchFilter,
    });
    const rangeVouchers = await Voucher.find({
      accountHead: accountId,
      status: "Approved",
      createdAt: { $gte: start, $lte: end },
      ...branchFilter,
    });

    const transactions = [
      ...rangeDonations.map((d) => ({
        _id: d._id,
        date: d.createdAt,
        type: "Donation",
        refNo: d.receiptNo || "N/A",
        description: d.inNameOf
          ? `Received from ${d.donorName} in name of ${d.inNameOf} (${d.branch})`
          : `Received from ${d.donorName} (${d.branch})`,
        credit: d.amount,
        debit: 0,
      })),
      ...rangeVouchers.map((v) => ({
        _id: v._id,
        date: v.createdAt,
        type: `Voucher (${v.voucherType})`,
        refNo: v.voucherNo,
        description: `${v.description} (${v.branch})`,
        credit: v.voucherType === "Credit" ? v.amount : 0,
        debit: v.voucherType === "Debit" ? v.amount : 0,
      })),
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

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
