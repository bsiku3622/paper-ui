// Resolvers — 규칙의 주인.
//
// 컴포넌트는 "내가 어떤 색인지" 만 말하고, 그게 무슨 클래스가 되는지는 모른다.
// 색 해석이 컴포넌트마다 흩어지면 둘이 조용히 달라진다.

import { joinClass } from "../internal/joinClass";
import type { AccentName, StatusName, Space } from "../tokens";
import { STATUS_ACCENT } from "../tokens";

// interactive 색 축(variant × status)은 별도 파일에.
export { resolveColorClassnames, VARIANTS, INTERACTIVE, type Variant, type ColorStatus } from "./color";

// ───── paper — 면 ────────────────────────────────────────────────────────
//
// 순백(base) · 옅은 면(subtle) · 눌린 면(muted). 이 시스템은 선보다 면으로
// 구획을 나눈다 (ChatGPT 의 결).

export const PAPERS = ["base", "subtle", "muted"] as const;
export type Paper = (typeof PAPERS)[number];

export const resolvePaper = (s: Paper | undefined): string =>
  s ? `pui-paper-${s}` : "";

// ───── ink — 잉크 농도 ─────────────────────────────────────────────────────

export const INKS = ["base", "soft", "faint"] as const;
export type Ink = (typeof INKS)[number];

export const resolveInk = (i: Ink | undefined): string => (i ? `pui-ink-${i}` : "");

// ───── tone — 작게 얹는 색 ─────────────────────────────────────────────────
//
// accent 를 쓰는 방법:
//   ink  — 글자/아이콘만 그 색 (링크 · 강조 수치)
//   wash — 옅은 면 + 같은 색 괘선 + 그 색 글자 (배지 · 선택 행)
//   dot  — 작은 채운 점 (status 표시자)
//
// 색으로 꽉 찬 큰 면(solid)은 tone 이 아니다 — primary(검정) 만 면을 채운다.

export const TONES = ["ink", "wash", "dot"] as const;
export type Tone = (typeof TONES)[number];

export const resolveTone = (accent: AccentName | undefined, tone: Tone = "ink"): string =>
  accent ? `pui-${accent}-${tone}` : "";

// status → accent. info=blue · success=green · error=red (전부 색을 가짐).
export const resolveStatus = (status: StatusName | undefined, tone: Tone = "ink"): string =>
  status ? resolveTone(STATUS_ACCENT[status], tone) : "";

// ───── space — 간격 ────────────────────────────────────────────────────────

export const resolveSpace = (
  axis: "p" | "px" | "py" | "gap",
  size: Space | undefined,
): string => (size ? `pui-${axis}-${size}` : "");

// ───── 합성 ────────────────────────────────────────────────────────────────

export type BoxLike = {
  paper?: Paper;
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
    resolvePaper(p.paper),
    resolveInk(p.ink),
    p.status ? resolveStatus(p.status, p.tone) : resolveTone(p.accent, p.tone),
    resolveSpace("p", p.padding),
    resolveSpace("px", p.paddingX),
    resolveSpace("py", p.paddingY),
    resolveSpace("gap", p.gap),
  );
