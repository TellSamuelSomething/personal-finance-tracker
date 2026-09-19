import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

import { createApp } from "../app.js";

export const JWT_SECRET = "test-secret-".padEnd(40, "x");

/** Starts an in-memory MongoDB and an app connected to it. Call `stop()` when the suite is done. */
export async function startTestApp() {
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri("finance-tracker-test"));

  const app = createApp({ jwtSecret: JWT_SECRET, limitAuthRequests: false });

  return {
    app,
    async stop() {
      await mongoose.disconnect();
      await mongod.stop();
    },
  };
}

/** Registers a user, logs in and returns the token. */
export async function registerAndLogin(app, username, password = "password123") {
  await request(app).post("/api/auth/register").send({ username, password }).expect(201);
  const res = await request(app).post("/api/auth/login").send({ username, password }).expect(200);
  return res.body.token;
}

export const bearer = (token) => ({ Authorization: `Bearer ${token}` });

export const sampleTransaction = (overrides = {}) => ({
  type: "Expense",
  amount: 25.5,
  category: "Food",
  date: "2026-09-01",
  ...overrides,
});
