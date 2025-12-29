const Event = require("../models/Event");

// @desc    Get all events (Public)
// @route   GET /api/events
const getEvents = async (req, res) => {
  try {
    // Sort by date (Nearest first)
    const events = await Event.find({}).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new event (Manager/Admin)
// @route   POST /api/events
const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, eventType, branch } =
      req.body;

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      eventType,
      branch: branch || "Headquarters",
      createdBy: req.user._id, // Will be the Manager's ID
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Register for event (Public Guest)
// @route   POST /api/events/:id/register
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const { name, phone } = req.body;

    // Prevent duplicate registration by phone number
    const alreadyRegistered = event.registrations.find(
      (r) => r.phone === phone
    );
    if (alreadyRegistered) {
      return res
        .status(400)
        .json({ message: "This phone number is already registered." });
    }

    // Add to registrations
    event.registrations.push({
      user: req.user ? req.user._id : null,
      name,
      phone,
    });

    await event.save();
    res.json({ message: "Registration Successful" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getEvents, createEvent, registerForEvent };
