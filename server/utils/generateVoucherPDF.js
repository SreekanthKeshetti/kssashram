const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const buildVoucherPDF = (voucher, dataCallback, endCallback) => {
  const doc = new PDFDocument({ size: "A5", layout: "landscape", margin: 30 });

  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  // --- 1. LOGO & HEADER ---
  const logoPath = path.join(__dirname, "..", "logo.jpg");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 30, 20, { width: 50 });
  }

  doc
    .fontSize(18)
    .fillColor("#581818")
    .text("KARUNASRI SEVA SAMITHI", 0, 30, { align: "center" });
  doc
    .fontSize(10)
    .text("Saroornagar, Hyderabad - 500035", 0, 55, { align: "center" });
  doc.moveDown();

  // --- 2. TITLE ---
  const title =
    voucher.voucherType === "Debit" ? "PAYMENT VOUCHER" : "RECEIPT VOUCHER";
  doc
    .fontSize(14)
    .fillColor("black")
    .text(title, 0, 80, { align: "center", underline: true });

  // --- 3. DETAILS ---
  const startY = 120;
  doc.fontSize(11).text(`Voucher No: ${voucher.voucherNo}`, 30, startY);
  doc.text(
    `Date: ${new Date(voucher.createdAt).toLocaleDateString()}`,
    450,
    startY
  );

  // Account Code Display
  const accCode = voucher.accountHead ? voucher.accountHead.code : "---";
  const accName = voucher.accountHead
    ? voucher.accountHead.name
    : "Unknown Ledger";

  doc.text(`Account Head:`, 30, startY + 30);
  doc.font("Helvetica-Bold").text(`${accCode} - ${accName}`, 150, startY + 30);

  doc.font("Helvetica").text(`Amount:`, 30, startY + 55);
  doc
    .font("Helvetica-Bold")
    .text(`Rs. ${voucher.amount.toLocaleString()}/-`, 150, startY + 55);

  doc.font("Helvetica").text(`Narration:`, 30, startY + 80);
  doc.text(voucher.description || "-", 150, startY + 80);

  doc.text(`Payment Mode:`, 30, startY + 105);
  doc.text(voucher.paymentMode, 150, startY + 105);

  // --- 4. SIGNATURES (Requirement: Warden + 2 Committee) ---
  const sigY = 320;
  doc.fontSize(9);

  // Warden (Prepared By)
  doc.text("Prepared By:", 30, sigY - 15);
  doc
    .font("Helvetica-Bold")
    .text(voucher.preparedBy ? voucher.preparedBy.name : "Warden", 30, sigY);
  doc.font("Helvetica").text("(Warden/Accountant)", 30, sigY + 12);

  // Receiver
  doc.text("Receiver's Signature", 200, sigY);

  // Approvers
  doc.text("Authorized Signatories:", 400, sigY - 15);

  // List names of people who clicked approve
  if (voucher.approvedBy && voucher.approvedBy.length > 0) {
    const names = voucher.approvedBy.map((u) => u.name).join(" & ");
    doc.font("Helvetica-Bold").text(names, 400, sigY, { width: 180 });
  } else {
    doc.text("(Pending Approval)", 400, sigY);
  }

  doc.end();
};

module.exports = { buildVoucherPDF };
