import { NOW, random } from "../../../kit";
import { DAY, HOUR, MINUTE, before, now } from "../lib/clock";
import { fakeKey } from "../lib/fake";
import type { PeerKind, PeerRow, WireGuardPeer, WolDevice } from "./types";

export const WG = {
  interface: "wg0",
  subnet: "10.20.100.0/24",
  personalSubnet: "10.20.10.0/24",
  endpoint: "vpn.example.net:51820",
  dns: "10.20.0.1",
  serverKey: fakeKey("wg-server"),
  allowed: "10.20.0.0/16",
} as const;

const GIB = 1024 ** 3;

type Seed = {
  name: string;
  ip: string;
  endpoint: string | null;
  online: boolean;
  away?: number;
  recv: number;
  sent: number;
  kbps: number;
  limit: PeerRow["rateLimitMbps"];
  added: number;
};

const SEEDS: readonly Seed[] = [
  { name: "MacBook Air", ip: "10.20.10.2", endpoint: "203.0.113.24:49152", online: true, recv: 6.2, sent: 41.7, kbps: 380, limit: null, added: 240 },
  { name: "휴대폰", ip: "10.20.10.3", endpoint: "198.51.100.77:37102", online: true, recv: 1.1, sent: 9.8, kbps: 90, limit: null, added: 238 },
  { name: "태블릿", ip: "10.20.10.4", endpoint: "198.51.100.77:50211", online: false, away: 5, recv: 0.3, sent: 2.9, kbps: 140, limit: null, added: 190 },
  { name: "작업용 데스크탑", ip: "10.20.10.5", endpoint: "203.0.113.24:45870", online: false, away: 3, recv: 54, sent: 188, kbps: 1400, limit: null, added: 240 },
  { name: "서재 미니 PC", ip: "10.20.10.6", endpoint: "203.0.113.24:45911", online: true, recv: 3.6, sent: 22.4, kbps: 120, limit: null, added: 170 },
  { name: "거실 NAS", ip: "10.20.10.7", endpoint: "203.0.113.24:45934", online: true, recv: 31.5, sent: 76.8, kbps: 310, limit: null, added: 160 },
  { name: "서연의 노트북", ip: "10.20.100.11", endpoint: "192.0.2.58:41722", online: true, recv: 2.4, sent: 17.9, kbps: 220, limit: 50, added: 120 },
  { name: "도윤의 휴대폰", ip: "10.20.100.12", endpoint: "192.0.2.131:22043", online: true, recv: 0.4, sent: 3.2, kbps: 60, limit: "unlimited", added: 96 },
  { name: "지호의 태블릿", ip: "10.20.100.13", endpoint: "192.0.2.17:60488", online: false, away: 26, recv: 0.1, sent: 0.9, kbps: 110, limit: 20, added: 61 },
  { name: "하린의 PC", ip: "10.20.100.14", endpoint: "203.0.113.190:51207", online: true, recv: 8.8, sent: 96.4, kbps: 740, limit: 20, added: 58 },
  { name: "민준의 맥북", ip: "10.20.100.15", endpoint: "198.51.100.203:33915", online: false, away: 140, recv: 1.9, sent: 14.2, kbps: 260, limit: "unlimited", added: 44 },
  { name: "지우의 휴대폰", ip: "10.20.100.16", endpoint: null, online: false, recv: 0, sent: 0, kbps: 80, limit: 10, added: 1 },
  { name: "프린터 Pi", ip: "10.20.20.1", endpoint: "198.51.100.9:51820", online: true, recv: 0.2, sent: 0.8, kbps: 25, limit: null, added: 150 },
];

export const seedPeers = (): PeerRow[] =>
  SEEDS.map((seed) => ({
    name: seed.name,
    publicKey: fakeKey(seed.ip),
    allowedIp: seed.ip,
    endpoint: seed.endpoint,
    online: seed.online,
    lastSeen: seed.online || seed.away === undefined ? 0 : Math.floor(before(seed.away * HOUR) / 1000),
    received: Math.round(seed.recv * GIB),
    sent: Math.round(seed.sent * GIB),
    kbps: seed.kbps,
    rateLimitMbps: seed.limit,
    addedAt: before(seed.added * DAY),
  }));

export const kindOf = (allowedIp: string): PeerKind => (allowedIp.startsWith("10.20.10.") ? "personal" : allowedIp.startsWith("10.20.100.") ? "friend" : "other");
export const KIND_LABEL: Record<PeerKind, string> = { personal: "내 기기", friend: "친구", other: "기타 peer" };

const hash = (text: string) => {
  let value = 2166136261;
  for (let index = 0; index < text.length; index++) value = Math.imul(value ^ text.charCodeAt(index), 16777619);
  return value >>> 0;
};

export type Reach = (allowedIp: string, at: number) => { online: boolean; wentAway?: number } | null;
export const reachFromDevices = (devices: readonly WolDevice[], reachable: (device: WolDevice, at: number) => boolean): Reach => (allowedIp, at) => {
  const device = devices.find((item) => item.address === allowedIp);
  if (!device) return null;
  return { online: reachable(device, at), wentAway: device.awakeUntil !== null && at >= device.awakeUntil ? Math.floor(device.awakeUntil / 1000) : undefined };
};

export const readPeer = (row: PeerRow, at = now(), reach?: Reach): WireGuardPeer => {
  const seconds = Math.floor(at / 1000);
  const linked = reach?.(row.allowedIp, at) ?? null;
  const arrived = row.connectsAt !== undefined && at >= row.connectsAt;
  const online = linked ? linked.online : row.online || arrived;
  const lastSeen = linked?.wentAway ?? row.lastSeen;
  const elapsed = Math.max(0, (at - Math.max(NOW.getTime(), row.connectsAt ?? 0)) / 1000);
  const perSecond = online ? (row.kbps * 1000) / 8 : 0;
  const address = hash(row.publicKey);
  const latest = seconds - 1 - (hash(`${row.publicKey}:${Math.floor(seconds / 10)}`) % 70);
  return {
    name: row.name,
    publicKey: row.publicKey,
    allowedIp: row.allowedIp,
    endpoint: row.endpoint ?? (arrived ? `203.0.113.${1 + (address % 253)}:${40000 + (address % 20000)}` : null),
    handshake: online ? (row.connectsAt !== undefined && arrived ? Math.max(Math.floor(row.connectsAt / 1000), latest) : latest) : lastSeen,
    received: Math.round(row.received + elapsed * perSecond * 0.16),
    sent: Math.round(row.sent + elapsed * perSecond),
    rateLimitMbps: row.rateLimitMbps,
  };
};

export const isOnline = (peer: WireGuardPeer, at = now()) => peer.handshake > 0 && at / 1000 - peer.handshake < 180;

export const nextHost = (rows: readonly PeerRow[], prefix: string, first: number): number | null => {
  const used = rows.filter((row) => row.allowedIp.startsWith(prefix)).map((row) => Number(row.allowedIp.slice(prefix.length)));
  const next = Math.max(first - 1, ...used) + 1;
  return next <= 254 ? next : null;
};

export const SLOT = 10_000;
export type Rate = { upload: number; download: number };

export const rateOf = (row: PeerRow, slot: number, online: boolean): Rate => {
  if (!online) return { upload: 0, download: 0 };
  const next = random(`${row.publicKey}:${slot}`);
  const wave = 0.35 + 1.3 * next();
  const burst = next() > 0.93 ? 3.5 : 1;
  const download = (row.kbps / 1000) * wave * burst;
  const upload = download * (0.1 + 0.12 * next());
  const cap = typeof row.rateLimitMbps === "number" ? row.rateLimitMbps : Infinity;
  return { upload, download: Math.min(download, cap) };
};

export const totalRate = (rows: readonly PeerRow[], slot: number, at: number, reach?: Reach): Rate => {
  const total = { upload: 0, download: 0 };
  for (const row of rows) {
    const peer = readPeer(row, at, reach);
    const rate = rateOf(row, slot, isOnline(peer, at));
    total.upload += rate.upload;
    total.download += rate.download;
  }
  return total;
};

export const trafficHistory = (rows: readonly PeerRow[], at: number, count = 18, reach?: Reach): { at: number; upload: number; download: number }[] => {
  const last = Math.floor(at / SLOT);
  return Array.from({ length: count }, (_, index) => {
    const slot = last - (count - 1 - index);
    return { at: slot * SLOT, ...totalRate(rows, slot, slot * SLOT + SLOT - 1, reach) };
  });
};

export const hourlyUsage = (row: PeerRow, peer: WireGuardPeer, at = now(), hours = 24): { at: number; upload: number; download: number }[] => {
  const lastHour = Math.floor(at / HOUR);
  return Array.from({ length: hours }, (_, index) => {
    const hour = lastHour - (hours - 1 - index);
    const start = hour * HOUR;
    const gone = peer.handshake === 0 || (!isOnline(peer, at) && start > peer.handshake * 1000 + HOUR);
    if (gone) return { at: start, upload: 0, download: 0 };
    const clock = new Date(start + 9 * HOUR).getUTCHours();
    const day = clock >= 18 && clock <= 23 ? 1 : clock >= 8 && clock < 18 ? 0.6 : clock < 6 ? 0.08 : 0.3;
    const next = random(`${row.publicKey}:hour:${hour}`);
    const download = ((row.kbps * 1000) / 8) * 3600 * day * (0.25 + 1.2 * next()) / (1024 * 1024);
    return { at: start, upload: download * (0.1 + 0.1 * next()), download };
  });
};

export type Session = { id: string; start: number; end: number | null; upload: number; download: number };
export const sessionsOf = (row: PeerRow, peer: WireGuardPeer, at = now()): Session[] => {
  if (peer.handshake === 0) return [];
  const next = random(`${row.publicKey}:sessions`);
  const bytes = (length: number) => {
    const download = row.kbps * 125 * (length / 1000) * (0.3 + 0.9 * next());
    return { upload: download * (0.08 + 0.1 * next()), download };
  };
  const sessions: Session[] = [];
  const online = isOnline(peer, at);
  let cursor = online ? at - (5 + Math.floor(next() * 40)) * MINUTE : peer.handshake * 1000 + 2 * MINUTE;
  if (online) sessions.push({ id: "now", start: cursor, end: null, ...bytes(at - cursor) });
  for (let index = 0; index < 7; index++) {
    const end = online || index > 0 ? cursor - (30 + Math.floor(next() * 600)) * MINUTE : cursor;
    const length = (12 + Math.floor(next() * 240)) * MINUTE;
    sessions.push({ id: `s${index}`, start: end - length, end, ...bytes(length) });
    cursor = end - length;
  }
  return sessions.filter((session) => session.start > row.addedAt);
};

export const recentHandshakes = (peer: WireGuardPeer, at = now(), count = 6) =>
  Array.from({ length: count }, (_, index) => peer.handshake * 1000 - index * 2 * MINUTE).filter((moment) => moment > 0 && moment <= at);
