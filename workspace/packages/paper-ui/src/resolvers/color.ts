// Accent resolver — surface 깊이와 accent × variant의 시각 무게를 분리한다.
//
// `accent`는 primary(중립 pigment)와 semantic status pigment를 함께 부르는 public API다.
// 컴포넌트는 이름만 말하고, 실제 class와 tone 조합은 profile이 결정한다.

export const SURFACES = ["raised", "canvas", "sunken"] as const;
export type Surface = (typeof SURFACES)[number];

export const resolveSurface = (surface: Surface | undefined): string =>
  surface ? `pui-surface-${surface}` : "";

export const ACCENTS = ["primary", "info", "success", "warning", "error"] as const;
export type Accent = (typeof ACCENTS)[number];

// `solid`은 pigment 자체, wash·soft는 각각 가벼운 면이다. `muted`는 Ghost형 투명 면에
// 선택된 accent의 subtle tone을 전경으로 쓰는 보조 variant다.
export const VARIANTS = [
  "solid",
  "soft",
  "hairline",
  "hairlineMuted",
  "ghost",
  "muted",
] as const;
export type Variant = (typeof VARIANTS)[number];

export const resolveAccent = (accent: Accent | undefined, variant: Variant = "solid"): string =>
  accent ? `pui-a-${accent}-${variant}` : "";

export const INTERACTIVE = "pui-interactive";
