// What a route tells the shell. A route's `handle` is a SiteHandle; the layout reads the matches from the
// root to the page and the deepest value of each field wins.
//
//   chrome   'site' (default) — the shell draws the header, the main landmark and, with a sidebar, the sidebar.
//            'none' — the page owns its banner and its <main id="main" tabIndex={-1}>; the shell keeps the skip link and the title.
//   sidebar  which navigation stands beside the content.
//   frame    'content' (default) — the page sits in the shell's frame. 'full' — the page draws its own column.
//   title    the page's name (one string, or one per language), or a function of the route params and the language that
//            returns undefined for a name it does not know.

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

// The tab title: "<page> — paper-ui", and the home page is the name alone.
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
