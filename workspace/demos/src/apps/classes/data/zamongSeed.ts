// The demo account's invented study history, offered once to a 자몽 that is still empty ("밑칠"): semesters 1–3 and one summer term
// with grades, and the 4th from this term's timetable. Every name is a course of the catalogue; the grades are made up. A P/F
// course has no grade to write (the first year is mostly P/F), and the 4th semester has none yet.

import type { Hours, TermKey, ZamongMap } from "../lib/curriculum";
import { courseOf } from "./catalog";

type Row = readonly [course: string, term: TermKey, grade: string | null];

const HISTORY: readonly Row[] = [
  // 1학기
  ["국어1", "1", null], ["수학1", "1", null], ["영어Ⅰ", "1", null], ["정보과학1", "1", null], ["물리학및실험1", "1", null], ["미술", "1", "A0"], ["체육1", "1", "A+"],
  // 2학기
  ["국어2", "2", null], ["수학2", "2", null], ["영어Ⅱ", "2", null], ["정보과학2", "2", null], ["화학및실험", "2", null], ["한국사의이해", "2", null], ["음악", "2", "A-"], ["체육2", "2", "A0"],
  // 여름 계절학기
  ["생물학및실험", "S", null],
  // 3학기
  ["미적분학1", "3", "B+"], ["논리와글쓰기", "3", "A-"], ["영어Ⅲ", "3", "B0"], ["정치와경제", "3", "A0"], ["철학", "3", "A+"], ["체육3", "3", "A+"], ["자료구조", "3", "B+"], ["프로그래밍과문제해결(EC)", "3", "A0"],
];

// 시수 is typed by the person; the demo account has some already.
export const SEED_HOURS: Hours = { selfDev: 36, collab: 28, global: 14 };

// `current` is what the account takes now (a subject of the term, and whether it is the English class), put in `slot`.
export const buildSeed = (current: readonly { subject: string; isEc: boolean }[], slot: TermKey): ZamongMap => {
  const entries: ZamongMap = {};
  for (const [course, term, grade] of HISTORY) entries[course] = { term, grade, ec: false };
  for (const item of current) {
    const course = courseOf(item.subject) ?? courseOf(item.subject.replace(/\(EC\)$/, ""));
    if (course) entries[course.name] = { term: slot, grade: null, ec: item.isEc };
  }
  return entries;
};
