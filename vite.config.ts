import { readFileSync, writeFileSync } from "node:fs";
import { defineConfig } from "vite";
import type { Plugin } from "vite";

const backend = {
  target: "https://localhost:3443",
  changeOrigin: true,
  secure: false
};

const serviceWorker: Plugin = {
  name: "gestio-service-worker",
  writeBundle(_options, bundle) {
    const shell = Object.keys(bundle).sort().map(file => file === "index.html" ? "/" : `/${file}`);
    const build = { cache: `gestio-shell-${Date.now().toString(36)}`, shell };
    const source = readFileSync(new URL("./web/public/sw.js", import.meta.url), "utf8");
    writeFileSync(new URL("./dist/web/sw.js", import.meta.url), `self.GESTIO_BUILD=${JSON.stringify(build)};\n${source}`);
  }
};

export default defineConfig({
  plugins: [serviceWorker],
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
