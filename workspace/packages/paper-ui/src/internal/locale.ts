import { createContext, useContext, useMemo, useSyncExternalStore } from "react";

import { resolveMessages, type PaperMessages } from "./messages";

export type LocaleValue = {
  locale: string | undefined;
  messages: Partial<PaperMessages> | undefined;
};
export const LocaleContext = createContext<LocaleValue | null>(null);

const FALLBACK = "en";

const subscribeToLanguage = (notify: () => void): (() => void) => {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  return () => observer.disconnect();
};
const documentLanguage = (): string => document.documentElement.lang;
const serverLanguage = (): string => "";

export const useDocumentLanguage = (): string => useSyncExternalStore(subscribeToLanguage, documentLanguage, serverLanguage);

export const normalizeLocale = (tag: string): string => {
  try {
    return Intl.getCanonicalLocales(tag.replace(/_/g, "-"))[0] ?? FALLBACK;
  } catch {
    return FALLBACK;
  }
};

export const resolveLocale = (given: string | undefined, language: string): string => normalizeLocale(given || language || FALLBACK);

export function useLocale(): string {
  const context = useContext(LocaleContext);
  return resolveLocale(context?.locale, useDocumentLanguage());
}

export function useMessages(): PaperMessages {
  const context = useContext(LocaleContext);
  const locale = useLocale();
  const overrides = context?.messages;
  return useMemo(() => resolveMessages(locale, overrides), [locale, overrides]);
}
