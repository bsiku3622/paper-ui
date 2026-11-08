import { cleanTitle } from "../lib/markup";
import { hash } from "../lib/text";
import { buildHistory, normalize } from "./history";
import type { Rev, Seed } from "./types";

const files = import.meta.glob("../articles/*.wiki", { query: "?raw", import: "default", eager: true }) as unknown as Record<string, string>;

const REDIRECTS: readonly (readonly [string, string])[] = [
  ["돌담", "돌담시"],
  ["Doldam", "돌담시"],
  ["FDM", "3D 프린터"],
  ["별누리 동아리", "별누리"],
  ["한국어 문자", "한글"],
  ["달리기 대회", "마라톤"],
];

const load = (): Seed[] => {
  const seen = new Map<string, Seed>();
  for (const file of Object.keys(files).sort()) {
    const raw = files[file]!.replace(/\r\n?/g, "\n");
    for (const part of raw.split(/^@@[ \t]+/m).slice(1)) {
      const newline = part.indexOf("\n");
      const title = cleanTitle(newline < 0 ? part : part.slice(0, newline));
      const text = normalize(newline < 0 ? "" : part.slice(newline + 1));
      if (title) seen.set(title, { title, text, stars: 3 + (hash(title) % 150) });
    }
  }
  for (const [from, to] of REDIRECTS) if (!seen.has(from)) seen.set(from, { title: from, text: `#넘겨주기 [[${to}]]`, stars: 1 + (hash(from) % 9) });
  return [...seen.values()];
};

export const SEEDS: readonly Seed[] = load();
export const SEED_REVS: ReadonlyMap<string, Rev[]> = new Map(SEEDS.map((seed) => [seed.title, buildHistory(seed.title, seed.text)]));
