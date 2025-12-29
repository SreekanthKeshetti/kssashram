const PDFDocument = require("pdfkit");
const fs = require("fs");

const buildReceipt = (donation, dataCallback, endCallback) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  // --- 1. Header ---
  doc
    .fillColor("#581818") // Maroon
    .fontSize(20)
    .text("KARUNASRI SEVA SAMITHI", { align: "center" })
    .fontSize(10)
    .text("Plot No. 123, Temple Road, Saroornagar, Hyderabad - 500035", {
      align: "center",
    })
    .text(
      "Reg No: 123/2024 | Email: info@karunasri.org | Phone: +91 99220 03000",
      { align: "center" }
    )
    .moveDown();

  // Draw a line
  doc
    .moveTo(50, 130)
    .lineTo(550, 130)
    .strokeColor("#DAA520")
    .lineWidth(2)
    .stroke();

  // --- 2. Receipt Title ---
  doc
    .moveDown()
    .fillColor("#000000")
    .fontSize(16)
    .text("DONATION RECEIPT", { align: "center", underline: true })
    .moveDown();

  // --- 3. Receipt Details (Grid Layout) ---
  const startY = 200;

  doc
    .fontSize(12)
    .text(
      `Receipt No: ${donation._id.toString().slice(-6).toUpperCase()}`,
      50,
      startY
    );
  doc.text(
    `Date: ${new Date(donation.createdAt).toLocaleDateString()}`,
    400,
    startY
  );

  doc.moveDown();
  doc.text(`Received with thanks from:`, 50, startY + 30);
  doc.font("Helvetica-Bold").text(donation.donorName, 200, startY + 30);

  doc.font("Helvetica").text(`Phone Number:`, 50, startY + 50);
  doc.text(donation.donorPhone, 200, startY + 50);

  if (donation.donorPan) {
    doc.text(`PAN Number:`, 50, startY + 70);
    doc.text(donation.donorPan, 200, startY + 70);
  }

  doc.text(`Sum of Rupees:`, 50, startY + 100);
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text(`Rs. ${donation.amount.toLocaleString()}/-`, 200, startY + 100);

  doc
    .font("Helvetica")
    .fontSize(12)
    .text(`Towards Scheme:`, 50, startY + 130);
  doc.text(donation.scheme, 200, startY + 130);

  doc.text(`Payment Mode:`, 50, startY + 150);
  doc.text(donation.paymentMode, 200, startY + 150);

  // --- 4. 80G Statement ---
  doc.moveDown(4);
  doc
    .rect(50, 450, 500, 60) // Box
    .fillAndStroke("#f0f0f0", "#000000"); // Light grey background

  doc
    .fillColor("#000000")
    .text(
      "Donations to Karunasri Seva Samithi are exempt from Income Tax under Section 80G of the Income Tax Act, 1961. URN: AAATE1234EF20214",
      60,
      465,
      { width: 480, align: "center" }
    );

  // --- 5. Footer / Signature ---
  doc.moveDown(4);
  doc.text("Authorized Signatory", 400, 600);
  doc.text("(Karunasri Seva Samithi)", 380, 615);

  doc.end();
};

module.exports = { buildReceipt };
