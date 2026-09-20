import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Dedicated ports, so the tests never collide with (or accidentally run against) a dev server
// that is already open on the usual 5000 and 5173.
const API_PORT = 5055;
const CLIENT_PORT = 5175;
const CLIENT_URL = `http://localhost:${CLIENT_PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: CLIENT_URL,
    // Amounts are formatted with the browser's locale, so pin it to keep "3,000.00" the same everywhere.
    locale: "en-US",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      // Set PW_CHANNEL=msedge to use an installed Edge instead of downloading Playwright's own browser.
      use: { ...devices["Desktop Chrome"], channel: process.env.PW_CHANNEL || undefined },
    },
  ],

  // The real API (against a throwaway in-memory MongoDB) and the real client: nothing is mocked.
  webServer: [
    {
      command: "node scripts/dev-memory.js",
      cwd: path.join(root, "server"),
      url: `http://localhost:${API_PORT}/api/health`,
      env: {
        ...process.env,
        PORT: String(API_PORT),
        CLIENT_ORIGIN: CLIENT_URL,
        // Every test registers its own user, which would trip the production login rate limit.
        AUTH_RATE_LIMIT: "10000",
      },
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      command: `npx vite --port ${CLIENT_PORT} --strictPort`,
      cwd: path.join(root, "client"),
      url: CLIENT_URL,
      env: { ...process.env, API_PROXY_TARGET: `http://localhost:${API_PORT}` },
      timeout: 60_000,
      reuseExistingServer: false,
    },
  ],
});
