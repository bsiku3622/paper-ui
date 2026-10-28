import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dist mode: the package resolves to its published files (dist/*.js and dist/paper-ui.css) the way an
// installed consumer sees it, so no vanilla-extract runs. The harness and the package share one React.
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
