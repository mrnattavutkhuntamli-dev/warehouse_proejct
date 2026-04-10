import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind CSS v4 — ใช้ plugin แทน postcss
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['get-nonce'],
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy /api ไปยัง backend Express
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
