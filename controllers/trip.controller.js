const Trip = require("../models/Trip");
const Activity = require("../models/Activity");

exports.createTrip = async (req, res) => {
  const { title, destination, startDate, endDate, description } = req.body;

  try {
    const trip = await Trip.create({
      user: req.user._id,
      title,
      destination,
      startDate,
      endDate,
      description,
    });

    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ message: "Failed to create trip", err });
  }
};

exports.getTrips = async (req, res) => {
  try {
    const now = new Date();
    const filters = { user: req.user._id }; // base filter for current user

    // 🧠 Apply status filtering based on date logic
    if (req.query.status === "planned") {
      // No dates means this is just a wishlist-style trip
      filters.startDate = { $exists: false };
      filters.endDate = { $exists: false };
    } else if (req.query.status === "future") {
      // Dates are set, but trip hasn't started yet
      filters.startDate = { $gt: now };
    } else if (req.query.status === "active") {
      // Current date is within trip range
      filters.startDate = { $lte: now };
      filters.endDate = { $gte: now };
    } else if (req.query.status === "completed") {
      // Trip has ended
      filters.endDate = { $lt: now };
    }

    const trips = await Trip.find(filters).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch trips" });
  }
};

exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: "Error fetching trip" });
  }
};

exports.updateTrip = async (req, res) => {
  const { title, destination, startDate, endDate } = req.body;

  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, destination, startDate, endDate },
      { new: true }
    );

    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: "Failed to update trip" });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // 🔥 Delete all related activities
    await Activity.deleteMany({ trip: trip._id });

    res.json({ message: "Trip and all associated activities deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete trip" });
  }
};
