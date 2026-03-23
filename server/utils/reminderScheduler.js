// const cron = require("node-cron");
// const nodemailer = require("nodemailer");
// const Donation = require("../models/Donation");

// const { emailBackupInternal } = require("../controllers/backupController");

// const runScheduler = () => {
//   // Run every day at 10:00 AM
//   cron.schedule("0 10 * * *", async () => {
//     console.log("⏳ Running Daily Donation Reminder Check...");

//     try {
//       const today = new Date();

//       // Calculate target dates
//       const target30 = new Date();
//       target30.setDate(today.getDate() + 30); // 30 Days from now

//       const target7 = new Date();
//       target7.setDate(today.getDate() + 7); // 7 Days from now

//       // Helper to format date for query (Ignore time, just match Date)
//       const startOfDay = (d) => new Date(d.setHours(0, 0, 0, 0));
//       const endOfDay = (d) => new Date(d.setHours(23, 59, 59, 999));

//       // 1. Find Donors due in 30 Days OR 7 Days
//       const donationsToRemind = await Donation.find({
//         isRecurring: true,
//         donorEmail: { $exists: true, $ne: "" }, // Must have email
//         $or: [
//           {
//             nextReminderDate: {
//               $gte: startOfDay(target30),
//               $lte: endOfDay(target30),
//             },
//           },
//           {
//             nextReminderDate: {
//               $gte: startOfDay(target7),
//               $lte: endOfDay(target7),
//             },
//           },
//         ],
//       });

//       if (donationsToRemind.length === 0) {
//         console.log("✅ No reminders to send today.");
//         return;
//       }

//       console.log(`📧 Sending ${donationsToRemind.length} reminders...`);

//       // 2. Setup Email Transporter
//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.EMAIL_PASS,
//         },
//       });

//       // 3. Send Emails
//       for (const don of donationsToRemind) {
//         const daysLeft = Math.ceil(
//           (new Date(don.nextReminderDate) - today) / (1000 * 60 * 60 * 24),
//         );

//         const mailOptions = {
//           from: process.env.EMAIL_USER,
//           to: don.donorEmail,
//           subject: `Gentle Reminder: Upcoming Donation for ${don.scheme}`,
//           html: `
//             <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
//               <h3 style="color: #581818;">Namaste ${don.donorName},</h3>
//               <p>We hope this email finds you in good health and high spirits.</p>
//               <p>This is a gentle reminder that your annual support for <strong>${
//                 don.scheme
//               }</strong> is upcoming in <strong>${daysLeft} days</strong> (on ${new Date(
//                 don.nextReminderDate,
//               ).toLocaleDateString()}).</p>
//               <p>Last year, your generous contribution of <strong>Rs. ${
//                 don.amount
//               }</strong> helped us serve the needy effectively.</p>
//               <p>We look forward to your continued support.</p>
//               <br/>
//               <p>With Gratitude,</p>
//               <p><strong>Karunasri Seva Samithi</strong></p>
//               <hr/>
//               <small>You can pay online via our website or visit the Ashram.</small>
//             </div>
//           `,
//         };

//         await transporter.sendMail(mailOptions);
//         console.log(`   -> Sent to ${don.donorName} (${daysLeft} days left)`);
//       }
//     } catch (error) {
//       console.error("❌ Scheduler Error:", error);
//     }
//   });
//   cron.schedule("0 22 * * 0", async () => {
//     console.log("📦 Starting Weekly Auto-Backup...");
//     await emailBackupInternal();
//   });
// };

// module.exports = runScheduler;

const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Donation = require("../models/Donation");
const { emailBackupInternal } = require("../controllers/backupController");

// ==========================================
// TELECOM API STUBS (For Future Integration)
// ==========================================
const sendSMS = async (phone, message) => {
  // TODO: Replace with MSG91 / Twilio API Call
  // Example: await axios.post('https://api.msg91.com/api/v5/flow/', { ... })
  console.log(`📱 [SMS MOCK] Sending to ${phone}: ${message}`);
};

const sendWhatsApp = async (phone, message) => {
  // TODO: Replace with Meta WhatsApp Cloud API or Twilio WhatsApp API
  console.log(`💬 [WHATSAPP MOCK] Sending to ${phone}: ${message}`);
};

const runScheduler = () => {
  // =========================================================
  // 1. RECURRING DONATION PAYMENT REMINDERS (Runs 10:00 AM)
  // =========================================================
  cron.schedule("0 10 * * *", async () => {
    console.log("⏳ Running Daily Donation Payment Reminder Check...");

    try {
      const today = new Date();
      const target30 = new Date();
      target30.setDate(today.getDate() + 30);
      const target7 = new Date();
      target7.setDate(today.getDate() + 7);

      const startOfDay = (d) => new Date(new Date(d).setHours(0, 0, 0, 0));
      const endOfDay = (d) => new Date(new Date(d).setHours(23, 59, 59, 999));

      const donationsToRemind = await Donation.find({
        isRecurring: true,
        status: "Active",
        donorEmail: { $exists: true, $ne: "" },
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

      if (donationsToRemind.length === 0) return;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      for (const don of donationsToRemind) {
        const daysLeft = Math.ceil(
          (new Date(don.nextReminderDate) - today) / (1000 * 60 * 60 * 24),
        );
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: don.donorEmail,
          subject: `Gentle Reminder: Upcoming Donation for ${don.scheme}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
              <h3 style="color: #581818;">Namaste ${don.donorName},</h3>
              <p>This is a gentle reminder that your annual support for <strong>${don.scheme}</strong> is upcoming in <strong>${daysLeft} days</strong> (on ${new Date(don.nextReminderDate).toLocaleDateString()}).</p>
              <p>Last year, your generous contribution of <strong>Rs. ${don.amount}</strong> helped us serve the needy effectively.</p>
              <p>We look forward to your continued support.</p>
              <br/><p>With Gratitude,<br/><strong>Karunasri Seva Samithi</strong></p>
            </div>
          `,
        };
        await transporter.sendMail(mailOptions);
      }
    } catch (error) {
      console.error("❌ Scheduler Error:", error);
    }
  });

  // =========================================================
  // 2. SEVA EVENT INVITATIONS (Runs 9:30 AM)
  // Sends an invite 7 Days and 2 Days before the Annadhanam/Seva
  // =========================================================
  cron.schedule("30 9 * * *", async () => {
    console.log("⏳ Running Seva Invitation Check (7 Days & 2 Days prior)...");

    try {
      const today = new Date();

      // Helper to generate the precise Date-Matching Query (Handles both One-Time & Recurring)
      const getEventQuery = (daysAhead) => {
        const targetDate = new Date();
        targetDate.setDate(today.getDate() + daysAhead);

        const day = targetDate.getDate();
        const month = targetDate.getMonth() + 1;
        const fullStart = new Date(new Date(targetDate).setHours(0, 0, 0, 0));
        const fullEnd = new Date(
          new Date(targetDate).setHours(23, 59, 59, 999),
        );

        return {
          targetDateObj: targetDate,
          daysAhead: daysAhead,
          query: {
            status: "Active",
            calendarType: "Gregorian",
            programDate: { $exists: true, $ne: null },
            $or: [
              // Rule A: One-time Event matching exact date
              {
                isRecurring: false,
                programDate: { $gte: fullStart, $lte: fullEnd },
              },
              // Rule B: Recurring Event matching Day and Month
              {
                isRecurring: true,
                $expr: {
                  $and: [
                    { $eq: [{ $dayOfMonth: "$programDate" }, day] },
                    { $eq: [{ $month: "$programDate" }, month] },
                  ],
                },
              },
            ],
          },
        };
      };

      // Get queries for 7 Days and 2 Days
      const jobs = [getEventQuery(7), getEventQuery(2)];

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      for (const job of jobs) {
        const upcomingEvents = await Donation.find(job.query);

        for (const don of upcomingEvents) {
          const eventDateStr = job.targetDateObj.toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          const occasionText = don.occasion
            ? `on the occasion of ${don.occasion}`
            : "";
          const nameText = don.inNameOf ? `in the name of ${don.inNameOf}` : "";

          // --- 1. SEND EMAIL ---
          if (don.donorEmail) {
            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: don.donorEmail,
              subject: `Invitation: Your Upcoming Seva at Karunasri Ashram`,
              html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #daa520; border-radius: 8px;">
                  <h3 style="color: #581818; text-align: center;">KARUNASRI SEVA SAMITHI</h3>
                  <hr style="border: 1px solid #eee;" />
                  <p>Namaste <strong>${don.donorName}</strong>,</p>
                  <p>We are delighted to remind you that your scheduled Seva (<strong>${don.scheme}</strong>) ${occasionText} ${nameText} is approaching in <strong>${job.daysAhead} days</strong>.</p>
                  
                  <div style="background-color: #fffbf5; padding: 15px; border-left: 4px solid #d35400; margin: 20px 0;">
                    <strong>Date of Seva:</strong> ${eventDateStr}<br/>
                    <strong>Branch:</strong> ${don.branch}
                  </div>

                  <p>We cordially invite you and your family to be present at the Ashram on this auspicious day. It brings immense joy to the children and residents when donors personally serve the food and share their blessings.</p>
                  <p>Please let us know what time you plan to arrive so we can make the necessary arrangements.</p>
                  
                  <br/>
                  <p>In Service of the Lord,</p>
                  <p><strong>Ashram Management</strong><br/>Phone: +91 9000889785</p>
                </div>
              `,
            };
            await transporter.sendMail(mailOptions);
            console.log(
              `📧 [EMAIL] Sent Event Invite to ${don.donorName} (${job.daysAhead} days prior)`,
            );
          }

          // --- 2. SEND SMS & WHATSAPP ---
          if (don.donorPhone && don.donorPhone !== "0000000000") {
            const shortMessage = `Namaste ${don.donorName}, your Seva (${don.scheme}) is scheduled on ${eventDateStr}. We cordially invite you to visit the Ashram and serve the students. - Karunasri Seva Samithi`;

            await sendSMS(don.donorPhone, shortMessage);
            await sendWhatsApp(don.donorPhone, shortMessage);
          }
        }
      }
    } catch (error) {
      console.error("❌ Seva Invitation Scheduler Error:", error);
    }
  });

  // =========================================================
  // 3. WEEKLY DATABASE BACKUP (Runs Sunday at 10:00 PM)
  // =========================================================
  cron.schedule("0 22 * * 0", async () => {
    console.log("📦 Starting Weekly Auto-Backup...");
    await emailBackupInternal();
  });
};

module.exports = runScheduler;
