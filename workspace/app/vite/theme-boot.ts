import type { Plugin } from "vite";

// Read by path: this config runs outside Vite's resolver, so the "paper-ui-source" condition does not apply.
import { THEME_STORAGE_KEY, themeBootScript } from "../../packages/paper-ui/src/theme/boot";

// src/theme.ts holds the options the Provider gets; theme.test.ts checks the two agree.
export const themeBoot = (): Plugin => ({
  name: "paper-theme-boot",
  transformIndexHtml: () => [{ tag: "script", children: themeBootScript({ defaultTheme: "system", storageKey: THEME_STORAGE_KEY }), injectTo: "head-prepend" }],
});
