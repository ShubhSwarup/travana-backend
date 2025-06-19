const Expense = require("../models/Expense");

exports.getBudgetSummary = async (req, res) => {
  const { tripId } = req.params;

  try {
    const expenses = await Expense.find({ trip: tripId });

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryBreakdown = {};
    const dailySpending = {};
    let topExpenses = [...expenses];

    for (const e of expenses) {
      // Category breakdown
      const category = e.category || "misc";
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + e.amount;

      // Daily spending
      const day = new Date(e.date).toISOString().split("T")[0];
      dailySpending[day] = (dailySpending[day] || 0) + e.amount;
    }

    topExpenses = topExpenses
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    res.json({
      totalSpent,
      categoryBreakdown,
      dailySpending,
      topExpenses,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch budget summary" });
  }
};
