// search.ts — finds articles by title, category and text, best first, with the sentence a word was found in.

import type { WikiIndex } from "./index";

export type Hit = { title: string; score: number; snippet: string | null; inTitle: boolean };

const squash = (text: string) => text.replace(/\s+/g, " ").trim();

const snippetAt = (plain: string, at: number, length: number) => {
  const from = Math.max(0, at - 40);
  const cut = plain.slice(from, at + length + 100);
  const text = squash(cut);
  return `${from > 0 ? "… " : ""}${text}${at + length + 100 < plain.length ? " …" : ""}`;
};

// A few words around the first place a word is found in a plain text; null when it is not there.
export const snippetOf = (plain: string, needle: string) => {
  const at = plain.toLowerCase().indexOf(needle.toLowerCase());
  return at < 0 ? null : snippetAt(plain, at, needle.length);
};

export const search = (index: WikiIndex, query: string): Hit[] => {
  const q = squash(query).toLowerCase();
  if (!q) return [];
  const words = q.split(" ");
  const hits: Hit[] = [];
  for (const article of index.articles.values()) {
    if (article.redirect) continue;
    const title = article.title.toLowerCase();
    let score = 0;
    if (title === q) score += 1000;
    else if (title.startsWith(q)) score += 600;
    else if (title.includes(q)) score += 400;
    else if (words.length > 1 && words.every((word) => title.includes(word))) score += 250;
    // Of two titles that contain the words, the shorter one is the closer.
    if (score >= 250 && title !== q) score += Math.max(0, 60 - (title.length - q.length) * 6);
    if (article.categories.some((name) => name.toLowerCase().includes(q))) score += 80;

    const plain = article.parsed.plain.toLowerCase();
    let at = plain.indexOf(q);
    let length = q.length;
    let found = at >= 0 ? plain.split(q).length - 1 : 0;
    if (found === 0 && words.length > 1 && words.every((word) => plain.includes(word))) {
      at = plain.indexOf(words[0]!);
      length = words[0]!.length;
      found = 1;
    }
    score += Math.min(found, 12) * 8;
    if (score === 0) continue;
    hits.push({ title: article.title, score, snippet: at >= 0 ? snippetAt(article.parsed.plain, at, length) : null, inTitle: score >= 250 });
  }
  return hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "ko"));
};

// Titles that start with or contain what was typed: for the “바로가기” and for suggestions.
export const suggest = (index: WikiIndex, query: string, limit = 8) => {
  const q = squash(query).toLowerCase();
  if (!q) return [];
  const starts: string[] = [];
  const contains: string[] = [];
  for (const title of index.titles) {
    const lower = title.toLowerCase();
    if (lower.startsWith(q)) starts.push(title);
    else if (lower.includes(q)) contains.push(title);
  }
  return [...starts, ...contains].slice(0, limit);
};
