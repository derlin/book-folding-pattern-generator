import { defineConfig } from 'vite';
import sitemap from 'vite-plugin-sitemap';

const BASE_URL = process.env.VITE_BASE_URL || '';
const HOSTNAME = BASE_URL || 'http://localhost:5173';

export default defineConfig({
  // Setting base to an empty string forces relative paths for all assets.
  // Example: /assets/index.js becomes assets/index.js
  // Important for it to work on github actions
  base: BASE_URL,

  plugins: [
    sitemap({
      hostname: HOSTNAME,
    }),
  ],
});
