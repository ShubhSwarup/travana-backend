const Booking = require("../models/Booking");
const Trip = require("../models/Trip");

// Create Booking
exports.createBooking = async (req, res) => {
  const {
    title,
    type,
    referenceNumber,
    checkIn,
    checkOut,
    location,
    coordinates,
    notes,
    documentUrl,
  } = req.body;
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const booking = await Booking.create({
      user: req.user._id,
      trip: tripId,
      title,
      type,
      referenceNumber,
      checkIn,
      checkOut,
      location,
      coordinates,
      notes,
      documentUrl,
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: "Failed to create booking" });
  }
};

// Get All Bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      trip: req.params.tripId,
      user: req.user._id,
    }).sort({ checkIn: 1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

// Update Booking
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      {
        _id: req.params.bookingId,
        trip: req.params.tripId,
        user: req.user._id,
      },
      req.body,
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Failed to update booking" });
  }
};

// Delete Booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({
      _id: req.params.bookingId,
      trip: req.params.tripId,
      user: req.user._id,
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json({ message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete booking" });
  }
};
