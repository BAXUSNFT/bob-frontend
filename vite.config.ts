import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import viteCompression from "vite-plugin-compression";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 1024,
    }),
  ],
  clearScreen: false,
  build: {
    outDir: "dist",
    minify: true,
    cssMinify: true,
    sourcemap: false,
    cssCodeSplit: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  preview: {
    allowedHosts: ["bob-frontend.baxusprod.xyz"],
  },
});
