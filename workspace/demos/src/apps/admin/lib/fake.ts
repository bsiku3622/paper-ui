import { random } from "../../../kit";

const BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const LOWER = "abcdefghijklmnopqrstuvwxyz0123456789";

export const fakeKey = (seed: string) => {
  const next = random(`key:${seed}`);
  let key = "DEMO";
  for (let index = 0; index < 39; index++) key += BASE64[Math.floor(next() * BASE64.length)];
  return `${key}=`;
};

export const KEY_PATTERN = /^[A-Za-z0-9+/]{43}=$/;

let counter = 0;
export const makeId = (prefix: string, seed = "") => {
  counter += 1;
  const next = random(`${prefix}:${seed}:${Date.now()}:${counter}`);
  let tail = "";
  for (let index = 0; index < 6; index++) tail += LOWER[Math.floor(next() * LOWER.length)];
  return `${prefix}_${tail}`;
};

export const visitorAddress = (next: () => number) => {
  const roll = next();
  const host = 1 + Math.floor(next() * 253);
  if (roll < 0.42) return `203.0.113.${host}`;
  if (roll < 0.8) return `198.51.100.${host}`;
  if (roll < 0.94) return `192.0.2.${host}`;
  return `2001:db8:${Math.floor(next() * 0xffff).toString(16)}::${host.toString(16)}`;
};
