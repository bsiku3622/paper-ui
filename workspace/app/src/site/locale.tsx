import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export const SITE_LOCALES = ["ko", "en"] as const;
export type SiteLocale = (typeof SITE_LOCALES)[number];

export type Bilingual<T = string> = Readonly<Record<SiteLocale, T>>;

export const LOCALE_STORAGE_KEY = "paper-ui-site:locale";

const isLocale = (value: unknown): value is SiteLocale => SITE_LOCALES.includes(value as SiteLocale);

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
    }
  }, []);
  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

const FALLBACK: LocaleState = { locale: "ko", setLocale: () => {} };

export const useSiteLocale = (): LocaleState => useContext(LocaleContext) ?? FALLBACK;

type Pair = Readonly<Record<SiteLocale, unknown>>;

export const useWords = <W extends Pair>(words: W): W[SiteLocale] => words[useSiteLocale().locale];

export const pick = <W extends Pair>(words: W, locale: SiteLocale): W[SiteLocale] => words[locale];
