import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 30_000,
    // The first run downloads a MongoDB binary for the in-memory test database.
    hookTimeout: 300_000,
  },
});
