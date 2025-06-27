const express = require("express");
const {
  register,
  login,
  getLoggedInUser,
} = require("../controllers/auth.controller");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getLoggedInUser);

module.exports = router;
