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

  // --- 1. Top Slogans (Y = 20) ---
  doc.fontSize(9).font("Helvetica-Bold").fillColor("black");
  doc.text("SEVA", 30, 20);
  doc.text("SHIKSHANA", 0, 20, { align: "center" });
  doc.text("SAMSKAR", 500, 20, { align: "right" });

  // --- 2. Logo (Moved down to Y=35) ---
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 30, 35, { width: 50 });
  }

  // --- 3. Main Title (Moved down to Y=35) ---
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor("#000000")
    .text("KARUNASRI SEVA SAMITHI", 0, 35, { align: "center" });

  // --- 4. Address Block ---
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
    .moveTo(20, 95)
    .lineTo(575, 95)
    .strokeColor("#DAA520")
    .lineWidth(1)
    .stroke();
  doc.moveTo(20, 98).lineTo(575, 98).stroke();
};

// --- FILE: server/utils/generatePDF.js ---

// ... (Keep imports and helper functions at the top) ...

const buildReceipt = (donation, dataCallback, endCallback) => {
  // A4 Size (Portrait)
  const doc = new PDFDocument({ size: "A4", margin: 30 });

  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  drawHeader(doc, donation.branch);

  // --- TOP ROW: RECEIPT NO & DATE ---
  let y = 115;

  const systemReceiptNo =
    donation.receiptNo || `${donation._id.toString().slice(-6).toUpperCase()}`;
  const systemDate = new Date(donation.createdAt).toLocaleDateString();

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#B22222")
    .text(`Receipt No: ${systemReceiptNo}`, 30, y);

  doc
    .fillColor("black")
    .fontSize(14)
    .text("RECEIPT", 250, y - 2);

  doc.fontSize(11).text(`Date: ${systemDate}`, 450, y);

  // --- MAIN CONTENT ---
  y += 35;
  const lineGap = 25; // Slightly increased gap for clarity
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

  // 2. Mobile & IDs (UPDATED: Added underlines for values)
  y += lineGap;

  // Mobile
  doc.font("Helvetica").text("Mobile:", 30, y);
  doc.font("Helvetica-Bold").text(donation.donorPhone, 75, y);
  doc
    .moveTo(75, y + 12)
    .lineTo(190, y + 12)
    .stroke(); // Underline Mobile Value

  // PAN
  doc.font("Helvetica").text("PAN:", 200, y);
  doc.font("Helvetica-Bold").text(donation.donorPan || "", 230, y);
  doc
    .moveTo(230, y + 12)
    .lineTo(340, y + 12)
    .stroke(); // Underline PAN Value

  // Aadhaar
  doc.font("Helvetica").text("Aadhaar:", 350, y);
  doc.font("Helvetica-Bold").text(donation.donorAadhaar || "", 400, y);
  doc
    .moveTo(400, y + 12)
    .lineTo(560, y + 12)
    .stroke(); // Underline Aadhaar Value

  // 3. Address
  y += lineGap;
  doc.font("Helvetica").text("Address:", 30, y);

  const addressX = 80;
  const addressWidth = 480;
  doc.font("Helvetica-Bold").text(donation.address || "", addressX, y, {
    width: addressWidth,
    align: "left",
  });

  const addressHeight = doc.heightOfString(donation.address || "_", {
    width: addressWidth,
  });

  // Underline address (adjusted to height)
  doc
    .moveTo(addressX, y + addressHeight + 2)
    .lineTo(560, y + addressHeight + 2)
    .stroke();

  y += addressHeight + 15; // Gap after address

  // --- 3A. MANUAL RECEIPT ROW (UPDATED: Specific underlines) ---
  const manualNo = donation.manualReceiptNo || "";
  const manualDateStr = donation.manualReceiptDate
    ? new Date(donation.manualReceiptDate).toLocaleDateString()
    : "";

  // Left: Manual Receipt No
  doc.font("Helvetica").text("Ref Manual Receipt No:", 30, y);
  doc.font("Helvetica-Bold").text(manualNo, 150, y);
  // Underline ONLY the Manual No value
  doc
    .moveTo(150, y + 12)
    .lineTo(330, y + 12)
    .stroke();

  // Right: Manual Date
  doc.font("Helvetica").text("Manual Date:", 350, y);
  doc.font("Helvetica-Bold").text(manualDateStr, 420, y);
  // Underline ONLY the Date value
  doc
    .moveTo(420, y + 12)
    .lineTo(560, y + 12)
    .stroke();

  y += 25; // Gap before Email row
  // ----------------------------------------------

  // 4. Email
  doc.font("Helvetica").text("Email Id:", 30, y);
  doc.font("Helvetica-Bold").text(donation.donorEmail || "", 80, y);
  doc
    .moveTo(80, y + 12)
    .lineTo(560, y + 12)
    .stroke();

  // 5. Amount & Words
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
  // y += lineGap + 10;
  // let payString = "";

  // // A. Build the Payment Mode String
  // if (donation.paymentMode === "Cash") {
  //   payString = "Cash";
  // } else {
  //   const { chequeNo, chequeDate, bankName, transactionId, ddNo } =
  //     donation.paymentDetails || {};

  //   if (donation.paymentMode === "Cheque") {
  //     payString = `Cheque No. ${chequeNo || "-"} Dt ${chequeDate ? new Date(chequeDate).toLocaleDateString() : "-"}`;
  //   } else if (donation.paymentMode === "DD") {
  //     payString = `DD No. ${ddNo || "-"} Dt ${chequeDate ? new Date(chequeDate).toLocaleDateString() : "-"}`;
  //   } else {
  //     payString = `${donation.paymentMode} Ref. ${transactionId || "-"}`;
  //   }

  //   // If there is a Donor's Bank (for Cheque/DD), add it
  //   if (bankName) payString += ` (Donor Bank: ${bankName})`;
  // }

  // // B. ADD THE ORGANIZATION'S DEPOSIT BANK (The Requirement)
  // if (donation.depositBank && donation.depositBank.name) {
  //   // We append it nicely to the string
  //   payString += ` | Deposited to: ${donation.depositBank.name}`;
  // }

  // doc.font("Helvetica").text("By Cash/Cheque/Online:", 30, y);
  // doc.font("Helvetica-Bold").text(payString, 150, y, { width: 400 });

  // // Calculate height in case text wraps to two lines
  // const payHeight = doc.heightOfString(payString, { width: 400 });

  // doc
  //   .moveTo(150, y + payHeight + 2) // Dynamic underline based on text height
  //   .lineTo(560, y + payHeight + 2)
  //   .stroke();

  // y += payHeight + 15; // Adjust Y for next section

  // // 7. Towards
  // y += lineGap;
  // let towards = donation.scheme;
  // if (donation.occasion) towards += ` (${donation.occasion})`;
  // if (donation.inNameOf) towards += ` in name of ${donation.inNameOf}`;

  // doc.font("Helvetica").text("Towards:", 30, y);

  // const towardsWidth = 470;
  // doc.font("Helvetica-Bold").text(towards, 80, y, { width: towardsWidth });

  // const towardsHeight = doc.heightOfString(towards, { width: towardsWidth });

  // doc
  //   .moveTo(80, y + towardsHeight + 2)
  //   .lineTo(560, y + towardsHeight + 2)
  //   .stroke();

  // y += towardsHeight + 25;
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
    // Add Donor Bank if exists
    if (bankName) payString += ` (Donor Bank: ${bankName})`;
  }

  // Draw Payment Mode Line
  doc.font("Helvetica").text("By Cash/Cheque/Online:", 30, y);
  doc.font("Helvetica-Bold").text(payString, 150, y, { width: 400 });

  const payHeight = doc.heightOfString(payString, { width: 400 });
  doc
    .moveTo(150, y + payHeight + 2)
    .lineTo(560, y + payHeight + 2)
    .stroke();
  // --- NEW: CHEQUE REALIZATION NOTE ---
  let extraChequeGap = 0;
  if (donation.paymentMode === "Cheque") {
    extraChequeGap = 12;
    doc
      .font("Helvetica-Oblique")
      .fontSize(8)
      .fillColor("#B22222") // Red/Maroon text
      .text(
        "* Note: Cheques are subject to realization.",
        150,
        y + payHeight + 6,
      );
    doc.fillColor("black"); // Reset text color back to black
  }

  // --- 7. DEPOSITED TO ACCOUNT (Always Visible) ---
  // Add gap based on previous text height
  y += lineGap + (payHeight > 15 ? 10 : 0);

  doc.font("Helvetica").text("Deposited to Account:", 30, y);

  // Get Bank Name or default to empty string/dash
  const bankName =
    donation.depositBank && donation.depositBank.name
      ? donation.depositBank.name
      : "";

  doc.font("Helvetica-Bold").text(bankName, 150, y, { width: 400 });

  // Calculate height to position the underline correctly
  // If bankName is empty, default height is ~12-14px
  const bankHeight = bankName
    ? doc.heightOfString(bankName, { width: 400 })
    : 12;

  doc
    .moveTo(150, y + bankHeight + 2)
    .lineTo(560, y + bankHeight + 2)
    .stroke();

  // Adjust Y for the next section
  y += bankHeight + 10;

  // --- 8. TOWARDS ---
  y += lineGap;

  let towards = donation.scheme;
  if (donation.occasion) towards += ` (${donation.occasion})`;
  if (donation.inNameOf) towards += ` in name of ${donation.inNameOf}`;

  doc.font("Helvetica").text("Towards:", 30, y);

  const towardsWidth = 470;
  doc.font("Helvetica-Bold").text(towards, 80, y, { width: towardsWidth });

  const towardsHeight = doc.heightOfString(towards, { width: towardsWidth });

  doc
    .moveTo(80, y + towardsHeight + 2)
    .lineTo(560, y + towardsHeight + 2)
    .stroke();

  y += towardsHeight + 25;

  // --- FOOTER (Same as before) ---
  let footerY = y < 350 ? 350 : y;

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

  // doc
  //   .font("Helvetica")
  //   .fontSize(7)
  //   .text(
  //     "Income Tax exemption under Section 80G of IT ACT 1961 received Vide Director of Income Tax (Exemption)\nLtr.LF.No.DI(E)HYD/806/90/(05)07-08 dated 29-10-2007 & CBDT Circular No. 7 dated 27-10-2010.\nand as amended by the Finance ACT 2020.",
  //     140,
  //     footerY,
  //     { align: "center", width: 420 },
  //   );

  // doc.moveDown(0.5);
  // doc
  //   .font("Helvetica-Bold")
  //   .fontSize(8)
  //   .fillColor("#B22222")
  //   .text(
  //     "IT Dept. Unique Regd.No.Under 80G AAATK6724FF20021, Date: 18/10/2021",
  //     140,
  //     doc.y,
  //     { align: "center", width: 420 },
  //   );
  // --- NEW: 80G TAX COMPLIANCE LOGIC ---
  const isTaxEligible = !(
    donation.paymentMode === "Cash" && donation.amount > 2000
  );

  if (isTaxEligible) {
    // Print normal 80G Text
    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor("black")
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
      .fillColor("#B22222") // Red
      .text(
        "IT Dept. Unique Regd.No.Under 80G AAATK6724FF20021, Date: 18/10/2021",
        140,
        doc.y,
        { align: "center", width: 420 },
      );
  } else {
    // Print Warning Text for Cash > 2000
    doc
      .font("Helvetica-Oblique")
      .fontSize(8)
      .fillColor("#B22222") // Red
      .text(
        "* Note: As per Section 80G of the Income Tax Act, cash donations exceeding Rs. 2,000/- are not eligible for tax exemption benefits.",
        140,
        footerY + 10,
        { align: "center", width: 420 },
      );
  }
  // -------------------------------------

  doc
    .fillColor("blue")
    .fontSize(12)
    .text("KARUNASRI SEVA SAMITHI", 400, footerY + 45, { align: "right" });
  doc
    .fontSize(8)
    .fillColor("black")
    .text("Authorized Signatory", 480, footerY + 60);
  // --- NEW: ISSUED BY TRACEABILITY ---
  // If no user collected it (e.g., Guest Online Donation), say "System / Online"
  const issuerName = donation.collectedBy
    ? donation.collectedBy.name
    : "System / Online";

  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#555")
    .text(`Issued By: ${issuerName}`, 30, footerY + 60);

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
    const recNo = d.receiptNo || d._id.toString().slice(-6).toUpperCase();
    doc.text(
      `${new Date(d.createdAt).toLocaleDateString()} - Rec: ${recNo} - Rs.${d.amount} - ${d.scheme}`,
      50,
      y,
    );
    y += 20;
  });

  doc.end();
};

module.exports = { buildReceipt, buildTaxCertificate };
