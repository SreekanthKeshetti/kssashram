const cron = require("node-cron");
const Donation = require("../models/Donation");
const { emailBackupInternal } = require("../controllers/backupController");
const { sendWhatsAppMessage } = require("./whatsappService");
const { sendEmail } = require("./emailService");

const runScheduler = () => {
  // =========================================================
  // 1. RECURRING DONATION CRM REMINDERS (Runs 10:00 AM)
  // Tracks 30 days, 7 days, and 2 days before the anniversary
  // =========================================================
  cron.schedule("0 10 * * *", async () => {
    console.log("⏳ Running Daily CRM Donation Renewal Check...");

    try {
      const today = new Date();

      const target30 = new Date();
      target30.setDate(today.getDate() + 30);
      const target7 = new Date();
      target7.setDate(today.getDate() + 7);
      const target2 = new Date();
      target2.setDate(today.getDate() + 2);

      const startOfDay = (d) => new Date(new Date(d).setHours(0, 0, 0, 0));
      const endOfDay = (d) => new Date(new Date(d).setHours(23, 59, 59, 999));

      const donationsToRemind = await Donation.find({
        isRecurring: true,
        status: "Active",
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
          {
            nextReminderDate: {
              $gte: startOfDay(target2),
              $lte: endOfDay(target2),
            },
          },
        ],
      });

      if (donationsToRemind.length === 0) return;

      for (const don of donationsToRemind) {
        const daysLeft = Math.ceil(
          (new Date(don.nextReminderDate) - today) / (1000 * 60 * 60 * 24),
        );
        let logMessage = `Sent ${daysLeft}-day automated reminder`;

        if (don.donorEmail) {
          await sendEmail({
            to: don.donorEmail,
            subject: `Gentle Reminder: Upcoming Anniversary for ${don.scheme}`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
                <h3 style="color: #581818;">Namaste ${don.donorName} garu,</h3>
                <p>This is a gentle reminder that your annual support for <strong>${don.scheme}</strong> is approaching in <strong>${daysLeft} days</strong> (on ${new Date(don.nextReminderDate).toLocaleDateString()}).</p>
                <p>Last year, your generous contribution of <strong>Rs. ${don.amount}</strong> helped us serve the needy effectively.</p>
                <p>We look forward to your continued support and invite you to visit the Ashram on this special day.</p>
                <br/><p>With Gratitude,<br/><strong>Karunasri Seva Samithi</strong></p>
              </div>
            `,
          });
          logMessage += " via Email";
        }

        if (don.donorPhone && don.donorPhone !== "0000000000") {
          await sendWhatsAppMessage(don.donorPhone, "recurring_reminder", {
            name: don.donorName,
            scheme: don.scheme,
            daysLeft: daysLeft,
          });
          logMessage += " & WhatsApp";
        }

        don.followUpLogs.push({
          date: new Date(),
          actionBy: "System Robot",
          type: "System",
          note: logMessage,
        });
        await don.save();
      }
    } catch (error) {
      console.error("❌ Scheduler Error:", error);
    }
  });

  // =========================================================
  // 2. SEVA EVENT INVITATIONS (Runs 9:30 AM)
  // =========================================================
  cron.schedule("30 9 * * *", async () => {
    console.log("⏳ Running Seva Invitation Check (7 Days & 2 Days prior)...");

    try {
      const today = new Date();

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
              {
                isRecurring: false,
                programDate: { $gte: fullStart, $lte: fullEnd },
              },
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

      const jobs = [getEventQuery(7), getEventQuery(2)];

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

          if (don.donorEmail) {
            await sendEmail({
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
            });
            console.log(
              `📧 [EMAIL] Sent Event Invite to ${don.donorName} (${job.daysAhead} days prior)`,
            );
          }

          if (don.donorPhone && don.donorPhone !== "0000000000") {
            await sendWhatsAppMessage(don.donorPhone, "event_invitation", {
              name: don.donorName,
              scheme: don.scheme,
              date: eventDateStr,
            });
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
