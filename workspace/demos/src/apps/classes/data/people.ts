import { KOREAN_NAMES, random, shuffle } from "../../../kit";

const split = (name: string): [string, string] => (name.startsWith("남궁") ? ["남궁", name.slice(2)] : [name.slice(0, 1), name.slice(1)]);
const PARTS = KOREAN_NAMES.map(split);
export const SURNAMES = [...new Set(PARTS.map(([surname]) => surname))];
export const GIVEN = [...new Set(PARTS.map(([, given]) => given))];

export const makeNames = (seed: string, count: number, taken: Set<string>): string[] => {
  const r = random(seed);
  const out: string[] = [];
  const surnames = shuffle(r, SURNAMES);
  let guard = 0;
  while (out.length < count && guard++ < 20000) {
    const surname = surnames[Math.floor(r() * surnames.length)]!;
    const given = GIVEN[Math.floor(r() * GIVEN.length)]!;
    const name = surname + given;
    if (taken.has(name)) continue;
    taken.add(name);
    out.push(name);
  }
  return out;
};

export type Student = { stuId: string; name: string };

export const ME: Student = { stuId: "25-307", name: "한지우" };
export const ME_EMAIL = "jiwoo.han@students.example.kr";
