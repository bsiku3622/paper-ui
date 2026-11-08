import type { Hours, TermKey, ZamongMap } from "../lib/curriculum";
import { courseOf } from "./catalog";

type Row = readonly [course: string, term: TermKey, grade: string | null];

const HISTORY: readonly Row[] = [
  ["국어1", "1", null], ["수학1", "1", null], ["영어Ⅰ", "1", null], ["정보과학1", "1", null], ["물리학및실험1", "1", null], ["미술", "1", "A0"], ["체육1", "1", "A+"],
  ["국어2", "2", null], ["수학2", "2", null], ["영어Ⅱ", "2", null], ["정보과학2", "2", null], ["화학및실험", "2", null], ["한국사의이해", "2", null], ["음악", "2", "A-"], ["체육2", "2", "A0"],
  ["생물학및실험", "S", null],
  ["미적분학1", "3", "B+"], ["논리와글쓰기", "3", "A-"], ["영어Ⅲ", "3", "B0"], ["정치와경제", "3", "A0"], ["철학", "3", "A+"], ["체육3", "3", "A+"], ["자료구조", "3", "B+"], ["프로그래밍과문제해결(EC)", "3", "A0"],
];

export const SEED_HOURS: Hours = { selfDev: 36, collab: 28, global: 14 };

export const buildSeed = (current: readonly { subject: string; isEc: boolean }[], slot: TermKey): ZamongMap => {
  const entries: ZamongMap = {};
  for (const [course, term, grade] of HISTORY) entries[course] = { term, grade, ec: false };
  for (const item of current) {
    const course = courseOf(item.subject) ?? courseOf(item.subject.replace(/\(EC\)$/, ""));
    if (course) entries[course.name] = { term: slot, grade: null, ec: item.isEc };
  }
  return entries;
};
