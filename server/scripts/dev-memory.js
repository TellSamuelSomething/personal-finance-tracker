// Runs the API against a throwaway in-memory MongoDB, so the app can be tried without installing
// or hosting a database. All data is lost when the process stops.
import { randomBytes } from "node:crypto";

import { MongoMemoryServer } from "mongodb-memory-server";

const mongod = await MongoMemoryServer.create();

process.env.MONGO_URI = mongod.getUri("finance-tracker");
process.env.JWT_SECRET ??= randomBytes(32).toString("hex");

process.on("SIGINT", async () => {
  await mongod.stop();
  process.exit(0);
});

await import("../index.js");
