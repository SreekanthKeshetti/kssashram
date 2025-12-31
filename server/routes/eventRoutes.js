// const express = require("express");
// const router = express.Router();
// const {
//   getEvents,
//   createEvent,
//   registerForEvent,
//   markAttendance,
// } = require("../controllers/eventController");
// const { protect, staff } = require("../middleware/authMiddleware");

// router
//   .route("/")
//   .get(getEvents) // Public can view
//   .post(protect, staff, createEvent); // <--- 'staff' allows Manager AND Admin

// router.route("/:id/register").post(registerForEvent); // Public can register
// router.put("/:id/attendance", protect, staff, markAttendance);

// module.exports = router;
const express = require("express");
const router = express.Router();
const {
  getEvents,
  createEvent,
  registerForEvent,
  markAttendance,
  updatePaymentStatus, // <--- Import
} = require("../controllers/eventController");
const { protect, staff } = require("../middleware/authMiddleware");

router.route("/").get(getEvents).post(protect, staff, createEvent);

router.route("/:id/register").post(registerForEvent);
router.put("/:id/attendance", protect, staff, markAttendance);

// --- NEW ROUTE ---
router.put("/:id/payment", protect, staff, updatePaymentStatus);

module.exports = router;
