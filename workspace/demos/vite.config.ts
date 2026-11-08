import { fileURLToPath } from "node:url";
import { defaultClientConditions, defaultServerConditions, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

// The config runs outside Vite's resolver, so it reads the package source by path, as the site's own config does.
import { THEME_STORAGE_KEY, themeBootScript } from "../packages/paper-ui/src/theme/boot";

const workspace = fileURLToPath(new URL("..", import.meta.url));

// The boot script puts the stored or OS theme on <html> before the first paint (theming.md, "Vite"). The demos share the site's
// origin and its storage key, so a demo opens in the theme the visitor chose on the site.
const themeBoot = () => ({
  name: "paper-theme-boot",
  transformIndexHtml: () => [{ tag: "script", children: themeBootScript({ defaultTheme: "system", storageKey: THEME_STORAGE_KEY }), injectTo: "head-prepend" as const }],
});

// The demos are served under /demos/ next to the site, in development through the site's proxy and in production from the site's
// own dist (app/dist/demos), so the site and the demos deploy as one. Like the site, they read Paper from its source.
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
