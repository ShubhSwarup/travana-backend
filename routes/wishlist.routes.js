const express = require("express");
const router = express.Router({ mergeParams: true });
const protect = require("../middlewares/authMiddleware");
const {
  createWishlistItem,
  getWishlistItems,
  updateWishlistItem,
  deleteWishlistItem,
} = require("../controllers/wishlist.controller");

router.use(protect);

router.post("/", createWishlistItem);
router.get("/", getWishlistItems);
router.put("/:itemId", updateWishlistItem);
router.delete("/:itemId", deleteWishlistItem);

module.exports = router;
