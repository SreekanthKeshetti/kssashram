// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const bcrypt = require("bcryptjs");
// const User = require("./models/User");
// const connectDB = require("./config/db");

// // Load env vars
// dotenv.config();

// const importData = async () => {
//   try {
//     // 1. CONNECT TO DB FIRST (and wait for it!)
//     await connectDB();

//     // 2. Clear existing users
//     await User.deleteMany();
//     console.log("Old Users Removed...");

//     // 3. Hash the password "123456"
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash("123456", salt);

//     // 4. Define Users
//     const users = [
//       {
//         name: "Admin User",
//         email: "admin@karunasri.org",
//         password: hashedPassword,
//         phone: "9999999999",
//         role: "admin",
//         branch: "Headquarters",
//       },
//       {
//         name: "Ashram Manager",
//         email: "manager@karunasri.org",
//         password: hashedPassword,
//         phone: "8888888888",
//         role: "employee",
//         branch: "Saroornagar",
//       },
//       {
//         name: "Guest Donor",
//         email: "guest@gmail.com",
//         password: hashedPassword,
//         phone: "7777777777",
//         role: "user",
//       },
//     ];

//     // 5. Insert into Database
//     await User.insertMany(users);

//     console.log("Data Imported Successfully!");
//     process.exit();
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//     process.exit(1);
//   }
// };

// // Run the function
// importData();
// https://cloud.mongodb.com/v2/69454db012e4d516140237f2#/security/network/accessList

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const connectDB = require("./config/db");

dotenv.config();

const importData = async () => {
  try {
    await connectDB();

    // 1. Hash the password "123456"
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    // 2. Define the Staff Users you want to ensure exist
    // const staffUsers = [
    //   {
    //     name: "Admin User",
    //     email: "admin@karunasri.org",
    //     password: hashedPassword,
    //     phone: "9999999999",
    //     role: "admin",
    //     branch: "Headquarters",
    //   },
    //   {
    //     name: "Ashram Manager",
    //     email: "manager@karunasri.org",
    //     password: hashedPassword,
    //     phone: "8888888888",
    //     role: "employee",
    //     branch: "Saroornagar",
    //   },
    // ];
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
      // --- NEW COMMITTEE ROLES ---
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

    // 3. Loop through and create only if they don't exist
    for (const user of staffUsers) {
      const userExists = await User.findOne({ email: user.email });

      if (userExists) {
        console.log(`Skipping: ${user.name} (${user.email}) already exists.`);
      } else {
        await User.create(user);
        console.log(`Created: ${user.name} (${user.email})`);
      }
    }

    console.log("Seeding Process Complete!");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
