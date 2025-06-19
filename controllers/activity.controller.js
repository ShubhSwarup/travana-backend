const Activity = require("../models/Activity");
const Expense = require("../models/Expense");
const Trip = require("../models/Trip");

exports.createActivity = async (req, res) => {
  const {
    name,
    description,
    location,
    time,
    category,
    expense,
    coordinates,
    placeId,
  } = req.body;

  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    // Step 1: Create activity first
    const activity = await Activity.create({
      trip: tripId,
      name,
      description,
      location,
      time,
      category,
      coordinates, // 📍 Optional: { lat, lng }
      placeId, // 🆔 Optional: Google Place ID
    });

    // Step 2: If expense exists, create it and link back
    if (expense?.amount > 0) {
      const createdExpense = await Expense.create({
        trip: tripId,
        activity: activity._id,
        title: expense.title || name,
        amount: expense.amount,
        category: expense.category || "activity",
        notes: expense.notes || "",
        date: time || Date.now(),
      });

      // Step 3: Update activity with expense reference
      activity.expense = createdExpense._id;
      await activity.save();
    }

    res.status(201).json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create activity" });
  }
};
exports.getActivities = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    const activities = await Activity.find({ trip: req.params.tripId })
      .sort({ time: 1 })
      .populate("expense"); // 💰 this will now bring full expense data

    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch activities" });
  }
};

exports.updateActivity = async (req, res) => {
  const {
    name,
    description,
    location,
    time,
    category,
    expense,
    coordinates,
    placeId,
  } = req.body;

  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    const activity = await Activity.findOne({
      _id: req.params.activityId,
      trip: req.params.tripId,
    });

    if (!activity)
      return res.status(404).json({ message: "Activity not found" });

    // Update activity fields
    if (name !== undefined) activity.name = name;
    if (description !== undefined) activity.description = description;
    if (location !== undefined) activity.location = location;
    if (time !== undefined) activity.time = time;
    if (category !== undefined) activity.category = category;
    if (coordinates !== undefined) activity.coordinates = coordinates;
    if (placeId !== undefined) activity.placeId = placeId;

    // If there's expense data
    if (expense) {
      const Expense = require("../models/Expense");

      if (activity.expense) {
        // Update existing expense
        await Expense.findByIdAndUpdate(activity.expense, {
          title: expense.title || name || activity.name,
          amount: expense.amount,
          category: expense.category,
          notes: expense.notes,
          date: expense.date || time,
        });
      } else if (expense.amount > 0) {
        // Create new expense and link
        const newExpense = await Expense.create({
          trip: req.params.tripId,
          activity: activity._id,
          title: expense.title || name || activity.name,
          amount: expense.amount,
          category: expense.category || "activity",
          notes: expense.notes || "",
          date: expense.date || time || Date.now(),
        });
        activity.expense = newExpense._id;
      }
    }

    await activity.save();

    res.json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update activity" });
  }
};
exports.deleteActivity = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    const activity = await Activity.findOneAndDelete({
      _id: req.params.activityId,
      trip: req.params.tripId,
    });

    if (!activity)
      return res.status(404).json({ message: "Activity not found" });

    // Delete associated expense if present
    if (activity.expense) {
      const Expense = require("../models/Expense");
      await Expense.findByIdAndDelete(activity.expense);
    }

    res.json({ message: "Activity and associated expense deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete activity" });
  }
};
