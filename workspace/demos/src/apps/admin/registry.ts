import type { GlyphName } from "../../kit";

export const BASE = "/admin";

export type ServiceKey = "wol" | "galaxy" | "files" | "wireguard";

export type Service = {
  id: ServiceKey;
  label: string;
  glyph: GlyphName;
  description: string;
  site: string | null;
};

export const SERVICES: readonly Service[] = [
  { id: "wol", label: "데스크탑 WOL", glyph: "monitor", description: "집의 데스크탑을 원격으로 깨웁니다.", site: null },
  { id: "galaxy", label: "Galaxy S23+", glyph: "film", description: "휴대폰 영상과 사진을 보고 공개 여부를 관리합니다.", site: null },
  { id: "files", label: "files", glyph: "folder", description: "파일을 올리고 링크로 나눠 주는 곳.", site: "https://files.example.com" },
  { id: "wireguard", label: "WireGuard", glyph: "network", description: "친구 VPN peer를 등록하고 연결을 관리합니다.", site: null },
];

export const serviceTo = (id: ServiceKey) => `${BASE}/s/${id}`;
export const findService = (id: string | undefined) => SERVICES.find((service) => service.id === id);
