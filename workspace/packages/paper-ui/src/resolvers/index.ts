// Resolvers — 규칙의 주인.
//
// 컴포넌트는 "내가 어떤 색인지" 만 말하고, 그게 무슨 클래스가 되는지는 모른다.
// 색 해석이 컴포넌트마다 흩어지면 둘이 조용히 달라진다. 공유 축의 이름은 styles/ 의
// typed class map 을 인덱싱해 class 가 된다 — 이름을 문자열로 짓는 자리는 없다.

import { joinClass } from "../internal/joinClass";
import { spaceClass } from "../styles/space.css";
import { keys } from "../tokens/helpers";
export { resolveControlFontSize, resolvePreset, resolveText } from "./typography";
export { resolveFill, resolveInk } from "./color";
export { resolveGap, resolveSpace, type GapProps } from "./space";

// ───── 합성 (Box) ──────────────────────────────────────────────────────────────
//
// Box 는 1차 바탕이다: 어떤 안쪽 여백(padding)을 두는가. 자식 사이 간격(gap)은 자식을 늘어놓는 Stack·Inline·Grid 가 갖는다.
// 색은 Box 에 없다 — 면 · 테두리 · 모서리 · 높이 · 테마는 Surface, accent × variant 는 Paint, 잉크는 Text.
// 여백 축은 이 지도 하나에서 나온다 — prop 의 타입, Box 가 가르는 prop 의 목록, class 가 모두 같은 키를 돈다.

export const BOX_STYLE = {
  padding: spaceClass.padding,
  paddingX: spaceClass.paddingX,
  paddingY: spaceClass.paddingY,
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
