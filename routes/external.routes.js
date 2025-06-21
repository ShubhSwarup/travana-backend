const express = require("express");
const protect = require("../middlewares/authMiddleware");
const router = express.Router({ mergeParams: true });

router.use(protect);

router.get("/", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  try {
    const response = await fetch(
      `${process.env.GET_CITIES_API_URL}${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent": "TravanaApp/1.0 (support@travana.com)",
        },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Nominatim API error:", error);
    res.status(500).json({ error: "Failed to fetch from Nominatim" });
  }
});

module.exports = router;
