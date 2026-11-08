// Calendar arithmetic on plain "YYYY-MM-DD" keys, done in UTC so a screen reads the same in every time zone. Today is the
// kit's NOW (Seoul time), not the visitor's clock.

import { NOW } from "../../../kit";

const two = (value: number) => String(value).padStart(2, "0");

export const dateKey = (year: number, month: number, day: number) => `${year}-${two(month)}-${two(day)}`;

// "2026-11-04" as Seoul reads NOW.
export const TODAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(NOW);

export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

// A month is "YYYY-MM".
export const monthOf = (key: string) => key.slice(0, 7);

const split = (month: string) => ({ year: Number(month.slice(0, 4)), index: Number(month.slice(5, 7)) - 1 });

export const addMonths = (month: string, delta: number) => {
  const { year, index } = split(month);
  const moved = new Date(Date.UTC(year, index + delta, 1));
  return `${moved.getUTCFullYear()}-${two(moved.getUTCMonth() + 1)}`;
};

export const monthTitle = (month: string) => {
  const { year, index } = split(month);
  return `${year}년 ${index + 1}월`;
};

// The cells of a month's grid, Sunday first: a day of the month, or null for the blanks that fill the weeks.
export const monthCells = (month: string): (number | null)[] => {
  const { year, index } = split(month);
  const first = new Date(Date.UTC(year, index, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, index + 1, 0)).getUTCDate();
  return Array.from({ length: Math.ceil((first + days) / 7) * 7 }, (_, cell) => {
    const day = cell - first + 1;
    return day < 1 || day > days ? null : day;
  });
};

const LONG_DAY = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "long", timeZone: "UTC" });

// "11월 4일 수요일"
export const longDay = (key: string) => LONG_DAY.format(new Date(`${key}T00:00:00Z`));
