const fs = require("fs");
const csv = require("csv-parser");
const AccountHead = require("../models/AccountHead");
const path = require("path");
const Donation = require("../models/Donation");
const Scheme = require("../models/Scheme");
const nodemailer = require("nodemailer");
const { buildReceipt, buildTaxCertificate } = require("../utils/generatePDF");
const { logAudit } = require("../utils/auditLogger");

// Helper to find Account Head ID based on Scheme Name
const getAccountHeadForScheme = async (schemeName) => {
  if (!schemeName) return null;
  // Try to find a scheme that matches loosely
  const schemeObj = await Scheme.findOne({
    name: { $regex: new RegExp(schemeName.trim(), "i") },
  });
  return schemeObj ? schemeObj.accountHead : null;
};

// @desc    Create new donation
const createDonation = async (req, res) => {
  try {
    const {
      donorName,
      donorPhone,
      donorLandline,
      donorEmail,
      donorPan,
      donorAadhaar,
      amount,
      scheme,
      paymentMode,
      paymentReference,
      branch,
      isRecurring,
      occasion,
      inNameOf,
      programDate,
      category,
      address,
      paymentDetails,
      manualReceiptNo,
      manualReceiptDate,
      calendarType,
      tithi,
      depositBank,
      interestPeriod,
    } = req.body;

    let finalBranch = "KarunaSri Seva Samithi";
    if (req.user.role === "kba_manager") finalBranch = "Karunya Bharathi";
    else if (req.user.role === "ksa_manager") finalBranch = "Karunya Sindhu";
    else finalBranch = branch || "KarunaSri Seva Samithi";

    // let nextDate = null;
    // if (isRecurring) {
    //   const d = new Date();
    //   d.setFullYear(d.getFullYear() + 1);
    //   nextDate = d;
    // }
    let nextDate = null;
    if (isRecurring) {
      // If 'programDate' (Occasion Date) is filled, use it.
      // If not, use 'new Date()' (Today).
      const baseDate = programDate ? new Date(programDate) : new Date();

      // Set to Next Year
      baseDate.setFullYear(baseDate.getFullYear() + 1);
      nextDate = baseDate;
    }

    const accountHeadId = await getAccountHeadForScheme(scheme);

    const donation = await Donation.create({
      donorName,
      donorPhone,
      donorLandline,
      donorEmail,
      donorPan,
      donorAadhaar,
      amount,
      scheme,
      accountHead: accountHeadId,
      depositBank,
      paymentMode,
      paymentDetails,
      paymentReference,
      branch: finalBranch,
      collectedBy: req.user._id,
      occasion,
      inNameOf,
      programDate: programDate || null,
      manualReceiptNo,
      manualReceiptDate,
      category: category || "Household",
      address,
      isRecurring: isRecurring || false,
      nextReminderDate: nextDate,
      calendarType: calendarType || "Gregorian",
      tithi: tithi || "",
      interestPeriod: interestPeriod || null,
    });

    await logAudit(
      req,
      "CREATE",
      "Donation",
      donation._id,
      `Created donation of Rs.${amount} for ${donorName}`,
    );
    // ---------------------------------------------------------
    // 4. AUTO-SEND EMAIL LOGIC (ADDED BACK)
    // ---------------------------------------------------------
    if (donation.donorEmail) {
      try {
        // IMPORTANT: We must re-fetch with populate to get Bank Name & Account Head Name for the PDF
        const fullDonation = await Donation.findById(donation._id)
          .populate("depositBank", "name")
          .populate("accountHead", "code name");

        if (fullDonation) {
          // Generate PDF Buffer
          let buffers = [];
          const pdfPromise = new Promise((resolve, reject) => {
            try {
              buildReceipt(
                fullDonation,
                (chunk) => buffers.push(chunk),
                () => resolve(Buffer.concat(buffers)),
              );
            } catch (e) {
              reject(e);
            }
          });

          const pdfBuffer = await pdfPromise;

          // Setup Transporter
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          // Send Mail
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: fullDonation.donorEmail,
            subject: `Donation Receipt - Karunasri Seva Samithi`,
            html: `
              <h3>Namaste ${fullDonation.donorName},</h3>
              <p>Thank you for your generous donation of <strong>Rs. ${fullDonation.amount}</strong>.</p>
              <p>Please find your official 80G tax-exempt receipt attached to this email.</p>
              <br/>
              <p>Regards,<br/>Karunasri Team</p>
            `,
            attachments: [
              {
                filename: `Receipt_${fullDonation.receiptNo || "New"}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ],
          });

          // Update Status
          donation.receiptStatus = "Sent";
          await donation.save();
          console.log(`📧 Receipt sent to ${fullDonation.donorEmail}`);
        }
      } catch (emailError) {
        console.error("❌ Auto-Email Failed:", emailError.message);
        // We do NOT stop the function here; the donation was created successfully.
        // The user will see "Pending" status in the list and can retry manually.
      }
    }
    // ---------------------------------------------------------
    res.status(201).json(donation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all donations (Sorted Recent First)
const getDonations = async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = {};

    // Branch Security
    if (req.user.role === "kba_manager") query.branch = "Karunya Bharathi";
    else if (req.user.role === "ksa_manager") query.branch = "Karunya Sindhu";

    // Date Filter
    if (from && to) {
      query.createdAt = {
        $gte: new Date(from),
        $lte: new Date(new Date(to).setHours(23, 59, 59)),
      };
    }

    const donations = await Donation.find(query)
      .populate("accountHead", "code name")
      .populate("depositBank", "name")
      .sort({ createdAt: -1, _id: -1 }); // <--- FIX: Sorts recent first

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ... (Keep downloadReceipt, emailReceipt, createPublicDonation, uploadMedia, deleteMedia, getMyDonations, getDonorByPhone, generateTaxCertificate, getDailySevaList AS IS - no changes needed there) ...
// Copying them here for completeness to ensure you have the full file without errors.

const downloadReceipt = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("depositBank", "name")
      .populate("accountHead", "code name");
    if (!donation)
      return res.status(404).json({ message: "Donation not found" });

    const filename = `Receipt_${donation.donorName}_${Date.now()}.pdf`;
    res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-type", "application/pdf");

    buildReceipt(
      donation,
      (chunk) => res.write(chunk),
      () => res.end(),
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const emailReceipt = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("depositBank", "name")
      .populate("accountHead", "code name");

    if (!donation || !donation.donorEmail)
      return res.status(400).json({ message: "Donation/Email missing" });

    let buffers = [];
    await new Promise((resolve) => {
      buildReceipt(
        donation,
        (chunk) => buffers.push(chunk),
        () => resolve(),
      );
    });
    const pdfBuffer = Buffer.concat(buffers);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: donation.donorEmail,
      subject: `Donation Receipt - Karunasri Seva Samithi`,
      html: `<h3>Namaste ${donation.donorName},</h3><p>Thank you for your donation of Rs. ${donation.amount}.</p>`,
      attachments: [
        {
          filename: `Receipt.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    donation.receiptStatus = "Sent";
    await donation.save();
    res.json({ message: "Receipt sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPublicDonation = async (req, res) => {
  try {
    const { donorName, donorPhone, donorEmail, amount, scheme, paymentMode } =
      req.body;
    const accountHeadId = await getAccountHeadForScheme(scheme);
    const donation = await Donation.create({
      donorName,
      donorPhone,
      donorEmail,
      amount,
      scheme,
      accountHead: accountHeadId,
      paymentMode,
      branch: "KarunaSri Seva Samithi",
      receiptStatus: "Generated",
    });
    res.status(201).json(donation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const uploadMedia = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Not found" });
    const filePaths = req.files.map(
      (file) => `/${file.path.replace(/\\/g, "/")}`,
    );
    donation.media.push(...filePaths);
    await donation.save();
    res.json({ message: "Uploaded", media: donation.media });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMedia = async (req, res) => {
  try {
    const { filePath } = req.body;
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Not found" });
    donation.media = donation.media.filter((file) => file !== filePath);
    await donation.save();
    const absolutePath = path.join(__dirname, "..", filePath);
    if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
    res.json({ message: "Deleted", media: donation.media });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({
      $or: [{ donor: req.user._id }, { donorEmail: req.user.email }],
    }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDonorByPhone = async (req, res) => {
  try {
    const { phone } = req.query;
    const donation = await Donation.findOne({
      donorPhone: { $regex: new RegExp(phone.trim(), "i") },
    }).sort({ createdAt: -1 });
    if (donation) res.json({ success: true, donor: donation });
    else res.status(404).json({ success: false, message: "Not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateTaxCertificate = async (req, res) => {
  try {
    const { phone, year } = req.query;
    const start = new Date(`${year}-04-01`);
    const end = new Date(`${parseInt(year) + 1}-03-31`);
    end.setHours(23, 59, 59, 999);

    const donations = await Donation.find({
      donorPhone: { $regex: new RegExp(phone.trim(), "i") },
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: 1 });

    if (donations.length === 0)
      return res.status(404).json({ message: "No donations found" });

    const donorDetails = {
      name: donations[donations.length - 1].donorName,
      phone: donations[donations.length - 1].donorPhone,
      pan: donations[donations.length - 1].donorPan || "N/A",
      address:
        donations[donations.length - 1].address || "Address not recorded",
    };

    const filename = `TaxCert_${year}.pdf`;
    res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-type", "application/pdf");
    buildTaxCertificate(
      donorDetails,
      donations,
      `Apr ${year} - Mar ${parseInt(year) + 1}`,
      (chunk) => res.write(chunk),
      () => res.end(),
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDailySevaList = async (req, res) => {
  try {
    const { date, tithi } = req.query;
    const targetDate = new Date(date);
    const day = targetDate.getDate();
    const month = targetDate.getMonth() + 1;

    const conditions = [
      {
        calendarType: "Gregorian",
        isRecurring: false,
        programDate: {
          $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          $lte: new Date(new Date(date).setHours(23, 59, 59, 999)),
        },
      },
      {
        calendarType: "Gregorian",
        isRecurring: true,
        $expr: {
          $and: [
            { $eq: [{ $dayOfMonth: "$programDate" }, day] },
            { $eq: [{ $month: "$programDate" }, month] },
          ],
        },
      },
    ];
    if (tithi) conditions.push({ calendarType: "Telugu", tithi: tithi });

    let donations = await Donation.find({ $or: conditions }).sort({
      createdAt: 1,
    });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- IMPORT DONATIONS (FIXED: SCHEME MAPPING & INDIVIDUAL SAVE) NO Sequnce code ---
// const importDonations = async (req, res) => {
//   if (!req.file) return res.status(400).json({ message: "No file uploaded" });

//   const results = [];
//   const filePath = req.file.path;
//   const userSelectedCategory = req.body.category || "Household";

//   // Pre-load Account Heads
//   const accountHeads = await AccountHead.find({});
//   const accountMap = {};
//   accountHeads.forEach((acc) => {
//     accountMap[acc.code.toString()] = acc._id;
//     accountMap[acc.name.toLowerCase()] = acc._id;
//   });

//   try {
//     console.log("--- STARTING CSV IMPORT ---"); // DEBUG LOG

//     fs.createReadStream(filePath)
//       .pipe(csv())
//       .on("data", (row) => {
//         // Log the first row to see what headers the server sees
//         if (results.length === 0) {
//           console.log("CSV Headers detected:", Object.keys(row));
//         }

//         // Helper to find value loosely
//         const getValue = (keywords) => {
//           const rowKeys = Object.keys(row);
//           // Check if any key contains the keyword (case insensitive)
//           const match = rowKeys.find((key) =>
//             keywords.some((k) => key.toLowerCase().includes(k.toLowerCase())),
//           );
//           return match ? row[match] : "";
//         };

//         // 1. EXTRACT DATA
//         // Broader keywords for Name
//         const dName =
//           getValue(["Name", "Donor", "First Name", "StudentName", "Devotee"]) ||
//           "Unknown Donor";

//         // Broader keywords for Phone
//         const dPhone =
//           getValue(["Phone", "Mobile", "Contact", "Cell"]) || "0000000000";

//         // Broader keywords for Amount
//         const dAmountStr = getValue(["Amount", "Price", "Donation", "Paid"]);
//         const dAmount = Number(dAmountStr.replace(/[^0-9.-]+/g, "")) || 0; // Clean currency symbols if any

//         // Broader keywords for Scheme
//         const rawScheme = getValue([
//           "Scheme",
//           "Category",
//           "Purpose",
//           "Towards",
//           "Seva",
//         ]);
//         const dScheme =
//           rawScheme && rawScheme.trim() !== "" ? rawScheme : "General Donation";

//         // 2. ACCOUNT HEAD MAPPING
//         let matchedAccountId = null;
//         if (dScheme && accountMap[dScheme.toLowerCase()]) {
//           matchedAccountId = accountMap[dScheme.toLowerCase()];
//         }

//         // 3. DATE PARSING
//         const rawDate = getValue(["Date", "Created", "Day"]);
//         let dDate = new Date();
//         if (rawDate) {
//           dDate = new Date(rawDate);
//           // If invalid date, fallback to today
//           if (isNaN(dDate.getTime())) dDate = new Date();
//         }
//         // Broader keywords for PAN
//         const dPan = getValue(["PAN", "Pan Number", "PanCard", "Tax ID"]) || "";

//         // Broader keywords for Aadhaar
//         const dAadhaar =
//           getValue(["Aadhaar", "Adhar", "UID", "Aadhar Number"]) || "";

//         // 4. FILTERING
//         // Only add if we have a Name or a substantial Amount
//         if (dName !== "Unknown Donor" || dAmount > 0) {
//           results.push({
//             donorName: dName,
//             donorPhone: dPhone,
//             donorEmail: getValue(["Email", "Mail"]) || "",
//             donorPan: dPan, // <--- Ensure this is mapped
//             donorAadhaar: dAadhaar, // <--- Ensure this is mapped
//             amount: dAmount,
//             scheme: dScheme,
//             accountHead: matchedAccountId,
//             paymentMode: "Cash",
//             category: userSelectedCategory, // Force user selected category
//             branch: "KarunaSri Seva Samithi",
//             createdAt: dDate,
//             receiptStatus: "Generated",
//             collectedBy: req.user._id,
//           });
//         } else {
//           console.log("Skipping Row (Invalid Name/Amount):", row);
//         }
//       })
//       .on("end", async () => {
//         try {
//           console.log(`Processing ${results.length} valid rows...`); // DEBUG LOG

//           if (results.length > 0) {
//             let count = 0;
//             for (const doc of results) {
//               try {
//                 await Donation.create(doc);
//                 count++;
//               } catch (e) {
//                 console.error("Save Error:", e.message);
//               }
//             }

//             fs.unlinkSync(filePath);
//             res.json({ message: `Successfully imported ${count} donations.` });
//           } else {
//             fs.unlinkSync(filePath);
//             res
//               .status(400)
//               .json({ message: "No valid data found. Check CSV headers." });
//           }
//         } catch (err) {
//           if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//           res.status(500).json({ message: "DB Error: " + err.message });
//         }
//       });
//   } catch (error) {
//     if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//     res.status(500).json({ message: error.message });
//   }
// };
const importDonations = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const results = [];
  const filePath = req.file.path;
  const userSelectedCategory = req.body.category || "Household";

  // Pre-load Account Heads
  const accountHeads = await AccountHead.find({});
  const accountMap = {};
  accountHeads.forEach((acc) => {
    accountMap[acc.code.toString()] = acc._id;
    accountMap[acc.name.toLowerCase()] = acc._id;
  });

  try {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        // ... (Keep existing getValue logic) ...
        const getValue = (keywords) => {
          const rowKeys = Object.keys(row);
          const match = rowKeys.find((key) =>
            keywords.some((k) => key.toLowerCase().includes(k.toLowerCase())),
          );
          return match ? row[match] : "";
        };

        const dName =
          getValue(["Name", "Donor", "First Name", "StudentName", "Devotee"]) ||
          "Unknown Donor";
        const dPhone =
          getValue(["Phone", "Mobile", "Contact", "Cell"]) || "0000000000";

        // Clean Amount
        const dAmountStr = getValue(["Amount", "Price", "Donation", "Paid"]);
        let dAmount = 0;
        if (dAmountStr) {
          dAmount = Number(dAmountStr.replace(/[^0-9.-]+/g, ""));
        }

        const rawScheme = getValue([
          "Scheme",
          "Category",
          "Purpose",
          "Towards",
          "Seva",
        ]);
        const dScheme =
          rawScheme && rawScheme.trim() !== "" ? rawScheme : "General Donation";

        let matchedAccountId = null;
        if (dScheme && accountMap[dScheme.toLowerCase()]) {
          matchedAccountId = accountMap[dScheme.toLowerCase()];
        }

        // Date Parsing
        const rawDate = getValue(["Date", "Created", "Day"]);
        let dDate = new Date();
        if (rawDate) {
          dDate = new Date(rawDate);
          if (isNaN(dDate.getTime())) dDate = new Date();
        }

        const dPan = getValue(["PAN", "Pan Number", "PanCard", "Tax ID"]) || "";
        const dAadhaar =
          getValue(["Aadhaar", "Adhar", "UID", "Aadhar Number"]) || "";

        if (dName !== "Unknown Donor" || dAmount > 0) {
          results.push({
            donorName: dName,
            donorPhone: dPhone,
            donorEmail: getValue(["Email", "Mail"]) || "",
            donorPan: dPan,
            donorAadhaar: dAadhaar,
            amount: dAmount,
            scheme: dScheme,
            accountHead: matchedAccountId,
            paymentMode: "Cash",
            category: userSelectedCategory,
            branch: "KarunaSri Seva Samithi",
            createdAt: dDate,
            receiptStatus: "Generated",
            collectedBy: req.user._id,
          });
        }
      })
      .on("end", async () => {
        try {
          // --- FIX: SORT BY DATE (OLDEST FIRST) BEFORE INSERTING ---
          // This ensures Receipt KSS-0001 is the oldest donation
          results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          // -------------------------------------------------------

          if (results.length > 0) {
            let count = 0;
            // Insert sequentially to maintain receipt order
            for (const doc of results) {
              try {
                await Donation.create(doc);
                count++;
              } catch (e) {
                console.error("Save Error:", e.message);
              }
            }

            fs.unlinkSync(filePath);
            res.json({ message: `Successfully imported ${count} donations.` });
          } else {
            fs.unlinkSync(filePath);
            res.status(400).json({ message: "No valid data found." });
          }
        } catch (err) {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          res.status(500).json({ message: "DB Error: " + err.message });
        }
      });
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a Donation (Void)
// @route   PUT /api/donations/:id/cancel
const cancelDonation = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason)
      return res
        .status(400)
        .json({ message: "Cancellation reason is required" });

    const donation = await Donation.findById(req.params.id);
    if (!donation)
      return res.status(404).json({ message: "Donation not found" });

    // Mark as Cancelled
    donation.status = "Cancelled";
    donation.cancellationReason = reason;
    donation.cancelledBy = req.user._id;

    await donation.save();

    await logAudit(
      req,
      "CANCEL",
      "Donation",
      donation._id,
      `Cancelled Receipt ${donation.receiptNo}. Reason: ${reason}`,
    );

    // res.json({ message: "Donation Cancelled Successfully", donation });
    // 2. SEND CANCELLATION EMAIL
    if (donation.donorEmail) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: donation.donorEmail,
          subject: `IMPORTANT: Receipt Cancelled - ${donation.receiptNo}`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; border: 1px solid #ddd; padding: 20px;">
              <h3 style="color: #b00;">Receipt Cancellation Notice</h3>
              <p>Namaste <strong>${donation.donorName}</strong>,</p>
              
              <p>This is to inform you that your donation receipt <strong>${donation.receiptNo}</strong> for <strong>Rs. ${donation.amount}</strong> has been cancelled.</p>
              
              <div style="background-color: #fff0f0; padding: 15px; border-left: 5px solid #b00; margin: 15px 0;">
                <strong>Reason for Cancellation:</strong><br/>
                ${reason}
              </div>

              <p>If this was due to a cheque issue (signature mismatch, etc.), we kindly request you to issue a fresh cheque or make a transfer online.</p>
              
              <p>Please contact our office if you have any questions.</p>
              <br/>
              <p>Regards,<br/><strong>Karunasri Seva Samithi</strong></p>
            </div>
          `,
        });
        console.log(`❌ Cancellation email sent to ${donation.donorEmail}`);
      } catch (emailErr) {
        console.error("Email failed:", emailErr.message);
        // Don't fail the request, just log it
      }
    }

    res.json({ message: "Donation Cancelled and Donor Notified", donation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Update Donation (Edit)
// @route   PUT /api/donations/:id
const updateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // 1. Find existing
    const donation = await Donation.findById(id);
    if (!donation)
      return res.status(404).json({ message: "Donation not found" });

    // 2. Update Fields
    // We iterate over the keys in the update object and apply them
    Object.keys(updates).forEach((key) => {
      donation[key] = updates[key];
    });

    // 3. Save
    await donation.save();

    // 4. Log Audit
    await logAudit(
      req,
      "UPDATE",
      "Donation",
      donation._id,
      `Updated Receipt ${donation.receiptNo}`,
    );

    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDonation,
  createPublicDonation,
  getDonations,
  downloadReceipt,
  emailReceipt,
  uploadMedia,
  deleteMedia,
  getMyDonations,
  getDonorByPhone,
  generateTaxCertificate,
  getDailySevaList,
  importDonations,
  cancelDonation,
  updateDonation,
};
