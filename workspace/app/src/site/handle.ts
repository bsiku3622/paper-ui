import { useEffect } from "react";
import { useMatches, type Params, type UIMatch } from "react-router-dom";

import { useSiteLocale, type Bilingual, type SiteLocale } from "./locale";

export type SiteHandle = {
  title?: string | Bilingual | ((params: Params, locale: SiteLocale) => string | undefined);
  chrome?: "site" | "none";
  sidebar?: "docs" | "playground";
  frame?: "content" | "full";
};

export type ResolvedHandle = { title: string | undefined; chrome: "site" | "none"; sidebar: SiteHandle["sidebar"]; frame: "content" | "full" };

export const SITE_NAME = "paper-ui";

export const documentTitle = (title: string | undefined): string => (title ? `${title} — ${SITE_NAME}` : SITE_NAME);

const titleIn = (title: SiteHandle["title"], params: Params, locale: SiteLocale): string | undefined =>
  typeof title === "function" ? title(params, locale) : typeof title === "object" ? title[locale] : title;

export const resolveHandle = (matches: readonly Pick<UIMatch<unknown, unknown>, "handle" | "params">[], locale: SiteLocale = "ko"): ResolvedHandle => {
  const resolved: ResolvedHandle = { title: undefined, chrome: "site", sidebar: undefined, frame: "content" };
  for (const { handle, params } of matches) {
    const own = (handle ?? {}) as SiteHandle;
    const title = titleIn(own.title, params, locale);
    if (title !== undefined) resolved.title = title;
    if (own.chrome) resolved.chrome = own.chrome;
    if (own.sidebar) resolved.sidebar = own.sidebar;
    if (own.frame) resolved.frame = own.frame;
  }
  return resolved;
};

export const useSiteHandle = (): ResolvedHandle => resolveHandle(useMatches(), useSiteLocale().locale);

export const useDocumentTitle = (title: string | undefined): void => {
  useEffect(() => {
    document.title = documentTitle(title);
  }, [title]);
};
