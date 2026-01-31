// const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const path = require("path");

// // Helper: Convert Number to Words (Simple version for Indian Currency)
// const numToWords = (num) => {
//   const a = [
//     "",
//     "One ",
//     "Two ",
//     "Three ",
//     "Four ",
//     "Five ",
//     "Six ",
//     "Seven ",
//     "Eight ",
//     "Nine ",
//     "Ten ",
//     "Eleven ",
//     "Twelve ",
//     "Thirteen ",
//     "Fourteen ",
//     "Fifteen ",
//     "Sixteen ",
//     "Seventeen ",
//     "Eighteen ",
//     "Nineteen ",
//   ];
//   const b = [
//     "",
//     "",
//     "Twenty",
//     "Thirty",
//     "Forty",
//     "Fifty",
//     "Sixty",
//     "Seventy",
//     "Eighty",
//     "Ninety",
//   ];

//   if ((num = num.toString()).length > 9) return "overflow";
//   const n = ("000000000" + num)
//     .substr(-9)
//     .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
//   if (!n) return;
//   let str = "";
//   str +=
//     n[1] != 0
//       ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "Crore "
//       : "";
//   str +=
//     n[2] != 0
//       ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "Lakh "
//       : "";
//   str +=
//     n[3] != 0
//       ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "Thousand "
//       : "";
//   str +=
//     n[4] != 0
//       ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "Hundred "
//       : "";
//   str +=
//     n[5] != 0
//       ? (str != "" ? "and " : "") +
//         (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]])
//       : "";
//   return str + "Rupees Only";
// };

// const buildVoucherPDF = (voucher, dataCallback, endCallback) => {
//   // Use A5 Landscape (Standard Voucher Size)
//   const doc = new PDFDocument({ size: "A5", layout: "landscape", margin: 30 });

//   doc.on("data", dataCallback);
//   doc.on("end", endCallback);

//   // --- 1. HEADER ---
//   const logoPath = path.join(__dirname, "..", "logo.jpg");
//   if (fs.existsSync(logoPath)) {
//     doc.image(logoPath, 30, 20, { width: 50 });
//   }

//   // Organization Name
//   doc
//     .font("Helvetica-Bold")
//     .fontSize(18)
//     .fillColor("#581818")
//     .text("KARUNASRI SEVA SAMITHI", 0, 25, { align: "center" });

//   // Address (From the Image)
//   doc
//     .font("Helvetica")
//     .fontSize(9)
//     .fillColor("black")
//     .text("H.No.17-1-474, Krishna Nagar, Saidabad, Hyderabad - 500 059, T.S.", {
//       align: "center",
//     })
//     .text(
//       "Society Regd. No. 7451/1999  |  Phone: 040-24073204, Mobile: 9000889785",
//       { align: "center" },
//     );

//   doc.moveDown(0.5);

//   // --- 2. TITLE & BRANCH ---
//   const title =
//     voucher.voucherType === "Debit" ? "DEBIT VOUCHER" : "CREDIT VOUCHER";

//   doc
//     .font("Helvetica-Bold")
//     .fontSize(14)
//     .fillColor("#B22222") // Reddish color for title
//     .text(title, { align: "center" });

//   // Branch Name (e.g., Karunya Bharathi Ashram)
//   doc
//     .fontSize(10)
//     .fillColor("black")
//     .text(`(${voucher.branch || "Headquarters"})`, { align: "center" });

//   // --- 3. VOUCHER DETAILS ROW ---
//   const startY = 110;

//   // Left: Voucher No & Account Code
//   doc.text(`Voucher No: `, 30, startY);
//   doc.font("Helvetica-Bold").text(voucher.voucherNo, 90, startY);

//   // Right: Date
//   doc.font("Helvetica").text(`Date: `, 450, startY);
//   doc
//     .font("Helvetica-Bold")
//     .text(new Date(voucher.createdAt).toLocaleDateString(), 480, startY);

//   const accName = voucher.accountHead ? `${voucher.accountHead.code}` : "---";
//   doc.font("Helvetica").text(`Account Code: `, 30, startY + 20);
//   doc.font("Helvetica-Bold").text(accName, 95, startY + 20);

//   // --- 4. MAIN CONTENT (Lines) ---
//   let currentY = startY + 45;
//   const lineGap = 25;

//   // Paid To
//   doc.font("Helvetica").text(`Paid to Sri/Smt/Ms/M/s:`, 30, currentY);
//   doc
//     .font("Helvetica-Bold")
//     .text(voucher.recipientName || "_______________________", 140, currentY);
//   // Underline
//   doc
//     .moveTo(140, currentY + 12)
//     .lineTo(550, currentY + 12)
//     .lineWidth(0.5)
//     .strokeColor("#999")
//     .stroke();

//   // Towards (Description)
//   const description = voucher.description || "";
//   doc.font("Helvetica").text(`Towards:`, 400, currentY - 10); // Placed slightly above or can be merged
//   // In the image, 'Towards' is mixed with payment details sometimes, but let's put description here for clarity
//   doc.font("Helvetica-Bold").text(`( ${description} )`, 350, currentY);

//   // Sum of Rs (Numeric) & Words
//   currentY += lineGap;
//   doc.font("Helvetica").text(`Sum of Rs.`, 30, currentY);

//   // Box for Amount
//   doc.rect(80, currentY - 5, 80, 20).stroke();
//   doc
//     .font("Helvetica-Bold")
//     .fontSize(12)
//     .text(`₹ ${voucher.amount}/-`, 85, currentY - 2);

//   // Words
//   const amountWords = numToWords(voucher.amount);
//   doc.fontSize(10).font("Helvetica").text(`(Rupees`, 170, currentY);
//   doc.font("Helvetica-Bold").text(` ${amountWords} `, 215, currentY);
//   doc
//     .font("Helvetica")
//     .text(
//       `____________________ )`,
//       215 + doc.widthOfString(amountWords),
//       currentY,
//     );

//   // Payment Details (Cash/Cheque)
//   currentY += lineGap;
//   let payDetails = "";
//   if (voucher.paymentMode === "Cash") {
//     payDetails = "Cash";
//   } else {
//     const { chequeNo, chequeDate, bankName } = voucher.paymentDetails || {};
//     payDetails = `${voucher.paymentMode} No: ${chequeNo || "-"}  Dt: ${chequeDate ? new Date(chequeDate).toLocaleDateString() : "-"}  Bank: ${bankName || "-"}`;
//   }

//   doc.font("Helvetica").text(`By ${voucher.paymentMode}:`, 30, currentY);
//   doc.font("Helvetica-Bold").text(payDetails, 100, currentY);
//   doc
//     .moveTo(100, currentY + 12)
//     .lineTo(550, currentY + 12)
//     .lineWidth(0.5)
//     .stroke();

//   // --- 5. FOOTER SIGNATURES ---
//   // The image has 4 specific spots
//   const footerY = 320;
//   doc.font("Helvetica").fontSize(9);

//   // 1. Recipient
//   doc.text("Recipient", 50, footerY);
//   doc
//     .moveTo(30, footerY - 10)
//     .lineTo(100, footerY - 10)
//     .stroke();

//   // 2. Warden (Prepared By)
//   doc.text("Warden", 180, footerY);
//   doc
//     .moveTo(160, footerY - 10)
//     .lineTo(230, footerY - 10)
//     .stroke();

//   // 3. Treasurer (Approved By)
//   doc.text("Treasurer", 300, footerY);
//   doc
//     .moveTo(280, footerY - 10)
//     .lineTo(350, footerY - 10)
//     .stroke();

//   // 4. Secretary/President (Passed By)
//   doc.text("Secretary/President", 420, footerY);
//   doc
//     .moveTo(400, footerY - 10)
//     .lineTo(520, footerY - 10)
//     .stroke();

//   // --- STAMP SIMULATION (If Approved) ---
//   if (voucher.status === "Approved") {
//     doc.save();
//     doc.rotate(-5, { origin: [400, 250] });
//     doc.rect(380, 240, 150, 40).strokeColor("blue").lineWidth(2).stroke();
//     doc.fontSize(14).fillColor("blue").text("VOUCHER PASSED", 395, 252);
//     doc.restore();
//   }

//   doc.end();
// };

// module.exports = { buildVoucherPDF };
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Helper: Number to Words
const numToWords = (num) => {
  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if ((num = num.toString()).length > 9) return "overflow";
  const n = ("000000000" + num)
    .substr(-9)
    .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return;
  let str = "";
  str +=
    n[1] != 0
      ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "Crore "
      : "";
  str +=
    n[2] != 0
      ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "Lakh "
      : "";
  str +=
    n[3] != 0
      ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "Thousand "
      : "";
  str +=
    n[4] != 0
      ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "Hundred "
      : "";
  str +=
    n[5] != 0
      ? (str != "" ? "and " : "") +
        (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]])
      : "";
  return str + "Rupees Only";
};

const buildVoucherPDF = (voucher, dataCallback, endCallback) => {
  const doc = new PDFDocument({ size: "A5", layout: "landscape", margin: 30 });

  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  // --- 1. HEADER ---
  const logoPath = path.join(__dirname, "..", "logo.jpg");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 30, 20, { width: 50 });
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor("#581818")
    .text("KARUNASRI SEVA SAMITHI", 0, 25, { align: "center" });

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("black")
    .text("H.No.17-1-474, Krishna Nagar, Saidabad, Hyderabad - 500 059, T.S.", {
      align: "center",
    })
    .text(
      "Society Regd. No. 7451/1999  |  Phone: 040-24073204, Mobile: 9000889785",
      { align: "center" },
    );

  doc.moveDown(0.5);

  const title =
    voucher.voucherType === "Debit" ? "DEBIT VOUCHER" : "CREDIT VOUCHER";
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor("#B22222")
    .text(title, { align: "center" });
  doc
    .fontSize(10)
    .fillColor("black")
    .text(`(${voucher.branch || "Headquarters"})`, { align: "center" });

  // --- 2. VOUCHER INFO ROW ---
  const startY = 115;
  doc.fillColor("black");

  // Left: No & Account
  doc.text(`Voucher No:`, 30, startY);
  doc.font("Helvetica-Bold").text(voucher.voucherNo, 95, startY);

  const accName = voucher.accountHead ? `${voucher.accountHead.code}` : "---";
  doc.font("Helvetica").text(`Account Code:`, 30, startY + 15);
  doc.font("Helvetica-Bold").text(accName, 98, startY + 15);

  // Right: Date
  doc.font("Helvetica").text(`Date:`, 440, startY);
  doc
    .font("Helvetica-Bold")
    .text(new Date(voucher.createdAt).toLocaleDateString(), 470, startY);

  // --- 3. MAIN CONTENT (Sequential Lines) ---
  let currentY = startY + 40;
  const lineGap = 25;

  // A. PAID TO
  doc.font("Helvetica").text(`Paid to Sri/Smt/Ms/M/s:`, 30, currentY);
  doc
    .font("Helvetica-Bold")
    .text(voucher.recipientName || "_______________________", 140, currentY);
  doc
    .moveTo(140, currentY + 12)
    .lineTo(550, currentY + 12)
    .lineWidth(0.5)
    .strokeColor("#999")
    .stroke();

  // B. AMOUNT (Using "Rs." to avoid symbol glitch)
  currentY += lineGap;
  doc.font("Helvetica").text(`Sum of Rs.`, 30, currentY);

  // Box for Amount
  doc.rect(85, currentY - 5, 100, 20).stroke();
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(`Rs. ${voucher.amount}/-`, 90, currentY - 2);

  // Words (Aligned next to box)
  const amountWords = numToWords(voucher.amount);
  doc.fontSize(10).font("Helvetica").text(`(Rupees`, 200, currentY);
  doc.font("Helvetica-Bold").text(` ${amountWords} `, 240, currentY);
  // Dynamic underline for words
  const wordsWidth = doc.widthOfString(` ${amountWords} `);
  doc
    .moveTo(240, currentY + 12)
    .lineTo(240 + wordsWidth + 20, currentY + 12)
    .stroke();
  doc.font("Helvetica").text(`)`, 240 + wordsWidth + 25, currentY);

  // C. PAYMENT DETAILS (Replicating image format)
  currentY += lineGap;

  let payString = "";
  const { chequeNo, chequeDate, bankName, transactionId } =
    voucher.paymentDetails || {};

  if (voucher.paymentMode === "Cash") {
    payString = `Cash`;
    if (bankName) payString += ` (Bank: ${bankName})`;
  } else if (voucher.paymentMode === "Cheque" || voucher.paymentMode === "DD") {
    payString = `${voucher.paymentMode} No. ${chequeNo || "_______"}  Dated ${chequeDate ? new Date(chequeDate).toLocaleDateString() : "_______"}`;
    if (bankName) payString += `  Drawn on ${bankName}`;
  } else {
    payString = `${voucher.paymentMode} Ref: ${transactionId || "_______"}`;
    if (bankName) payString += `  Bank: ${bankName}`;
  }

  doc.font("Helvetica").text(`In Cash/Cheque No.`, 30, currentY);
  doc.font("Helvetica-Bold").text(payString, 130, currentY);
  doc
    .moveTo(130, currentY + 12)
    .lineTo(550, currentY + 12)
    .stroke();

  // D. TOWARDS (Description) - Moved below payment to avoid overlap
  currentY += lineGap;
  doc.font("Helvetica").text(`Towards:`, 30, currentY);
  doc
    .font("Helvetica-Bold")
    .text(voucher.description || "_______________________", 80, currentY);
  doc
    .moveTo(80, currentY + 12)
    .lineTo(550, currentY + 12)
    .stroke();

  // --- 4. FOOTER SIGNATURES ---
  const footerY = 320;
  doc.font("Helvetica").fontSize(9);

  // 1. Recipient
  doc.text("Recipient", 50, footerY);
  doc
    .moveTo(30, footerY - 10)
    .lineTo(100, footerY - 10)
    .stroke();

  // 2. Warden
  doc.text("Warden", 180, footerY);
  doc
    .moveTo(160, footerY - 10)
    .lineTo(230, footerY - 10)
    .stroke();

  // 3. Treasurer
  doc.text("Treasurer", 300, footerY);
  doc
    .moveTo(280, footerY - 10)
    .lineTo(350, footerY - 10)
    .stroke();

  // 4. Secretary/President
  doc.text("Secretary/President", 420, footerY);
  doc
    .moveTo(400, footerY - 10)
    .lineTo(520, footerY - 10)
    .stroke();

  // STAMP
  if (voucher.status === "Approved") {
    doc.save();
    doc.rotate(-5, { origin: [450, 250] });
    doc.rect(420, 240, 130, 40).strokeColor("blue").lineWidth(2).stroke();
    doc.fontSize(14).fillColor("blue").text("VOUCHER PASSED", 430, 252);
    doc.restore();
  }

  doc.end();
};

module.exports = { buildVoucherPDF };
