const Event = require("../models/Event");
const Voucher = require("../models/Voucher"); // <--- Import Voucher
const AccountHead = require("../models/AccountHead"); // <--- Import AccountHead

// @desc    Get all events
const getEvents = async (req, res) => {
  try {
    // Sort by nearest start date
    const events = await Event.find({}).sort({ startDate: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new event / Training
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      time,
      location,
      eventType,
      branch,
      isPaid,
      feeAmount,
    } = req.body;

    // Use startDate as fallback if old frontend sends 'date'
    const start = startDate || req.body.date;

    const event = await Event.create({
      title,
      description,
      startDate: start,
      endDate: endDate || start, // If 1-day event, end = start
      time,
      location,
      eventType,
      isPaid: isPaid || false,
      feeAmount: isPaid ? Number(feeAmount) : 0,
      branch: branch || "Headquarters",
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Register (Logic same, but mapping 'date' for legacy safety)
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const { name, phone } = req.body;
    const alreadyRegistered = event.registrations.find(
      (r) => r.phone === phone
    );
    if (alreadyRegistered)
      return res.status(400).json({ message: "Already registered." });

    const initialStatus = event.isPaid ? "Pending" : "Free";

    event.registrations.push({
      user: req.user ? req.user._id : null,
      name,
      phone,
      paymentStatus: initialStatus,
      attendanceLog: [], // Initialize empty log
    });

    await event.save();
    res.json({ message: "Registration Successful" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- Mark Attendance for a SPECIFIC DATE ---
const markAttendance = async (req, res) => {
  try {
    const { registrationId, date, status } = req.body; // status: true(Present) / false(Absent)

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const registration = event.registrations.id(registrationId);
    if (!registration)
      return res.status(404).json({ message: "Registration not found" });

    // Normalize date to remove time (YYYY-MM-DD)
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    if (status) {
      // MARK PRESENT: Add date if not exists
      const exists = registration.attendanceLog.some(
        (d) => new Date(d).getTime() === targetDate.getTime()
      );
      if (!exists) {
        registration.attendanceLog.push(targetDate);
      }
    } else {
      // MARK ABSENT: Remove date
      registration.attendanceLog = registration.attendanceLog.filter(
        (d) => new Date(d).getTime() !== targetDate.getTime()
      );
    }

    await event.save();
    res.json({
      message: "Attendance updated",
      registrations: event.registrations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- UPDATED: Mark Payment & Auto-Journal ---
const updatePaymentStatus = async (req, res) => {
  try {
    const { registrationId, status } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const registration = event.registrations.id(registrationId);
    if (!registration)
      return res.status(404).json({ message: "Registration not found" });

    // Prevent duplicate vouchers if already paid
    if (registration.paymentStatus === "Paid" && status === "Paid") {
      return res.status(400).json({ message: "User already marked as Paid." });
    }

    registration.paymentStatus = status;
    await event.save();

    // --- AUTO-CREATE VOUCHER IF PAID ---
    if (status === "Paid" && event.isPaid && event.feeAmount > 0) {
      // 1. Find Account Code for Training (208)
      // If 208 doesn't exist, fallback to any Credit code
      let account = await AccountHead.findOne({ code: "208" });
      if (!account) account = await AccountHead.findOne({ type: "Credit" });

      if (account) {
        await Voucher.create({
          voucherType: "Credit",
          voucherNo: "VCH-EVT-" + Date.now().toString().slice(-6), // Unique ID
          accountHead: account._id,
          amount: event.feeAmount,
          description: `Training Fee: ${registration.name} for ${event.title}`,
          paymentMode: "Cash", // Assuming Cash/UPI for counter payment
          branch: event.branch || "Headquarters",
          status: "Approved", // Auto-approve since money is collected
          preparedBy: req.user._id,
          approvedBy: [req.user._id], // Auto-sign
        });
        console.log("✅ Auto-Voucher created for Event Fee");
      }
    }
    // -----------------------------------

    res.json({
      message: "Payment updated",
      registrations: event.registrations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEvents,
  createEvent,
  registerForEvent,
  markAttendance,
  updatePaymentStatus,
};
