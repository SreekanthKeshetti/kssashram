// const Donation = require("../models/Donation");
// const { buildReceipt } = require("../utils/generatePDF"); // Import the utility
// const nodemailer = require("nodemailer");

// // @desc    Create new donation (Manual Entry by Admin/Employee)
// // @route   POST /api/donations
// const createDonation = async (req, res) => {
//   try {
//     const {
//       donorName,
//       donorPhone,
//       donorEmail,
//       donorPan,
//       amount,
//       scheme,
//       paymentMode,
//       paymentReference,
//       branch,
//     } = req.body;

//     const donation = await Donation.create({
//       donorName,
//       donorPhone,
//       donorEmail,
//       donorPan,
//       amount,
//       scheme,
//       paymentMode,
//       paymentReference,
//       branch: branch || "Headquarters",
//       collectedBy: req.user._id, // The logged-in employee ID
//     });

//     res.status(201).json(donation);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // @desc    Get all donations
// // @route   GET /api/donations
// const getDonations = async (req, res) => {
//   try {
//     // Sort by newest first
//     const donations = await Donation.find({}).sort({ createdAt: -1 });
//     res.json(donations);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// // @desc    Download Receipt PDF
// // @route   GET /api/donations/:id/receipt
// const downloadReceipt = async (req, res) => {
//   try {
//     const donation = await Donation.findById(req.params.id);
//     if (!donation)
//       return res.status(404).json({ message: "Donation not found" });

//     // Set headers to tell browser this is a PDF
//     const filename = `Receipt_${donation.donorName}_${Date.now()}.pdf`;
//     res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
//     res.setHeader("Content-type", "application/pdf");

//     // Stream the PDF to the response
//     buildReceipt(
//       donation,
//       (chunk) => res.write(chunk),
//       () => res.end()
//     );
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Email Receipt PDF
// // @route   POST /api/donations/:id/email
// const emailReceipt = async (req, res) => {
//   try {
//     const donation = await Donation.findById(req.params.id);
//     if (!donation)
//       return res.status(404).json({ message: "Donation not found" });
//     if (!donation.donorEmail)
//       return res.status(400).json({ message: "Donor has no email address" });

//     // 1. Generate PDF in memory
//     let buffers = [];
//     const pdfPromise = new Promise((resolve) => {
//       buildReceipt(
//         donation,
//         (chunk) => buffers.push(chunk),
//         () => resolve(Buffer.concat(buffers))
//       );
//     });

//     const pdfBuffer = await pdfPromise;

//     // 2. Setup Nodemailer
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     // 3. Send Email with Attachment
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: donation.donorEmail,
//       subject: `Donation Receipt - Karunasri Seva Samithi`,
//       html: `
//         <h3>Namaste ${donation.donorName},</h3>
//         <p>Thank you for your generous donation of <strong>Rs. ${donation.amount}</strong>.</p>
//         <p>Please find your official 80G tax-exempt receipt attached to this email.</p>
//         <br/>
//         <p>Regards,<br/>Karunasri Team</p>
//       `,
//       attachments: [
//         {
//           filename: `Receipt_${donation._id}.pdf`,
//           content: pdfBuffer,
//           contentType: "application/pdf",
//         },
//       ],
//     });

//     // 4. Update Status
//     donation.receiptStatus = "Sent";
//     await donation.save();

//     res.json({ message: "Receipt sent successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // Don't forget to export them!
// module.exports = {
//   createDonation,
//   getDonations,
//   downloadReceipt,
//   emailReceipt,
// };

// module.exports = { createDonation, getDonations };

const fs = require("fs"); // <--- Add this at the very top
const csv = require("csv-parser"); // Ensure csv-parser is installed
const AccountHead = require("../models/AccountHead"); // Import AccountHead model

const path = require("path"); // <--- Ensure this is imported too
const Donation = require("../models/Donation");
const { buildReceipt, buildTaxCertificate } = require("../utils/generatePDF"); // Ensure this path is correct
const Scheme = require("../models/Scheme"); // <--- Import Scheme
const nodemailer = require("nodemailer");
const { logAudit } = require("../utils/auditLogger"); // <--- Import

// Helper to find Account Head ID based on Scheme Name
const getAccountHeadForScheme = async (schemeName) => {
  const schemeObj = await Scheme.findOne({ name: schemeName });
  return schemeObj ? schemeObj.accountHead : null;
};

// @desc    Create new donation
// @route   POST /api/donations
const createDonation = async (req, res) => {
  try {
    const {
      donorName,
      donorPhone,
      donorEmail,
      donorPan,
      donorAadhaar,
      amount,
      scheme,
      paymentMode,
      paymentReference,
      branch,
      isRecurring, // <--- Destructure this
      occasion,
      inNameOf,
      programDate,
      category,
      address,
    } = req.body;

    // Calculate Next Reminder Date (If Recurring)
    let nextDate = null;
    if (isRecurring) {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1); // Default to Next Year (Annual)
      nextDate = d;
    }

    const accountHeadId = await getAccountHeadForScheme(scheme);

    const donation = await Donation.create({
      donorName,
      // ... existing fields ...
      isRecurring: isRecurring || false,
      nextReminderDate: nextDate,
      // ...
      donorPhone,
      donorEmail,
      donorPan,
      donorAadhaar,
      amount,
      scheme,
      accountHead: accountHeadId,
      paymentMode,
      paymentReference,
      branch: branch || "Headquarters",
      collectedBy: req.user._id,
      occasion,
      inNameOf,
      programDate: programDate || null,
      category: category || "Household", // Default to Household if not selected
      address,
    });
    await logAudit(
      req,
      "CREATE",
      "Donation",
      donation._id,
      `Created donation of Rs.${amount} for ${donorName}`
    );

    res.status(201).json(donation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all donations
// @route   GET /api/donations
// const getDonations = async (req, res) => {
//   try {
//     const donations = await Donation.find({}).sort({ createdAt: -1 });
//     res.json(donations);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// @desc    Get all donations (Populated with Account Code)
// @route   GET /api/donations
const getDonations = async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = {};

    if (from && to) {
      query.createdAt = {
        $gte: new Date(from),
        $lte: new Date(new Date(to).setHours(23, 59, 59)),
      };
    }

    const donations = await Donation.find(query)
      .populate("accountHead", "code name") // <--- THIS IS CRITICAL
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download Receipt PDF
// @route   GET /api/donations/:id/receipt
const downloadReceipt = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation)
      return res.status(404).json({ message: "Donation not found" });

    const filename = `Receipt_${donation.donorName}_${Date.now()}.pdf`;
    res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-type", "application/pdf");

    buildReceipt(
      donation,
      (chunk) => res.write(chunk),
      () => res.end()
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Email Receipt PDF
// @route   POST /api/donations/:id/email
const emailReceipt = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation)
      return res.status(404).json({ message: "Donation not found" });
    if (!donation.donorEmail)
      return res.status(400).json({ message: "Donor has no email address" });

    let buffers = [];
    const pdfPromise = new Promise((resolve) => {
      buildReceipt(
        donation,
        (chunk) => buffers.push(chunk),
        () => resolve(Buffer.concat(buffers))
      );
    });

    const pdfBuffer = await pdfPromise;

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
      subject: `Donation Receipt - Karunasri Seva Samithi`,
      html: `
        <h3>Namaste ${donation.donorName},</h3>
        <p>Thank you for your generous donation of <strong>Rs. ${donation.amount}</strong>.</p>
        <p>Please find your official 80G tax-exempt receipt attached to this email.</p>
        <br/>
        <p>Regards,<br/>Karunasri Team</p>
      `,
      attachments: [
        {
          filename: `Receipt_${donation._id}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    donation.receiptStatus = "Sent";
    await donation.save();

    res.json({ message: "Receipt sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Public Donation (Guest User - No Token)
// @route   POST /api/donations/public
const createPublicDonation = async (req, res) => {
  try {
    const {
      donorName,
      donorPhone,
      donorEmail,
      donorPan,
      amount,
      scheme,
      paymentMode,
      paymentReference,
      address,
    } = req.body;

    // Basic Validation
    if (!donorName || !amount || !scheme || !paymentMode) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const accountHeadId = await getAccountHeadForScheme(scheme);

    const donation = await Donation.create({
      donorName,
      donorPhone,
      donorEmail,
      donorPan,
      amount,
      scheme,
      accountHead: accountHeadId, // <--- SAVE IT HERE
      paymentMode, // 'Online' or 'Bank Transfer'
      paymentReference,
      branch: "Headquarters", // Default for online
      receiptStatus: "Generated", // Auto-generate status
      // collectedBy is left undefined for online donations
    });

    // Optional: You could trigger the emailReceipt function here automatically
    // But for now, let's just save it.

    res.status(201).json(donation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Upload Media for Donation (KSS_DON_11)
// @route   POST /api/donations/:id/upload
const uploadMedia = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation)
      return res.status(404).json({ message: "Donation not found" });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Get paths of uploaded files
    const filePaths = req.files.map(
      (file) => `/${file.path.replace(/\\/g, "/")}`
    ); // Fix windows slashes

    // Add to existing media array
    donation.media.push(...filePaths);
    await donation.save();

    res.json({ message: "Files uploaded successfully", media: donation.media });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Media from Donation
// @route   DELETE /api/donations/:id/media
const deleteMedia = async (req, res) => {
  try {
    const { filePath } = req.body; // Expecting "/uploads/filename.jpg"
    const donation = await Donation.findById(req.params.id);

    if (!donation)
      return res.status(404).json({ message: "Donation not found" });

    // 1. Remove from Database Array
    donation.media = donation.media.filter((file) => file !== filePath);
    await donation.save();

    // 2. Delete File from Server Disk
    // filePath looks like "/uploads/image.jpg". We need to remove the leading "/"
    const absolutePath = path.join(__dirname, "..", filePath);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath); // Delete file
    }

    res.json({ message: "File deleted successfully", media: donation.media });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// // Add to exports
// module.exports = {
//   createDonation,
//   createPublicDonation,
//   getDonations,
//   downloadReceipt,
//   emailReceipt,
//   uploadMedia,
//   deleteMedia, // <--- Add this
// };
// @desc    Get My Donations (Logged in User)
// @route   GET /api/donations/my
const getMyDonations = async (req, res) => {
  try {
    // Find donations where 'donorEmail' matches the user's email
    // OR where 'donor' ID matches the user ID (if we linked them)
    const donations = await Donation.find({
      $or: [
        { donor: req.user._id },
        { donorEmail: req.user.email }, // Fallback if they donated as guest with same email
      ],
    }).sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDonorByPhone = async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone)
      return res.status(400).json({ message: "Phone number required" });

    // Create a regex that allows flexible matching (ignores case, trims)
    const searchRegex = new RegExp(phone.trim(), "i");

    // Find the most recent donation
    const donation = await Donation.findOne({
      donorPhone: { $regex: searchRegex },
    }).sort({ createdAt: -1 });

    if (donation) {
      res.json({
        success: true,
        donor: {
          donorName: donation.donorName,
          donorPhone: donation.donorPhone,
          donorEmail: donation.donorEmail,
          donorPan: donation.donorPan,
          donorAadhaar: donation.donorAadhaar,
          address: donation.address, // <--- Good to have address too
        },
      });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Donor not found with this number." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- IMPROVED: Tax Certificate Generation ---
const generateTaxCertificate = async (req, res) => {
  try {
    const { phone, year } = req.query;

    if (!phone || !year)
      return res.status(400).json({ message: "Phone and Year required" });

    // 1. Calculate Date Range for Financial Year (Apr 1 to Mar 31)
    const start = new Date(`${year}-04-01`);
    const end = new Date(`${parseInt(year) + 1}-03-31`);
    // Set end time to end of day
    end.setHours(23, 59, 59, 999);

    // 2. Flexible Phone Search
    const searchRegex = new RegExp(phone.trim(), "i");

    const donations = await Donation.find({
      donorPhone: { $regex: searchRegex },
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: 1 });

    if (donations.length === 0) {
      return res.status(404).json({
        message: `No donations found for ${phone} in FY ${year}-${
          parseInt(year) + 1
        }`,
      });
    }

    // 3. Get latest donor details
    const latestDonation = donations[donations.length - 1];
    const donorDetails = {
      name: latestDonation.donorName,
      phone: latestDonation.donorPhone,
      pan: latestDonation.donorPan || "N/A",
      address: latestDonation.address || "Address not recorded",
    };

    const filename = `TaxCert_${year}_${donorDetails.name}.pdf`;
    res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-type", "application/pdf");

    buildTaxCertificate(
      donorDetails,
      donations,
      `April ${year} - March ${parseInt(year) + 1}`,
      (chunk) => res.write(chunk),
      () => res.end()
    );
  } catch (error) {
    console.error("Certificate Error:", error);
    res.status(500).json({ message: error.message });
  }
};
// --- NEW: Get Daily Seva List (Today's Sponsors) ---
const getDailySevaList = async (req, res) => {
  try {
    const { date } = req.query; // Format: YYYY-MM-DD

    if (!date) return res.status(400).json({ message: "Date is required" });

    // Construct Start and End of the selected day
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    // Find donations scheduled for this PROGRAM DATE
    const donations = await Donation.find({
      programDate: { $gte: start, $lte: end },
    }).sort({ createdAt: 1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. NEW: IMPORT DONATIONS FROM CSV
// --- UPDATED: IMPORT DONATIONS (Client Specific Mapping) ---
const importDonations = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const results = [];
  const filePath = req.file.path;

  // 1. Get the category chosen by user in Frontend (default to Household if missing)
  const userSelectedCategory = req.body.category || "Household";

  const accountHeads = await AccountHead.find({});
  const accountMap = {};
  accountHeads.forEach((acc) => {
    accountMap[acc.code.toString()] = acc._id;
  });

  try {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        // ... (Keep existing getValue helper) ...
        const getValue = (keywords) => {
          const rowKeys = Object.keys(row);
          const match = rowKeys.find((key) =>
            keywords.some((k) => key.toLowerCase() === k.toLowerCase())
          );
          if (row[keywords[0]]) return row[keywords[0]];
          return match ? row[match] : "";
        };

        // ... (Keep Name, Phone, Account Code mapping) ...
        const dName = row.LastName || row.Name || "Unknown Donor";
        const dPhone = row.Phone || "0000000000";
        const rawCode = row.KSS_Category__c || "";
        let matchedAccountId = null;
        if (rawCode && accountMap[rawCode])
          matchedAccountId = accountMap[rawCode];

        const dPan = row["PAN NUMBER"] || row.PAN || "";
        const dAadhaar = row.AADHAAR || row.Aadhaar || "";
        const dEmail = row.Email_Address || "";
        const dAmount = Number(row.Amount) || 0;
        const dDate = row.Date ? new Date(row.Date) : new Date();
        const dScheme = "General Donation";
        const dBranch = "Headquarters";
        const dAddress = "";

        // --- THE FIX: CATEGORY LOGIC ---
        // 1. Check if the row itself has a category column
        // 2. If NOT, use the 'userSelectedCategory' we got from the dropdown
        const rowCategory = getValue(["Category", "Type"]);
        const finalCategory = rowCategory || userSelectedCategory;
        // -------------------------------

        if (dName && dName !== "Unknown Donor") {
          results.push({
            donorName: dName,
            donorPhone: dPhone,
            donorEmail: dEmail,
            donorPan: dPan,
            donorAadhaar: dAadhaar,
            address: dAddress,
            amount: dAmount,
            scheme: dScheme,
            accountHead: matchedAccountId,
            paymentMode: "Cash",
            category: finalCategory, // <--- SAVING IT HERE
            branch: dBranch,
            createdAt: dDate,
            receiptStatus: "Generated",
            collectedBy: req.user._id,
          });
        }
      })
      // ... (Rest of the function stays same) ...
      .on("end", async () => {
        // ... insertMany logic ...
        try {
          if (results.length > 0) {
            await Donation.insertMany(results);
            fs.unlinkSync(filePath);
            res.json({
              message: `Successfully imported ${results.length} donations as '${userSelectedCategory}'`,
            });
          } else {
            fs.unlinkSync(filePath);
            res.status(400).json({ message: "No valid data found." });
          }
        } catch (err) {
          res.status(500).json({ message: "DB Error: " + err.message });
        }
      });
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
  getDonorByPhone, // <--- Updated
  generateTaxCertificate, // <--- Updated
  getDailySevaList,
  importDonations,
};
