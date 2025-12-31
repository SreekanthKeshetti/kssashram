const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const buildProgressPDF = (student, dataCallback, endCallback) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  // --- 1. HEADER & LOGO ---
  const logoPath = path.join(__dirname, "..", "logo.jpg");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 60 });
  }

  doc
    .fillColor("#581818")
    .fontSize(20)
    .text("KARUNASRI SEVA SAMITHI", 120, 50, { align: "left" })
    .fontSize(10)
    .text("Student Progress Report", 120, 75, { align: "left" });

  doc
    .moveTo(50, 100)
    .lineTo(550, 100)
    .strokeColor("#DAA520")
    .lineWidth(2)
    .stroke();

  // --- 2. STUDENT DETAILS ---
  doc.moveDown(3);
  doc.fillColor("black").fontSize(12);

  doc
    .font("Helvetica-Bold")
    .text(`Name: ${student.firstName} ${student.lastName}`);
  doc
    .font("Helvetica")
    .text(`Date of Birth: ${new Date(student.dob).toLocaleDateString()}`);
  doc.text(`Branch: ${student.branch}`);

  if (student.sponsor) {
    doc.text(`Sponsored By: ${student.sponsor.donorName}`);
  }

  doc.moveDown(2);

  // --- 3. ACADEMIC PROGRESS ---
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Academic Performance", { underline: true });
  doc.moveDown(0.5);

  // Simple Table Header
  let y = doc.y;
  doc.fontSize(10).font("Helvetica-Bold");
  doc.text("Year", 50, y);
  doc.text("Class", 150, y);
  doc.text("School", 250, y);
  doc.text("Percentage", 450, y);

  doc
    .moveTo(50, y + 15)
    .lineTo(550, y + 15)
    .stroke();
  y += 25;

  // Table Rows
  doc.font("Helvetica");
  if (student.educationHistory && student.educationHistory.length > 0) {
    student.educationHistory.forEach((edu) => {
      doc.text(edu.year, 50, y);
      doc.text(edu.class, 150, y);
      doc.text(edu.school, 250, y);
      doc.text(edu.percentage + "%", 450, y);
      y += 20;
    });
  } else {
    doc.text("No academic records available yet.", 50, y);
    y += 20;
  }

  doc.moveDown(2);
  y = doc.y;

  // --- 4. HEALTH UPDATE ---
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Health & Well-being", 50, y, { underline: true });
  doc.moveDown(0.5);

  y = doc.y;
  doc.fontSize(10).font("Helvetica-Bold");
  doc.text("Date", 50, y);
  doc.text("Checkup Type", 150, y);
  doc.text("Observation", 300, y);

  doc
    .moveTo(50, y + 15)
    .lineTo(550, y + 15)
    .stroke();
  y += 25;

  doc.font("Helvetica");
  if (student.healthRecords && student.healthRecords.length > 0) {
    student.healthRecords.forEach((h) => {
      doc.text(new Date(h.date).toLocaleDateString(), 50, y);
      doc.text(h.checkupType, 150, y);
      doc.text(h.observation, 300, y);
      y += 20;
    });
  } else {
    doc.text("No health issues recorded. Student is healthy.", 50, y);
  }

  // --- 5. FOOTER ---
  doc.moveDown(4);
  doc.fontSize(10).font("Helvetica-Oblique");
  doc.text(
    "Thank you for your continued support in shaping this child's future.",
    { align: "center" }
  );

  doc.end();
};

module.exports = { buildProgressPDF };
