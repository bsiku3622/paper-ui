import { defaultClientConditions, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

// Source mode, for the workspace e2e: @studio-baeks/paper-ui resolves through its "paper-ui-source" export
// condition, as in the app, so vanilla-extract compiles the package's .css.ts and styles.css is
// src/styles/global.css.ts. The harness itself imports the package only through its exports.
export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  resolve: {
    conditions: ["paper-ui-source", ...defaultClientConditions],
  },
});
