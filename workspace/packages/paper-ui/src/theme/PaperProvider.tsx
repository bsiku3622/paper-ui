// PaperProvider — binds React to the document's theme store, and says which language the page speaks.
//
// A Provider chooses the theme (light, dark or system, which follows the OS) and, when asked, the locale and the
// words Atoms say. It has no state of its own and no DOM wrapper: the theme goes onto <html data-pui-theme> in the
// layout phase, and the Provider hands the store's preference and the mode <html> shows down as context.
// Providers share one store per document, and the stylesheet comes in through "@studio-baeks/paper-ui/styles.css",
// never through here. <html lang> and <html dir> are written only when a locale is passed; without one the locale
// is whatever <html lang> already says.

import { useContext, useEffect, useLayoutEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";

import { LocaleHost } from "../internal/aria/i18n";
import { localeDirection } from "../internal/direction";
import { LocaleContext, normalizeLocale, resolveLocale, useDocumentLanguage, type LocaleValue } from "../internal/locale";
import type { PaperMessages } from "../internal/messages";
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
  // The language of the page (a BCP 47 tag). Written to <html lang> and <html dir>, and read by Atoms for their words
  // and by React Aria for direction.
  locale?: string;
  // The words Atoms say, key by key over the catalog of the locale's language.
  messages?: Partial<PaperMessages>;
  children?: ReactNode;
};

export const PaperProvider = ({ defaultTheme = "system", storageKey = THEME_STORAGE_KEY, locale, messages, children }: PaperProviderProps) => {
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

  // A Provider inside another keeps what it does not set.
  const outer = useContext(LocaleContext);
  const language = useDocumentLanguage();
  const given = locale ?? outer?.locale;
  const words = useMemo(() => (outer?.messages && messages ? { ...outer.messages, ...messages } : messages ?? outer?.messages), [outer?.messages, messages]);
  const value = useMemo<LocaleValue>(() => ({ locale: given, messages: words }), [given, words]);

  useIsomorphicLayoutEffect(() => {
    if (!locale) return;
    const root = document.documentElement;
    const before = { lang: root.getAttribute("lang"), dir: root.getAttribute("dir") };
    const tag = normalizeLocale(locale);
    root.setAttribute("lang", tag);
    root.setAttribute("dir", localeDirection(tag));
    return () => {
      for (const [name, previous] of Object.entries(before)) {
        if (previous === null) root.removeAttribute(name);
        else root.setAttribute(name, previous);
      }
    };
  }, [locale]);

  return (
    <ThemeControlContext.Provider value={control}>
      <LocaleContext.Provider value={value}>
        <LocaleHost locale={resolveLocale(given, language)}>{children}</LocaleHost>
      </LocaleContext.Provider>
    </ThemeControlContext.Provider>
  );
};
