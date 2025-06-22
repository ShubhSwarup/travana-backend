const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },
    destination: {
      type: String,
      maxlength: 200,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 250,
      trim: true,
      default: "",
    },
    startDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !this.endDate || value <= this.endDate;
        },
        message: "Start date must be before or equal to end date.",
      },
       required: false,
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !this.startDate || value >= this.startDate;
        },
        message: "End date must be after or equal to start date.",
      },
       required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
