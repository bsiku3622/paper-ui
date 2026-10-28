import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

import pkg from "./package.json" with { type: "json" };
import { buildTargets } from "../../scripts/browser-baseline.mjs";

// The runtime dependencies stay outside the bundle, subpaths included; package.json is their only list.
const runtime = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies)];

// JS and CSS are lowered only as far as the declared browser floor (package.json "browserslist").
const target = buildTargets(pkg.browserslist);

// dist/paper-ui.css opens with the layer statement of tokens/layers.css.ts, then keeps the order in which
// global.css.ts brings in the global styles (variables → theme → typography → utility → color), with the component
// styles after them. Rollup runs entries sorted by module id, so src/index.ts would run first and pull typography.css
// ahead of theme.css. The styles entry is therefore wrapped in a virtual module whose "\0" id sorts first, and
// the layer module, the variables module and src/styles share one chunk, whose CSS keeps that execution order.
const STYLES_ENTRY = "\0paper-ui-styles";
const globalStylesheet = fileURLToPath(new URL("src/styles/global.css.ts", import.meta.url));
const layerModule = fileURLToPath(new URL("src/tokens/layers.css.ts", import.meta.url));
const variablesModule = fileURLToPath(new URL("src/tokens/variables.css.ts", import.meta.url));
const stylesDir = fileURLToPath(new URL("src/styles/", import.meta.url));

const stylesEntryFirst = (): Plugin => ({
  name: "paper-ui:styles-entry-first",
  apply: "build",
  enforce: "pre",
  resolveId: (source, _importer, { isEntry }) => (isEntry && source === globalStylesheet ? STYLES_ENTRY : null),
  load: (id) => (id === STYLES_ENTRY ? `import ${JSON.stringify(globalStylesheet)};` : null),
});

export default defineConfig({
  plugins: [stylesEntryFirst(), vanillaExtractPlugin()],
  build: {
    target,
    cssTarget: target,
    lib: {
      // styles carries the global stylesheet into dist/paper-ui.css only; its JS is not exported.
      entry: { styles: "src/styles/global.css.ts", index: "src/index.ts", tokens: "src/tokens/public.ts" },
      formats: ["es"],
      fileName: (_, name) => `${name}.js`,
      cssFileName: "paper-ui",
    },
    rollupOptions: {
      external: (id) => runtime.some((dep) => id === dep || id.startsWith(`${dep}/`)),
      output: {
        banner: (chunk) => (chunk.isEntry && chunk.name === "index" ? '"use client";' : ""),
        chunkFileNames: "chunks/[name]-[hash].js",
        manualChunks: (id) => (id.startsWith(stylesDir) || id.startsWith(layerModule) || id.startsWith(variablesModule) ? "global" : undefined),
      },
    },
  },
  test: { environment: "jsdom", globals: true },
});
