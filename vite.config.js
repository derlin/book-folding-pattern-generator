import { defineConfig } from "vite";

export default defineConfig({
  // Setting base to an empty string forces relative paths for all assets.
  // Example: /assets/index.js becomes assets/index.js
  // Important for it to work on github actions
  base: "",
});
