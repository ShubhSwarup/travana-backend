const ChecklistItem = require("../models/ChecklistItem");

exports.getChecklist = async (req, res) => {
  try {
    const filters = { trip: req.params.tripId };
    if (req.query.type) filters.type = req.query.type;

    const items = await ChecklistItem.find(filters).sort({ createdAt: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch checklist items" });
  }
};

exports.createChecklistItem = async (req, res) => {
  try {
    const { type, text, notes } = req.body;
    const tripId = req.params.tripId;

    const item = await ChecklistItem.create({
      trip: tripId,
      type,
      text,
      notes,
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to create checklist item" });
  }
};

exports.updateChecklistItem = async (req, res) => {
  try {
    const item = await ChecklistItem.findOneAndUpdate(
      { _id: req.params.itemId, trip: req.params.tripId },
      req.body,
      { new: true }
    );

    if (!item)
      return res.status(404).json({ message: "Checklist item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to update checklist item" });
  }
};

exports.deleteChecklistItem = async (req, res) => {
  try {
    const item = await ChecklistItem.findOneAndDelete({
      _id: req.params.itemId,
      trip: req.params.tripId,
    });

    if (!item)
      return res.status(404).json({ message: "Checklist item not found" });
    res.json({ message: "Checklist item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete checklist item" });
  }
};
