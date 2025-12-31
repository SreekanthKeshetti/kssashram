const express = require("express");
const router = express.Router();
const {
  getEvents,
  createEvent,
  registerForEvent,
  markAttendance,
} = require("../controllers/eventController");
const { protect, staff } = require("../middleware/authMiddleware");

router
  .route("/")
  .get(getEvents) // Public can view
  .post(protect, staff, createEvent); // <--- 'staff' allows Manager AND Admin

router.route("/:id/register").post(registerForEvent); // Public can register
router.put("/:id/attendance", protect, staff, markAttendance);

module.exports = router;
