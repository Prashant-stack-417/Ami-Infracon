import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      '@testing-library/react': path.resolve(__dirname, 'node_modules/@testing-library/react'),
      'vitest': path.resolve(__dirname, 'node_modules/vitest')
    }
  },
  envDir: "..",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['animejs', 'react-hot-toast', '@tabler/icons-react', 'react-leaflet']
        }
      }
    }
  },
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
    include: ['../tests/frontend/**/*.test.{js,jsx}']
  }
});
