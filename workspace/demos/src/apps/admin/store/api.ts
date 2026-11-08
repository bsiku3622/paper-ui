import { useCallback } from "react";

import { random } from "../../../kit";
import { fileState, readFile } from "../data/files";
import type { AdminFile, FileRow, PeerRow, Visibility, WolDevice } from "../data/types";
import { nextHost } from "../data/wireguard";
import { cooldownLeft, isReachable, wake as wakeDevice } from "../data/wol";
import { now } from "../lib/clock";
import { ApiError } from "../lib/errors";
import { KEY_PATTERN, makeId } from "../lib/fake";
import { formatBytes, mimeOf } from "../lib/format";
import { LATENCY, sleep } from "../lib/hooks";
import { useAdmin } from "./store";

export type NewFile = {
  title: string;
  description: string;
  slug: string;
  name: string;
  size: number;
  visibility: Visibility;
  password: string;
  expiresAt: number | null;
  maxDownloads: number | null;
};

export type FilePatch = {
  slug?: string;
  title?: string;
  description?: string;
  visibility?: Visibility;
  password?: string;
  expiresAt?: number | null;
  maxDownloads?: number | null;
};

const SLUG = /^[0-9A-Za-z가-힣][0-9A-Za-z가-힣_-]{1,63}$/;

const slugFor = (title: string, taken: ReadonlySet<string>, spare: string) => {
  const ascii = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32);
  const base = ascii.length >= 3 ? ascii : `file-${spare}`;
  let slug = base;
  for (let count = 2; taken.has(slug); count++) slug = `${base}-${count}`;
  return slug;
};

const checkLimits = (maxDownloads: number | null | undefined, expiresAt: number | null | undefined) => {
  if (maxDownloads !== null && maxDownloads !== undefined && (!Number.isInteger(maxDownloads) || maxDownloads < 1)) throw new ApiError("다운로드 제한은 1 이상의 정수여야 합니다.");
  if (expiresAt !== null && expiresAt !== undefined && expiresAt <= now()) throw new ApiError("만료 시각이 이미 지났습니다. 앞으로의 시각을 골라주세요.");
};

export const useFilesApi = () => {
  const { files, setFiles, log } = useAdmin();

  const createFile = useCallback(
    (input: NewFile): void => {
      const title = input.title.trim() || input.name;
      const slug = input.slug.trim();
      if (slug && !SLUG.test(slug)) throw new ApiError("주소는 글자, 숫자, 하이픈, 밑줄로 2자 이상 써주세요.");
      if (slug && files.some((file) => file.slug === slug)) throw new ApiError("이미 쓰고 있는 주소입니다.", "slug_taken", 409);
      if (input.visibility === "password" && input.password.length === 0) throw new ApiError("비밀번호 공개를 골랐으면 비밀번호가 있어야 합니다.");
      checkLimits(input.maxDownloads, input.expiresAt);
      const at = now();
      const id = makeId("f");
      const spare = makeId("s").slice(2, 6);
      setFiles((list) => [
        {
          id,
          slug: slug || slugFor(title, new Set(list.map((file) => file.slug)), spare),
          title,
          description: input.description.trim(),
          originalName: input.name,
          mime: mimeOf(input.name),
          size: input.size,
          visibility: input.visibility,
          expiresAt: input.expiresAt,
          maxDownloads: input.maxDownloads,
          downloadCount: 0,
          createdAt: at,
          updatedAt: at,
        },
        ...list,
      ]);
      log({ service: "files", level: "info", title: "파일을 올렸습니다", detail: `${title} · ${formatBytes(input.size)}`, actor: "관리자" });
    },
    [files, setFiles, log],
  );

  const patchFile = useCallback(
    async (id: string, patch: FilePatch): Promise<AdminFile> => {
      await sleep(LATENCY.save);
      const current = files.find((file) => file.id === id);
      if (!current) throw new ApiError("파일을 찾지 못했습니다. 이미 지워졌을 수 있습니다.", "not_found", 404);
      const title = (patch.title ?? current.title).trim();
      if (!title) throw new ApiError("제목을 입력해주세요.");
      const slug = (patch.slug ?? current.slug).trim();
      if (!SLUG.test(slug)) throw new ApiError("주소는 글자, 숫자, 하이픈, 밑줄로 2자 이상 써주세요.");
      if (files.some((file) => file.id !== id && file.slug === slug)) throw new ApiError("이미 쓰고 있는 주소입니다.", "slug_taken", 409);
      const visibility = patch.visibility ?? current.visibility;
      if (visibility === "password" && current.visibility !== "password" && !patch.password) throw new ApiError("비밀번호 공개로 바꾸려면 비밀번호가 있어야 합니다.");
      const expiresAt = patch.expiresAt === undefined ? current.expiresAt : patch.expiresAt;
      const maxDownloads = patch.maxDownloads === undefined ? current.maxDownloads : patch.maxDownloads;
      checkLimits(maxDownloads, expiresAt === current.expiresAt ? null : expiresAt);
      const next: FileRow = { ...current, title, slug, description: (patch.description ?? current.description).trim(), visibility, expiresAt, maxDownloads, updatedAt: now() };
      setFiles((list) => list.map((file) => (file.id === id ? next : file)));
      log({ service: "files", level: "info", title: "설정을 고쳤습니다", detail: next.title, actor: "관리자" });
      return readFile(next);
    },
    [files, setFiles, log],
  );

  const removeFile = useCallback(
    async (id: string) => {
      await sleep(LATENCY.save);
      const current = files.find((file) => file.id === id);
      if (!current) throw new ApiError("파일을 찾지 못했습니다. 이미 지워졌을 수 있습니다.", "not_found", 404);
      setFiles((list) => list.filter((file) => file.id !== id));
      log({ service: "files", level: "info", title: "파일을 지웠습니다", detail: current.originalName, actor: "관리자" });
    },
    [files, setFiles, log],
  );

  const stopSharing = useCallback(
    async (id: string) => {
      await sleep(LATENCY.save);
      const current = files.find((file) => file.id === id);
      if (!current || fileState(current) !== "live") return;
      const at = now();
      setFiles((list) => list.map((file) => (file.id === id ? { ...file, expiresAt: at, updatedAt: at } : file)));
      log({ service: "files", level: "info", title: "공유를 멈췄습니다", detail: current.title, actor: "관리자" });
    },
    [files, setFiles, log],
  );

  return { createFile, patchFile, removeFile, stopSharing };
};

export const uploadDuration = (size: number) => Math.min(4200, 1100 + (size / (60 * 1024 * 1024)) * 1000);

export type PeerKindInput = "personal" | "friend";

export const useWireGuardApi = () => {
  const { peers, setPeers, log } = useAdmin();

  const addPeer = useCallback(
    async (kind: PeerKindInput, name: string, publicKey: string, host?: number): Promise<PeerRow> => {
      await sleep(LATENCY.save);
      const label = name.trim();
      if (!label) throw new ApiError("기기 이름을 입력해주세요.");
      if (!KEY_PATTERN.test(publicKey)) throw new ApiError("public key 형식이 올바르지 않습니다. 43자와 = 하나, 모두 44자여야 합니다.");
      if (peers.some((peer) => peer.publicKey === publicKey)) throw new ApiError("이미 등록된 public key입니다.", "duplicate", 409);
      const prefix = kind === "personal" ? "10.20.10." : "10.20.100.";
      const last = host ?? nextHost(peers, prefix, kind === "personal" ? 2 : 11);
      if (last === null) throw new ApiError("이 대역에 남은 주소가 없습니다.");
      if (!Number.isInteger(last) || last < 1 || last > 254) throw new ApiError("주소 마지막 숫자는 1에서 254 사이여야 합니다.");
      const allowedIp = `${prefix}${last}`;
      if (peers.some((peer) => peer.allowedIp === allowedIp)) throw new ApiError(`${allowedIp}는 이미 쓰고 있는 주소입니다.`, "duplicate", 409);
      const at = now();
      const row: PeerRow = {
        name: label,
        publicKey,
        allowedIp,
        endpoint: null,
        online: false,
        lastSeen: 0,
        received: 0,
        sent: 0,
        kbps: 90 + Math.round(random(publicKey)() * 260),
        rateLimitMbps: kind === "friend" ? 20 : null,
        addedAt: at,
        connectsAt: at + 6000,
      };
      setPeers((list) => [...list, row]);
      log({ service: "wireguard", level: "info", title: "peer를 추가했습니다", detail: `${label} · ${allowedIp}`, actor: "관리자" });
      return row;
    },
    [peers, setPeers, log],
  );

  const removePeer = useCallback(
    async (publicKey: string) => {
      await sleep(LATENCY.save);
      const current = peers.find((peer) => peer.publicKey === publicKey);
      if (!current) throw new ApiError("peer를 찾지 못했습니다. 이미 해제됐을 수 있습니다.", "not_found", 404);
      setPeers((list) => list.filter((peer) => peer.publicKey !== publicKey));
      log({ service: "wireguard", level: "info", title: "peer 연결을 해제했습니다", detail: `${current.name} · ${current.allowedIp}`, actor: "관리자" });
    },
    [peers, setPeers, log],
  );

  const setRateLimit = useCallback(
    async (allowedIp: string, rateLimitMbps: number | "unlimited") => {
      await sleep(LATENCY.save);
      if (rateLimitMbps !== "unlimited" && (!Number.isInteger(rateLimitMbps) || rateLimitMbps < 0 || rateLimitMbps > 300)) throw new ApiError("속도 제한은 0에서 300 사이의 정수여야 합니다.");
      const current = peers.find((peer) => peer.allowedIp === allowedIp);
      if (!current) throw new ApiError("peer를 찾지 못했습니다.", "not_found", 404);
      setPeers((list) => list.map((peer) => (peer.allowedIp === allowedIp ? { ...peer, rateLimitMbps } : peer)));
      log({ service: "wireguard", level: "info", title: "속도 제한을 바꿨습니다", detail: `${current.name} · ${rateLimitMbps === "unlimited" ? "제한 없음" : rateLimitMbps === 0 ? "차단" : `${rateLimitMbps} Mbps`}`, actor: "관리자" });
    },
    [peers, setPeers, log],
  );

  const renamePeer = useCallback(
    async (publicKey: string, name: string) => {
      await sleep(LATENCY.quick);
      const label = name.trim();
      if (!label) throw new ApiError("기기 이름을 입력해주세요.");
      setPeers((list) => list.map((peer) => (peer.publicKey === publicKey ? { ...peer, name: label } : peer)));
    },
    [setPeers],
  );

  return { addPeer, removePeer, setRateLimit, renamePeer };
};

const MAC = /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i;
const ADDRESS = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

export type NewDevice = { name: string; host: string; mac: string; address: string; description: string };

export const useWolApi = () => {
  const { devices, setDevices, log } = useAdmin();

  const wake = useCallback(
    async (id: string) => {
      await sleep(LATENCY.save);
      const device = devices.find((item) => item.id === id);
      if (!device) throw new ApiError("기기를 찾지 못했습니다.", "not_found", 404);
      const left = cooldownLeft(device);
      if (left > 0) throw new ApiError(`${left}초 뒤에 다시 보낼 수 있습니다.`, "cooldown", 429);
      const at = now();
      const woken = wakeDevice(device, at);
      setDevices((list) => list.map((item) => (item.id === id ? woken : item)));
      log({ service: "wol", level: "info", title: "깨우기 신호를 보냈습니다", detail: isReachable(device, at) ? `${device.name} · 이미 켜져 있음` : device.name, actor: "관리자" });
      return woken;
    },
    [devices, setDevices, log],
  );

  const validate = useCallback(
    (input: NewDevice, ignore?: string) => {
      if (!input.name.trim()) throw new ApiError("기기 이름을 입력해주세요.");
      if (!MAC.test(input.mac.trim())) throw new ApiError("MAC 주소는 00:00:5e:00:53:1a 처럼 콜론으로 나눠 써주세요.");
      const match = ADDRESS.exec(input.address.trim());
      if (!match || match.slice(1).some((part) => Number(part) > 255)) throw new ApiError("VPN 주소는 10.20.10.5 같은 IPv4 주소여야 합니다.");
      if (devices.some((item) => item.id !== ignore && item.mac.toLowerCase() === input.mac.trim().toLowerCase())) throw new ApiError("이미 등록된 MAC 주소입니다.", "duplicate", 409);
    },
    [devices],
  );

  const addDevice = useCallback(
    async (input: NewDevice): Promise<WolDevice> => {
      await sleep(LATENCY.save);
      validate(input);
      const device: WolDevice = {
        id: makeId("wol"),
        name: input.name.trim(),
        host: input.host.trim() || input.name.trim(),
        mac: input.mac.trim().toLowerCase(),
        address: input.address.trim(),
        description: input.description.trim(),
        awake: false,
        bootsAt: null,
        awakeUntil: null,
        lastSentAt: null,
        cooldownUntil: null,
        history: [],
      };
      setDevices((list) => [...list, device]);
      log({ service: "wol", level: "info", title: "깨울 기기를 추가했습니다", detail: `${device.name} · ${device.address}`, actor: "관리자" });
      return device;
    },
    [validate, setDevices, log],
  );

  const updateDevice = useCallback(
    async (id: string, input: NewDevice) => {
      await sleep(LATENCY.save);
      validate(input, id);
      setDevices((list) => list.map((item) => (item.id === id ? { ...item, name: input.name.trim(), host: input.host.trim() || input.name.trim(), mac: input.mac.trim().toLowerCase(), address: input.address.trim(), description: input.description.trim() } : item)));
      log({ service: "wol", level: "info", title: "기기 정보를 고쳤습니다", detail: input.name.trim(), actor: "관리자" });
    },
    [validate, setDevices, log],
  );

  const removeDevice = useCallback(
    async (id: string) => {
      await sleep(LATENCY.save);
      const device = devices.find((item) => item.id === id);
      if (!device) throw new ApiError("기기를 찾지 못했습니다.", "not_found", 404);
      setDevices((list) => list.filter((item) => item.id !== id));
      log({ service: "wol", level: "info", title: "깨울 기기를 지웠습니다", detail: device.name, actor: "관리자" });
    },
    [devices, setDevices, log],
  );

  return { wake, addDevice, updateDevice, removeDevice };
};

export const useGalaxyApi = () => {
  const { media, setMedia, log } = useAdmin();

  const setShared = useCallback(
    async (id: string, shared: boolean) => {
      await sleep(LATENCY.quick);
      const item = media.find((entry) => entry.id === id);
      if (!item) throw new ApiError("항목을 찾지 못했습니다.", "not_found", 404);
      setMedia((list) => list.map((entry) => (entry.id === id ? { ...entry, shared } : entry)));
      log({ service: "galaxy", level: "info", title: shared ? "외부 공개를 켰습니다" : "외부 공개를 껐습니다", detail: item.name, actor: "관리자" });
    },
    [media, setMedia, log],
  );

  return { setShared };
};
