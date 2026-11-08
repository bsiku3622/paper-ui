import { parse, type Parsed } from "../lib/markup";
import { collator, sizeOf } from "../lib/text";
import { SEED_REVS, SEEDS } from "./seeds";
import type { Rev, UserRev } from "./types";

const cache = new Map<string, Parsed>();
export const parsedOf = (text: string): Parsed => {
  let hit = cache.get(text);
  if (!hit) {
    hit = parse(text);
    cache.set(text, hit);
  }
  return hit;
};

export type ArticleInfo = {
  title: string;
  revs: Rev[];
  rev: Rev;
  parsed: Parsed;
  created: number;
  updated: number;
  size: number;
  stars: number;
  redirect: string | null;
  categories: string[];
  links: string[];
  inbound: string[];
};

export type WikiIndex = {
  articles: Map<string, ArticleInfo>;
  titles: string[];
  resolve: (title: string) => string | null;
  wanted: { title: string; from: string[] }[];
  orphans: string[];
  categories: Map<string, string[]>;
  revs: Rev[];
};

const FRONT = "대문";

export const buildIndex = (userRevs: readonly UserRev[]): WikiIndex => {
  const by = new Map<string, Rev[]>();
  for (const [title, revs] of SEED_REVS) by.set(title, [...revs]);
  for (const mine of userRevs) {
    const list = by.get(mine.title) ?? [];
    const last = list[list.length - 1];
    const size = sizeOf(mine.text);
    list.push({
      n: (last?.n ?? 0) + 1,
      title: mine.title,
      text: mine.text,
      at: mine.at,
      author: mine.author,
      summary: mine.summary,
      size,
      delta: size - (last?.size ?? 0),
      minor: mine.minor,
      kind: mine.kind,
      revertOf: mine.revertOf,
    });
    by.set(mine.title, list);
  }

  const stars = new Map(SEEDS.map((seed) => [seed.title, seed.stars]));
  const articles = new Map<string, ArticleInfo>();
  for (const [title, revs] of by) {
    const rev = revs[revs.length - 1]!;
    const parsed = parsedOf(rev.text);
    articles.set(title, {
      title,
      revs,
      rev,
      parsed,
      created: revs[0]!.at,
      updated: rev.at,
      size: rev.size,
      stars: stars.get(title) ?? 0,
      redirect: parsed.redirect,
      categories: parsed.categories,
      links: parsed.links,
      inbound: [],
    });
  }

  const resolve = (title: string): string | null => {
    let current = articles.get(title);
    if (!current) return null;
    for (let hops = 0; hops < 5 && current.redirect; hops++) {
      const next = articles.get(current.redirect);
      if (!next) break;
      current = next;
    }
    return current.title;
  };

  const inbound = new Map<string, Set<string>>();
  const missing = new Map<string, Set<string>>();
  const note = (map: Map<string, Set<string>>, target: string, from: string) => {
    let set = map.get(target);
    if (!set) map.set(target, (set = new Set()));
    set.add(from);
  };
  for (const article of articles.values()) {
    if (article.redirect) continue;
    for (const link of article.links) {
      if (link === article.title) continue;
      if (!articles.has(link)) {
        note(missing, link, article.title);
        continue;
      }
      note(inbound, link, article.title);
      const target = resolve(link);
      if (target && target !== link && target !== article.title) note(inbound, target, article.title);
    }
  }
  for (const article of articles.values()) article.inbound = [...(inbound.get(article.title) ?? [])].sort(collator.compare);

  const categories = new Map<string, string[]>();
  for (const article of articles.values()) {
    if (article.redirect) continue;
    for (const name of article.categories) categories.set(name, [...(categories.get(name) ?? []), article.title]);
  }
  for (const list of categories.values()) list.sort(collator.compare);

  return {
    articles,
    titles: [...articles.keys()].sort(collator.compare),
    resolve,
    wanted: [...missing.entries()]
      .map(([title, from]) => ({ title, from: [...from].sort(collator.compare) }))
      .sort((a, b) => b.from.length - a.from.length || collator.compare(a.title, b.title)),
    orphans: [...articles.values()]
      .filter((article) => !article.redirect && article.inbound.length === 0 && article.title !== FRONT)
      .map((article) => article.title)
      .sort(collator.compare),
    categories,
    revs: [...articles.values()].flatMap((article) => article.revs).sort((a, b) => b.at - a.at || b.n - a.n),
  };
};
