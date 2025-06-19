const express = require("express");
const {
  createActivity,
  getActivities,
  updateActivity,
  deleteActivity,
} = require("../controllers/activity.controller");
const protect = require("../middlewares/authMiddleware");

const router = express.Router({ mergeParams: true }); // to access tripId

router.use(protect); // All routes below are protected

router.post("/", createActivity);
router.get("/", getActivities);
router.put("/:activityId", updateActivity);
router.delete("/:activityId", deleteActivity);

module.exports = router;
