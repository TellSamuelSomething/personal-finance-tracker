import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import transactionRoutes from "./routes/transactionRoutes.js";
import authRoutes from "./routes/auth.js"; // ✅ ADD THIS

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ MOUNT AUTH ROUTES
app.use("/api/auth", authRoutes);

// Existing transaction routes
app.use("/api/transactions", transactionRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log(err));

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
