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
        manualChunks(id) {
          if (id.includes("node_modules/react-dom"))      return "vendor";
          if (id.includes("node_modules/react/"))         return "vendor";
          if (id.includes("node_modules/react-router"))   return "vendor";
          if (id.includes("node_modules/@chakra-ui"))     return "chakra";
          if (id.includes("node_modules/@emotion"))       return "chakra";
          if (id.includes("node_modules/framer-motion"))  return "chakra";
          if (id.includes("node_modules/gsap"))           return "gsap";
          if (id.includes("node_modules/firebase"))       return "firebase";
          if (id.includes("node_modules/@mercadopago"))   return "mercadopago";
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});