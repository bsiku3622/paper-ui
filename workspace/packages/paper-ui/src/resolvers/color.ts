// Color resolvers — 면 · 잉크 · accent × variant 의 이름을 class 로 고른다.
//
// 컴포넌트는 이름만 말하고, 그 이름이 어떤 class 인지는 styles/color.css.ts 의 지도가 안다.
// `accent`는 primary(중립 pigment)와 semantic status pigment를 함께 부르는 public API다.
// tone 조합은 tokens/color-recipes.ts 의 profile 이 정한다.

import { accentVariantClass, inkClass, surfaceClass } from "../styles/color.css";
import type { Accent, Ink, Surface, Variant } from "../tokens";

export const resolveSurface = (surface: Surface | undefined): string => (surface ? surfaceClass[surface] : "");

export const resolveInk = (ink: Ink | undefined): string => (ink ? inkClass[ink] : "");

export const resolveAccent = (accent: Accent | undefined, variant: Variant = "solid"): string =>
  accent ? accentVariantClass[accent][variant] : "";
