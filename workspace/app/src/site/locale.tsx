// The site's language. The site speaks Korean and English: a visitor who has chosen keeps the choice, and one who has not gets
// the browser's language (Korean for Korean, English for everything else). The choice goes to <PaperProvider locale>, which writes
// <html lang> and gives Paper's own words (a dialog's close button, a spinner's label) in the same language.
//
// Words a page says are written side by side, `{ ko: "…", en: "…" }`, next to where they are used: `useWords(WORDS)` picks the
// visitor's. The demo apps and the Arcfield screens are Korean products and stay Korean.

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export const SITE_LOCALES = ["ko", "en"] as const;
export type SiteLocale = (typeof SITE_LOCALES)[number];

// Words in both languages. `Bilingual<string>` is one phrase; any shape works (a list, a function of a count).
export type Bilingual<T = string> = Readonly<Record<SiteLocale, T>>;

export const LOCALE_STORAGE_KEY = "paper-ui-site:locale";

const isLocale = (value: unknown): value is SiteLocale => SITE_LOCALES.includes(value as SiteLocale);

// What the browser asks for, first match wins: a Korean tag anywhere in the list before an English one means Korean.
export const browserLocale = (languages: readonly string[] = typeof navigator === "undefined" ? [] : navigator.languages ?? [navigator.language]): SiteLocale => {
  for (const tag of languages) {
    const base = tag.toLowerCase().split("-")[0];
    if (base === "ko") return "ko";
    if (base === "en") return "en";
  }
  return "en";
};

const stored = (): SiteLocale | null => {
  try {
    const value = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
};

type LocaleState = { locale: SiteLocale; setLocale: (next: SiteLocale) => void };

const LocaleContext = createContext<LocaleState | null>(null);

export const SiteLocaleProvider = ({ children, initial }: { children: ReactNode; initial?: SiteLocale }) => {
  const [locale, setState] = useState<SiteLocale>(() => initial ?? stored() ?? browserLocale());
  const setLocale = useCallback((next: SiteLocale) => {
    setState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // A browser that keeps nothing still switches for this visit.
    }
  }, []);
  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

// Outside a provider (a test that renders one part) the site speaks Korean, the language its sources are written in.
const FALLBACK: LocaleState = { locale: "ko", setLocale: () => {} };

export const useSiteLocale = (): LocaleState => useContext(LocaleContext) ?? FALLBACK;

// Anything written in both languages. The two halves may be literal types of their own (`as const`): what comes back is either.
type Pair = Readonly<Record<SiteLocale, unknown>>;

// The visitor's half of words written in both languages.
export const useWords = <W extends Pair>(words: W): W[SiteLocale] => words[useSiteLocale().locale];

// The same, for a place that is not a component (a table built once, a function called while rendering).
export const pick = <W extends Pair>(words: W, locale: SiteLocale): W[SiteLocale] => words[locale];
