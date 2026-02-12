const express = require("express");
const router = express.Router();
const {
  getEvents,
  createEvent,
  registerForEvent,
  markAttendance,
  updatePaymentStatus, // <--- Import
  downloadBlankForm,
} = require("../controllers/eventController");
const { protect, staff } = require("../middleware/authMiddleware");

router.route("/").get(getEvents).post(protect, staff, createEvent);

router.route("/:id/register").post(registerForEvent);
router.put("/:id/attendance", protect, staff, markAttendance);

// --- NEW ROUTE ---
router.put("/:id/payment", protect, staff, updatePaymentStatus);
router.get("/blank-form", downloadBlankForm);

module.exports = router;
