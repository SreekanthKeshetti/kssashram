const Contact = require("../models/Contact");
const { sendEmail } = require("../utils/emailService");

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

    // 3. Send Email Notification via Resend HTTPS API
    if (newContact) {
      const emailResult = await sendEmail({
        to: process.env.EMAIL_TO_ADMIN || "karunasri1999@gmail.com",
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
      });

      if (!emailResult.success) {
        console.error(
          "⚠️ Contact inquiry saved to DB, but email failed:",
          emailResult.error,
        );
      }

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
