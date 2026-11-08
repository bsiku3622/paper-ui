export const COLOR_MODES = ["light", "dark"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

export const THEME_PREFERENCES = [...COLOR_MODES, "system"] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export const SURFACE_THEMES = [...COLOR_MODES, "inverse"] as const;
export type SurfaceTheme = (typeof SURFACE_THEMES)[number];

export const THEME_ATTRIBUTE = "data-pui-theme";
export const THEME_SWAP_ATTRIBUTE = "data-pui-theme-swap";
export const COLOR_MODE_QUERY = "(prefers-color-scheme: dark)";
