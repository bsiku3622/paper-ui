import { NOW } from "../../../kit";

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

let origin = Date.now();

export const startClock = (startedAt: number) => {
  origin = startedAt;
};

export const now = () => NOW.getTime() + (Date.now() - origin);
export const nowSeconds = () => Math.floor(now() / 1000);

export const before = (ms: number) => NOW.getTime() - ms;
