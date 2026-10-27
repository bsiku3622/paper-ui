import { defineConfig } from "vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

export default defineConfig({
  plugins: [vanillaExtractPlugin()],
  build: {
    lib: { entry: "src/index.ts", formats: ["es"], fileName: () => "index.js" },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "@react-aria/interactions", "@react-aria/focus", "@react-aria/dnd", "@react-aria/visually-hidden", "@react-aria/utils", "@react-aria/overlays", "@react-stately/overlays"],
      output: { assetFileNames: "paper-ui.css" },
    },
  },
  test: { environment: "jsdom", globals: true },
});
