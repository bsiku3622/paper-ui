// Resolvers — 규칙의 주인.
//
// 컴포넌트는 "내가 어떤 색인지" 만 말하고, *그게 무슨 클래스가 되는지* 는 모른다.
// 색 해석이 Button 안에도 Badge 안에도 흩어지면 둘이 조용히 달라진다.

import { joinClass } from "../internal/joinClass";
import type { AccentName, StatusName, Space } from "../tokens";

// ───── surface — 면 ────────────────────────────────────────────────────────
//
// 이 시스템의 면은 3 단뿐이고, 전부 *내려간다* (raised 없음).
// 장부에서 강조는 띄우는 게 아니라 칸을 파는 것이다.

export const SURFACES = ["base", "sunk", "deep"] as const;
export type Surface = (typeof SURFACES)[number];

export const resolveSurface = (s: Surface | undefined): string =>
  s ? `paper-surface-${s}` : "";

// ───── ink — 잉크 농도 ─────────────────────────────────────────────────────

export const INKS = ["base", "soft", "faint"] as const;
export type Ink = (typeof INKS)[number];

export const resolveInk = (i: Ink | undefined): string => (i ? `paper-ink-${i}` : "");

// ───── tone — 가끔 등장하는 잉크 ───────────────────────────────────────────
//
// accent 를 쓰는 방법은 두 가지뿐이다:
//   ink  — 글자/선만 그 색 (기본. 종이는 그대로)
//   wash — 아주 옅은 면 + 괘선 (Banner · 선택된 행처럼 면이 필요한 자리)
//
// solid(색으로 꽉 찬 면) 는 *Button 의 1 차 액션 한 자리* 에만 있다. 그 외에
// solid 를 노출하지 않는 게 이 팔레트가 조용한 이유다.

export const TONES = ["ink", "wash"] as const;
export type Tone = (typeof TONES)[number];

export const resolveTone = (accent: AccentName | undefined, tone: Tone = "ink"): string =>
  accent ? `paper-${accent}-${tone}` : "";

// status → accent. info 는 유채색이 없다 — ink.soft 로 간다.
export const resolveStatus = (status: StatusName | undefined, tone: Tone = "ink"): string => {
  if (!status) return "";
  if (status === "info") return tone === "wash" ? "paper-surface-sunk" : "paper-ink-soft";
  const map = { error: "red", success: "green", danger: "orange" } as const;
  return `paper-${map[status]}-${tone}`;
};

// ───── space — 간격 ────────────────────────────────────────────────────────

export const resolveSpace = (
  axis: "p" | "px" | "py" | "gap",
  size: Space | undefined,
): string => (size ? `paper-${axis}-${size}` : "");

// ───── 합성 ────────────────────────────────────────────────────────────────

export type BoxLike = {
  surface?: Surface;
  ink?: Ink;
  accent?: AccentName;
  tone?: Tone;
  status?: StatusName;
  padding?: Space;
  paddingX?: Space;
  paddingY?: Space;
  gap?: Space;
};

export const resolveBoxClass = (p: BoxLike): string =>
  joinClass(
    resolveSurface(p.surface),
    resolveInk(p.ink),
    p.status ? resolveStatus(p.status, p.tone) : resolveTone(p.accent, p.tone),
    resolveSpace("p", p.padding),
    resolveSpace("px", p.paddingX),
    resolveSpace("py", p.paddingY),
    resolveSpace("gap", p.gap),
  );
