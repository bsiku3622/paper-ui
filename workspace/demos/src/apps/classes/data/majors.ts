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

export type Suggestion = { track: string; because: readonly string[] };
