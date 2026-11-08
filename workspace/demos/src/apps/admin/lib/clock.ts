// The demo's present. It starts at the kit's NOW and runs forward from the first visit, so what a user makes today is
// older tomorrow and nothing in the hub is ever dated in the future. Seeds are written against NOW.

import { NOW } from "../../../kit";

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

let origin = Date.now();

// The store calls this once with the moment of the first visit (kept in the browser), so a reload does not go back in time.
export const startClock = (startedAt: number) => {
  origin = startedAt;
};

export const now = () => NOW.getTime() + (Date.now() - origin);
export const nowSeconds = () => Math.floor(now() / 1000);

// A moment `ms` before the first visit's present: how seeds say "3 days ago".
export const before = (ms: number) => NOW.getTime() - ms;
