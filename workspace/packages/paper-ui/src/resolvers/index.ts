// Resolvers — 규칙의 주인.
//
// 컴포넌트는 "내가 어떤 색인지" 만 말하고, 그게 무슨 클래스가 되는지는 모른다.
// 색 해석이 컴포넌트마다 흩어지면 둘이 조용히 달라진다.

import { joinClass } from "../internal/joinClass";
import type { StatusName, Space } from "../tokens";
import { STATUS_ACCENT } from "../tokens";
import { resolveSurface, ACCENTS, type Surface } from "./color";

// 면(surface) · 잉크색(color × variant)은 별도 파일에.
export {
  resolveSurface,
  resolveColor,
  COLORS,
  SURFACES,
  ACCENTS,
  VARIANTS,
  INTERACTIVE,
  type Color,
  type Surface,
  type Accent,
  type Variant,
} from "./color";

// ───── ink — 마크(Text · Icon)가 소유하는 색 ──────────────────────────────────
//
// 면(Box)은 ink 를 정하지 않는다 — 글자·아이콘이 자기 색을 정한다. 한 축에 뉴트럴
// 농도(base·soft·faint)와 의미색(info·success·warning·error)을 함께 둔다. 글자는 색이
// 하나다. accent 는 단일 톤(ink 슬롯, AA 대비) — "soft 한 빨강 글자"는 거의 안 쓰여
// 농도×색 직교(죽은 셀)를 만들지 않는다. 뉴트럴은 `pui-ink-*`, accent 는 `pui-{color}-ink`
// (둘 다 utility.css.ts 가 굽는다).

const NEUTRAL_INKS = ["base", "soft", "faint"] as const;
export { NEUTRAL_INKS };
export const INKS = [...NEUTRAL_INKS, ...ACCENTS] as const;
export type Ink = (typeof INKS)[number];

export const resolveInk = (i: Ink | undefined): string =>
  !i
    ? ""
    : (NEUTRAL_INKS as readonly string[]).includes(i)
      ? `pui-ink-${i}`
      : `pui-${i}-ink`;

// ───── tone — accent 를 글자/면/점으로 ─────────────────────────────────────────
//
// 색 매트릭스 밖에서 accent 색을 직접 쓰는 얇은 자리(링크·Field 오류 글자·상태 점).
//   ink — 글자/아이콘만 그 색 · wash — 옅은 면 + 괘선 · dot — 작은 채운 점

export const TONES = ["ink", "wash", "dot"] as const;
export type Tone = (typeof TONES)[number];

export const resolveTone = (accent: string | undefined, tone: Tone = "ink"): string =>
  accent ? `pui-${accent}-${tone}` : "";

// status → accent tone. (info·success·warning·error 전부 색을 가짐.)
export const resolveStatus = (status: StatusName | undefined, tone: Tone = "ink"): string =>
  status ? resolveTone(STATUS_ACCENT[status], tone) : "";

// ───── space — 간격 ────────────────────────────────────────────────────────────

export const resolveSpace = (
  axis: "p" | "px" | "py" | "gap",
  size: Space | undefined,
): string => (size ? `pui-${axis}-${size}` : "");

// ───── 합성 (Box) ──────────────────────────────────────────────────────────────
//
// Box 는 구조 패널이다: 어떤 면(surface 깊이)에, 어떤 간격(padding·gap)을 두는가.
// 색(잉크)·상태 같은 마크 축은 Box 에 없다 — 잉크색은 Button·Badge·Alert, 글자는 Text.
// 카드 테두리(border)·모서리(radius)·그림자(shadow)·반전(inverse)은 Box.tsx 가 직접 붙인다.

export type BoxLike = {
  surface?: Surface;
  padding?: Space;
  paddingX?: Space;
  paddingY?: Space;
  gap?: Space;
};

export const resolveBoxClass = (p: BoxLike): string =>
  joinClass(
    resolveSurface(p.surface),
    resolveSpace("p", p.padding),
    resolveSpace("px", p.paddingX),
    resolveSpace("py", p.paddingY),
    resolveSpace("gap", p.gap),
  );
