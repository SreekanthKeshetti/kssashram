// const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const path = require("path");

// const buildMemberProfile = (member, dataCallback, endCallback) => {
//   const doc = new PDFDocument({ size: "A4", margin: 50 });

//   doc.on("data", dataCallback);
//   doc.on("end", endCallback);

//   // --- 1. HEADER (Same as Receipt) ---
//   const logoPath = path.join(__dirname, "..", "logo.jpg");
//   if (fs.existsSync(logoPath)) {
//     doc.image(logoPath, 40, 30, { width: 60 });
//   }

//   doc
//     .fillColor("#581818")
//     .fontSize(18)
//     .font("Helvetica-Bold")
//     .text("KARUNASRI SEVA SAMITHI", 0, 35, { align: "center" });

//   doc
//     .fillColor("black")
//     .fontSize(10)
//     .font("Helvetica")
//     .text(`(${member.branch || "Headquarters"})`, { align: "center" })
//     .text("H.No.17-1-474, Krishna Nagar, Saidabad, Hyderabad - 500 059", {
//       align: "center",
//     })
//     .text("Phone: 040-24073204 | Mobile: 9000889785", { align: "center" });

//   doc.moveDown(1);
//   doc
//     .moveTo(40, 100)
//     .lineTo(550, 100)
//     .lineWidth(2)
//     .strokeColor("#581818")
//     .stroke();

//   // --- 2. TITLE ---
//   doc.moveDown(2);
//   doc
//     .fontSize(14)
//     .font("Helvetica-Bold")
//     .text("APPLICATION FOR MEMBERSHIP", { align: "center", underline: true });

//   // Date Right
//   doc
//     .fontSize(10)
//     .font("Helvetica")
//     .text(`Date: ${new Date(member.joinDate).toLocaleDateString()}`, 400, 135);

//   // --- 3. FORM BODY (The Numbered List) ---
//   let y = 170;
//   const gap = 25;
//   const labelX = 50;
//   const valueX = 250;

//   doc.font("Helvetica-Bold").text("1. Full Name", labelX, y);
//   doc
//     .font("Helvetica")
//     .text(`:  ${member.firstName} ${member.lastName}`, valueX, y);

//   y += gap;
//   doc.font("Helvetica-Bold").text("2. Father's / Spouse Name", labelX, y);
//   doc.font("Helvetica").text(`:  ${member.spouseName || "-"}`, valueX, y);

//   y += gap;
//   doc.font("Helvetica-Bold").text("3. Date of Birth", labelX, y);
//   const dobStr = member.dob ? new Date(member.dob).toLocaleDateString() : "-";
//   doc.font("Helvetica").text(`:  ${dobStr}`, valueX, y);

//   y += gap;
//   // Address is multiline
//   doc.font("Helvetica-Bold").text("4. Address", labelX, y);
//   doc.font("Helvetica").text(`:  ${member.address}`, valueX, y, { width: 300 });
//   const addressHeight = doc.heightOfString(member.address, { width: 300 });
//   y += addressHeight + 10;

//   doc.font("Helvetica-Bold").text("5. Qualifications", labelX, y);
//   doc.font("Helvetica").text(`:  ${member.qualification || "-"}`, valueX, y);

//   // Profession on same line if possible, or next
//   // Let's put Profession next for clean layout
//   y += gap;
//   doc.font("Helvetica-Bold").text("6. Profession", labelX, y);
//   doc.font("Helvetica").text(`:  ${member.profession || "-"}`, valueX, y);

//   y += gap;
//   doc.font("Helvetica-Bold").text("7. Positions in other Orgs", labelX, y);
//   doc
//     .font("Helvetica")
//     .text(`:  ${member.otherOrgPositions || "None"}`, valueX, y);

//   y += gap;
//   doc.font("Helvetica-Bold").text("8. Aadhaar No.", labelX, y);
//   doc.font("Helvetica").text(`:  ${member.aadhaar || "-"}`, valueX, y);

//   y += gap;
//   doc.font("Helvetica-Bold").text("9. PAN No.", labelX, y);
//   doc.font("Helvetica").text(`:  ${member.pan || "-"}`, valueX, y);

//   y += gap;
//   doc.font("Helvetica-Bold").text("10. Contact / Mobile", labelX, y);
//   doc.font("Helvetica").text(`:  ${member.phone}`, valueX, y);

//   y += gap;
//   doc.font("Helvetica-Bold").text("11. Email ID", labelX, y);
//   doc.font("Helvetica").text(`:  ${member.email || "-"}`, valueX, y);

//   y += gap;
//   doc.font("Helvetica-Bold").text("12. References", labelX, y);
//   doc.font("Helvetica").text(`:  ${member.references || "-"}`, valueX, y);

//   // --- 4. DECLARATION ---
//   y += 50;
//   doc
//     .font("Helvetica")
//     .fontSize(10)
//     .text(
//       `I, ${member.firstName} ${member.lastName}, declare that the details given above are true to the best of my knowledge. Further, I agree to abide by the present By-laws of Karunasri Seva Samithi. I wish to enroll myself as a ${member.category} Member.`,
//       50,
//       y,
//       { align: "justify", width: 500 },
//     );

//   // --- 5. SIGNATURES ---
//   y += 60;
//   doc.text("Place: Hyderabad", 50, y);
//   doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, y + 15);

//   doc
//     .font("Helvetica-Bold")
//     .text(`${member.firstName} ${member.lastName}`, 400, y);
//   doc.font("Helvetica").text("(Signature)", 430, y + 15);

//   // --- 6. OFFICE USE (Bottom Box) ---
//   y += 50;
//   doc.rect(40, y, 515, 80).stroke();

//   doc.font("Helvetica-Bold").text("FOR OFFICE USE ONLY", 230, y + 5);

//   doc.font("Helvetica").fontSize(9);
//   doc.text(
//     `Application Received on: ${new Date(member.createdAt).toLocaleDateString()}`,
//     50,
//     y + 25,
//   );

//   const paymentText =
//     member.feeStatus === "Paid"
//       ? `Paid Rs. ${member.feeAmount}/-`
//       : "Payment Pending";
//   doc.text(`Payment Details: ${paymentText}`, 50, y + 45);

//   doc.text("Secretary / President", 400, y + 55);

//   doc.end();
// };

// module.exports = { buildMemberProfile };

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const buildMemberProfile = (member, dataCallback, endCallback) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  // --- 1. HEADER ---
  const logoPath = path.join(__dirname, "..", "logo.jpg");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, 30, { width: 60 });
  }

  // --- PHOTO PLACEHOLDER (NEW) ---
  // Top Right Box for pasting photo
  const photoX = 460;
  const photoY = 30;
  const photoW = 90;
  const photoH = 110;

  doc
    .rect(photoX, photoY, photoW, photoH)
    .lineWidth(1)
    .strokeColor("black")
    .stroke();

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#666")
    .text("Affix Recent\nPassport Size\nPhoto", photoX, photoY + 40, {
      width: photoW,
      align: "center",
    });

  // --- TRUST DETAILS (Centered) ---
  // Restrict width to avoid hitting the photo box
  doc
    .fillColor("#581818")
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("KARUNASRI SEVA SAMITHI", 100, 35, { align: "center", width: 350 });

  doc
    .fillColor("black")
    .fontSize(10)
    .font("Helvetica")
    .text(`(${member.branch || "Headquarters"})`, 100, 58, {
      align: "center",
      width: 350,
    })
    .text(
      "H.No.17-1-474, Krishna Nagar, Saidabad, Hyderabad - 500 059",
      100,
      72,
      { align: "center", width: 350 },
    )
    .text("Phone: 040-24073204 | Mobile: 9000889785", 100, 86, {
      align: "center",
      width: 350,
    });

  // Divider Line
  doc.moveDown(1.5);
  doc
    .moveTo(40, 150)
    .lineTo(550, 150)
    .lineWidth(2)
    .strokeColor("#581818")
    .stroke();

  // --- 2. TITLE ---
  doc.moveDown(2); // Move below the photo box line
  doc
    .fillColor("black")
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("APPLICATION FOR MEMBERSHIP", 0, 170, {
      align: "center",
      underline: true,
    });

  // Date Right
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`Date: ${new Date(member.joinDate).toLocaleDateString()}`, 400, 175);

  // --- 3. FORM BODY (The Numbered List) ---
  let y = 210;
  const gap = 25;
  const labelX = 50;
  const valueX = 250;

  doc.font("Helvetica-Bold").text("1. Full Name", labelX, y);
  doc
    .font("Helvetica")
    .text(`:  ${member.firstName} ${member.lastName}`, valueX, y);

  y += gap;
  doc.font("Helvetica-Bold").text("2. Father's / Spouse Name", labelX, y);
  doc.font("Helvetica").text(`:  ${member.spouseName || "-"}`, valueX, y);

  y += gap;
  doc.font("Helvetica-Bold").text("3. Date of Birth", labelX, y);
  const dobStr = member.dob ? new Date(member.dob).toLocaleDateString() : "-";
  doc.font("Helvetica").text(`:  ${dobStr}`, valueX, y);

  y += gap;
  // Address is multiline
  doc.font("Helvetica-Bold").text("4. Address", labelX, y);
  doc.font("Helvetica").text(`:  ${member.address}`, valueX, y, { width: 300 });
  const addressHeight = doc.heightOfString(member.address, { width: 300 });
  y += addressHeight + 10;

  doc.font("Helvetica-Bold").text("5. Qualifications", labelX, y);
  doc.font("Helvetica").text(`:  ${member.qualification || "-"}`, valueX, y);

  y += gap;
  doc.font("Helvetica-Bold").text("6. Profession", labelX, y);
  doc.font("Helvetica").text(`:  ${member.profession || "-"}`, valueX, y);

  y += gap;
  doc.font("Helvetica-Bold").text("7. Positions in other Orgs", labelX, y);
  doc
    .font("Helvetica")
    .text(`:  ${member.otherOrgPositions || "None"}`, valueX, y);

  y += gap;
  doc.font("Helvetica-Bold").text("8. Aadhaar No.", labelX, y);
  doc.font("Helvetica").text(`:  ${member.aadhaar || "-"}`, valueX, y);

  y += gap;
  doc.font("Helvetica-Bold").text("9. PAN No.", labelX, y);
  doc.font("Helvetica").text(`:  ${member.pan || "-"}`, valueX, y);

  y += gap;
  doc.font("Helvetica-Bold").text("10. Contact / Mobile", labelX, y);
  doc.font("Helvetica").text(`:  ${member.phone}`, valueX, y);

  y += gap;
  doc.font("Helvetica-Bold").text("11. Email ID", labelX, y);
  doc.font("Helvetica").text(`:  ${member.email || "-"}`, valueX, y);

  y += gap;
  doc.font("Helvetica-Bold").text("12. References", labelX, y);
  doc.font("Helvetica").text(`:  ${member.references || "-"}`, valueX, y);

  // --- 4. DECLARATION ---
  y += 40;
  doc
    .font("Helvetica")
    .fontSize(10)
    .text(
      `I, ${member.firstName} ${member.lastName}, declare that the details given above are true to the best of my knowledge. Further, I agree to abide by the present By-laws of Karunasri Seva Samithi. I wish to enroll myself as a ${member.category} Member.`,
      50,
      y,
      { align: "justify", width: 500 },
    );

  // --- 5. SIGNATURES ---
  y += 60;
  doc.text("Place: Hyderabad", 50, y);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, y + 15);

  doc
    .font("Helvetica-Bold")
    .text(`${member.firstName} ${member.lastName}`, 400, y);
  doc.font("Helvetica").text("(Signature)", 430, y + 15);

  // --- 6. OFFICE USE (Bottom Box) ---
  const footerY = 680; // Fixed near bottom
  doc.rect(40, footerY, 515, 80).stroke();

  doc.font("Helvetica-Bold").text("FOR OFFICE USE ONLY", 230, footerY + 5);

  doc.font("Helvetica").fontSize(9);
  doc.text(
    `Application Received on: ${new Date(member.createdAt).toLocaleDateString()}`,
    50,
    footerY + 25,
  );

  const paymentText =
    member.feeStatus === "Paid"
      ? `Paid Rs. ${member.feeAmount}/-`
      : "Payment Pending";
  doc.text(`Payment Details: ${paymentText}`, 50, footerY + 45);

  doc.text("Secretary / President", 400, footerY + 55);

  doc.end();
};

module.exports = { buildMemberProfile };
