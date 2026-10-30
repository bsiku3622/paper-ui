// Color resolvers — 면 · 잉크의 이름을 class 로 고른다.
//
// 컴포넌트는 이름만 말하고, 그 이름이 어떤 class 인지는 styles/color.css.ts 의 지도가 안다.
// accent × variant 는 이 길이 아니라 paint 층의 paintClass 로만 간다.

import { fillClass, inkClass } from "../styles/color.css";
import type { Ink, SurfaceFill } from "../tokens";

export const resolveFill = (fill: SurfaceFill | undefined): string => (fill ? fillClass[fill] : "");

export const resolveInk = (ink: Ink | undefined): string => (ink ? inkClass[ink] : "");
