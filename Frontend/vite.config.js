import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: "..",
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "unsafe-none"
    },
    fs: {
      allow: ['..']
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['../tests/frontend/**/*.test.js']
  }
});
