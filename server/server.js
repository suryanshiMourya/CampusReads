
import "dotenv/config";
import dns from "node:dns";
import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";

// DNS workaround for MongoDB SRV lookup
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "CampusReads Day 1 API is running"
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
