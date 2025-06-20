const express = require("express");
const mongoose = require("mongoose");
// const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
require('dotenv').config();
const rateLimit = require("express-rate-limit");


const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const tripRoutes = require("./routes/trip.routes");
const activityRoutes = require("./routes/activity.routes");
const expenseRoutes = require("./routes/expense.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const bookingRoutes = require("./routes/booking.routes");
const checklistRoutes = require("./routes/checklist.routes");
const budgetSummaryRoutes = require("./routes/budgetSummary.routes");
const mapRoutes = require("./routes/map.routes");
const aiRoutes = require('./routes/ai.routes');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Adds various HTTP headers to help protect the app from well-known web vulnerabilities
app.use(helmet());

// Allows cross-origin requests (useful when frontend and backend are on different domains/ports)
app.use(cors());

// Parses incoming JSON requests so that you can access req.body
app.use(express.json());

// Rate limiter to prevent abuse or brute-force attacks (max 100 requests per 15 minutes per IP)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests, try again later.", // Custom message when limit is exceeded
  })
);


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/ai', aiRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/trips/:tripId/activities", activityRoutes);
app.use("/api/trips/:tripId/expenses", expenseRoutes);
app.use("/api/trips/:tripId/wishlist", wishlistRoutes);
app.use("/api/trips/:tripId/bookings", bookingRoutes);
app.use("/api/trips/:tripId/map", mapRoutes);
app.use("/api/trips/:tripId/checklist", checklistRoutes);
app.use("/api/trips/:tripId/budget-summary", budgetSummaryRoutes);



app.get("/", (req, res) => {
  res.send("Travana backend is running 🚀");
});

// 🔻 Place this 404 middleware after all valid routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// 🔻 Global error handler (catch all thrown errors)
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

