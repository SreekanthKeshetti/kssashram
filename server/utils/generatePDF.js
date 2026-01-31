// const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const path = require("path");

// // --- HELPER: DRAW HEADER (Used by both Receipt and Certificate) ---
// const drawHeader = (doc, branchName = "Headquarters") => {
//   // 1. LOGO
//   const logoPath = path.join(__dirname, "..", "logo.jpg");
//   if (fs.existsSync(logoPath)) {
//     doc.image(logoPath, 50, 45, { width: 70 });
//   }

//   // 2. TEXT DETAILS
//   doc
//     .fillColor("#581818") // Maroon
//     .fontSize(20)
//     .text("KARUNASRI SEVA SAMITHI", 130, 50, { align: "left" })
//     .fontSize(10)
//     .text(`Branch: ${branchName}`, 130, 75, { align: "left" })
//     .text(
//       "Plot No. 123, Temple Road, Saroornagar, Hyderabad - 500035",
//       130,
//       90,
//       { align: "left" },
//     )
//     .text("Reg No: 123/2024 | 80G Exempt | PAN: AAATE1234E", 130, 105, {
//       align: "left",
//     });

//   // 3. DIVIDER LINE
//   doc
//     .moveTo(50, 130)
//     .lineTo(550, 130)
//     .strokeColor("#DAA520") // Gold
//     .lineWidth(2)
//     .stroke();
// };

// // ==========================================
// // 1. DONATION RECEIPT GENERATOR
// // ==========================================
// const buildReceipt = (donation, dataCallback, endCallback) => {
//   const doc = new PDFDocument({ size: "A4", margin: 50 });

//   doc.on("data", dataCallback);
//   doc.on("end", endCallback);

//   // Draw Header
//   drawHeader(doc, donation.branch);

//   // Title
//   doc
//     .moveDown(4)
//     .fillColor("#000000")
//     .fontSize(16)
//     .text("DONATION RECEIPT", 50, 160, { align: "center", underline: true });

//   // Receipt Details
//   const startY = 210;
//   const col1 = 50;
//   const col2 = 200;

//   // Right Aligned Receipt Info
//   const rightX = 350;
//   const rightW = 200;

//   // Left: System ID
//   doc
//     .fontSize(11)
//     .text(
//       `System ID: ${donation._id.toString().slice(-6).toUpperCase()}`,
//       col1,
//       startY,
//     );

//   // Right: Date & Manual Ref
//   if (donation.manualReceiptNo) {
//     doc.text(`Manual Ref: ${donation.manualReceiptNo}`, rightX, startY, {
//       align: "right",
//       width: rightW,
//     });
//     if (donation.manualReceiptDate) {
//       doc.text(
//         `Date: ${new Date(donation.manualReceiptDate).toLocaleDateString()}`,
//         rightX,
//         doc.y + 5,
//         { align: "right", width: rightW },
//       );
//     }
//   } else {
//     doc.text(
//       `Date: ${new Date(donation.createdAt).toLocaleDateString()}`,
//       rightX,
//       startY,
//       { align: "right", width: rightW },
//     );
//   }

//   // Donor Details
//   const detailsY = startY + 40;
//   doc.text(`Received with thanks from:`, col1, detailsY);
//   doc.font("Helvetica-Bold").text(donation.donorName, col2, detailsY);

//   doc.font("Helvetica").text(`Phone Number:`, col1, detailsY + 20);
//   doc.text(donation.donorPhone, col2, detailsY + 20);

//   let currentY = detailsY + 40;
//   if (donation.donorPan) {
//     doc.text(`PAN Number:`, col1, currentY);
//     doc.text(donation.donorPan, col2, currentY);
//     currentY += 20;
//   }
//   if (donation.donorAadhaar) {
//     doc.text(`Aadhaar Number:`, col1, currentY);
//     doc.text(donation.donorAadhaar, col2, currentY);
//     currentY += 20;
//   }

//   // Amount & Scheme
//   currentY += 10;
//   doc.text(`Sum of Rupees:`, col1, currentY);
//   doc
//     .font("Helvetica-Bold")
//     .fontSize(14)
//     .text(`Rs. ${donation.amount.toLocaleString()}/-`, col2, currentY);

//   currentY += 30;
//   doc.font("Helvetica").fontSize(11).text(`Towards Scheme:`, col1, currentY);
//   doc.text(donation.scheme, col2, currentY);

//   // Payment Mode
//   currentY += 30;
//   doc.text(`Payment Mode:`, col1, currentY);

//   let paymentString = donation.paymentMode;
//   if (donation.paymentDetails) {
//     const { chequeNo, chequeDate, bankName, transactionId, ddNo } =
//       donation.paymentDetails;
//     if (donation.paymentMode === "Cheque") {
//       paymentString += ` | No: ${chequeNo || "-"}`;
//       if (bankName) paymentString += ` | Bank: ${bankName}`;
//       if (chequeDate)
//         paymentString += ` | Dt: ${new Date(chequeDate).toLocaleDateString()}`;
//     } else if (donation.paymentMode === "DD") {
//       paymentString += ` | DD: ${ddNo || "-"}`;
//       if (bankName) paymentString += ` | Bank: ${bankName}`;
//     } else if (
//       ["Online", "UPI", "Bank Transfer"].includes(donation.paymentMode)
//     ) {
//       if (transactionId) paymentString += ` | Ref: ${transactionId}`;
//     }
//   }
//   doc.text(paymentString, col2, currentY, { width: 300 });

//   // Occasion
//   if (donation.occasion || donation.inNameOf) {
//     currentY += 30;
//     let occasionText = "";
//     if (donation.occasion) occasionText += `${donation.occasion} `;
//     if (donation.inNameOf) occasionText += `in name of ${donation.inNameOf}`;
//     doc
//       .font("Helvetica-Oblique")
//       .text(`Occasion: ${occasionText}`, col1, currentY);
//   }

//   // Footer & Disclaimer
//   const footerY = 680;
//   doc.rect(50, footerY - 50, 500, 40).fillAndStroke("#f0f0f0", "#000000");
//   doc
//     .fillColor("#000000")
//     .font("Helvetica")
//     .fontSize(10)
//     .text(
//       "Donations are exempt from Income Tax under Section 80G.",
//       60,
//       footerY - 35,
//       { width: 480, align: "center" },
//     );

//   doc.text("Authorized Signatory", 400, footerY + 30);
//   doc.text("(Karunasri Seva Samithi)", 380, footerY + 45);

//   doc.end();
// };

// // ==========================================
// // 2. TAX CERTIFICATE GENERATOR
// // ==========================================
// const buildTaxCertificate = (
//   donorDetails,
//   donations,
//   dateRange,
//   dataCallback,
//   endCallback,
// ) => {
//   const doc = new PDFDocument({ size: "A4", margin: 50 });

//   doc.on("data", dataCallback);
//   doc.on("end", endCallback);

//   // 1. Draw Professional Header (Same as Receipt)
//   drawHeader(doc, "Headquarters"); // Tax certs usually issued from HQ

//   // 2. Title
//   doc.moveDown(4);
//   doc
//     .fillColor("black")
//     .fontSize(14)
//     .text("STATEMENT OF DONATIONS (FORM 10BE DATA)", {
//       align: "center",
//       underline: true,
//     });
//   doc.fontSize(11).text(`Financial Year: ${dateRange}`, { align: "center" });

//   // 3. Donor Info Box
//   doc.moveDown(2);
//   const infoY = doc.y;

//   doc.font("Helvetica-Bold").text(`Donor Name:`, 50, infoY);
//   doc.font("Helvetica").text(donorDetails.name, 150, infoY);

//   doc.font("Helvetica-Bold").text(`Phone:`, 350, infoY);
//   doc.font("Helvetica").text(donorDetails.phone, 420, infoY);

//   doc.font("Helvetica-Bold").text(`PAN Number:`, 50, infoY + 20);
//   doc.font("Helvetica").text(donorDetails.pan || "N/A", 150, infoY + 20);

//   doc.font("Helvetica-Bold").text(`Address:`, 50, infoY + 40);
//   doc
//     .font("Helvetica")
//     .text(donorDetails.address || "Not Provided", 150, infoY + 40);

//   // 4. Donation Table
//   doc.moveDown(3);
//   const tableTop = doc.y;

//   // Table Header
//   doc.font("Helvetica-Bold").fontSize(10);
//   doc.text("Date", 50, tableTop);
//   doc.text("Receipt No", 130, tableTop);
//   doc.text("Scheme / Purpose", 250, tableTop);
//   doc.text("Amount (Rs)", 450, tableTop, { align: "right" });

//   doc
//     .moveTo(50, tableTop + 15)
//     .lineTo(550, tableTop + 15)
//     .strokeColor("black")
//     .lineWidth(1)
//     .stroke();

//   // Table Rows
//   let y = tableTop + 25;
//   let totalAmount = 0;
//   doc.font("Helvetica");

//   donations.forEach((d) => {
//     // Page Break Logic
//     if (y > 700) {
//       doc.addPage();
//       y = 50;
//     }

//     doc.text(new Date(d.createdAt).toLocaleDateString(), 50, y);
//     // Prefer Manual Receipt No if available, else System ID
//     const receiptRef =
//       d.manualReceiptNo || d._id.toString().slice(-6).toUpperCase();
//     doc.text(receiptRef, 130, y);

//     doc.text(d.scheme.substring(0, 30), 250, y); // Truncate if too long
//     doc.text(d.amount.toLocaleString(), 450, y, { align: "right" });

//     totalAmount += d.amount;
//     y += 20;
//   });

//   // 5. Total
//   doc.moveTo(50, y).lineTo(550, y).lineWidth(1).stroke();
//   y += 10;
//   doc.font("Helvetica-Bold").fontSize(12);
//   doc.text("Total Donations:", 300, y);
//   doc.text(`Rs. ${totalAmount.toLocaleString()}/-`, 450, y, { align: "right" });

//   // 6. Footer
//   doc.moveDown(4);
//   doc
//     .fontSize(10)
//     .font("Helvetica")
//     .text(
//       "Certified that the above donations are received by Karunasri Seva Samithi.",
//       50,
//       doc.y,
//     );

//   const footerY = 720;
//   doc.text("Authorized Signatory", 400, footerY);
//   doc.text("(Karunasri Seva Samithi)", 380, footerY + 15);

//   doc.end();
// };

// // --- CRITICAL: EXPORT BOTH FUNCTIONS ---
// module.exports = { buildReceipt, buildTaxCertificate };

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// --- HELPER: NUMBER TO WORDS ---
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

const drawHeader = (doc, branchName) => {
  const logoPath = path.join(__dirname, "..", "logo.jpg");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 30, 25, { width: 50 });
  }

  // Corners
  doc.fontSize(9).font("Helvetica-Bold").text("SEVA", 30, 20);
  doc.text("SAMSKAR", 500, 20, { align: "right" });

  // Main Title
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor("#000000")
    .text("KARUNASRI SEVA SAMITHI", 0, 25, { align: "center" });

  // Address Block
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#333")
    .text("H.No.17-1-474, Krishna Nagar, Saidabad, Hyderabad - 500 059", {
      align: "center",
    })
    .text(
      "Society Regd. No. 7451/1999 | PAN: AAATK6724F | Ph: 040-24073204, 9000889785",
      { align: "center" },
    )
    .text("Email: karunasri1999@gmail.com | Website: https://karunasri.org", {
      align: "center",
    });

  doc.moveDown(0.5);
  // Double Line
  doc
    .moveTo(20, 80)
    .lineTo(575, 80)
    .strokeColor("#DAA520")
    .lineWidth(1)
    .stroke();
  doc.moveTo(20, 83).lineTo(575, 83).stroke();
};

const buildReceipt = (donation, dataCallback, endCallback) => {
  const doc = new PDFDocument({ size: "A5", layout: "landscape", margin: 30 });

  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  drawHeader(doc, donation.branch);

  // --- TOP ROW: RECEIPT NO & DATE ---
  let y = 100;

  const receiptNo =
    donation.manualReceiptNo || donation._id.toString().slice(-6).toUpperCase();
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#B22222")
    .text(`Receipt No: ${receiptNo}`, 30, y);

  doc
    .fillColor("black")
    .fontSize(14)
    .text("RECEIPT", 250, y - 2);

  const dateStr = donation.manualReceiptDate
    ? new Date(donation.manualReceiptDate).toLocaleDateString()
    : new Date(donation.createdAt).toLocaleDateString();
  doc.fontSize(11).text(`Date: ${dateStr}`, 450, y);

  // --- MAIN CONTENT ---
  y += 30;
  const lineGap = 20;
  doc.fontSize(10).fillColor("black");

  // 1. Received From
  doc.font("Helvetica").text("Received with thanks from Sri/Smt/M/s.", 30, y);
  doc.font("Helvetica-Bold").text(donation.donorName, 220, y);
  doc
    .moveTo(220, y + 12)
    .lineTo(560, y + 12)
    .lineWidth(0.5)
    .strokeColor("#999")
    .stroke();

  // 2. Mobile & IDs
  y += lineGap;
  doc.font("Helvetica").text("Mobile:", 30, y);
  doc.font("Helvetica-Bold").text(donation.donorPhone, 75, y);

  doc.font("Helvetica").text("PAN:", 200, y);
  doc.font("Helvetica-Bold").text(donation.donorPan || "__________", 230, y);

  doc.font("Helvetica").text("Aadhaar:", 350, y);
  doc
    .font("Helvetica-Bold")
    .text(donation.donorAadhaar || "__________", 400, y);

  // 3. Address
  y += lineGap;
  doc.font("Helvetica").text("Address:", 30, y);

  const addressX = 80;
  const addressWidth = 480;
  doc
    .font("Helvetica-Bold")
    .text(donation.address || "______________________", addressX, y, {
      width: addressWidth,
      align: "left",
    });

  const addressHeight = doc.heightOfString(donation.address || "_", {
    width: addressWidth,
  });
  doc
    .moveTo(addressX, y + addressHeight + 2)
    .lineTo(560, y + addressHeight + 2)
    .stroke();

  y += addressHeight + 10;

  // 4. Email
  doc.font("Helvetica").text("Email Id:", 30, y);
  doc.font("Helvetica-Bold").text(donation.donorEmail || "__________", 80, y);
  doc
    .moveTo(80, y + 12)
    .lineTo(560, y + 12)
    .stroke();

  // 5. Amount & Words (UPDATED)
  y += lineGap;
  doc.font("Helvetica").text("A sum of Rs:", 30, y);
  doc.rect(95, y - 3, 90, 18).stroke();
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(`Rs. ${donation.amount}/-`, 100, y);

  const amountWords = numToWords(donation.amount);
  doc.fontSize(10).font("Helvetica").text("(Rupees in words", 190, y);
  doc.font("Helvetica-Bold").text(` ${amountWords} `, 280, y);
  const wordsWidth = doc.widthOfString(` ${amountWords} `);
  doc.font("Helvetica").text(" /- )", 280 + wordsWidth, y);

  // 6. Payment Narrative
  y += lineGap + 10;
  let payString = "";
  if (donation.paymentMode === "Cash") {
    payString = "Cash";
  } else {
    const { chequeNo, chequeDate, bankName, transactionId, ddNo } =
      donation.paymentDetails || {};
    if (donation.paymentMode === "Cheque") {
      payString = `Cheque No. ${chequeNo || "-"} Dt ${chequeDate ? new Date(chequeDate).toLocaleDateString() : "-"}`;
    } else if (donation.paymentMode === "DD") {
      payString = `DD No. ${ddNo || "-"} Dt ${chequeDate ? new Date(chequeDate).toLocaleDateString() : "-"}`;
    } else {
      payString = `${donation.paymentMode} Ref. ${transactionId || "-"}`;
    }
    if (bankName) payString += ` drawn on ${bankName}`;
  }

  doc.font("Helvetica").text("By Cash/Cheque/Online:", 30, y);
  doc.font("Helvetica-Bold").text(payString, 150, y, { width: 400 });
  doc
    .moveTo(150, y + 12)
    .lineTo(560, y + 12)
    .stroke();

  // 7. Towards
  y += lineGap;
  let towards = donation.scheme;
  if (donation.occasion) towards += ` (${donation.occasion})`;
  if (donation.inNameOf) towards += ` in name of ${donation.inNameOf}`;

  doc.font("Helvetica").text("Towards:", 30, y);
  doc.font("Helvetica-Bold").text(towards, 80, y, { width: 470 });
  doc
    .moveTo(80, y + 12)
    .lineTo(560, y + 12)
    .stroke();

  // --- FOOTER ---
  const footerY = 320;

  const isCorpus =
    donation.scheme.toLowerCase().includes("corpus") ||
    donation.scheme.toLowerCase().includes("shasvitha");

  doc.font("Helvetica-Bold").fontSize(9);
  doc.text("1). Corpus Funds", 30, footerY);
  doc.rect(110, footerY - 2, 10, 10).stroke();
  if (isCorpus) doc.text("X", 112, footerY - 2);

  doc.text("2). Others", 30, footerY + 15);
  doc.rect(110, footerY + 13, 10, 10).stroke();
  if (!isCorpus) doc.text("X", 112, footerY + 13);

  doc
    .font("Helvetica")
    .fontSize(7)
    .text(
      "Income Tax exemption under Section 80G of IT ACT 1961 received Vide Director of Income Tax (Exemption)\nLtr.LF.No.DI(E)HYD/806/90/(05)07-08 dated 29-10-2007 & CBDT Circular No. 7 dated 27-10-2010.\nand as amended by the Finance ACT 2020.",
      140,
      footerY,
      { align: "center", width: 420 },
    );

  doc.moveDown(0.5);
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor("#B22222")
    .text(
      "IT Dept. Unique Regd.No.Under 80G AAATK6724FF20021, Date: 18/10/2021",
      140,
      doc.y,
      { align: "center", width: 420 },
    );

  doc
    .fillColor("blue")
    .fontSize(12)
    .text("KARUNASRI SEVA SAMITHI", 400, footerY + 45, { align: "right" });
  doc
    .fontSize(8)
    .fillColor("black")
    .text("Authorized Signatory", 480, footerY + 60);

  doc.end();
};

const buildTaxCertificate = (
  donorDetails,
  donations,
  dateRange,
  dataCallback,
  endCallback,
) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  drawHeader(doc, "Headquarters");
  doc.moveDown(4);
  doc
    .fillColor("black")
    .fontSize(14)
    .text("STATEMENT OF DONATIONS (FORM 10BE DATA)", {
      align: "center",
      underline: true,
    });
  doc.fontSize(11).text(`Financial Year: ${dateRange}`, { align: "center" });

  doc.moveDown(2);
  const infoY = doc.y;
  doc.font("Helvetica-Bold").text(`Donor Name:`, 50, infoY);
  doc.font("Helvetica").text(donorDetails.name, 150, infoY);

  let y = infoY + 60;
  donations.forEach((d) => {
    doc.text(
      `${new Date(d.createdAt).toLocaleDateString()} - Rs.${d.amount} - ${d.scheme}`,
      50,
      y,
    );
    y += 20;
  });

  doc.end();
};

module.exports = { buildReceipt, buildTaxCertificate };
