// The locale and the messages a subtree reads. PaperProvider sets them; without a Provider the locale is the
// document's own language, and English where it has none. Paper reads <html lang> and never the browser's language.

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

/** The language <html lang> names, or an empty string; a server render has not read it. */
export const useDocumentLanguage = (): string => useSyncExternalStore(subscribeToLanguage, documentLanguage, serverLanguage);

/** A tag as Intl and React Aria take it: ko_KR reads as ko-KR, and a tag Intl rejects reads as English. */
export const normalizeLocale = (tag: string): string => {
  try {
    return Intl.getCanonicalLocales(tag.replace(/_/g, "-"))[0] ?? FALLBACK;
  } catch {
    return FALLBACK;
  }
};

/** The locale in force: the one given, else the document's language, else English. */
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
