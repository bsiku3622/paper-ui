// The text of a doc, loaded when its page opens: one chunk per doc, bundled with the app.

import { parseDoc } from "./parse";

// The keys are the paths from this file to the docs, so a doc is found by its path under docs/.
const SOURCES = import.meta.glob<string>("@docs/**/*.md", { query: "?raw", import: "default" });

export const loadDocBody = async (file: string): Promise<string> => {
  const load = Object.entries(SOURCES).find(([path]) => path.endsWith(`/docs/${file}`))?.[1];
  if (!load) throw new Error(`no doc file "${file}"`);
  return parseDoc(await load()).body;
};
