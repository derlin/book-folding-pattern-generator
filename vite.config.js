import { defineConfig } from "vite";

const BASE_URL = process.env.APP_BASE_URL || "";

export default defineConfig({
  // Setting base to an empty string forces relative paths for all assets.
  // Example: /assets/index.js becomes assets/index.js
  // Important for it to work on github actions
  base: BASE_URL,
});
