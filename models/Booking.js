const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    type: {
      type: String,
      enum: ["flight", "hotel", "train", "bus", "car", "other"],
      default: "other",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    referenceNumber: {
      type: String,
      trim: true,
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    notes: {
      type: String,
      trim: true,
    },
    documentUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
