import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5174,
    proxy: {
      // Proxy API calls to hs-portal in development
      "/hub": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/upload": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/invalidate": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/preview": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
