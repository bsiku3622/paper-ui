import { fileURLToPath } from "node:url";
import { defaultClientConditions, defaultServerConditions, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

import { THEME_STORAGE_KEY, themeBootScript } from "../packages/paper-ui/src/theme/boot";

const workspace = fileURLToPath(new URL("..", import.meta.url));

const themeBoot = () => ({
  name: "paper-theme-boot",
  transformIndexHtml: () => [{ tag: "script", children: themeBootScript({ defaultTheme: "system", storageKey: THEME_STORAGE_KEY }), injectTo: "head-prepend" as const }],
});

export default defineConfig({
  base: "/demos/",
  plugins: [react(), vanillaExtractPlugin(), themeBoot()],
  resolve: { conditions: ["paper-ui-source", ...defaultClientConditions], dedupe: ["react", "react-dom", "react-router-dom"] },
  environments: { ssr: { resolve: { conditions: ["paper-ui-source", ...defaultServerConditions] } } },
  server: { port: 5310, strictPort: true, fs: { allow: [workspace] } },
  build: {
    outDir: fileURLToPath(new URL("../app/dist/demos", import.meta.url)),
    emptyOutDir: true,
    rollupOptions: { output: { manualChunks: { react: ["react", "react-dom", "react-router-dom"] } } },
  },
});
