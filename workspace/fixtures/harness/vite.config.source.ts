import { defaultClientConditions, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  resolve: {
    conditions: ["paper-ui-source", ...defaultClientConditions],
  },
});
