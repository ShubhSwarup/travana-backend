const User = require('../models/User');
const Trip = require('../models/Trip');
const Activity = require('../models/Activity');

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all user's trips
    const trips = await Trip.find({ user: userId });

    // Delete all activities linked to each trip
    const tripIds = trips.map((trip) => trip._id);
    await Activity.deleteMany({ trip: { $in: tripIds } });

    // Delete all trips
    await Trip.deleteMany({ user: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User and all associated data deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};
