// Accent resolver — surface 깊이와 accent × variant의 시각 무게를 분리한다.
//
// `accent`는 primary(중립 pigment)와 semantic status pigment를 함께 부르는 public API다.
// 컴포넌트는 이름만 말하고, 실제 class와 tone 조합은 profile이 결정한다.

import type { Accent, Surface, Variant } from "../tokens";

export const resolveSurface = (surface: Surface | undefined): string =>
  surface ? `pui-surface-${surface}` : "";

export const resolveAccent = (accent: Accent | undefined, variant: Variant = "solid"): string =>
  accent ? `pui-a-${accent}-${variant}` : "";

export const INTERACTIVE = "pui-interactive";
