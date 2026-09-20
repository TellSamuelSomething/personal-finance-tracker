import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In development, API calls to /api are forwarded to the Express server, so no CORS setup is needed.
    proxy: {
      "/api": process.env.API_PROXY_TARGET ?? "http://localhost:5000",
    },
  },
});
