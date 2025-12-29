const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const AccountHead = require("./models/AccountHead");
const Scheme = require("./models/Scheme"); // <--- Import Scheme Model
const connectDB = require("./config/db");

dotenv.config();

const importData = async () => {
  try {
    await connectDB();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    const staffUsers = [
      {
        name: "System Admin",
        email: "admin@karunasri.org",
        password: hashedPassword,
        phone: "9999999999",
        role: "admin",
        branch: "Headquarters",
      },
      {
        name: "Ashram Manager",
        email: "manager@karunasri.org",
        password: hashedPassword,
        phone: "8888888888",
        role: "employee",
        branch: "Saroornagar",
      },
      {
        name: "Trust President",
        email: "president@karunasri.org",
        password: hashedPassword,
        phone: "1111111111",
        role: "president",
        branch: "Headquarters",
      },
      {
        name: "Trust Secretary",
        email: "secretary@karunasri.org",
        password: hashedPassword,
        phone: "2222222222",
        role: "secretary",
        branch: "Headquarters",
      },
      {
        name: "Trust Treasurer",
        email: "treasurer@karunasri.org",
        password: hashedPassword,
        phone: "3333333333",
        role: "treasurer",
        branch: "Headquarters",
      },
    ];

    console.log("Checking for staff accounts...");

    for (const user of staffUsers) {
      const userExists = await User.findOne({ email: user.email });
      if (userExists) {
        console.log(`Skipping: ${user.name} (${user.email}) already exists.`);
      } else {
        await User.create(user);
        console.log(`Created: ${user.name} (${user.email})`);
      }
    }

    console.log("Seeding Account Codes...");
    await AccountHead.deleteMany();
    const accountCodes = [
      { code: "201", name: "NITYA ANNADHANAMU NIDHI", type: "Credit" },
      { code: "202", name: "SHASWITHA ANNADHANAMU NIDHI", type: "Credit" },
      { code: "203", name: "VIDYARTHI PATASHALA RUSUMU NIDHI", type: "Credit" },
      { code: "204", name: "VIDYARTHI POSHAKA NIDHI", type: "Credit" },
      { code: "205", name: "INTEREST RECEIVED", type: "Credit" },
      { code: "206", name: "DONATIONS", type: "Credit" },
      { code: "207", name: "KARUNYA BHARATHI BUILDING FUND", type: "Credit" },
      { code: "208", name: "VIDYARTHI KAUSHALYA NIDHI", type: "Credit" },
      { code: "209", name: "SAMAJA SEVA KARYAKRAMALA NIDHI", type: "Credit" },
      { code: "210", name: "INCOME TAX REFUND", type: "Credit" },
      { code: "220", name: "CORPUS FUND", type: "Credit" },
      { code: "230", name: "RESERVES & SURPLUS", type: "Credit" },
      { code: "10", name: "SALARIES WARDEN & CLERK", type: "Debit" },
      { code: "11", name: "SALARIES COOK", type: "Debit" },
      { code: "12", name: "SALARIES TUTORS", type: "Debit" },
      { code: "20", name: "MESS EXPENSES - VEGETABLES", type: "Debit" },
      { code: "21", name: "MESS EXPENSES - LPG", type: "Debit" },
      { code: "22", name: "MESS EXPENSES - MILK", type: "Debit" },
      { code: "23", name: "MESS EXPENSES - KIRANA ITEMS", type: "Debit" },
      { code: "30", name: "ADMIN EXPENSES - ELECTRICITY BILLS", type: "Debit" },
      {
        code: "31",
        name: "ADMIN EXPENSES - REPAIRS & MAINTENANCE",
        type: "Debit",
      },
      { code: "32", name: "ADMIN EXPENSES - PETROL", type: "Debit" },
      { code: "33", name: "ADMIN EXPENSES - CONVEYANCE", type: "Debit" },
      {
        code: "34",
        name: "ADMIN EXPENSES - POSTAGE/MOBILE/INTERNET",
        type: "Debit",
      },
      {
        code: "35",
        name: "ADMIN EXPENSES - PRINTING BULLETINS",
        type: "Debit",
      },
      { code: "36", name: "ADMIN EXPENSES - PRINTING GENERAL", type: "Debit" },
      { code: "37", name: "ADMIN EXPENSES - STATIONERY", type: "Debit" },
      { code: "38", name: "ADMIN EXPENSES - BANK CHARGES", type: "Debit" },
      { code: "39", name: "ADMIN EXPENSES - MEETINGS", type: "Debit" },
      {
        code: "40",
        name: "EDUCATIONAL - SCHOOL & COLLEGE FEES",
        type: "Debit",
      },
      { code: "41", name: "EDUCATIONAL - BUS PASSES", type: "Debit" },
      { code: "42", name: "EDUCATIONAL - EXAM FEES", type: "Debit" },
      { code: "43", name: "EDUCATIONAL - BOOKS & STATIONERY", type: "Debit" },
      { code: "44", name: "EDUCATIONAL - TRAINING PROGRAMMES", type: "Debit" },
      { code: "50", name: "MEDICAL EXPENSES", type: "Debit" },
      { code: "51", name: "MAJOR BUILDING RENOVATION", type: "Debit" },
      { code: "60", name: "DEPRECIATION", type: "Debit" },
      { code: "61", name: "PUJAS/FESTIVALS/HOLY FUNCTIONS", type: "Debit" },
      { code: "100", name: "CASH", type: "Debit" },
      { code: "101", name: "BANK BALANCE TSCOB", type: "Debit" },
      { code: "102", name: "BANK BALANCE SBI", type: "Debit" },
      { code: "103", name: "BANK BALANCE BOB", type: "Debit" },
    ];

    await AccountHead.insertMany(accountCodes);
    console.log("Account Codes Imported!");

    console.log("--- Seeding Schemes ---");
    await Scheme.deleteMany(); // Reset Schemes

    // Helper to find ID by Code
    const getCodeId = async (code) => {
      const acc = await AccountHead.findOne({ code });
      return acc ? acc._id : null;
    };

    // List of Schemes to Create (Based on PDF Credit Side)
    // We exclude things like "Interest Received" or "Tax Refund" as they are not user-selectable schemes
    const schemesToSeed = [
      { name: "Nitya Annadhana Nidhi", code: "201" },
      { name: "Shasvitha Annadhana Nidhi", code: "202" },
      { name: "Vidyarthi Pathashala Rusumu Nidhi", code: "203" },
      { name: "Vidyarthi Poshaka Nidhi", code: "204" },
      { name: "General Donations", code: "206" },
      { name: "Karunya Bharathi Building Fund", code: "207" },
      { name: "Vidyarthi Kaushalya Nidhi", code: "208" },
      { name: "Samaja Seva Karyakramala Nidhi", code: "209" },
      { name: "Corpus Fund", code: "220" },
    ];

    for (const s of schemesToSeed) {
      const accId = await getCodeId(s.code);
      if (accId) {
        await Scheme.create({
          name: s.name,
          description: `Donation towards ${s.name}`,
          accountHead: accId,
          isActive: true,
        });
        console.log(`Created Scheme: ${s.name} -> Code ${s.code}`);
      } else {
        console.log(`Skipped Scheme ${s.name} (Code ${s.code} not found)`);
      }
    }

    console.log("Seeding Process Complete!");
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
