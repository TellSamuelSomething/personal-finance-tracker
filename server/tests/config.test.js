import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../app.js";
import { loadConfig } from "../config.js";

const required = { MONGO_URI: "mongodb://127.0.0.1/test", JWT_SECRET: "a".repeat(32) };

describe("AUTH_RATE_LIMIT", () => {
  it("defaults to 30 attempts", () => {
    expect(loadConfig(required).authRateLimit).toBe(30);
  });

  it("can be raised, for example for end-to-end tests that register many users", () => {
    expect(loadConfig({ ...required, AUTH_RATE_LIMIT: "500" }).authRateLimit).toBe(500);
  });

  it("falls back to the default when the value is not a number", () => {
    expect(loadConfig({ ...required, AUTH_RATE_LIMIT: "lots" }).authRateLimit).toBe(30);
  });

  it("is what the login and register limiter actually enforces", async () => {
    const app = createApp({ jwtSecret: required.JWT_SECRET, authRateLimit: 2 });

    // Empty bodies are rejected by validation before any database access, which keeps this test database free.
    expect((await request(app).post("/api/auth/login").send({})).status).toBe(400);
    expect((await request(app).post("/api/auth/login").send({})).status).toBe(400);
    expect((await request(app).post("/api/auth/login").send({})).status).toBe(429);
  });
});
