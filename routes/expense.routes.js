const express = require("express");
const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} = require("../controllers/expense.controller");
const protect = require("../middlewares/authMiddleware");

const router = express.Router({ mergeParams: true });

router.use(protect);

router.post("/", createExpense);
router.get("/", getExpenses);
router.put("/:expenseId", updateExpense);
router.delete("/:expenseId", deleteExpense);

module.exports = router;
