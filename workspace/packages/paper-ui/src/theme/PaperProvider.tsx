// PaperProvider — binds React to the document's theme store.
//
// The only choice a Provider makes is the theme: light, dark or system (follow the OS). It has no state of its
// own and no DOM wrapper: the theme goes onto <html data-pui-theme> in the layout phase, and the Provider hands
// the store's preference and the mode <html> shows down as context. Providers share one store per document,
// and the stylesheet comes in through "@studio-baeks/paper-ui/styles.css", never through here.

import { useEffect, useLayoutEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";

import { isStylesheetLoaded, type ColorMode, type ThemePreference } from "../tokens";
import { ThemeControlContext, type ThemeControl } from "./context";
import { THEME_STORAGE_KEY } from "./engine";
import { getThemeStore } from "./store";

const useIsomorphicLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

// An app that leaves out styles.css sees an unstyled page with no error; say so once in development.
let stylesheetWarned = false;

export type PaperProviderProps = {
  // The theme before the user has chosen. A stored choice wins.
  defaultTheme?: ThemePreference;
  // Where the choice is stored; null keeps it for this page only.
  storageKey?: string | null;
  children?: ReactNode;
};

export const PaperProvider = ({ defaultTheme = "system", storageKey = THEME_STORAGE_KEY, children }: PaperProviderProps) => {
  const store = getThemeStore();
  store.configure({ storageKey, defaultTheme });

  useIsomorphicLayoutEffect(() => store.attach(), [store]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" || stylesheetWarned || isStylesheetLoaded(document.documentElement)) return;
    stylesheetWarned = true;
    console.warn('[paper-ui] The stylesheet is not loaded. Import "@studio-baeks/paper-ui/styles.css" once at the app entry.');
  }, []);

  // A server render has not read <html>: it answers with the default, and light for system.
  const theme = useSyncExternalStore(store.subscribe, store.getPreference, (): ThemePreference => defaultTheme);
  const resolved = useSyncExternalStore(store.subscribe, store.getMode, (): ColorMode => (defaultTheme === "system" ? "light" : defaultTheme));

  const control = useMemo<ThemeControl>(() => ({ theme, resolved, setTheme: store.setPreference }), [theme, resolved, store]);

  return <ThemeControlContext.Provider value={control}>{children}</ThemeControlContext.Provider>;
};
