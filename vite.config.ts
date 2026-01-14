import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/spendo/",
  build: {
    sourcemap: true
  },
  test: {
    environment: "jsdom",
    globals: true
  }
});
