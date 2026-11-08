// The rules for reading a timetable. Four places draw a day (the hero, the ruler, today's list, the week grid) and all
// four must answer the same questions the same way, so the questions live here and nowhere else.

import type { BreakTime, PeriodTime } from "../data/periods";

// A gap between two periods shorter than this is a break between classes; a longer one is lunch or dinner.
export const BREAK_MINUTES = 20;

type ClassLike = { subject: string; section: string; room: string };

// Never judge by period numbers: 4교시 and 5교시 are neighbours with a 70-minute lunch between them.
export const isBreakGap = (previousEnd: number, nextStart: number) => nextStart - previousEnd <= BREAK_MINUTES;

// The same subject, section and room — a change of room means a walk, so it is not one class.
export const isSameClass = (a: ClassLike, b: ClassLike) => a.subject === b.subject && a.section === b.section && a.room === b.room;

export const continuesClass = (
  previous: { klass: ClassLike; period: number; end: number },
  next: { klass: ClassLike; period: number; start: number },
) => isSameClass(previous.klass, next.klass) && previous.period + 1 === next.period && isBreakGap(previous.end, next.start);

// The name of a hole between two periods: the break that overlaps it most (lunch and 학급모임 both touch the midday gap).
export const gapName = (from: number, to: number, breaks: readonly BreakTime[]) => {
  let name = "";
  let longest = 0;
  for (const item of breaks) {
    const overlap = Math.min(to, item.end) - Math.max(from, item.start);
    if (overlap > longest) {
      longest = overlap;
      name = item.name;
    }
  }
  return name;
};

export type Hole = { from: number; to: number; name: string; after: number };
// The holes between consecutive periods that are longer than a break, with their names.
export const holes = (periods: readonly PeriodTime[], breaks: readonly BreakTime[]): Hole[] => {
  const out: Hole[] = [];
  for (let index = 1; index < periods.length; index++) {
    const before = periods[index - 1]!;
    const here = periods[index]!;
    if (!isBreakGap(before.end, here.start)) out.push({ from: before.end, to: here.start, name: gapName(before.end, here.start, breaks), after: before.period });
  }
  return out;
};
