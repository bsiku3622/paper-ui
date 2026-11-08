// 심화필수 전공 트랙: six tracks in three divisions. A student answers once (or says "not yet") and may change it until the
// second semester of the third year.

import { DEPARTMENTS } from "./catalog";

export type Division = { name: string; tracks: readonly string[] };
export const DIVISIONS: readonly Division[] = [
  { name: "수리정보과학부", tracks: ["수학", "정보과학"] },
  { name: "물리지구과학부", tracks: ["물리학", "지구과학"] },
  { name: "화학생물학부", tracks: ["화학", "생물학"] },
];
export const TRACKS = DIVISIONS.flatMap((division) => division.tracks);

export const divisionOf = (track: string | null) => DIVISIONS.find((division) => track !== null && division.tracks.includes(track))?.name ?? null;
export const trackRule = (track: string) => DEPARTMENTS.find((department) => department.name === track)?.track ?? "";

// 서버가 수강 이력으로 짐작한 트랙. A guess, shown as 추천 with the courses it came from; never chosen for the student.
export type Suggestion = { track: string; because: readonly string[] };
