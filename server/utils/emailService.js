const { Resend } = require("resend");

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Reusable HTTPS Email Service (Bypasses Render SMTP port blocking)
 */
const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error(
        "❌ [EMAIL SERVICE] Missing RESEND_API_KEY in environment variables.",
      );
      return { success: false, error: "Server email configuration missing" };
    }

    // Must be a verified domain on Resend (e.g., info@karunasri.org)
    // If testing without a domain, Resend provides 'onboarding@resend.dev'
    const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

    const data = await resend.emails.send({
      from: `Karunasri ERP <${fromEmail}>`,
      to,
      subject,
      html,
      attachments,
    });

    if (data.error) {
      console.error(
        "❌ [EMAIL SERVICE] Provider rejected email:",
        data.error.message,
      );
      return { success: false, error: data.error.message };
    }

    console.log(
      `✅ [EMAIL SERVICE] Successfully sent email to ${to}. ID: ${data.data?.id}`,
    );
    return { success: true, data };
  } catch (error) {
    console.error(
      "❌ [EMAIL SERVICE] Exception during execution:",
      error.message,
    );
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
