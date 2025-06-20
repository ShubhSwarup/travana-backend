const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 500,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      maxlength: 300,
      trim: true,
    },
    coordinates: {
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
    },
    placeId: {
      type: String,
      trim: true,
    },
    time: {
      type: Date,
    },
    category: {
      type: String,
      // enum: ["sightseeing", "food", "travel", "activity", "stay", "other"],
      enum: ["activity", "food", "shopping", "experience", "sightseeing", "stay", "travel", "other"],

      default: "other",
    },
    expense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Activity", activitySchema);
