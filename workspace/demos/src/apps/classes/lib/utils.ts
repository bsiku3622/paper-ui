// Small helpers the pages share: names, section numbers, the way times are written.

import { DAYS, DAY_LABEL } from "../data/periods";

// 학년 색 대신 쓰는 이름: 25학번 → "25".
export const cohortOf = (stuId: string) => stuId.split("-")[0] ?? "";

export const sectionNumber = (section: string) => section.match(/\d+/)?.[0] ?? section;

// "화2, 수3,4" — days in order, periods joined by commas.
export const formatTimes = (times: readonly { day: string; period: number }[]) => {
  const byDay = new Map<string, number[]>();
  for (const time of times) byDay.set(time.day, [...(byDay.get(time.day) ?? []), time.period]);
  return DAYS.filter((day) => byDay.has(day))
    .map((day) => `${DAY_LABEL[day]}${[...byDay.get(day)!].sort((a, b) => a - b).join(",")}`)
    .join(", ");
};

// "월67 목9" for a post that asks for a swap.
export const compactTimes = (times: readonly { day: string; period: number }[]) => {
  const byDay = new Map<string, number[]>();
  for (const time of times) byDay.set(time.day, [...(byDay.get(time.day) ?? []), time.period]);
  return DAYS.filter((day) => byDay.has(day))
    .map((day) => {
      const periods = [...byDay.get(day)!].sort((a, b) => a - b);
      return `${DAY_LABEL[day]}${periods.some((period) => period >= 10) ? periods.join(",") : periods.join("")}`;
    })
    .join(" ");
};

// [5, 6, 9] → "5–6, 9교시"
export const periodRuns = (periods: readonly number[]) => {
  const runs: number[][] = [];
  for (const period of [...periods].sort((a, b) => a - b)) {
    const last = runs[runs.length - 1];
    if (last && period === last[last.length - 1]! + 1) last.push(period);
    else runs.push([period]);
  }
  return `${runs.map((run) => (run.length > 1 ? `${run[0]}–${run[run.length - 1]}` : `${run[0]}`)).join(", ")}교시`;
};

// 250 → "4시간 10분"
export const duration = (minutes: number) => {
  if (minutes < 60) return `${minutes}분`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`;
};

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];
export const weekdayOf = (key: string) => {
  const [year, month, day] = key.split("-").map(Number) as [number, number, number];
  return WEEKDAY[new Date(year, month - 1, day).getDay()]!;
};
// "2026-11-04" → "2026년 11월 4일 수요일"
export const dateLabel = (key: string) => {
  const [year, month, day] = key.split("-").map(Number) as [number, number, number];
  return `${year}년 ${month}월 ${day}일 ${weekdayOf(key)}요일`;
};

// "…(English)" and other lower-case brackets are English glosses; (EC) stays.
export const koreanName = (subject: string) => subject.replace(/\([^()]*[a-z][^()]*\)/g, "").trim();

// A word before 로/으로.
export const particleRo = (word: string) => {
  const code = word.trim().slice(-1).charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const final = (code - 0xac00) % 28;
    return final === 0 || final === 8 ? "로" : "으로";
  }
  return "으로";
};
