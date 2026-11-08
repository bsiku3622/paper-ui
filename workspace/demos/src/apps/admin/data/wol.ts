// Wake-on-LAN: three invented machines behind the VPN. The desktop is asleep when the hub opens so a wake can be watched;
// the other two are already on. A woken machine answers after a few seconds and goes back to sleep after five minutes.

import { DAY, HOUR, MINUTE, SECOND, before, now } from "../lib/clock";
import { makeId } from "../lib/fake";
import type { WakeRecord, WakeResult, WolDevice } from "./types";

export const COOLDOWN = 30 * SECOND;
export const AWAKE_FOR = 5 * MINUTE;

type History = { age: number; result: WakeResult; seconds: number | null; by?: string };

const record = (device: string, index: number, entry: History): WakeRecord => ({
  id: `${device}:w${index}`,
  at: before(entry.age),
  by: entry.by ?? "관리자",
  result: entry.result,
  bootsAt: null,
  seconds: entry.seconds,
});

const DESKTOP: readonly History[] = [
  { age: 2 * DAY + 5 * HOUR, result: "응답 확인", seconds: 11 },
  { age: 4 * DAY + 2 * HOUR, result: "응답 확인", seconds: 9 },
  { age: 6 * DAY + 11 * HOUR, result: "응답 확인", seconds: 12 },
  { age: 7 * DAY + 3 * HOUR - 2 * MINUTE, result: "응답 확인", seconds: 10 },
  { age: 7 * DAY + 3 * HOUR, result: "응답 없음", seconds: null },
  { age: 11 * DAY, result: "응답 확인", seconds: 9 },
  { age: 13 * DAY + 6 * HOUR, result: "이미 켜져 있음", seconds: null },
  { age: 16 * DAY, result: "응답 확인", seconds: 14 },
  { age: 21 * DAY + 4 * HOUR, result: "응답 확인", seconds: 10 },
  { age: 26 * DAY + 9 * HOUR, result: "응답 확인", seconds: 11 },
];

const MINI: readonly History[] = [
  { age: 9 * DAY, result: "이미 켜져 있음", seconds: null },
  { age: 19 * DAY + 3 * HOUR, result: "응답 확인", seconds: 18 },
  { age: 24 * DAY, result: "응답 확인", seconds: 17 },
];

const NAS: readonly History[] = [
  { age: 5 * DAY, result: "이미 켜져 있음", seconds: null },
  { age: 14 * DAY + 8 * HOUR, result: "응답 확인", seconds: 31 },
];

const build = (id: string, base: Omit<WolDevice, "id" | "bootsAt" | "awakeUntil" | "lastSentAt" | "cooldownUntil" | "history">, history: readonly History[]): WolDevice => ({
  id,
  ...base,
  bootsAt: null,
  awakeUntil: null,
  lastSentAt: history[0] ? before(history[0].age) : null,
  cooldownUntil: null,
  history: history.map((entry, index) => record(id, index, entry)),
});

export const seedDevices = (): WolDevice[] => [
  build("desktop", { name: "작업용 데스크탑", host: "desk-pc", mac: "00:00:5e:00:53:1a", address: "10.20.10.5", description: "집 책상 위의 데스크탑. 유선 LAN으로 연결되어 있고 VPN으로 깨웁니다.", awake: false }, DESKTOP),
  build("mini", { name: "서재 미니 PC", host: "den-mini", mac: "00:00:5e:00:53:2b", address: "10.20.10.6", description: "서재 선반의 작은 PC. 빌드와 백업을 맡습니다.", awake: true }, MINI),
  build("nas", { name: "거실 NAS", host: "nas-living", mac: "00:00:5e:00:53:3c", address: "10.20.10.7", description: "거실 장식장 안의 저장소. 밤에는 절전으로 들어갑니다.", awake: true }, NAS),
];

export const isReachable = (device: WolDevice, at = now()) =>
  device.awake || (device.bootsAt !== null && device.awakeUntil !== null && at >= device.bootsAt && at < device.awakeUntil);

export const cooldownLeft = (device: WolDevice, at = now()) => Math.max(0, Math.ceil(((device.cooldownUntil ?? 0) - at) / 1000));

// A record as it reads now: a signal still on its way is waiting, then it answered.
export const describeRecord = (entry: WakeRecord, at = now()): { result: WakeResult; seconds: number | null } => {
  if (entry.bootsAt === null) return { result: entry.result, seconds: entry.seconds };
  if (at < entry.bootsAt) return { result: "대기 중", seconds: null };
  return { result: "응답 확인", seconds: Math.round((entry.bootsAt - entry.at) / 1000) };
};

// Sending the signal: the device that is asleep will answer in 7 to 12 seconds, the one that is on shrugs.
export const wake = (device: WolDevice, at = now()): WolDevice => {
  const already = isReachable(device, at);
  const delay = 7 + (device.history.length % 6);
  const bootsAt = already ? null : at + delay * SECOND;
  const entry: WakeRecord = {
    id: makeId("w", device.id),
    at,
    by: "관리자",
    result: already ? "이미 켜져 있음" : "대기 중",
    bootsAt,
    seconds: null,
  };
  return {
    ...device,
    lastSentAt: at,
    cooldownUntil: at + COOLDOWN,
    bootsAt: bootsAt ?? device.bootsAt,
    awakeUntil: bootsAt === null ? device.awakeUntil : bootsAt + AWAKE_FOR,
    history: [entry, ...device.history].slice(0, 60),
  };
};
