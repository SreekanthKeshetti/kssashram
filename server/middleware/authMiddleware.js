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

// 3. Staff Only (Employees + Committee Members)
const staff = (req, res, next) => {
  const allowedRoles = [
    "admin",
    "employee",
    "president",
    "secretary",
    "treasurer",
    // NEW ROLES ADDED HERE:
    "warden_food",
    "warden_nonfood",
    "accountant",
    "clerk",
    // --- ADD NEW ROLES HERE ---
    "kba_manager",
    "ksa_manager",
  ];

  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    res
      .status(401)
      .json({ message: "Not authorized. Staff/Committee access required." });
  }
};
// 4. NEW: Committee Only (For Approvals)
const committee = (req, res, next) => {
  const allowedRoles = ["admin", "president", "secretary", "treasurer"];

  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    res
      .status(401)
      .json({ message: "Not authorized. Committee access required." });
  }
};

module.exports = { protect, admin, staff, committee };
