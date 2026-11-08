import { random } from "../../../kit";
import { DAY, before } from "../lib/clock";
import { visitorAddress } from "../lib/fake";
import { formatBytes } from "../lib/format";
import { seedFiles } from "./files";
import { seedPeers } from "./wireguard";
import { seedDevices } from "./wol";
import { seedMedia } from "./galaxy";
import type { ActivityEvent, Level, ServiceId } from "./types";

export const SERVICE_LABEL: Record<ServiceId, string> = {
  files: "files",
  wireguard: "WireGuard",
  wol: "데스크탑 WOL",
  galaxy: "Galaxy S23+",
  hub: "관리 콘솔",
};

type Made = { title: string; detail?: string; actor: string; level?: Level };
type Template = { service: ServiceId; weight: number; make: (next: () => number) => Made };

const ADMIN = "관리자";
const SYSTEM = "시스템";

export const seedEvents = (): ActivityEvent[] => {
  const files = seedFiles();
  const peers = seedPeers();
  const devices = seedDevices();
  const media = seedMedia();
  const any = <T,>(next: () => number, list: readonly T[]) => list[Math.floor(next() * list.length)]!;

  const templates: Template[] = [
    { service: "files", weight: 5, make: (next) => { const file = any(next, files); return { title: "파일을 올렸습니다", detail: `${file.title} · ${formatBytes(file.size)}`, actor: ADMIN }; } },
    { service: "files", weight: 3, make: (next) => ({ title: "설정을 고쳤습니다", detail: `${any(next, files).title} · ${any(next, ["만료 시각", "다운로드 제한", "공개 범위", "설명"])}`, actor: ADMIN }) },
    { service: "files", weight: 2, make: (next) => ({ title: "파일을 지웠습니다", detail: any(next, files).originalName, actor: ADMIN }) },
    { service: "files", weight: 2, make: (next) => ({ title: "만료되어 공유가 끝났습니다", detail: any(next, files).title, actor: SYSTEM }) },
    { service: "files", weight: 1, make: (next) => ({ title: "다운로드 횟수를 모두 썼습니다", detail: any(next, files).title, actor: SYSTEM }) },
    { service: "files", weight: 1, make: (next) => ({ title: "비밀번호 오류가 반복됐습니다", detail: `${any(next, files.filter((file) => file.visibility === "password")).title} · 3회 연속 · ${visitorAddress(next)}`, actor: SYSTEM, level: "warning" }) },
    { service: "wireguard", weight: 2, make: (next) => { const peer = any(next, peers); return { title: "peer를 추가했습니다", detail: `${peer.name} · ${peer.allowedIp}`, actor: ADMIN }; } },
    { service: "wireguard", weight: 3, make: (next) => { const peer = any(next, peers.filter((item) => typeof item.rateLimitMbps === "number")); return { title: "속도 제한을 바꿨습니다", detail: `${peer.name} · ${peer.rateLimitMbps} Mbps`, actor: ADMIN }; } },
    { service: "wireguard", weight: 1, make: (next) => ({ title: "peer 연결을 해제했습니다", detail: `${any(next, peers).name}`, actor: ADMIN }) },
    { service: "wireguard", weight: 2, make: (next) => ({ title: "handshake가 오래 없습니다", detail: `${any(next, peers.filter((item) => !item.online)).name} · ${2 + Math.floor(next() * 5)}일째`, actor: SYSTEM, level: "warning" }) },
    { service: "wireguard", weight: 2, make: (next) => { const peer = any(next, peers); return { title: "새 기기가 처음 연결됐습니다", detail: `${peer.name} · ${peer.allowedIp}`, actor: SYSTEM }; } },
    { service: "wol", weight: 5, make: (next) => ({ title: "깨우기 신호를 보냈습니다", detail: any(next, devices).name, actor: ADMIN }) },
    { service: "wol", weight: 4, make: (next) => ({ title: "응답을 확인했습니다", detail: `${any(next, devices).name} · ${8 + Math.floor(next() * 8)}초 만에`, actor: SYSTEM }) },
    { service: "wol", weight: 1, make: (next) => ({ title: "응답이 없습니다", detail: `${any(next, devices).name} · 신호를 보낸 지 60초`, actor: SYSTEM, level: "warning" }) },
    { service: "galaxy", weight: 3, make: (next) => ({ title: "외부 공개를 켰습니다", detail: any(next, media).name, actor: ADMIN }) },
    { service: "galaxy", weight: 2, make: (next) => ({ title: "외부 공개를 껐습니다", detail: any(next, media).name, actor: ADMIN }) },
    { service: "galaxy", weight: 3, make: (next) => ({ title: "동기화했습니다", detail: `사진 ${10 + Math.floor(next() * 60)}장 · 영상 ${Math.floor(next() * 4)}개`, actor: SYSTEM }) },
    { service: "hub", weight: 5, make: () => ({ title: "로그인했습니다", detail: "10.20.10.2", actor: ADMIN }) },
    { service: "hub", weight: 1, make: (next) => ({ title: "로그인에 실패했습니다", detail: `${visitorAddress(next)} · 비밀번호가 맞지 않음`, actor: SYSTEM, level: "warning" }) },
    { service: "hub", weight: 2, make: () => ({ title: "로그아웃했습니다", actor: ADMIN }) },
  ];
  const total = templates.reduce((sum, template) => sum + template.weight, 0);

  const next = random("admin-activity");
  const events: ActivityEvent[] = [];
  for (let index = 0; index < 84; index++) {
    let roll = next() * total;
    const template = templates.find((item) => (roll -= item.weight) < 0) ?? templates[0]!;
    const made = template.make(next);
    events.push({
      id: "",
      at: Math.round(before(Math.pow(next(), 1.9) * 30 * DAY + 20 * 60_000)),
      service: template.service,
      level: made.level ?? "info",
      title: made.title,
      detail: made.detail,
      actor: made.actor,
    });
  }
  events.sort((a, b) => b.at - a.at);
  return events.map((event, index) => ({ ...event, id: `ev_${String(events.length - index).padStart(4, "0")}` }));
};
