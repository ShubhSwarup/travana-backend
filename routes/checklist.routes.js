const express = require("express");
const {
  getChecklist,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
} = require("../controllers/checklist.controller");
const protect = require("../middlewares/authMiddleware");

const router = express.Router({ mergeParams: true });

// Get all checklist items or filtered by type
router.get("/", protect, getChecklist);

// Add new checklist item
router.post("/", protect, createChecklistItem);

// Update checklist item
router.put("/:itemId", protect, updateChecklistItem);

// Delete checklist item
router.delete("/:itemId", protect, deleteChecklistItem);

module.exports = router;
