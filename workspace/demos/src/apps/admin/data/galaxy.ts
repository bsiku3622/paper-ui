// The phone's camera roll, as the hub sees it: the latest twenty-four items with invented names and sizes. The viewer
// itself lives elsewhere; the hub only decides what is shown outside.

import { random } from "../../../kit";
import { DAY, HOUR, MINUTE, before } from "../lib/clock";
import type { MediaRow } from "./types";

const MB = 1024 * 1024;

// Shot names the way a phone writes them: 20261030_172458.jpg.
const stamp = (at: number) => {
  const date = new Date(at + 9 * HOUR);
  const pad = (value: number, length = 2) => String(value).padStart(length, "0");
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}_${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`;
};

export const seedMedia = (): MediaRow[] => {
  const next = random("galaxy-media");
  const rows: MediaRow[] = [];
  let cursor = before(35 * MINUTE);
  for (let index = 0; index < 24; index++) {
    cursor -= Math.round((4 * HOUR + next() * 22 * HOUR) * (index > 14 ? 1.6 : 1));
    const video = next() < 0.25;
    const takenAt = Math.round(cursor);
    rows.push({
      id: `m_${String(index + 1).padStart(3, "0")}`,
      name: `${stamp(takenAt)}.${video ? "mp4" : "jpg"}`,
      kind: video ? "video" : "photo",
      takenAt,
      size: Math.round((video ? 40 + next() * 760 : 1.8 + next() * 5.4) * MB),
      duration: video ? 8 + Math.floor(next() * 400) : null,
      shared: next() < 0.28,
    });
  }
  return rows;
};

// What the phone holds in all, beyond the twenty-four shown.
export const GALAXY = {
  photos: 1284,
  videos: 96,
  // Shared items older than the twenty-four.
  sharedOlder: 4,
  storageUsed: 118.4,
  storageTotal: 256,
  syncedAt: () => before(12 * MINUTE),
  oldest: () => before(380 * DAY),
};
