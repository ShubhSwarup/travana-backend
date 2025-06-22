const { OpenAI } = require("openai");
const Trip = require("../models/Trip");
const Activity = require("../models/Activity");
const Expense = require("../models/Expense");
const WishlistItem = require("../models/WishlistItem");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generateTripWithAI = async (req, res) => {
  const {
    destination,
    origin,
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

    const prompt = `
Create a ${numDays}-day travel itinerary for a user traveling from ${
      origin || "origin"
    } to ${destination} between ${startDate} and ${endDate}.

For each day, suggest 2–3 activities. Each activity must include:
- name
- description
- location (e.g., 'Eiffel Tower, Paris')
- category (sightseeing, food, travel, stay, activity, other)
- coordinates (latitude and longitude, if confidently known)

Also include 1–2 wishlist suggestions per day:
- name, description, type (activity, food, shopping, experience), location

Additionally, estimate the following trip costs:
- flightCost (round trip from ${origin || "origin"} to ${destination})
- stayCost (accommodation cost for ${numDays} days)
- foodCost (total or daily food expense)
- transportCost (local travel)

Return strict **valid JSON only** in this structure:
{
  "days": [
    {
      "date": "2025-12-20",
      "activities": [ { ... }, { ... } ],
      "wishlistSuggestions": [ { ... }, { ... } ]
    },
    ...
  ],
  "estimatedExpenses": {
    "flightCost": 50000,
    "stayCost": 30000,
    "foodCost": 10000,
    "transportCost": 5000
  }
}
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

    // 🧹 Clean and parse response
    let content = aiRes.choices[0].message.content.trim();

    if (content.startsWith("```")) {
      content = content
        .replace(/```(?:json)?/g, "")
        .replace(/```$/, "")
        .trim();
    }

    const parsed = JSON.parse(content);
    const { days, estimatedExpenses } = parsed;

    // Step 1: Create Trip
    const trip = await Trip.create({
      user: req.user._id,
      title,
      destination,
      startDate,
      endDate,
      description: `AI generated itinerary for ${destination}`,
    });

    // Step 2: Add AI-generated expense estimates
    if (estimatedExpenses) {
      const expenseList = [
        {
          title: "Flight",
          amount: estimatedExpenses.flightCost,
          category: "travel",
        },
        {
          title: "Accommodation",
          amount: estimatedExpenses.stayCost,
          category: "stay",
        },
        { title: "Food", amount: estimatedExpenses.foodCost, category: "food" },
        {
          title: "Transport",
          amount: estimatedExpenses.transportCost,
          category: "transport",
        },
      ];

      for (const item of expenseList) {
        if (item.amount && item.amount > 0) {
          await Expense.create({
            trip: trip._id,
            title: item.title,
            amount: item.amount,
            category: item.category,
            generatedByAI: true,
            notes: "Estimated by AI",
          });
        }
      }
    }

    // Step 3: Add activities + expenses
    for (const day of days) {
      const dayDate = new Date(day.date);

      for (const act of day.activities || []) {
        const activity = await Activity.create({
          trip: trip._id,
          name: act.name,
          description: act.description,
          location: act.location,
          category: act.category || "other",
          time: dayDate,
          coordinates: act.coordinates || undefined,
        });

        // Optional activity cost
        const costAmount =
          act.cost || act.estimatedCost || (act.expense?.amount ?? 0);
        if (costAmount > 0) {
          const expense = await Expense.create({
            trip: trip._id,
            activity: activity._id,
            title: act.name,
            amount: costAmount,
            category: "activity",
            date: dayDate,
            notes: act.description || "",
            generatedByAI: true,
          });

          activity.expense = expense._id;
          await activity.save();
        }
      }

      // Step 4: Wishlist suggestions
      if (day.wishlistSuggestions?.length) {
        for (const wish of day.wishlistSuggestions) {
          await WishlistItem.create({
            user: req.user._id,
            trip: trip._id,
            title: wish.name,
            type: [
              "activity",
              "food",
              "shopping",
              "experience",
              "other",
            ].includes(wish.type)
              ? wish.type
              : "other",
            notes: wish.description || "",
            location: wish.location || "",
          });
        }
      }
    }
    res
      .status(201)
      .json({ message: "Trip created successfully", _id: trip._id });
  } catch (err) {
    console.error("❌ AI Trip Creation Error:", err);
    res.status(500).json({ message: "Failed to generate trip with AI" });
  }
};
