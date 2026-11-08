import type { BreakTime, PeriodTime } from "../data/periods";

export const BREAK_MINUTES = 20;

type ClassLike = { subject: string; section: string; room: string };

export const isBreakGap = (previousEnd: number, nextStart: number) => nextStart - previousEnd <= BREAK_MINUTES;

export const isSameClass = (a: ClassLike, b: ClassLike) => a.subject === b.subject && a.section === b.section && a.room === b.room;

export const continuesClass = (
  previous: { klass: ClassLike; period: number; end: number },
  next: { klass: ClassLike; period: number; start: number },
) => isSameClass(previous.klass, next.klass) && previous.period + 1 === next.period && isBreakGap(previous.end, next.start);

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
export const holes = (periods: readonly PeriodTime[], breaks: readonly BreakTime[]): Hole[] => {
  const out: Hole[] = [];
  for (let index = 1; index < periods.length; index++) {
    const before = periods[index - 1]!;
    const here = periods[index]!;
    if (!isBreakGap(before.end, here.start)) out.push({ from: before.end, to: here.start, name: gapName(before.end, here.start, breaks), after: before.period });
  }
  return out;
};
