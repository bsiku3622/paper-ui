import { THEME_STORAGE_KEY } from "@studio-baeks/paper-ui/theme-boot";

// The theme settings the app gives <PaperProvider>. The boot script in index.html (vite/theme-boot.ts)
// reads the same key, so the stored choice applies before first paint; theme.test.ts holds the two together.
export const THEME = { defaultTheme: "system", storageKey: THEME_STORAGE_KEY } as const;
