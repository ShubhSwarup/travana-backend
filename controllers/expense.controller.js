const Expense = require("../models/Expense");
const Trip = require("../models/Trip");

// Create a new expense
exports.createExpense = async (req, res) => {
  const { title, amount, category, date, notes, activity } = req.body;
  const { tripId } = req.params;
  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ message: "Trip not found" });
  }

  //  If you want to verify ownership:
  if (trip.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized for this trip" });
  }
  try {
    const expense = await Expense.create({
      trip: tripId,
      activity: activity || null,
      title,
      amount,
      category,
      date,
      notes,
    });

    res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create expense" });
  }
};

// Get all expenses for a trip
exports.getExpenses = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    const expenses = await Expense.find({ trip: req.params.tripId }).sort({
      date: 1,
    });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.expenseId, trip: req.params.tripId },
      req.body,
      { new: true }
    );

    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: "Failed to update expense" });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    const expense = await Expense.findOneAndDelete({
      _id: req.params.expenseId,
      trip: req.params.tripId,
    });

    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete expense" });
  }
};
