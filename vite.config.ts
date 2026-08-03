import { defineConfig } from "vite";

const backend = {
  target: "https://localhost:3443",
  changeOrigin: true,
  secure: false
};

export default defineConfig({
  root: "web",
  build: {
    outDir: "../dist/web",
    emptyOutDir: true
  },
  server: {
    proxy: {
      "/auth": backend,
      "/accounts": backend,
      "/balance": backend,
      "/enable-banking": backend,
      "/imports": backend,
      "/institutions": backend,
      "/transactions": backend
    }
  }
});
