const express = require("express");
const {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
} = require("../controllers/trip.controller");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect); // All routes below are protected

router.post("/", createTrip);
router.get("/", getTrips);
router.get("/:id", getTrip);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);

module.exports = router;
