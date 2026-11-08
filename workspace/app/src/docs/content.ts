// The text of a doc, loaded when its page opens: one chunk per doc, bundled with the app.

import type { SiteLocale } from "../site/locale";
import { EN_DOCS_DIR } from "../site/site-core";
import { parseDoc } from "./parse";

// The keys are the paths from this file to the docs, so a doc is found by its path under docs/.
const SOURCES = import.meta.glob<string>("@docs/**/*.md", { query: "?raw", import: "default" });

const sourceOf = (file: string) => Object.entries(SOURCES).find(([path]) => path.endsWith(`/docs/${file}`))?.[1];

// The body of a doc in the language asked for. English comes from its translation in docs/en/ when there is one, and from the
// Korean original otherwise; `translated` says which.
export const loadDocBody = async (file: string, locale: SiteLocale = "ko"): Promise<{ body: string; translated: boolean }> => {
  const english = locale === "en" ? sourceOf(`${EN_DOCS_DIR}/${file}`) : undefined;
  const load = english ?? sourceOf(file);
  if (!load) throw new Error(`no doc file "${file}"`);
  return { body: parseDoc(await load()).body, translated: english !== undefined };
};
