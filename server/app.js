import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";

import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactionRoutes.js";

/**
 * Builds the Express app without connecting to anything, so tests can use it directly.
 * The JWT secret is read from `jwtSecret` and shared with the controllers through app.locals.
 */
export function createApp({ jwtSecret, clientOrigin = "http://localhost:5173", limitAuthRequests = true }) {
  const app = express();
  app.locals.jwtSecret = jwtSecret;

  app.use(helmet());
  app.use(cors({ origin: clientOrigin }));
  app.use(express.json({ limit: "10kb" }));

  if (limitAuthRequests) {
    // Slows down password guessing.
    app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));
  }

  app.use("/api/auth", authRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
