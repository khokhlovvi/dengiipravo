import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// SITE_BASE=/test/ — тестовая версия в подпапке, по умолчанию сайт в корне
export default defineConfig({
  base: process.env.SITE_BASE || "/",
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react()],
});
