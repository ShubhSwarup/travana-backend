const Activity = require("../models/Activity");
const Trip = require("../models/Trip");

exports.getMapData = async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const activities = await Activity.find({ trip: tripId })
      .sort({ time: 1 })
      .lean();

    // Group by date
    const mapData = {};

    activities.forEach((act) => {
      const dateKey = act.time
        ? new Date(act.time).toISOString().split("T")[0]
        : "unscheduled";

      if (!mapData[dateKey]) {
        mapData[dateKey] = [];
      }

      mapData[dateKey].push({
        id: act._id,
        name: act.name,
        location: act.location,
        coordinates: act.coordinates || null,
        time: act.time,
        category: act.category,
      });
    });

    // Format for frontend
    const formatted = Object.entries(mapData).map(([date, activities]) => ({
      date,
      activities,
    }));

    res.json({ tripId, mapData: formatted });
  } catch (err) {
    console.error("Map data error:", err);
    res.status(500).json({ message: "Failed to load map data" });
  }
};
