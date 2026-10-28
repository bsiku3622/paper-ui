import type { Plugin } from "vite";

// The config runs outside Vite's resolver, so it reads the package source by path: the "paper-ui-source"
// export condition does not apply to it.
import { THEME_STORAGE_KEY, themeBootScript } from "../../packages/paper-ui/src/theme/boot";

// Puts the theme boot script first in <head>, so the stored or OS theme is on <html> before the first paint.
// src/theme.ts holds the options the Provider gets; theme.test.ts checks the two agree.
export const themeBoot = (): Plugin => ({
  name: "paper-theme-boot",
  transformIndexHtml: () => [{ tag: "script", children: themeBootScript({ defaultTheme: "system", storageKey: THEME_STORAGE_KEY }), injectTo: "head-prepend" }],
});
