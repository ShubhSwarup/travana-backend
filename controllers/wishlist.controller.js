const WishlistItem = require("../models/WishlistItem");

exports.createWishlistItem = async (req, res) => {
  const { title, type, notes, location, coordinates, placeId } = req.body;
  const { tripId } = req.params;

  try {
    const item = await WishlistItem.create({
      user: req.user._id,
      trip: tripId,
      title,
      type,
      notes,
      location,
      coordinates, // { lat, lng }
      placeId,
    });
    res.status(201).json(item);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create wishlist item" });
  }
};

exports.getWishlistItems = async (req, res) => {
  try {
    const items = await WishlistItem.find({
      trip: req.params.tripId,
      user: req.user._id,
    }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch wishlist items" });
  }
};

exports.updateWishlistItem = async (req, res) => {
  try {
    const item = await WishlistItem.findOneAndUpdate(
      { _id: req.params.itemId, trip: req.params.tripId, user: req.user._id },
      {
        ...req.body,
        // Optionally: add validation/sanitization here
      },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Wishlist item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to update wishlist item" });
  }
};

exports.deleteWishlistItem = async (req, res) => {
  try {
    const item = await WishlistItem.findOneAndDelete({
      _id: req.params.itemId,
      trip: req.params.tripId,
      user: req.user._id,
    });
    if (!item) return res.status(404).json({ message: "Wishlist item not found" });
    res.json({ message: "Wishlist item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete wishlist item" });
  }
};
