// const Contact = require("../models/Contact");

// // @desc    Submit a new contact message
// // @route   POST /api/contact
// // @access  Public
// const submitContact = async (req, res) => {
//   try {
//     const { name, phone, email, subject, message } = req.body;

//     // Validation: Check if fields are empty
//     if (!name || !phone || !email || !message) {
//       return res
//         .status(400)
//         .json({ message: "Please fill in all required fields" });
//     }

//     // Create new contact in Database
//     const newContact = await Contact.create({
//       name,
//       phone,
//       email,
//       subject,
//       message,
//     });

//     if (newContact) {
//       res.status(201).json({
//         success: true,
//         message: "Message sent successfully! We will contact you soon.",
//         data: newContact,
//       });
//     } else {
//       res.status(400).json({ message: "Invalid contact data" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Server Error: " + error.message });
//   }
// };

// module.exports = { submitContact };
const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");

// @desc    Submit a new contact message & Send Email
// @route   POST /api/contact
const submitContact = async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    // 1. Validation
    if (!name || !phone || !email || !message) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields" });
    }

    // 2. Save to Database
    const newContact = await Contact.create({
      name,
      phone,
      email,
      subject,
      message,
    });

    // 3. Send Email Notification
    if (newContact) {
      // Create Transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // Your App Password
        },
      });

      // Email Content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to the Ashram's own email
        subject: `New Website Inquiry: ${subject}`,
        html: `
          <h3>New Contact Message</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <br/>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      };

      // Send Mail
      await transporter.sendMail(mailOptions);

      res.status(201).json({
        success: true,
        message: "Message sent successfully! We will contact you soon.",
        data: newContact,
      });
    } else {
      res.status(400).json({ message: "Invalid contact data" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

module.exports = { submitContact };
