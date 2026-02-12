const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const buildSkillForm = (dataCallback, endCallback) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  // --- 1. HEADER (Standard KSS Header) ---
  const logoPath = path.join(__dirname, "..", "logo.jpg");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, 30, { width: 60 });
  }

  // Trust Name & Address
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor("#581818") // Maroon
    .text("KARUNASRI SEVA SAMITHI", 110, 35, { align: "center" });

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("black")
    .text(
      "H.No.17-1-474, Krishna Nagar, Saidabad, Hyderabad - 500 059",
      110,
      60,
      { align: "center" },
    )
    .text("Phone: 040-24073204 | Mobile: 9000889785", 110, 75, {
      align: "center",
    });

  // Divider
  doc
    .moveTo(40, 100)
    .lineTo(550, 100)
    .strokeColor("#DAA520") // Gold
    .lineWidth(2)
    .stroke();

  // --- 2. FORM TITLE ---
  doc.moveDown(3);
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor("black")
    .text("SKILL DEVELOPMENT / EVENT REGISTRATION FORM", {
      align: "center",
      underline: true,
    });

  // --- 3. THE FORM FIELDS ---
  let y = 160;
  const gap = 35;
  const labelX = 50;
  const lineStart = 200;
  const lineEnd = 540;

  doc.fontSize(11).font("Helvetica");

  // Field Generator Helper
  const drawField = (label, isBox = false) => {
    doc.font("Helvetica-Bold").text(label, labelX, y);

    if (isBox) {
      doc.rect(lineStart, y - 5, 20, 20).stroke(); // Checkbox
      doc.font("Helvetica").text("Male", lineStart + 30, y);
      doc.rect(lineStart + 70, y - 5, 20, 20).stroke();
      doc.font("Helvetica").text("Female", lineStart + 100, y);
    } else {
      // Draw dotted line
      doc
        .moveTo(lineStart, y + 10)
        .lineTo(lineEnd, y + 10)
        .lineWidth(0.5)
        .strokeColor("#333")
        .dash(1, { space: 2 })
        .stroke();
    }
    y += gap;
    doc.undash(); // Reset dash
  };

  drawField("1. Program / Course Name:");
  drawField("2. Full Name of Applicant:");
  drawField("3. Father's / Husband's Name:");
  drawField("4. Date of Birth / Age:");
  drawField("5. Gender:", true); // Special handling for checkbox
  drawField("6. Aadhaar Number:");
  drawField("7. Mobile Number:");
  drawField("8. Email Address (Optional):");
  drawField("9. Qualification / Occupation:");

  // Address is multi-line
  doc.font("Helvetica-Bold").text("10. Residential Address:", labelX, y);
  doc
    .moveTo(lineStart, y + 10)
    .lineTo(lineEnd, y + 10)
    .stroke();
  y += gap;
  doc
    .moveTo(lineStart, y + 10)
    .lineTo(lineEnd, y + 10)
    .stroke();
  y += gap;

  // --- 4. DECLARATION ---
  y += 20;
  doc
    .font("Helvetica-Oblique")
    .fontSize(9)
    .text(
      "I hereby declare that the details furnished above are true. I agree to abide by the rules and regulations of Karunasri Seva Samithi during the course of this training/event.",
      50,
      y,
      { align: "justify", width: 500 },
    );

  // --- 5. SIGNATURES ---
  y += 60;
  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("Date: ________________", 50, y);
  doc.text("Place: ________________", 50, y + 20);

  doc.text("Signature of Applicant", 400, y);

  // --- 6. OFFICE USE BOX ---
  const footerY = 700;
  doc.rect(40, footerY, 515, 100).stroke();

  doc
    .fillColor("black")
    .fontSize(10)
    .text("FOR OFFICE USE ONLY", 0, footerY + 10, {
      align: "center",
      width: 600,
    });

  doc.fontSize(9).font("Helvetica");
  doc.text("Registration No: __________________________", 60, footerY + 35);
  doc.text("Date of Joining: __________________________", 350, footerY + 35);

  doc.text("Fee Details (If applicable):", 60, footerY + 60);
  doc.text("Paid Rs. ___________  Receipt No: ___________", 200, footerY + 60);

  doc.text("Course Coordinator Sign", 400, footerY + 80);

  doc.end();
};

module.exports = { buildSkillForm };
