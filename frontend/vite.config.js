import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // This app is not optimized for fast loads
    chunkSizeWarningLimit: 10000,
  },
});
