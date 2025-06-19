const express = require("express");
const router = express.Router({ mergeParams: true });
const { getMapData } = require("../controllers/map.controller");
const protect = require("../middlewares/authMiddleware");


router.get("/", protect, getMapData);

module.exports = router;
