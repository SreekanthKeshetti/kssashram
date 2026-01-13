// const Event = require("../models/Event");

// // @desc    Get all events
// const getEvents = async (req, res) => {
//   try {
//     const events = await Event.find({}).sort({ date: 1 });
//     res.json(events);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Create new event (Updated for Fees)
// const createEvent = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       date,
//       time,
//       location,
//       eventType,
//       branch,
//       isPaid,
//       feeAmount,
//     } = req.body;

//     const event = await Event.create({
//       title,
//       description,
//       date,
//       time,
//       location,
//       eventType,
//       // --- NEW FIELDS ---
//       isPaid: isPaid || false,
//       feeAmount: isPaid ? Number(feeAmount) : 0,
//       // ------------------
//       branch: branch || "Headquarters",
//       createdBy: req.user._id,
//     });

//     res.status(201).json(event);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // @desc    Register for event (Updated for Payment Status)
// const registerForEvent = async (req, res) => {
//   try {
//     const event = await Event.findById(req.params.id);
//     if (!event) return res.status(404).json({ message: "Event not found" });

//     const { name, phone } = req.body;

//     const alreadyRegistered = event.registrations.find(
//       (r) => r.phone === phone
//     );
//     if (alreadyRegistered) {
//       return res
//         .status(400)
//         .json({ message: "Phone number already registered." });
//     }

//     // Determine Status: If Paid Event -> 'Pending', else 'Free'
//     const initialStatus = event.isPaid ? "Pending" : "Free";

//     event.registrations.push({
//       user: req.user ? req.user._id : null,
//       name,
//       phone,
//       paymentStatus: initialStatus, // <--- Set Status
//     });

//     await event.save();
//     res.json({ message: "Registration Successful" });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // @desc    Mark Attendance
// const markAttendance = async (req, res) => {
//   try {
//     const { registrationId, status } = req.body;
//     const event = await Event.findById(req.params.id);
//     if (!event) return res.status(404).json({ message: "Event not found" });

//     const registration = event.registrations.id(registrationId);
//     if (!registration)
//       return res.status(404).json({ message: "Registration not found" });

//     registration.attended = status;
//     await event.save();

//     res.json({
//       message: "Attendance updated",
//       registrations: event.registrations,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // --- NEW: Mark Payment Status (Admin/Staff) ---
// const updatePaymentStatus = async (req, res) => {
//   try {
//     const { registrationId, status } = req.body; // 'Paid' or 'Waived'
//     const event = await Event.findById(req.params.id);
//     if (!event) return res.status(404).json({ message: "Event not found" });

//     const registration = event.registrations.id(registrationId);
//     if (!registration)
//       return res.status(404).json({ message: "Registration not found" });

//     registration.paymentStatus = status;
//     await event.save();

//     res.json({
//       message: "Payment status updated",
//       registrations: event.registrations,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = {
//   getEvents,
//   createEvent,
//   registerForEvent,
//   markAttendance,
//   updatePaymentStatus,
// };

const Event = require("../models/Event");

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

// --- UPDATED: Mark Attendance for a SPECIFIC DATE ---
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

// ... Keep updatePaymentStatus ...
const updatePaymentStatus = async (req, res) => {
  try {
    const { registrationId, status } = req.body;
    const event = await Event.findById(req.params.id);
    const registration = event.registrations.id(registrationId);
    registration.paymentStatus = status;
    await event.save();
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
