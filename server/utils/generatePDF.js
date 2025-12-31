// const PDFDocument = require("pdfkit");
// const fs = require("fs");

// const buildReceipt = (donation, dataCallback, endCallback) => {
//   const doc = new PDFDocument({ size: "A4", margin: 50 });

//   doc.on("data", dataCallback);
//   doc.on("end", endCallback);

//   // --- 1. Header ---
//   doc
//     .fillColor("#581818") // Maroon
//     .fontSize(20)
//     .text("KARUNASRI SEVA SAMITHI", { align: "center" })
//     .fontSize(10)
//     .text("Plot No. 123, Temple Road, Saroornagar, Hyderabad - 500035", {
//       align: "center",
//     })
//     .text(
//       "Reg No: 123/2024 | Email: info@karunasri.org | Phone: +91 99220 03000",
//       { align: "center" }
//     )
//     .moveDown();

//   // Draw a line
//   doc
//     .moveTo(50, 130)
//     .lineTo(550, 130)
//     .strokeColor("#DAA520")
//     .lineWidth(2)
//     .stroke();

//   // --- 2. Receipt Title ---
//   doc
//     .moveDown()
//     .fillColor("#000000")
//     .fontSize(16)
//     .text("DONATION RECEIPT", { align: "center", underline: true })
//     .moveDown();

//   // --- 3. Receipt Details (Grid Layout) ---
//   const startY = 200;

//   doc
//     .fontSize(12)
//     .text(
//       `Receipt No: ${donation._id.toString().slice(-6).toUpperCase()}`,
//       50,
//       startY
//     );
//   doc.text(
//     `Date: ${new Date(donation.createdAt).toLocaleDateString()}`,
//     400,
//     startY
//   );

//   doc.moveDown();
//   doc.text(`Received with thanks from:`, 50, startY + 30);
//   doc.font("Helvetica-Bold").text(donation.donorName, 200, startY + 30);

//   doc.font("Helvetica").text(`Phone Number:`, 50, startY + 50);
//   doc.text(donation.donorPhone, 200, startY + 50);

//   if (donation.donorPan) {
//     doc.text(`PAN Number:`, 50, startY + 70);
//     doc.text(donation.donorPan, 200, startY + 70);
//   }

//   doc.text(`Sum of Rupees:`, 50, startY + 100);
//   doc
//     .font("Helvetica-Bold")
//     .fontSize(14)
//     .text(`Rs. ${donation.amount.toLocaleString()}/-`, 200, startY + 100);

//   doc
//     .font("Helvetica")
//     .fontSize(12)
//     .text(`Towards Scheme:`, 50, startY + 130);
//   doc.text(donation.scheme, 200, startY + 130);

//   doc.text(`Payment Mode:`, 50, startY + 150);
//   doc.text(donation.paymentMode, 200, startY + 150);

//   // --- 4. 80G Statement ---
//   doc.moveDown(4);
//   doc
//     .rect(50, 450, 500, 60) // Box
//     .fillAndStroke("#f0f0f0", "#000000"); // Light grey background

//   doc
//     .fillColor("#000000")
//     .text(
//       "Donations to Karunasri Seva Samithi are exempt from Income Tax under Section 80G of the Income Tax Act, 1961. URN: AAATE1234EF20214",
//       60,
//       465,
//       { width: 480, align: "center" }
//     );

//   // --- 5. Footer / Signature ---
//   doc.moveDown(4);
//   doc.text("Authorized Signatory", 400, 600);
//   doc.text("(Karunasri Seva Samithi)", 380, 615);

//   doc.end();
// };

// module.exports = { buildReceipt };
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const buildReceipt = (donation, dataCallback, endCallback) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  // --- 1. ADD LOGO ---
  const logoPath = path.join(__dirname, "..", "logo.jpg"); // Look for logo.png in server folder

  if (fs.existsSync(logoPath)) {
    // Image(path, x, y, options)
    doc.image(logoPath, 50, 45, { width: 70 });
  }

  // --- 2. Header Text (Shifted Right to make room for logo) ---
  doc
    .fillColor("#581818") // Maroon
    .fontSize(20)
    .text("KARUNASRI SEVA SAMITHI", 130, 50, { align: "left" }) // Adjusted X position
    .fontSize(10)
    .text(
      "Plot No. 123, Temple Road, Saroornagar, Hyderabad - 500035",
      130,
      75,
      { align: "left" }
    )
    .text("Reg No: 123/2024 | Email: info@karunasri.org", 130, 90, {
      align: "left",
    });

  // Draw a line
  doc
    .moveTo(50, 130)
    .lineTo(550, 130)
    .strokeColor("#DAA520")
    .lineWidth(2)
    .stroke();

  // --- 3. Receipt Title ---
  doc
    .moveDown(3) // Move cursor down
    .fillColor("#000000")
    .fontSize(16)
    .text("DONATION RECEIPT", 50, 150, { align: "center", underline: true });

  // --- 4. Receipt Details ---
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

  doc.text(`Received with thanks from:`, 50, startY + 30);
  doc.font("Helvetica-Bold").text(donation.donorName, 200, startY + 30);

  doc.font("Helvetica").text(`Phone Number:`, 50, startY + 50);
  doc.text(donation.donorPhone, 200, startY + 50);

  if (donation.donorPan) {
    doc.text(`PAN Number:`, 50, startY + 70);
    doc.text(donation.donorPan, 200, startY + 70);
  }

  // Handle Aadhaar (KSS_DON_8)
  if (donation.donorAadhaar) {
    doc.text(`Aadhaar Number:`, 50, startY + 90);
    doc.text(donation.donorAadhaar, 200, startY + 90);
  }

  const amountY = donation.donorAadhaar ? startY + 120 : startY + 100;

  doc.text(`Sum of Rupees:`, 50, amountY);
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text(`Rs. ${donation.amount.toLocaleString()}/-`, 200, amountY);

  doc
    .font("Helvetica")
    .fontSize(12)
    .text(`Towards Scheme:`, 50, amountY + 30);
  doc.text(donation.scheme, 200, amountY + 30);

  doc.text(`Payment Mode:`, 50, amountY + 50);
  doc.text(donation.paymentMode, 200, amountY + 50);

  // --- 5. 80G Statement ---
  doc
    .rect(50, 480, 500, 60) // Box
    .fillAndStroke("#f0f0f0", "#000000");

  doc
    .fillColor("#000000")
    .text(
      "Donations to Karunasri Seva Samithi are exempt from Income Tax under Section 80G of the Income Tax Act, 1961.",
      60,
      495,
      { width: 480, align: "center" }
    );

  // --- 6. Footer ---
  doc.text("Authorized Signatory", 400, 650);
  doc.text("(Karunasri Seva Samithi)", 380, 665);

  doc.end();
};
// --- NEW FUNCTION: Consolidated Tax Certificate ---
const buildTaxCertificate = (
  donorDetails,
  donations,
  dateRange,
  dataCallback,
  endCallback
) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  // 1. Header & Logo
  const logoPath = path.join(__dirname, "..", "logo.jpg");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 60 });
  }

  doc
    .fillColor("#581818")
    .fontSize(20)
    .text("KARUNASRI SEVA SAMITHI", 120, 50, { align: "left" })
    .fontSize(10)
    .text("Plot No. 123, Temple Road, Saroornagar, Hyderabad - 500035", 120, 75)
    .text(
      "Reg No: 123/2024 | PAN: AAATE1234E | 80G URN: AAATE1234EF20214",
      120,
      90
    );

  doc
    .moveTo(50, 115)
    .lineTo(550, 115)
    .strokeColor("#DAA520")
    .lineWidth(2)
    .stroke();

  // 2. Certificate Title
  doc.moveDown(4);
  doc
    .fillColor("black")
    .fontSize(16)
    .text("STATEMENT OF DONATION (FORM 10BE)", {
      align: "center",
      underline: true,
    });
  doc.fontSize(10).text(`Financial Year: ${dateRange}`, { align: "center" });

  // 3. Donor Details
  doc.moveDown(2);
  doc.text(`Donor Name: ${donorDetails.name}`, 50);
  doc.text(`Phone: ${donorDetails.phone}`);
  doc.text(`PAN: ${donorDetails.pan || "N/A"}`);
  doc.text(`Address: ${donorDetails.address || "N/A"}`);

  // 4. Donation Table
  doc.moveDown(2);
  let y = doc.y;

  // Table Header
  doc.font("Helvetica-Bold");
  doc.text("Date", 50, y);
  doc.text("Receipt No", 150, y);
  doc.text("Mode", 300, y);
  doc.text("Amount (Rs)", 450, y, { align: "right" });

  doc
    .moveTo(50, y + 15)
    .lineTo(550, y + 15)
    .lineWidth(1)
    .strokeColor("black")
    .stroke();
  y += 25;

  // Table Body
  doc.font("Helvetica");
  let total = 0;

  donations.forEach((d) => {
    doc.text(new Date(d.createdAt).toLocaleDateString(), 50, y);
    doc.text(d._id.toString().slice(-6).toUpperCase(), 150, y);
    doc.text(d.paymentMode, 300, y);
    doc.text(d.amount.toLocaleString("en-IN") + "/-", 450, y, {
      align: "right",
    });

    total += d.amount;
    y += 20;
  });

  doc.moveTo(50, y).lineTo(550, y).lineWidth(1).stroke();
  y += 10;

  // Total
  doc.font("Helvetica-Bold").fontSize(12);
  doc.text("Total Donations:", 300, y);
  doc.text(`Rs. ${total.toLocaleString("en-IN")}/-`, 450, y, {
    align: "right",
  });

  // 5. Footer / Declaration
  doc.moveDown(4);
  doc.font("Helvetica").fontSize(10);
  doc.text(
    "Certified that the above donations are received by Karunasri Seva Samithi and are exempt u/s 80G of the Income Tax Act, 1961.",
    50,
    doc.y,
    { align: "justify" }
  );

  doc.moveDown(4);
  doc.text("Authorized Signatory", 400, doc.y);
  doc.text("(Karunasri Seva Samithi)", 380, doc.y + 15);

  doc.end();
};

module.exports = { buildReceipt, buildTaxCertificate };
