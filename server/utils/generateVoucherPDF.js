const PDFDocument = require("pdfkit");

const buildVoucherPDF = (voucher, dataCallback, endCallback) => {
  const doc = new PDFDocument({ size: "A5", layout: "landscape", margin: 30 }); // A5 Landscape is standard for vouchers

  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  // --- Header ---
  doc
    .fontSize(18)
    .fillColor("#581818")
    .text("KARUNASRI SEVA SAMITHI", { align: "center" });
  doc.fontSize(10).text("Saroornagar, Hyderabad - 500035", { align: "center" });
  doc.moveDown();

  // --- Title ---
  const title =
    voucher.voucherType === "Debit" ? "PAYMENT VOUCHER" : "RECEIPT VOUCHER";
  doc
    .fontSize(14)
    .fillColor("black")
    .text(title, { align: "center", underline: true });
  doc.moveDown();

  // --- Details Box ---
  const startY = 100;

  // Left Side
  doc.fontSize(11).text(`Voucher No: ${voucher.voucherNo}`, 30, startY);
  doc.text(
    `Date: ${new Date(voucher.createdAt).toLocaleDateString()}`,
    400,
    startY
  );

  doc.moveDown();
  doc.text(`Paid To / Received From:`, 30, startY + 30);
  doc.font("Helvetica-Bold").text(voucher.ledgerName, 180, startY + 30);

  doc.font("Helvetica").text(`Sum of Rupees:`, 30, startY + 55);
  doc
    .font("Helvetica-Bold")
    .text(`Rs. ${voucher.amount.toLocaleString()}/-`, 180, startY + 55);

  doc.font("Helvetica").text(`Towards:`, 30, startY + 80);
  doc.text(voucher.description || "General Expense", 180, startY + 80);

  doc.text(`Payment Mode:`, 30, startY + 105);
  doc.text(voucher.paymentMode, 180, startY + 105);

  // --- Footer Signatures ---
  doc.moveDown(5);
  const sigY = 300;

  doc.fontSize(10);
  doc.text("Prepared By", 50, sigY);
  doc.text("Receiver's Signature", 250, sigY);
  doc.text("Authorized Signatory", 450, sigY);

  doc.end();
};

module.exports = { buildVoucherPDF };
