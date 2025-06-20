const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const { generateTripWithAI } = require("../controllers/aiTrip.controller");

// Route to generate trip with AI (pro users only)
router.post("/generate-trip", protect, generateTripWithAI);

module.exports = router;
