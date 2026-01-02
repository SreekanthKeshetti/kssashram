const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Donation = require("../models/Donation");

const runScheduler = () => {
  // Run every day at 10:00 AM
  cron.schedule("0 10 * * *", async () => {
    console.log("⏳ Running Daily Donation Reminder Check...");

    try {
      const today = new Date();

      // Calculate target dates
      const target30 = new Date();
      target30.setDate(today.getDate() + 30); // 30 Days from now

      const target7 = new Date();
      target7.setDate(today.getDate() + 7); // 7 Days from now

      // Helper to format date for query (Ignore time, just match Date)
      const startOfDay = (d) => new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = (d) => new Date(d.setHours(23, 59, 59, 999));

      // 1. Find Donors due in 30 Days OR 7 Days
      const donationsToRemind = await Donation.find({
        isRecurring: true,
        donorEmail: { $exists: true, $ne: "" }, // Must have email
        $or: [
          {
            nextReminderDate: {
              $gte: startOfDay(target30),
              $lte: endOfDay(target30),
            },
          },
          {
            nextReminderDate: {
              $gte: startOfDay(target7),
              $lte: endOfDay(target7),
            },
          },
        ],
      });

      if (donationsToRemind.length === 0) {
        console.log("✅ No reminders to send today.");
        return;
      }

      console.log(`📧 Sending ${donationsToRemind.length} reminders...`);

      // 2. Setup Email Transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // 3. Send Emails
      for (const don of donationsToRemind) {
        const daysLeft = Math.ceil(
          (new Date(don.nextReminderDate) - today) / (1000 * 60 * 60 * 24)
        );

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: don.donorEmail,
          subject: `Gentle Reminder: Upcoming Donation for ${don.scheme}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
              <h3 style="color: #581818;">Namaste ${don.donorName},</h3>
              <p>We hope this email finds you in good health and high spirits.</p>
              <p>This is a gentle reminder that your annual support for <strong>${
                don.scheme
              }</strong> is upcoming in <strong>${daysLeft} days</strong> (on ${new Date(
            don.nextReminderDate
          ).toLocaleDateString()}).</p>
              <p>Last year, your generous contribution of <strong>Rs. ${
                don.amount
              }</strong> helped us serve the needy effectively.</p>
              <p>We look forward to your continued support.</p>
              <br/>
              <p>With Gratitude,</p>
              <p><strong>Karunasri Seva Samithi</strong></p>
              <hr/>
              <small>You can pay online via our website or visit the Ashram.</small>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`   -> Sent to ${don.donorName} (${daysLeft} days left)`);
      }
    } catch (error) {
      console.error("❌ Scheduler Error:", error);
    }
  });
};

module.exports = runScheduler;
