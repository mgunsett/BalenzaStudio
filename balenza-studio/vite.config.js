import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:      ["react", "react-dom", "react-router-dom"],
          chakra:      ["@chakra-ui/react", "@emotion/react", "@emotion/styled"],
          gsap:        ["gsap"],
          firebase:    ["firebase/app", "firebase/firestore", "firebase/auth", "firebase/storage"],
          mercadopago: ["@mercadopago/sdk-react"],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});