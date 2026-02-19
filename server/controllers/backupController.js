const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const AdmZip = require("adm-zip");
const nodemailer = require("nodemailer");

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
    users: await User.find({}), // Careful with passwords, but needed for full restore
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

    // Append files
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

    // Wait for zip to finish writing
    output.on("close", async () => {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to self/admin
        subject: `Weekly Data Backup - ${new Date().toLocaleDateString()}`,
        html: `<p>Attached is the automated weekly backup of the Karunasri ERP Database.</p>`,
        attachments: [{ filename: "Weekly_Backup.zip", path: zipPath }],
      });

      console.log("✅ Backup Emailed Successfully");
      // Cleanup
      fs.unlinkSync(zipPath);
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
    const zipEntries = zip.getEntries(); // an array of ZipEntry records

    // Helper: Parse JSON from entry
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

    // DANGEROUS OPERATION: Wipe and Replace
    // We use insertMany with the data from JSON.
    // Note: We deliberately DO NOT delete Users to prevent locking admin out,
    // unless the user specifically requested a full wipe.
    // For safety here, we will upsert or just insert.
    // BUT for a true restore (Clean slate), deleteMany is standard.

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

    // Users: Only restore if the list is empty (New DB), otherwise skip to avoid overwriting current Admin
    // Or, you can implement logic to merge.
    const userCount = await User.countDocuments();
    if (users && userCount === 0) {
      await User.insertMany(users);
    }

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ message: "Database Restored Successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Restore Failed: " + error.message });
  }
};

module.exports = { downloadBackup, emailBackupInternal, restoreBackup };
