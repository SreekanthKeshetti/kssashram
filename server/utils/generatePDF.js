// const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const path = require("path");

// const buildReceipt = (donation, dataCallback, endCallback) => {
//   const doc = new PDFDocument({ size: "A4", margin: 50 });

//   doc.on("data", dataCallback);
//   doc.on("end", endCallback);

//   // --- 1. LOGO ---
//   const logoPath = path.join(__dirname, "..", "logo.jpg");
//   if (fs.existsSync(logoPath)) {
//     doc.image(logoPath, 50, 45, { width: 70 });
//   }

//   // --- 2. HEADER (Branch Specific) ---
//   const branchName = donation.branch || "Headquarters";

//   doc
//     .fillColor("#581818")
//     .fontSize(20)
//     .text("KARUNASRI SEVA SAMITHI", 130, 50, { align: "left" })
//     .fontSize(10)
//     .text(`Branch: ${branchName}`, 130, 75, { align: "left" })
//     .text(
//       "Reg No: 123/2024 | 80G Exempt | Email: info@karunasri.org",
//       130,
//       90,
//       {
//         align: "left",
//       },
//     );

//   // Divider Line
//   doc
//     .moveTo(50, 130)
//     .lineTo(550, 130)
//     .strokeColor("#DAA520")
//     .lineWidth(2)
//     .stroke();

//   // --- 3. TITLE ---
//   doc
//     .moveDown(3)
//     .fillColor("#000000")
//     .fontSize(16)
//     .text("DONATION RECEIPT", 50, 150, { align: "center", underline: true });

//   // --- 4. RECEIPT DETAILS (FIXED OVERLAP) ---
//   const startY = 200;
//   const col1 = 50; // Labels Left
//   const col2 = 200; // Values Left

//   const rightColX = 350; // Moved left to give more space
//   const rightColWidth = 200;

//   // Left Side: System ID
//   doc
//     .fontSize(11)
//     .text(
//       `System ID: ${donation._id.toString().slice(-6).toUpperCase()}`,
//       50,
//       startY,
//     );

//   // Right Side: Manual Receipt & Date (Aligned Right to prevent overlap)
//   if (donation.manualReceiptNo) {
//     doc.text(`Manual Ref: ${donation.manualReceiptNo}`, rightColX, startY, {
//       align: "right",
//       width: rightColWidth,
//     });

//     if (donation.manualReceiptDate) {
//       // Use doc.y to place it directly below the previous line automatically
//       doc.text(
//         `Date: ${new Date(donation.manualReceiptDate).toLocaleDateString()}`,
//         rightColX,
//         doc.y + 5,
//         { align: "right", width: rightColWidth },
//       );
//     }
//   } else {
//     doc.text(
//       `Date: ${new Date(donation.createdAt).toLocaleDateString()}`,
//       rightColX,
//       startY,
//       { align: "right", width: rightColWidth },
//     );
//   }

//   // --- 5. DONOR DETAILS ---
//   // Ensure we start below the header section, regardless of wrapping
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

//   // Amount
//   // Add extra spacing before Amount
//   currentY += 10;
//   doc.text(`Sum of Rupees:`, col1, currentY);
//   doc
//     .font("Helvetica-Bold")
//     .fontSize(14)
//     .text(`Rs. ${donation.amount.toLocaleString()}/-`, col2, currentY);

//   // Scheme
//   currentY += 30;
//   doc.font("Helvetica").fontSize(11).text(`Towards Scheme:`, col1, currentY);
//   doc.text(donation.scheme, col2, currentY);

//   // --- 6. PAYMENT DETAILS ---
//   currentY += 30;
//   doc.text(`Payment Mode:`, col1, currentY);

//   let paymentString = donation.paymentMode;

//   if (donation.paymentDetails) {
//     const { chequeNo, chequeDate, bankName, transactionId, ddNo } =
//       donation.paymentDetails;

//     if (donation.paymentMode === "Cheque") {
//       paymentString += ` | No: ${chequeNo || "-"}`;
//       if (chequeDate)
//         paymentString += ` | Dt: ${new Date(chequeDate).toLocaleDateString()}`;
//       if (bankName) paymentString += ` | Bank: ${bankName}`;
//     } else if (donation.paymentMode === "DD") {
//       paymentString += ` | DD: ${ddNo || chequeNo || "-"}`;
//       if (bankName) paymentString += ` | Bank: ${bankName}`;
//     } else if (
//       ["Online", "UPI", "Bank Transfer"].includes(donation.paymentMode)
//     ) {
//       if (transactionId) paymentString += ` | Ref: ${transactionId}`;
//     }
//   }

//   doc.text(paymentString, col2, currentY, { width: 300 });

//   // --- 7. OCCASION ---
//   if (donation.occasion || donation.inNameOf) {
//     currentY += 30;
//     let occasionText = "";
//     if (donation.occasion) occasionText += `${donation.occasion} `;
//     if (donation.inNameOf) occasionText += `in name of ${donation.inNameOf}`;

//     doc
//       .font("Helvetica-Oblique")
//       .text(`Occasion: ${occasionText}`, col1, currentY);
//   }

//   // --- 8. FOOTER ---
//   // Fixed position at bottom to ensure it doesn't overlap with long content
//   const footerY = 700; // Near bottom of A4

//   doc.rect(50, footerY - 60, 500, 50).fillAndStroke("#f0f0f0", "#000000");

//   doc
//     .fillColor("#000000")
//     .font("Helvetica")
//     .text(
//       "Donations to Karunasri Seva Samithi are exempt from Income Tax under Section 80G of the Income Tax Act, 1961.",
//       60,
//       footerY - 45,
//       { width: 480, align: "center" },
//     );

//   doc.text("Authorized Signatory", 400, footerY + 20);
//   doc.text("(Karunasri Seva Samithi)", 380, footerY + 35);

//   doc.end();
// };

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

//   doc.fontSize(18).text("KARUNASRI SEVA SAMITHI", { align: "center" });
//   doc
//     .fontSize(12)
//     .text("Consolidated 80G Statement (Form 10BE Data)", { align: "center" });
//   doc.moveDown();

//   doc.text(`Donor: ${donorDetails.name}`);
//   doc.text(`PAN: ${donorDetails.pan}`);
//   doc.text(`Period: ${dateRange}`);
//   doc.moveDown();

//   let y = 200;
//   donations.forEach((d) => {
//     doc.text(
//       `${new Date(d.createdAt).toLocaleDateString()} - Rs.${d.amount} - ${d.scheme}`,
//       50,
//       y,
//     );
//     y += 20;
//   });

//   doc.end();
// };

// module.exports = { buildReceipt, buildTaxCertificate };
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// --- HELPER: DRAW HEADER (Used by both Receipt and Certificate) ---
const drawHeader = (doc, branchName = "Headquarters") => {
  // 1. LOGO
  const logoPath = path.join(__dirname, "..", "logo.jpg");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 70 });
  }

  // 2. TEXT DETAILS
  doc
    .fillColor("#581818") // Maroon
    .fontSize(20)
    .text("KARUNASRI SEVA SAMITHI", 130, 50, { align: "left" })
    .fontSize(10)
    .text(`Branch: ${branchName}`, 130, 75, { align: "left" })
    .text(
      "17-1-474, Krishna Nagar Colony, Saidabad. Hyderabad - 500059",
      130,
      90,
      { align: "left" },
    )
    .text("Reg No: 123/2024 | 80G Exempt | PAN: AAATE1234E", 130, 105, {
      align: "left",
    });

  // 3. DIVIDER LINE
  doc
    .moveTo(50, 130)
    .lineTo(550, 130)
    .strokeColor("#DAA520") // Gold
    .lineWidth(2)
    .stroke();
};

// ==========================================
// 1. DONATION RECEIPT GENERATOR
// ==========================================
const buildReceipt = (donation, dataCallback, endCallback) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  // Draw Header
  drawHeader(doc, donation.branch);

  // Title
  doc
    .moveDown(4)
    .fillColor("#000000")
    .fontSize(16)
    .text("DONATION RECEIPT", 50, 160, { align: "center", underline: true });

  // Receipt Details
  const startY = 210;
  const col1 = 50;
  const col2 = 200;

  // Right Aligned Receipt Info
  const rightX = 350;
  const rightW = 200;

  // Left: System ID
  doc
    .fontSize(11)
    .text(
      `System ID: ${donation._id.toString().slice(-6).toUpperCase()}`,
      col1,
      startY,
    );

  // Right: Date & Manual Ref
  if (donation.manualReceiptNo) {
    doc.text(`Manual Ref: ${donation.manualReceiptNo}`, rightX, startY, {
      align: "right",
      width: rightW,
    });
    if (donation.manualReceiptDate) {
      doc.text(
        `Date: ${new Date(donation.manualReceiptDate).toLocaleDateString()}`,
        rightX,
        doc.y + 5,
        { align: "right", width: rightW },
      );
    }
  } else {
    doc.text(
      `Date: ${new Date(donation.createdAt).toLocaleDateString()}`,
      rightX,
      startY,
      { align: "right", width: rightW },
    );
  }

  // Donor Details
  const detailsY = startY + 40;
  doc.text(`Received with thanks from:`, col1, detailsY);
  doc.font("Helvetica-Bold").text(donation.donorName, col2, detailsY);

  doc.font("Helvetica").text(`Phone Number:`, col1, detailsY + 20);
  doc.text(donation.donorPhone, col2, detailsY + 20);

  let currentY = detailsY + 40;
  if (donation.donorPan) {
    doc.text(`PAN Number:`, col1, currentY);
    doc.text(donation.donorPan, col2, currentY);
    currentY += 20;
  }
  if (donation.donorAadhaar) {
    doc.text(`Aadhaar Number:`, col1, currentY);
    doc.text(donation.donorAadhaar, col2, currentY);
    currentY += 20;
  }

  // Amount & Scheme
  currentY += 10;
  doc.text(`Sum of Rupees:`, col1, currentY);
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text(`Rs. ${donation.amount.toLocaleString()}/-`, col2, currentY);

  currentY += 30;
  doc.font("Helvetica").fontSize(11).text(`Towards Scheme:`, col1, currentY);
  doc.text(donation.scheme, col2, currentY);

  // Payment Mode
  currentY += 30;
  doc.text(`Payment Mode:`, col1, currentY);

  let paymentString = donation.paymentMode;
  if (donation.paymentDetails) {
    const { chequeNo, chequeDate, bankName, transactionId, ddNo } =
      donation.paymentDetails;
    if (donation.paymentMode === "Cheque") {
      paymentString += ` | No: ${chequeNo || "-"}`;
      if (bankName) paymentString += ` | Bank: ${bankName}`;
      if (chequeDate)
        paymentString += ` | Dt: ${new Date(chequeDate).toLocaleDateString()}`;
    } else if (donation.paymentMode === "DD") {
      paymentString += ` | DD: ${ddNo || "-"}`;
      if (bankName) paymentString += ` | Bank: ${bankName}`;
    } else if (
      ["Online", "UPI", "Bank Transfer"].includes(donation.paymentMode)
    ) {
      if (transactionId) paymentString += ` | Ref: ${transactionId}`;
    }
  }
  doc.text(paymentString, col2, currentY, { width: 300 });

  // Occasion
  if (donation.occasion || donation.inNameOf) {
    currentY += 30;
    let occasionText = "";
    if (donation.occasion) occasionText += `${donation.occasion} `;
    if (donation.inNameOf) occasionText += `in name of ${donation.inNameOf}`;
    doc
      .font("Helvetica-Oblique")
      .text(`Occasion: ${occasionText}`, col1, currentY);
  }

  // Footer & Disclaimer
  const footerY = 680;
  doc.rect(50, footerY - 50, 500, 40).fillAndStroke("#f0f0f0", "#000000");
  doc
    .fillColor("#000000")
    .font("Helvetica")
    .fontSize(10)
    .text(
      "Donations are exempt from Income Tax under Section 80G.",
      60,
      footerY - 35,
      { width: 480, align: "center" },
    );

  doc.text("Authorized Signatory", 400, footerY + 30);
  doc.text("(Karunasri Seva Samithi)", 380, footerY + 45);

  doc.end();
};

// ==========================================
// 2. TAX CERTIFICATE GENERATOR (UPDATED)
// ==========================================
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

  // 1. Draw Professional Header (Same as Receipt)
  drawHeader(doc, "Headquarters"); // Tax certs usually issued from HQ

  // 2. Title
  doc.moveDown(4);
  doc
    .fillColor("black")
    .fontSize(14)
    .text("STATEMENT OF DONATIONS (FORM 10BE DATA)", {
      align: "center",
      underline: true,
    });
  doc.fontSize(11).text(`Financial Year: ${dateRange}`, { align: "center" });

  // 3. Donor Info Box
  doc.moveDown(2);
  const infoY = doc.y;

  doc.font("Helvetica-Bold").text(`Donor Name:`, 50, infoY);
  doc.font("Helvetica").text(donorDetails.name, 150, infoY);

  doc.font("Helvetica-Bold").text(`Phone:`, 350, infoY);
  doc.font("Helvetica").text(donorDetails.phone, 420, infoY);

  doc.font("Helvetica-Bold").text(`PAN Number:`, 50, infoY + 20);
  doc.font("Helvetica").text(donorDetails.pan || "N/A", 150, infoY + 20);

  doc.font("Helvetica-Bold").text(`Address:`, 50, infoY + 40);
  doc
    .font("Helvetica")
    .text(donorDetails.address || "Not Provided", 150, infoY + 40);

  // 4. Donation Table
  doc.moveDown(3);
  const tableTop = doc.y;

  // Table Header
  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("Date", 50, tableTop);
  doc.text("Receipt No", 130, tableTop);
  doc.text("Scheme / Purpose", 250, tableTop);
  doc.text("Amount (Rs)", 450, tableTop, { align: "right" });

  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  // Table Rows
  let y = tableTop + 25;
  let totalAmount = 0;
  doc.font("Helvetica");

  donations.forEach((d) => {
    // Page Break Logic
    if (y > 700) {
      doc.addPage();
      y = 50;
    }

    doc.text(new Date(d.createdAt).toLocaleDateString(), 50, y);
    // Prefer Manual Receipt No if available, else System ID
    const receiptRef =
      d.manualReceiptNo || d._id.toString().slice(-6).toUpperCase();
    doc.text(receiptRef, 130, y);

    doc.text(d.scheme.substring(0, 30), 250, y); // Truncate if too long
    doc.text(d.amount.toLocaleString(), 450, y, { align: "right" });

    totalAmount += d.amount;
    y += 20;
  });

  // 5. Total
  doc.moveTo(50, y).lineTo(550, y).lineWidth(1).stroke();
  y += 10;
  doc.font("Helvetica-Bold").fontSize(12);
  doc.text("Total Donations:", 300, y);
  doc.text(`Rs. ${totalAmount.toLocaleString()}/-`, 450, y, { align: "right" });

  // 6. Footer
  doc.moveDown(4);
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      "Certified that the above donations are received by Karunasri Seva Samithi.",
      50,
      doc.y,
    );

  const footerY = 720;
  doc.text("Authorized Signatory", 400, footerY);
  doc.text("(Karunasri Seva Samithi)", 380, footerY + 15);

  doc.end();
};

module.exports = { buildReceipt, buildTaxCertificate };
