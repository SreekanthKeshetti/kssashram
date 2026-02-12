const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const buildStudentAdmissionForm = (dataCallback, endCallback) => {
  const doc = new PDFDocument({ size: "A4", margin: 40 });

  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  // --- HELPER: Draw Header ---
  const drawHeader = (isFirstPage = false) => {
    const kssLogo = path.join(__dirname, "..", "logo_kss.jpg");
    if (fs.existsSync(kssLogo)) {
      doc.image(kssLogo, 40, 30, { width: 60 });
    }
    // 2. RIGHT LOGO (VHP/Tree)
    const vhpLogo = path.join(__dirname, "..", "logo_vhp.jpg");
    if (fs.existsSync(vhpLogo)) {
      doc.image(vhpLogo, 500, 30, { width: 65 });
    }

    // Centered Title
    doc
      .fillColor("#581818")
      .font("Helvetica-Bold")
      .fontSize(18)
      .text("KARUNASRI SEVA SAMITHI", 110, 35, { align: "center", width: 400 });

    doc
      .fillColor("black")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("KARUNYA SINDHU , KARUNYA BHARATHI", 110, 58, {
        align: "center",
        width: 400,
      })
      .font("Helvetica")
      .text(
        "H.No.17-1-474, Krishna Nagar Colony, Saidabad, Hyderabad - 500 059",
        110,
        72,
        { align: "center", width: 400 },
      )
      .text("Cell: 9000889785, 040-79621625", 110, 86, {
        align: "center",
        width: 400,
      });

    // Divider
    doc
      .moveTo(40, 105)
      .lineTo(550, 105)
      .lineWidth(2)
      .strokeColor("#000")
      .stroke();
  };

  // --- HELPER: Draw Aadhar Box Grid ---
  const drawAadharGrid = (x, y) => {
    const boxSize = 15;
    for (let i = 0; i < 12; i++) {
      doc.rect(x + i * boxSize, y, boxSize, boxSize).stroke();
    }
  };

  // ==========================
  // PAGE 1: CHECKLIST & PHOTOS
  // ==========================
  drawHeader(true);
  doc.moveDown(4);

  // Branch Selection
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(
      "ADMISSION INTO:  1. KARUNYA SINDHU (   ) SAIDABAD    2. KARUNYA BHARATHI (   ) CHANDRAYANAGUTTA",
      50,
      120,
    );

  doc
    .fontSize(12)
    .text("*** REQUIRED DOCUMENTS FOR NEW ADMISSION ***", 100, 150, {
      align: "center",
      underline: true,
    });

  doc.text(
    "SERIAL NO: ........................   DATE OF ADMISSION: ........................",
    50,
    180,
  );

  // Document List (Left Side)
  let y = 220;
  const gap = 25;
  doc.fontSize(10).font("Helvetica");

  const docs = [
    "1. APPLICATION REQUEST LETTER BY PARENT/GUARDIAN",
    "2. STUDENT AADHAR XEROX - 5 COPIES (YES / NO)",
    "3. STUDENT BIRTH CERTIFICATE XEROX - 5 COPIES (YES / NO)",
    "4. STUDENT MARKS SHEET XEROX - 5 COPIES (YES / NO)",
    "5. STUDENT LAST STUDIED BONAFIDE - 5 COPIES (YES / NO)",
    "6. STUDENTS PASSPORT SIZE PHOTOS - 8 COPIES (YES / NO)",
    "7. STUDENT CASTE CERTIFICATE XEROX - 5 COPIES (YES / NO)",
    "8. PARENT'S DEATH CERTIFICATE XEROX - 5 COPIES (YES / NO)",
    "9. PARENT, GUARDIANS AADHAR CARDS - 5 XEROX (YES / NO)",
    "10. PARENT, GUARDIAN PHOTOS - 4 COPIES (YES / NO)",
    "11. HYDERABAD LOCAL ELECTRICITY BILL (ONLY HYDERABAD)",
  ];

  docs.forEach((item) => {
    doc.text(item, 50, y);
    y += gap;
  });

  // Photo Boxes (Right Side)
  // Student Photo
  doc.rect(420, 220, 100, 120).stroke();
  doc.text("LATEST PHOTO\nOF THE STUDENT", 420, 270, {
    width: 100,
    align: "center",
  });

  // Parent Photo
  doc.rect(420, 520, 100, 120).stroke();
  doc.text("LATEST PHOTO\nOF PARENT/\nGUARDIAN", 420, 570, {
    width: 100,
    align: "center",
  });

  // Medical Tests
  y += 20;
  doc
    .font("Helvetica-Bold")
    .text("12. STUDENT MEDICAL TESTS (MANDATORY):", 50, y);
  y += 20;

  const tests = [
    "1. Hemogram",
    "2. Blood Grouping & Rh Typing",
    "3. Serum For Hbs Ag Antigen",
    "4. VDRL",
    "5. HIV",
    "6. RBS",
    "7. Urine Analysis",
    "8. X-Ray Chest",
    "9. US Abdomen",
    "10. Eye Testing",
    "11. OAE",
  ];

  doc.font("Helvetica");
  tests.forEach((t) => {
    doc.text(t, 70, y);
    y += 18;
  });

  // ==========================
  // PAGE 2: PERSONAL DETAILS
  // ==========================
  doc.addPage();
  drawHeader();

  doc.moveDown(3);
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("PERSONAL DETAILS :", 50, 120, { underline: true });

  y = 150;
  const lineGap = 30;

  // Row 1
  doc.font("Helvetica").text("1. FIRST NAME:", 50, y);
  doc
    .moveTo(140, y + 10)
    .lineTo(300, y + 10)
    .stroke(); // Line
  doc.text("LAST NAME:", 320, y);
  doc
    .moveTo(390, y + 10)
    .lineTo(550, y + 10)
    .stroke(); // Line
  y += lineGap;

  // Row 2
  doc.text("2. DATE OF BIRTH:", 50, y);
  doc.rect(160, y - 5, 120, 20).stroke(); // Box
  doc.text("AGE:", 320, y);
  doc
    .moveTo(360, y + 10)
    .lineTo(500, y + 10)
    .stroke();
  y += lineGap;

  // Row 3
  doc.text("3. CLASS:", 50, y);
  doc
    .moveTo(110, y + 10)
    .lineTo(200, y + 10)
    .stroke();
  doc.text("Last studied school name:", 220, y);
  doc
    .moveTo(360, y + 10)
    .lineTo(550, y + 10)
    .stroke();
  y += lineGap;

  // Row 4 - Aadhar
  doc.text("4. STUDENT AADHAR:", 50, y);
  drawAadharGrid(200, y - 5);
  y += lineGap;

  // Row 5
  doc.text("5. CASTE DETAILS:", 50, y);
  doc
    .moveTo(160, y + 10)
    .lineTo(300, y + 10)
    .stroke();
  doc.text("SUB-CASTE:", 320, y);
  doc
    .moveTo(400, y + 10)
    .lineTo(550, y + 10)
    .stroke();
  y += lineGap;

  // Row 6 - ID Marks
  doc.text("6. IDENTIFICATION MARKS:", 50, y);
  doc.text("1.", 220, y);
  doc
    .moveTo(240, y + 10)
    .lineTo(550, y + 10)
    .stroke();
  y += lineGap;
  doc.text("2.", 220, y);
  doc
    .moveTo(240, y + 10)
    .lineTo(550, y + 10)
    .stroke();
  y += lineGap;

  // Row 7 - Case Type
  doc.text("7. TYPE OF CASE (Single Parent/Orphan/BPL/Divorced):", 50, y);
  doc
    .moveTo(350, y + 10)
    .lineTo(550, y + 10)
    .stroke();
  y += lineGap;

  // Row 8
  doc.text("8. CAUSE OF DEATH:", 50, y);
  doc
    .moveTo(170, y + 10)
    .lineTo(350, y + 10)
    .stroke();
  doc.text("DATE:", 370, y);
  doc
    .moveTo(410, y + 10)
    .lineTo(550, y + 10)
    .stroke();
  y += lineGap;

  // Row 9 - Father
  doc.text("9. FATHER NAME:", 50, y);
  doc
    .moveTo(160, y + 10)
    .lineTo(550, y + 10)
    .stroke();
  y += lineGap;

  doc.text("10. FATHER AADHAR:", 50, y);
  drawAadharGrid(200, y - 5);
  y += lineGap;

  doc.text("11. FATHER OCCUPATION:", 50, y);
  doc
    .moveTo(200, y + 10)
    .lineTo(400, y + 10)
    .stroke();
  doc.text("AGE:", 420, y);
  doc
    .moveTo(450, y + 10)
    .lineTo(550, y + 10)
    .stroke();
  y += lineGap;

  // Row 12 - Mother
  doc.text("12. MOTHER NAME:", 50, y);
  doc
    .moveTo(160, y + 10)
    .lineTo(550, y + 10)
    .stroke();
  y += lineGap;

  doc.text("13. MOTHER AADHAR:", 50, y);
  drawAadharGrid(200, y - 5);
  y += lineGap;

  doc.text("14. MOTHER OCCUPATION:", 50, y);
  doc
    .moveTo(200, y + 10)
    .lineTo(400, y + 10)
    .stroke();
  doc.text("AGE:", 420, y);
  doc
    .moveTo(450, y + 10)
    .lineTo(550, y + 10)
    .stroke();
  y += lineGap;

  // Guardian
  doc.text("15. GUARDIAN NAME:", 50, y);
  doc
    .moveTo(170, y + 10)
    .lineTo(350, y + 10)
    .stroke();
  doc.text("RELATION:", 370, y);
  doc
    .moveTo(440, y + 10)
    .lineTo(550, y + 10)
    .stroke();
  y += lineGap;

  // 17. Guardian Aadhar
  doc.text("17. GUARDIAN AADHAR:", 50, y);
  drawAadharGrid(200, y - 5);
  y += lineGap;

  // 16. Guardian Details
  doc.text("16. OCCUPATION:", 50, y);
  doc
    .moveTo(150, y + 12)
    .lineTo(280, y + 12)
    .stroke();
  doc.text("DOB:", 290, y);
  doc
    .moveTo(330, y + 12)
    .lineTo(450, y + 12)
    .stroke();
  doc.text("AGE:", 460, y);
  doc
    .moveTo(500, y + 12)
    .lineTo(550, y + 12)
    .stroke();
  y += lineGap;

  doc.text("16. GUARDIAN ADDRESS:", 50, y);
  doc
    .moveTo(190, y + 10)
    .lineTo(550, y + 10)
    .stroke();
  y += lineGap;
  doc.text("    MANDAL:", 50, y);
  doc
    .moveTo(120, y + 10)
    .lineTo(250, y + 10)
    .stroke();
  doc.text("DIST:", 270, y);
  doc
    .moveTo(310, y + 10)
    .lineTo(400, y + 10)
    .stroke();
  doc.text("PIN:", 420, y);
  doc
    .moveTo(450, y + 10)
    .lineTo(550, y + 10)
    .stroke();
  y += lineGap;

  doc.text("17. CONTACT NO 1:", 50, y);
  doc
    .moveTo(160, y + 10)
    .lineTo(300, y + 10)
    .stroke();
  doc.text("NO 2:", 320, y);
  doc
    .moveTo(360, y + 10)
    .lineTo(550, y + 10)
    .stroke();
  y += lineGap + 10;

  // ==========================
  // PAGE 3: DECLARATIONS & OFFICE USE
  // ==========================
  doc.addPage();
  y = 50;

  // 19. Siblings
  doc
    .font("Helvetica")
    .text(
      "19. STUDENT SIBLINGS DETAILS (SISTERS, BROTHERS NAMES, STATUS):",
      50,
      y,
    );
  y += 30;
  doc.text("1.", 70, y);
  doc
    .moveTo(90, y + 12)
    .lineTo(350, y + 12)
    .stroke();
  doc.text("STATUS:", 370, y);
  doc
    .moveTo(420, y + 12)
    .lineTo(550, y + 12)
    .stroke();
  y += 30;
  doc.text("2.", 70, y);
  doc
    .moveTo(90, y + 12)
    .lineTo(350, y + 12)
    .stroke();
  doc.text("STATUS:", 370, y);
  doc
    .moveTo(420, y + 12)
    .lineTo(550, y + 12)
    .stroke();
  y += 40;
  // Physical
  doc.text(
    "18. HEIGHT: ________  WEIGHT: ________  BLOOD GROUP: ________",
    50,
    y,
  );
  y += lineGap + 10;

  // Reference
  doc.text(
    "19. REFERENCE BY NAME: ____________________________ CELL: _________________",
    50,
    y,
  );
  y += lineGap + 10;

  doc.text("20. STUDENT PERSONAL BELONGINGS / ASSETS / BANK BALANCE:", 50, y);
  doc
    .moveTo(50, y + 25)
    .lineTo(550, y + 25)
    .stroke();
  doc
    .moveTo(50, y + 50)
    .lineTo(550, y + 50)
    .stroke();
  y += 70;

  doc.text("21. VISITING RELATIVES (NAME, RELATION, ADDRESS, CELL):", 50, y);
  y += 20;
  doc.text(
    "1. ___________________________________________________________________",
    50,
    y,
  );
  y += 25;
  doc.text(
    "2. ___________________________________________________________________",
    50,
    y,
  );
  y += 25;
  doc.text(
    "3. ___________________________________________________________________",
    50,
    y,
  );
  y += 40;

  // Signatures
  doc.text("STUDENT SIGNATURE: ____________________", 50, y);
  doc.text("DATE: ____________", 400, y);
  y += 40;
  doc.text("PARENT/GUARDIAN SIGNATURE: __________________________", 50, y);

  y += 60;

  // --- OFFICE USE BOX ---
  const boxTop = y;
  doc.rect(40, boxTop, 515, 250).stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("**** FOR OFFICE USE ONLY ****", 0, boxTop + 15, { align: "center" });

  y = boxTop + 50;
  doc
    .fontSize(10)
    .text(
      "APPLICATION RECEIVED BY: ________________________________  DATE: ____________",
      60,
      y,
    );
  y += 30;
  doc.text(
    "APPLICATION VERIFIED BY: __________________________________  DATE: ____________",
    60,
    y,
  );
  y += 30;

  doc.text("APPLICATION APPROVAL BY (SIGN WITH DATE):", 60, y, {
    underline: true,
  });
  y += 25;

  // Approval Boxes
  const approvalBoxHeight = 20;

  // President
  doc.text("1. SRI. ACHARYA K. SATYAMURTHI (PRESIDENT)", 60, y + 10);
  doc.rect(320, y, 200, approvalBoxHeight).stroke();
  y += approvalBoxHeight + 10;

  // Secretary
  doc.text("2. SRI. P. VENKATESHWAR RAO (SECRETARY)", 60, y + 10);
  doc.rect(320, y, 200, approvalBoxHeight).stroke();
  y += approvalBoxHeight + 10;

  // Treasurer
  doc.text("3. SRI. R. SATYANARAYANA (TREASURER)", 60, y + 10);
  doc.rect(320, y, 200, approvalBoxHeight).stroke();

  doc.end();
};

module.exports = { buildStudentAdmissionForm };
