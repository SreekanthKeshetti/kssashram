// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const User = require("../models/User");

// // Helper Function: Generate JWT Token
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: "30d", // User stays logged in for 30 days
//   });
// };

// // @desc    Register new user
// // @route   POST /api/users/register
// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, phone } = req.body;

//     if (!name || !email || !password || !phone) {
//       return res.status(400).json({ message: "Please fill all fields" });
//     }

//     // Check if user exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create User
//     const user = await User.create({
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//       role: "user", // Default role
//     });

//     if (user) {
//       res.status(201).json({
//         _id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user.id), // Send token back
//       });
//     } else {
//       res.status(400).json({ message: "Invalid user data" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Authenticate a user (Login)
// // @route   POST /api/users/login
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check for user email
//     const user = await User.findOne({ email });

//     // Check password matches
//     if (user && (await bcrypt.compare(password, user.password))) {
//       res.json({
//         _id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user.id),
//       });
//     } else {
//       res.status(401).json({ message: "Invalid email or password" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = { registerUser, loginUser };
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer"); // <--- Import Nodemailer
const User = require("../models/User");

// Helper: Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register new user & Send Welcome Email
// @route   POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "user",
    });

    if (user) {
      // --- SEND WELCOME EMAIL LOGIC START ---
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email, // Send to the NEW USER
          subject: "Welcome to Karunasri Seva Samithi Family",
          html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <h2 style="color: #D35400;">Namaste ${user.name},</h2>
              <p>Thank you for joining <strong>Karunasri Seva Samithi</strong>.</p>
              <p>We are delighted to have you as part of our community. Your account has been successfully created.</p>
              <p>You can now log in to:</p>
              <ul>
                <li>View your donation history</li>
                <li>Download receipts</li>
                <li>Stay updated with Ashram events</li>
              </ul>
              <br/>
              <p>In Service of the Lord,</p>
              <p><strong>The Karunasri Team</strong></p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.log("Email sending failed:", emailError);
        // We don't stop the registration if email fails, just log it
      }
      // --- SEND WELCOME EMAIL LOGIC END ---

      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login User (Kept same as before)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get User Profile
// @route   GET /api/users/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        branch: user.branch,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update User Profile
// @route   PUT /api/users/profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      // We usually don't allow changing email easily as it's the ID
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        token: generateToken(updatedUser._id), // Return new token just in case
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export new functions
module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
