import { useContext, useEffect, useInsertionEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from "react";

import { LocaleHost } from "../internal/aria/i18n";
import { localeDirection } from "../internal/direction";
import { LocaleContext, normalizeLocale, resolveLocale, useDocumentLanguage, type LocaleValue } from "../internal/locale";
import type { PaperMessages } from "../internal/messages";
import { isStylesheetLoaded, overridesRule, type ColorMode, type ThemeOverrides, type ThemePreference } from "../tokens";
import { ThemeControlContext, type ThemeControl } from "./context";
import { THEME_STORAGE_KEY } from "./engine";
import { warnUnknownSourceVariables } from "./source-check";
import { getThemeStore } from "./store";

const useIsomorphicLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

let stylesheetWarned = false;
let sourcesChecked = false;

export type PaperProviderProps = ThemeOverrides & {
  defaultTheme?: ThemePreference;
  storageKey?: string | null;
  locale?: string;
  messages?: Partial<PaperMessages>;
  children?: ReactNode;
};

// Effects run from the inside out and each goes to the front of <head>, so an inner Provider's rule comes later and wins.
const useOverridesRule = (rule: string) => {
  const element = useRef<HTMLStyleElement | null>(null);
  useInsertionEffect(() => {
    if (!rule) return;
    const style = document.createElement("style");
    style.setAttribute("data-pui-overrides", "");
    document.head.prepend(style);
    element.current = style;
    return () => {
      style.remove();
      element.current = null;
    };
  }, [Boolean(rule)]);
  useInsertionEffect(() => {
    if (element.current) element.current.textContent = rule;
  }, [rule]);
};

export const PaperProvider = ({ defaultTheme = "system", storageKey = THEME_STORAGE_KEY, locale, messages, children, ...overrides }: PaperProviderProps) => {
  const store = getThemeStore();
  store.configure({ storageKey, defaultTheme });

  useOverridesRule(overridesRule(overrides));

  useIsomorphicLayoutEffect(() => store.attach(), [store]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" || stylesheetWarned || isStylesheetLoaded(document.documentElement)) return;
    stylesheetWarned = true;
    console.warn('[paper-ui] The stylesheet is not loaded. Import "@studio-baeks/paper-ui/styles.css" once at the app entry.');
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" || sourcesChecked) return;
    sourcesChecked = true;
    warnUnknownSourceVariables(document);
  }, []);

  const theme = useSyncExternalStore(store.subscribe, store.getPreference, (): ThemePreference => defaultTheme);
  const resolved = useSyncExternalStore(store.subscribe, store.getMode, (): ColorMode => (defaultTheme === "system" ? "light" : defaultTheme));

  const control = useMemo<ThemeControl>(() => ({ theme, resolved, setTheme: store.setPreference }), [theme, resolved, store]);

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
