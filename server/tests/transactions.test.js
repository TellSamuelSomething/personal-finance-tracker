import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bearer, registerAndLogin, sampleTransaction, startTestApp } from "./helpers.js";

let app;
let stop;
let alice;
let bob;

beforeAll(async () => {
  ({ app, stop } = await startTestApp());
  alice = await registerAndLogin(app, "alice");
  bob = await registerAndLogin(app, "bob");
});

afterAll(() => stop());

const create = (token, body) => request(app).post("/api/transactions").set(bearer(token)).send(body);

describe("creating and listing", () => {
  it("creates a transaction and lists newest first", async () => {
    await create(alice, sampleTransaction({ category: "Older", date: "2026-08-01" })).expect(201);
    const created = await create(alice, sampleTransaction({ category: "Newer", date: "2026-09-15", amount: 100 }));

    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ type: "Expense", amount: 100, category: "Newer" });

    const list = await request(app).get("/api/transactions").set(bearer(alice));

    expect(list.status).toBe(200);
    expect(list.body.map((t) => t.category)).toEqual(["Newer", "Older"]);
  });

  it.each([
    ["an unknown type", { type: "Gift" }, "type"],
    ["a negative amount", { amount: -5 }, "amount"],
    ["a zero amount", { amount: 0 }, "amount"],
    ["an amount sent as text", { amount: "12" }, "amount"],
    ["a missing category", { category: "  " }, "category"],
    ["an invalid date", { date: "not-a-date" }, "date"],
  ])("rejects %s", async (_name, override, field) => {
    const res = await create(alice, sampleTransaction(override));

    expect(res.status).toBe(400);
    expect(res.body.errors[field]).toBeDefined();
  });

  it("ignores an owner sent in the body", async () => {
    const res = await create(bob, { ...sampleTransaction({ category: "Sneaky" }), user: "64b64c2f9f1b2c0012345678" });
    expect(res.status).toBe(201);

    const list = await request(app).get("/api/transactions").set(bearer(bob));
    expect(list.body.map((t) => t.category)).toContain("Sneaky");
  });
});

describe("ownership", () => {
  it("only lists the signed-in user's transactions", async () => {
    await create(alice, sampleTransaction({ category: "AliceOnly" })).expect(201);
    await create(bob, sampleTransaction({ category: "BobOnly" })).expect(201);

    const aliceList = await request(app).get("/api/transactions").set(bearer(alice));
    const bobList = await request(app).get("/api/transactions").set(bearer(bob));

    expect(aliceList.body.map((t) => t.category)).toContain("AliceOnly");
    expect(aliceList.body.map((t) => t.category)).not.toContain("BobOnly");
    expect(bobList.body.map((t) => t.category)).toContain("BobOnly");
    expect(bobList.body.map((t) => t.category)).not.toContain("AliceOnly");
  });

  it("does not let a user delete someone else's transaction", async () => {
    const { body } = await create(alice, sampleTransaction({ category: "Protected" })).expect(201);

    const attempt = await request(app).delete(`/api/transactions/${body._id}`).set(bearer(bob));
    expect(attempt.status).toBe(404);

    const list = await request(app).get("/api/transactions").set(bearer(alice));
    expect(list.body.map((t) => t._id)).toContain(body._id);
  });

  it("lets a user delete their own transaction", async () => {
    const { body } = await create(alice, sampleTransaction({ category: "Temporary" })).expect(201);

    const res = await request(app).delete(`/api/transactions/${body._id}`).set(bearer(alice));
    expect(res.status).toBe(200);

    const list = await request(app).get("/api/transactions").set(bearer(alice));
    expect(list.body.map((t) => t._id)).not.toContain(body._id);
  });

  it("answers 404 for an id that is not valid or unknown", async () => {
    const invalid = await request(app).delete("/api/transactions/not-an-id").set(bearer(alice));
    const unknown = await request(app).delete("/api/transactions/64b64c2f9f1b2c0012345678").set(bearer(alice));

    expect(invalid.status).toBe(404);
    expect(unknown.status).toBe(404);
  });
});

describe("api", () => {
  it("answers unknown routes with a JSON 404", async () => {
    const res = await request(app).get("/api/nothing-here");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Not found");
  });

  it("reports its health", async () => {
    const res = await request(app).get("/api/health");

    expect(res.body).toEqual({ status: "ok" });
  });
});
