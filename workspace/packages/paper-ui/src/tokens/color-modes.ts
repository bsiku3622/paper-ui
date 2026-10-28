// Color modes — the vocabulary of the theme, in the file that imports nothing. The theme engine
// (src/theme) and the theme stylesheets read these names through the barrel, so the attribute a
// scope carries and the mode set it selects are spelled in exactly one place.

// A mode is a complete set of Color roles; the palette behind it never changes.
export const COLOR_MODES = ["light", "dark"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

// What a user can ask for: a mode, or whatever the OS asks for.
export const THEME_PREFERENCES = [...COLOR_MODES, "system"] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

// What a Box can ask for: a mode, or the opposite of the mode around it.
export const BOX_THEMES = [...COLOR_MODES, "inverse"] as const;
export type BoxTheme = (typeof BOX_THEMES)[number];

// <html> carries the root's mode; a Box and a portal scope carry their own below it.
export const THEME_ATTRIBUTE = "data-pui-theme";
// Set on <html> while a swap is applied, so no element transitions between the two modes.
export const THEME_SWAP_ATTRIBUTE = "data-pui-theme-swap";
// With no attribute on <html>, the OS decides — in the stylesheet and in the engine alike.
export const COLOR_MODE_QUERY = "(prefers-color-scheme: dark)";
