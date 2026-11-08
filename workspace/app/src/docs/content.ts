import type { SiteLocale } from "../site/locale";
import { EN_DOCS_DIR } from "../site/site-core";
import { parseDoc } from "./parse";

const SOURCES = import.meta.glob<string>("@docs/**/*.md", { query: "?raw", import: "default" });

const sourceOf = (file: string) => Object.entries(SOURCES).find(([path]) => path.endsWith(`/docs/${file}`))?.[1];

export const loadDocBody = async (file: string, locale: SiteLocale = "ko"): Promise<{ body: string; translated: boolean }> => {
  const english = locale === "en" ? sourceOf(`${EN_DOCS_DIR}/${file}`) : undefined;
  const load = english ?? sourceOf(file);
  if (!load) throw new Error(`no doc file "${file}"`);
  return { body: parseDoc(await load()).body, translated: english !== undefined };
};
