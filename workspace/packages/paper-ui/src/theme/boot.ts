// boot.ts — the entry `@studio-baeks/paper-ui/theme-boot`: the script that applies the theme before first
// paint. It imports no React and no CSS, so a build tool or a server can load it on its own.

export { THEME_ATTRIBUTE } from "../tokens";
export { THEME_STORAGE_KEY, themeBootScript, type ThemeBootOptions } from "./engine";
