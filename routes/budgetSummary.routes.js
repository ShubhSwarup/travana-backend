const express = require("express");
const { getBudgetSummary } = require("../controllers/budgetSummary.controller");
const router = express.Router({ mergeParams: true });
const protect = require("../middlewares/authMiddleware");

router.get("/", protect, getBudgetSummary);

module.exports = router;
