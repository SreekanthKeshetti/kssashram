// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const protect = async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       // Get token from header (Bearer <token>)
//       token = req.headers.authorization.split(" ")[1];

//       // Verify token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // Get user from the token
//       req.user = await User.findById(decoded.id).select("-password");

//       next();
//     } catch (error) {
//       res.status(401).json({ message: "Not authorized, token failed" });
//     }
//   }

//   if (!token) {
//     res.status(401).json({ message: "Not authorized, no token" });
//   }
// };

// module.exports = { protect };

// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// // 1. Protect (Checks if user is logged in)
// const protect = async (req, res, next) => {
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       token = req.headers.authorization.split(" ")[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await User.findById(decoded.id).select("-password");
//       next();
//     } catch (error) {
//       res.status(401).json({ message: "Not authorized, token failed" });
//     }
//   }
//   if (!token) {
//     res.status(401).json({ message: "Not authorized, no token" });
//   }
// };

// // 2. Admin Only (Checks if user is Admin) <--- NEW FUNCTION
// const admin = (req, res, next) => {
//   if (req.user && req.user.role === "admin") {
//     next(); // Allow access
//   } else {
//     res.status(401).json({ message: "Not authorized as an admin" });
//   }
// };

// module.exports = { protect, admin };
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 1. Protect (Checks if user is logged in)
const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// 2. Admin Only (Strict)
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as an admin" });
  }
};

// 3. Staff Only (Manager OR Admin) <--- THIS ENABLE MANAGER ACCESS
// const staff = (req, res, next) => {
//   if (req.user && (req.user.role === "admin" || req.user.role === "employee")) {
//     next(); // Allow access
//   } else {
//     res.status(401).json({ message: "Not authorized. Staff access required." });
//   }
// };
// 3. Staff Only (Employees + Committee Members)
const staff = (req, res, next) => {
  const allowedRoles = [
    "admin",
    "employee",
    "president",
    "secretary",
    "treasurer",
  ];

  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    res
      .status(401)
      .json({ message: "Not authorized. Staff/Committee access required." });
  }
};

module.exports = { protect, admin, staff };
