const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const buildReceipt = (donation, dataCallback, endCallback) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  // --- 1. LOGO ---
  const logoPath = path.join(__dirname, "..", "logo.jpg");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 70 });
  }

  // --- 2. HEADER (Branch Specific) ---
  const branchName = donation.branch || "Headquarters";

  doc
    .fillColor("#581818")
    .fontSize(20)
    .text("KARUNASRI SEVA SAMITHI", 130, 50, { align: "left" })
    .fontSize(10)
    .text(`Branch: ${branchName}`, 130, 75, { align: "left" })
    .text(
      "Reg No: 123/2024 | 80G Exempt | Email: info@karunasri.org",
      130,
      90,
      {
        align: "left",
      },
    );

  // Divider Line
  doc
    .moveTo(50, 130)
    .lineTo(550, 130)
    .strokeColor("#DAA520")
    .lineWidth(2)
    .stroke();

  // --- 3. TITLE ---
  doc
    .moveDown(3)
    .fillColor("#000000")
    .fontSize(16)
    .text("DONATION RECEIPT", 50, 150, { align: "center", underline: true });

  // --- 4. RECEIPT DETAILS (FIXED OVERLAP) ---
  const startY = 200;
  const col1 = 50; // Labels Left
  const col2 = 200; // Values Left

  const rightColX = 350; // Moved left to give more space
  const rightColWidth = 200;

  // Left Side: System ID
  doc
    .fontSize(11)
    .text(
      `System ID: ${donation._id.toString().slice(-6).toUpperCase()}`,
      50,
      startY,
    );

  // Right Side: Manual Receipt & Date (Aligned Right to prevent overlap)
  if (donation.manualReceiptNo) {
    doc.text(`Manual Ref: ${donation.manualReceiptNo}`, rightColX, startY, {
      align: "right",
      width: rightColWidth,
    });

    if (donation.manualReceiptDate) {
      // Use doc.y to place it directly below the previous line automatically
      doc.text(
        `Date: ${new Date(donation.manualReceiptDate).toLocaleDateString()}`,
        rightColX,
        doc.y + 5,
        { align: "right", width: rightColWidth },
      );
    }
  } else {
    doc.text(
      `Date: ${new Date(donation.createdAt).toLocaleDateString()}`,
      rightColX,
      startY,
      { align: "right", width: rightColWidth },
    );
  }

  // --- 5. DONOR DETAILS ---
  // Ensure we start below the header section, regardless of wrapping
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

  // Amount
  // Add extra spacing before Amount
  currentY += 10;
  doc.text(`Sum of Rupees:`, col1, currentY);
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text(`Rs. ${donation.amount.toLocaleString()}/-`, col2, currentY);

  // Scheme
  currentY += 30;
  doc.font("Helvetica").fontSize(11).text(`Towards Scheme:`, col1, currentY);
  doc.text(donation.scheme, col2, currentY);

  // --- 6. PAYMENT DETAILS ---
  currentY += 30;
  doc.text(`Payment Mode:`, col1, currentY);

  let paymentString = donation.paymentMode;

  if (donation.paymentDetails) {
    const { chequeNo, chequeDate, bankName, transactionId, ddNo } =
      donation.paymentDetails;

    if (donation.paymentMode === "Cheque") {
      paymentString += ` | No: ${chequeNo || "-"}`;
      if (chequeDate)
        paymentString += ` | Dt: ${new Date(chequeDate).toLocaleDateString()}`;
      if (bankName) paymentString += ` | Bank: ${bankName}`;
    } else if (donation.paymentMode === "DD") {
      paymentString += ` | DD: ${ddNo || chequeNo || "-"}`;
      if (bankName) paymentString += ` | Bank: ${bankName}`;
    } else if (
      ["Online", "UPI", "Bank Transfer"].includes(donation.paymentMode)
    ) {
      if (transactionId) paymentString += ` | Ref: ${transactionId}`;
    }
  }

  doc.text(paymentString, col2, currentY, { width: 300 });

  // --- 7. OCCASION ---
  if (donation.occasion || donation.inNameOf) {
    currentY += 30;
    let occasionText = "";
    if (donation.occasion) occasionText += `${donation.occasion} `;
    if (donation.inNameOf) occasionText += `in name of ${donation.inNameOf}`;

    doc
      .font("Helvetica-Oblique")
      .text(`Occasion: ${occasionText}`, col1, currentY);
  }

  // --- 8. FOOTER ---
  // Fixed position at bottom to ensure it doesn't overlap with long content
  const footerY = 700; // Near bottom of A4

  doc.rect(50, footerY - 60, 500, 50).fillAndStroke("#f0f0f0", "#000000");

  doc
    .fillColor("#000000")
    .font("Helvetica")
    .text(
      "Donations to Karunasri Seva Samithi are exempt from Income Tax under Section 80G of the Income Tax Act, 1961.",
      60,
      footerY - 45,
      { width: 480, align: "center" },
    );

  doc.text("Authorized Signatory", 400, footerY + 20);
  doc.text("(Karunasri Seva Samithi)", 380, footerY + 35);

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

  doc.fontSize(18).text("KARUNASRI SEVA SAMITHI", { align: "center" });
  doc
    .fontSize(12)
    .text("Consolidated 80G Statement (Form 10BE Data)", { align: "center" });
  doc.moveDown();

  doc.text(`Donor: ${donorDetails.name}`);
  doc.text(`PAN: ${donorDetails.pan}`);
  doc.text(`Period: ${dateRange}`);
  doc.moveDown();

  let y = 200;
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
