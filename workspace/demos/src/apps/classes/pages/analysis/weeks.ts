// 시간표 비교 — the rules behind the grid: who is taken for a match of a typed name, and what each period of the week is
// for the students chosen (everybody free, the same class, busy with different classes, or only some of them busy).

import type { TermData } from "../../data/build";
import { DAYS, PERIOD_NUMBERS, slotKey } from "../../data/periods";
import { termIndex, type Placed, type StudentEntry } from "../../lib/index";
import { initials } from "../../lib/search";

// A student with their week as a map from "WED-3" to what they have then.
export type Person = { stuId: string; name: string; at: Map<string, Placed> };

export const personOf = (entry: StudentEntry): Person => ({
  stuId: entry.stuId,
  name: entry.name,
  at: new Map(entry.placed.map((placed) => [slotKey(placed.day, placed.period), placed])),
});

export type Kind = "free" | "common" | "conflict" | "mixed";
export type Busy = { person: Person; placed: Placed };

// free: nobody has a class. common: everybody has the same subject. conflict: everybody is busy, with different subjects.
// mixed: some are busy and some are free.
export const classify = (people: readonly Person[], key: string): { kind: Kind; busy: Busy[] } => {
  const busy: Busy[] = [];
  for (const person of people) {
    const placed = person.at.get(key);
    if (placed) busy.push({ person, placed });
  }
  if (busy.length === 0) return { kind: "free", busy };
  if (busy.length < people.length) return { kind: "mixed", busy };
  return { kind: new Set(busy.map((item) => item.placed.subject)).size === 1 ? "common" : "conflict", busy };
};

// How many periods of the week are of each kind. Nothing to compare with fewer than two people.
export const summarize = (people: readonly Person[]) => {
  const total = { free: 0, common: 0, conflict: 0 };
  if (people.length < 2) return total;
  for (const day of DAYS) {
    for (const period of PERIOD_NUMBERS) {
      const { kind } = classify(people, slotKey(day, period));
      if (kind === "free") total.free += 1;
      else if (kind === "common") total.common += 1;
      else if (kind === "conflict") total.conflict += 1;
    }
  }
  return total;
};

// Up to `limit` students for two or more typed letters: a name or an ID that contains them, or the initials of a name
// (ㅎㅈㅇ). Those that start with the letters come first. Students already chosen are left out.
export const suggest = (data: TermData, query: string, taken: readonly string[], limit = 5): { list: StudentEntry[]; total: number } => {
  const text = query.trim();
  if ([...text].length < 2) return { list: [], total: 0 };
  const lower = text.toLowerCase();
  const chosung = /^[ㄱ-ㅎ]+$/.test(text);
  const hits: { entry: StudentEntry; rank: number }[] = [];
  for (const entry of termIndex(data).students.values()) {
    if (taken.includes(entry.stuId)) continue;
    const matches = entry.name.includes(text) || entry.stuId.includes(lower) || (chosung && initials(entry.name).includes(text));
    if (!matches) continue;
    hits.push({ entry, rank: entry.name.startsWith(text) || entry.stuId.startsWith(lower) ? 0 : 1 });
  }
  hits.sort((a, b) => a.rank - b.rank || a.entry.stuId.localeCompare(b.entry.stuId));
  return { list: hits.slice(0, limit).map((hit) => hit.entry), total: hits.length };
};
