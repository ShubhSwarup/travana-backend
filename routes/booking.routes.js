const express = require("express");
const router = express.Router({ mergeParams: true });
const { createBooking, getBookings, updateBooking, deleteBooking } = require("../controllers/booking.controller");
const protect = require("../middlewares/authMiddleware");

router.use(protect);

router.post("/", createBooking);
router.get("/", getBookings);
router.put("/:bookingId", updateBooking);
router.delete("/:bookingId", deleteBooking);

module.exports = router;
