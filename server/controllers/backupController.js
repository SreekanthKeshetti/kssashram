const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const AdmZip = require("adm-zip");
const { sendEmail } = require("../utils/emailService");

// Import ALL Models
const Donation = require("../models/Donation");
const Student = require("../models/Student");
const Member = require("../models/Member");
const Inventory = require("../models/Inventory");
const Voucher = require("../models/Voucher");
const Event = require("../models/Event");
const User = require("../models/User");
const AccountHead = require("../models/AccountHead");

// Helper to get Data
const getAllData = async () => {
  return {
    donations: await Donation.find({}),
    students: await Student.find({}),
    members: await Member.find({}),
    inventory: await Inventory.find({}),
    vouchers: await Voucher.find({}),
    events: await Event.find({}),
    users: await User.find({}),
    accounts: await AccountHead.find({}),
  };
};

// @desc    Download Backup (Manual)
// @route   GET /api/backup/download
const downloadBackup = async (req, res) => {
  try {
    const data = await getAllData();
    const archive = archiver("zip", { zlib: { level: 9 } });

    res.attachment(`KSS_Backup_${new Date().toISOString().split("T")[0]}.zip`);
    archive.pipe(res);

    for (const [key, value] of Object.entries(data)) {
      archive.append(JSON.stringify(value, null, 2), { name: `${key}.json` });
    }

    await archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Backup Failed" });
  }
};

// @desc    Email Backup (Automated)
// @route   Internal Function
const emailBackupInternal = async () => {
  try {
    const data = await getAllData();
    const zipPath = path.join(__dirname, "../temp_backup.zip");
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);

    for (const [key, value] of Object.entries(data)) {
      archive.append(JSON.stringify(value, null, 2), { name: `${key}.json` });
    }

    await archive.finalize();

    output.on("close", async () => {
      // Read archive file as a buffer for Resend
      const fileBuffer = fs.readFileSync(zipPath);

      const emailResult = await sendEmail({
        to: process.env.EMAIL_TO_ADMIN || "karunasri1999@gmail.com",
        subject: `Weekly Data Backup - ${new Date().toLocaleDateString()}`,
        html: `<p>Attached is the automated weekly backup of the Karunasri ERP Database.</p>`,
        attachments: [
          {
            filename: "Weekly_Backup.zip",
            content: fileBuffer,
          },
        ],
      });

      if (emailResult.success) {
        console.log("✅ Backup Emailed Successfully via Resend");
      } else {
        console.error("❌ Auto-Backup Email Failed:", emailResult.error);
      }

      // Cleanup local temp file
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
      }
    });
  } catch (error) {
    console.error("❌ Auto-Backup Failed:", error);
  }
};

// @desc    Restore Database from ZIP
// @route   POST /api/backup/restore
const restoreBackup = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const zip = new AdmZip(req.file.path);
    const zipEntries = zip.getEntries();

    const getData = (filename) => {
      const entry = zipEntries.find((e) => e.entryName === filename);
      return entry ? JSON.parse(entry.getData().toString("utf8")) : null;
    };

    const donations = getData("donations.json");
    const students = getData("students.json");
    const members = getData("members.json");
    const inventory = getData("inventory.json");
    const vouchers = getData("vouchers.json");
    const events = getData("events.json");
    const users = getData("users.json");
    const accounts = getData("accounts.json");

    if (donations) {
      await Donation.deleteMany({});
      await Donation.insertMany(donations);
    }
    if (students) {
      await Student.deleteMany({});
      await Student.insertMany(students);
    }
    if (members) {
      await Member.deleteMany({});
      await Member.insertMany(members);
    }
    if (inventory) {
      await Inventory.deleteMany({});
      await Inventory.insertMany(inventory);
    }
    if (vouchers) {
      await Voucher.deleteMany({});
      await Voucher.insertMany(vouchers);
    }
    if (events) {
      await Event.deleteMany({});
      await Event.insertMany(events);
    }
    if (accounts) {
      await AccountHead.deleteMany({});
      await AccountHead.insertMany(accounts);
    }

    const userCount = await User.countDocuments();
    if (users && userCount === 0) {
      await User.insertMany(users);
    }

    fs.unlinkSync(req.file.path);
    res.json({ message: "Database Restored Successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Restore Failed: " + error.message });
  }
};

module.exports = { downloadBackup, emailBackupInternal, restoreBackup };
