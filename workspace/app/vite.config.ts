/// <reference types="vitest/config" />
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defaultClientConditions, defaultServerConditions, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

import { DOC_GROUPS } from "./src/site/site-core";
import { paperDocs } from "./vite/paper-docs";
import { themeBoot } from "./vite/theme-boot";

const workspace = fileURLToPath(new URL("..", import.meta.url));
const docs = fileURLToPath(new URL("../../docs", import.meta.url));
const inspect = fileURLToPath(new URL("../packages/paper-ui/src/tokens/inspect/", import.meta.url));
const DEMOS_PORT = 5310;
const { version } = JSON.parse(readFileSync(new URL("../packages/paper-ui/package.json", import.meta.url), "utf-8")) as { version: string };

export default defineConfig({
  define: { __PAPER_UI_VERSION__: JSON.stringify(version) },
  plugins: [
    react(),
    vanillaExtractPlugin(),
    paperDocs({ dir: docs, groups: DOC_GROUPS }),
    themeBoot(),
  ],
  resolve: {
    alias: [
      { find: "@docs", replacement: docs },
      { find: /^@paper-ui\/inspect\/(.+)$/, replacement: `${inspect}$1.ts` },
    ],
    conditions: ["paper-ui-source", ...defaultClientConditions],
  },
  // The source condition is needed here too, since a clean checkout has no dist.
  // It is set on the environment because the vanilla-extract compiler replaces `ssr`.
  environments: { ssr: { resolve: { conditions: ["paper-ui-source", ...defaultServerConditions] } } },
  server: { fs: { allow: [workspace, docs] }, proxy: { "/demos": { target: `http://localhost:${DEMOS_PORT}`, changeOrigin: false } } },
  test: { environment: "jsdom", globals: true },
});
