// Invented identifiers. A key made here is shaped like a WireGuard key (43 base64 characters and "=") but starts with
// "DEMO", so nobody mistakes it for a real one. Addresses come from the private 10.x ranges or from the ranges that
// RFC 5737 and RFC 3849 set aside for documentation.

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

// A short id for rows the user makes: f_k3x9q2.
let counter = 0;
export const makeId = (prefix: string, seed = "") => {
  counter += 1;
  const next = random(`${prefix}:${seed}:${Date.now()}:${counter}`);
  let tail = "";
  for (let index = 0; index < 6; index++) tail += LOWER[Math.floor(next() * LOWER.length)];
  return `${prefix}_${tail}`;
};

// The documentation address blocks a visitor may come from.
export const visitorAddress = (next: () => number) => {
  const roll = next();
  const host = 1 + Math.floor(next() * 253);
  if (roll < 0.42) return `203.0.113.${host}`;
  if (roll < 0.8) return `198.51.100.${host}`;
  if (roll < 0.94) return `192.0.2.${host}`;
  return `2001:db8:${Math.floor(next() * 0xffff).toString(16)}::${host.toString(16)}`;
};
