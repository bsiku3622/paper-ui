// The school day: eleven periods and the named stretches between them (meals, self study). Minutes from midnight.
// 9교시 ends at 18:30 and 10교시 begins at 19:30; 저녁 and 자습 overlap the periods rather than replacing them.

export const DAYS = ["MON", "TUE", "WED", "THU", "FRI"] as const;
export type Day = (typeof DAYS)[number];
export const DAY_LABEL: Record<Day, string> = { MON: "월", TUE: "화", WED: "수", THU: "목", FRI: "금" };
export const DAY_FULL: Record<Day, string> = { MON: "월요일", TUE: "화요일", WED: "수요일", THU: "목요일", FRI: "금요일" };

export type PeriodTime = { period: number; start: number; end: number };
export type BreakTime = { name: string; start: number; end: number };

const at = (hour: number, minute: number) => hour * 60 + minute;
const series = (first: number, count: number, from: number): PeriodTime[] =>
  Array.from({ length: count }, (_, index) => ({ period: from + index, start: first + index * 60, end: first + index * 60 + 50 }));

export const PERIODS: readonly PeriodTime[] = [...series(at(8, 40), 4, 1), ...series(at(13, 40), 5, 5), ...series(at(19, 30), 2, 10)];

export const BREAKS: readonly BreakTime[] = [
  { name: "아침식사", start: at(7, 10), end: at(8, 30) },
  { name: "점심", start: at(12, 30), end: at(13, 10) },
  { name: "학급모임", start: at(13, 20), end: at(13, 30) },
  { name: "저녁", start: at(17, 30), end: at(19, 0) },
  { name: "자습", start: at(19, 30), end: at(21, 30) },
  { name: "입실", start: at(21, 30), end: at(23, 20) },
];

export const PERIOD_NUMBERS = PERIODS.map((item) => item.period);
export const periodTime = (period: number) => PERIODS.find((item) => item.period === period);

export const hhmm = (minute: number) => `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;

export const slotKey = (day: string, period: number) => `${day}-${period}`;
