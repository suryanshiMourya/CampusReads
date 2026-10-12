
import reviewRoutes from "./routes/reviewRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import "dotenv/config";
import dns from "node:dns";
import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { protect } from "./middleware/authMiddleware.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "CampusReads Day 2 API is running"
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/reviews", reviewRoutes);
// Protected test route
app.get("/api/auth-test", protect, (req, res) => {
  res.json({
    message: "Authentication successful!",
    userId: req.user.id
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});