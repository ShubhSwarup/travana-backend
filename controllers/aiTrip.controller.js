const { OpenAI } = require("openai");
const Trip = require("../models/Trip");
const Activity = require("../models/Activity");
const Expense = require("../models/Expense");
const WishlistItem = require("../models/WishlistItem");
const allowedTypes = ["activity", "food", "shopping", "experience", "sightseeing", "stay", "travel", "other"];


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generateTripWithAI = async (req, res) => {
  const {
    destination,
    startDate,
    endDate,
    title = "AI Generated Trip",
  } = req.body;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const numDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (numDays > 10) {
      return res
        .status(400)
        .json({ message: "Trip duration cannot exceed 10 days." });
    }

    // ✅ Enhanced prompt with coordinates instructions
    const prompt = `
Create a ${numDays}-day travel itinerary for a trip to ${destination} from ${startDate} to ${endDate}.
For each day, suggest 2–3 activities. Each activity must include:
- name
- description
- location (e.g., 'Eiffel Tower, Paris')
- category (sightseeing, food, travel, stay, activity, other)
- coordinates (latitude and longitude, only if confidently known. Example: Eiffel Tower = lat: 48.8584, lng: 2.2945)

Also, provide 1–2 optional wishlistSuggestions for each day:
- name
- description
- type (activity, food, shopping, experience)
- location (if any)

⚠️ Return valid JSON in this format:
[
  {
    "date": "2025-12-20",
    "activities": [
      {
        "name": "...",
        "description": "...",
        "location": "...",
        "category": "...",
        "coordinates": { "lat": 0.0000, "lng": 0.0000 }
      }
    ],
    "wishlistSuggestions": [
      {
        "name": "...",
        "description": "...",
        "type": "...",
        "location": "..."
      }
    ]
  }
]
    `;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: "You are a travel assistant and planner bot.",
        },
        { role: "user", content: prompt },
      ],
    });

    // const parsed = JSON.parse(aiRes.choices[0].message.content);
    let content = aiRes.choices[0].message.content.trim();

    // Remove Markdown code block if present (e.g. ```json ... ```)
    if (content.startsWith("```")) {
      content = content.replace(/```(?:json)?/g, "").trim();
    }

    const parsed = JSON.parse(content);

    // Step 1: Create trip
    const trip = await Trip.create({
      user: req.user._id,
      title,
      destination,
      startDate,
      endDate,
      description: `AI generated itinerary for ${destination}`,
    });

    // Step 2: Loop through days and create activities
    for (const day of parsed) {
      const dayDate = new Date(day.date);

      for (const act of day.activities) {
        const activity = await Activity.create({
          trip: trip._id,
          name: act.name,
          description: act.description,
          location: act.location,
          category: act.category || "other",
          time: dayDate,
          coordinates: act.coordinates || undefined,
        });

        const costAmount =
          act.cost || act.estimatedCost || act.expense?.amount || 0;

        if (costAmount > 0) {
          const expense = await Expense.create({
            trip: trip._id,
            activity: activity._id,
            title: act.name,
            amount: costAmount,
            category: "activity",
            date: dayDate,
            notes: act.description || "",
          });

          activity.expense = expense._id;
          await activity.save();
        }
      }

      // Step 3: Create wishlist suggestions
      if (day.wishlistSuggestions?.length) {
        for (const wish of day.wishlistSuggestions) {
            const normalizedType = allowedTypes.includes(wish.type) ? wish.type : "other";
          await WishlistItem.create({
            user: req.user._id,
            trip: trip._id,
            title: wish.name,
            type: normalizedType,
            notes: wish.description || "",
            location: wish.location || "",
          });
        }
      }
    }

    res
      .status(201)
      .json({ message: "Trip created successfully", tripId: trip._id });
  } catch (err) {
    console.error("❌ AI Trip Creation Error:", err);
    res.status(500).json({ message: "Failed to generate trip with AI" });
  }
};
