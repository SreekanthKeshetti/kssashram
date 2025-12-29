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
const path = require("path"); // <--- Ensure this is imported too
const Donation = require("../models/Donation");
const { buildReceipt } = require("../utils/generatePDF"); // Ensure this path is correct
const nodemailer = require("nodemailer");
const { logAudit } = require("../utils/auditLogger"); // <--- Import

// @desc    Create new donation
// @route   POST /api/donations
const createDonation = async (req, res) => {
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
      branch,
    } = req.body;

    const donation = await Donation.create({
      donorName,
      donorPhone,
      donorEmail,
      donorPan,
      amount,
      scheme,
      paymentMode,
      paymentReference,
      branch: branch || "Headquarters",
      collectedBy: req.user._id,
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
const getDonations = async (req, res) => {
  try {
    const donations = await Donation.find({}).sort({ createdAt: -1 });
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

    const donation = await Donation.create({
      donorName,
      donorPhone,
      donorEmail,
      donorPan,
      amount,
      scheme,
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

// Export it
module.exports = {
  createDonation,
  createPublicDonation,
  getDonations,
  downloadReceipt,
  emailReceipt,
  uploadMedia,
  deleteMedia,
  getMyDonations, // <--- Add this
};
