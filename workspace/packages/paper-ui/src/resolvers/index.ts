// Resolvers — 규칙의 주인.
//
// 컴포넌트는 "내가 어떤 색인지" 만 말하고, 그게 무슨 클래스가 되는지는 모른다.
// 색 해석이 컴포넌트마다 흩어지면 둘이 조용히 달라진다. 공유 축의 이름은 styles/ 의
// typed class map 을 인덱싱해 class 가 된다 — 이름을 문자열로 짓는 자리는 없다.

import { joinClass } from "../internal/joinClass";
import { surfaceClass } from "../styles/color.css";
import { spaceClass } from "../styles/space.css";
import { keys } from "../tokens/helpers";
export { resolveControlFontSize, resolvePreset, resolveText } from "./typography";
export { resolveSurface, resolveInk, resolveAccent } from "./color";
export { resolveSpace } from "./space";

// ───── 합성 (Box) ──────────────────────────────────────────────────────────────
//
// Box 는 구조 패널이다: 어떤 면(surface 깊이)에, 어떤 간격(padding·gap)을 두는가.
// 색(잉크)·상태 같은 마크 축은 Box 에 없다 — 잉크색은 Button·Badge·Alert, 글자는 Text.
// 카드 테두리(border)·모서리(radius)·그림자(shadow)·테마(theme)는 Box.tsx 가 직접 붙인다.
// 면 · 여백 축은 이 지도 하나에서 나온다 — prop 의 타입, Box 가 가르는 prop 의 목록, class 가 모두 같은 키를 돈다.

export const BOX_STYLE = {
  surface: surfaceClass,
  padding: spaceClass.padding,
  paddingX: spaceClass.paddingX,
  paddingY: spaceClass.paddingY,
  gap: spaceClass.gap,
} as const;

export type BoxStyleProps = { [K in keyof typeof BOX_STYLE]?: keyof (typeof BOX_STYLE)[K] };

export const BOX_STYLE_KEYS = keys(BOX_STYLE);

export const resolveBoxClass = (props: BoxStyleProps): string =>
  joinClass(
    ...BOX_STYLE_KEYS.map((key) => {
      const name = props[key];
      return name ? (BOX_STYLE[key] as Record<string, string>)[name] : "";
    }),
  );
