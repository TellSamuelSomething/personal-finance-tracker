import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bearer, JWT_SECRET, registerAndLogin, startTestApp } from "./helpers.js";

let app;
let stop;

beforeAll(async () => {
  ({ app, stop } = await startTestApp());
});

afterAll(() => stop());

describe("registration", () => {
  it("creates a user", async () => {
    const res = await request(app).post("/api/auth/register").send({ username: "newuser", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("User registered");
  });

  it("treats usernames as case-insensitive", async () => {
    await request(app).post("/api/auth/register").send({ username: "Casey", password: "password123" }).expect(201);

    const duplicate = await request(app).post("/api/auth/register").send({ username: "casey", password: "password123" });
    expect(duplicate.status).toBe(409);

    const login = await request(app).post("/api/auth/login").send({ username: "CASEY", password: "password123" });
    expect(login.status).toBe(200);
  });

  it("rejects a username that is already taken", async () => {
    await request(app).post("/api/auth/register").send({ username: "taken", password: "password123" }).expect(201);

    const res = await request(app).post("/api/auth/register").send({ username: "taken", password: "password123" });

    expect(res.status).toBe(409);
  });

  it("rejects invalid input with one message per field", async () => {
    const res = await request(app).post("/api/auth/register").send({ username: "ab", password: "short" });

    expect(res.status).toBe(400);
    expect(res.body.errors.username).toMatch(/at least 3/);
    expect(res.body.errors.password).toMatch(/at least 8/);
  });

  it("rejects a missing password instead of failing with a server error", async () => {
    const res = await request(app).post("/api/auth/register").send({ username: "nopassword" });

    expect(res.status).toBe(400);
    expect(res.body.errors.password).toBeDefined();
  });

  it("rejects a password longer than bcrypt can use", async () => {
    const res = await request(app).post("/api/auth/register").send({ username: "longpass", password: "x".repeat(73) });

    expect(res.status).toBe(400);
  });

  it("rejects a body that is not valid JSON", async () => {
    const res = await request(app).post("/api/auth/register").set("Content-Type", "application/json").send("{oops");

    expect(res.status).toBe(400);
  });
});

describe("login", () => {
  it("returns a token", async () => {
    await request(app).post("/api/auth/register").send({ username: "loginuser", password: "password123" }).expect(201);

    const res = await request(app).post("/api/auth/login").send({ username: "loginuser", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.username).toBe("loginuser");
  });

  it("gives the same answer for a wrong password and an unknown username", async () => {
    await request(app).post("/api/auth/register").send({ username: "known", password: "password123" }).expect(201);

    const wrongPassword = await request(app).post("/api/auth/login").send({ username: "known", password: "wrong-password" });
    const unknownUser = await request(app).post("/api/auth/login").send({ username: "nobody", password: "password123" });

    expect(wrongPassword.status).toBe(401);
    expect(unknownUser.status).toBe(401);
    expect(unknownUser.body).toEqual(wrongPassword.body);
  });
});

describe("token checks on protected routes", () => {
  it("rejects a request without a token", async () => {
    const res = await request(app).get("/api/transactions");

    expect(res.status).toBe(401);
  });

  it("rejects a token that is not a JWT", async () => {
    const res = await request(app).get("/api/transactions").set(bearer("not.a.token"));

    expect(res.status).toBe(401);
  });

  it("rejects a token signed with another secret", async () => {
    const forged = jwt.sign({ sub: "64b64c2f9f1b2c0012345678" }, "some-other-secret-that-is-long-enough-1234");

    const res = await request(app).get("/api/transactions").set(bearer(forged));

    expect(res.status).toBe(401);
  });

  it("rejects an expired token", async () => {
    const expired = jwt.sign({ sub: "64b64c2f9f1b2c0012345678" }, JWT_SECRET, { expiresIn: -10 });

    const res = await request(app).get("/api/transactions").set(bearer(expired));

    expect(res.status).toBe(401);
  });

  it("accepts a token from a real login", async () => {
    const token = await registerAndLogin(app, "tokenuser");

    const res = await request(app).get("/api/transactions").set(bearer(token));

    expect(res.status).toBe(200);
  });
});
