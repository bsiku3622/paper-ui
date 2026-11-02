// Surface — 면. Box 위에 색을 얹는 2차 primitive: 어떤 면(fill)에, 테두리 · 모서리 · 높이 · 테마를 두는가.
//
// Box 가 칸이라면 Surface 는 그 칸이 놓인 종이다. 면의 색 · 테두리 선 · 그림자는 모두 여기서 오고 Box 에는 없다.
// 요소는 하나다 — `as` 로 다른 primitive 를 고르면(<Surface as={Stack} gap="md" fill="raised">) 그 요소가 면이 된다.

import { forwardRef, type ElementType } from "react";

import { joinClass } from "../../internal/joinClass";
import { resolveFill } from "../../resolvers";
import { elevation as elevationClass, stickyTop, type StickyTop } from "../../styles/elevation.css";
import { useThemeScope } from "../../theme/scope";
import { stateAttributes, type Elevation, type SurfaceFill, type SurfaceRadius, type SurfaceTheme } from "../../tokens";
import { Box, type BoxOwnProps } from "../Box";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";
import { restingShadow, surfaceBorder, surfaceItem, surfaceRadius } from "./Surface.css";

// 그림자는 면이 드리운다. 면이 없는 상자의 그림자는 속이 빈 고리로 보이므로, fill 이 있을 때만 받는다.
type SurfaceFace = { fill?: SurfaceFill; shadow?: false } | { fill: SurfaceFill; shadow?: boolean };

export type SurfaceOwnProps = BoxOwnProps & SurfaceFace & {
  // fill 은 면의 깊이 — canvas · raised · sunken. 테마가 있는 Surface 는 fill 을 안 줘도 그 테마의 canvas 를 깐다.
  // shadow 는 제자리에 있는 면의 그림자 — 선 대신 가장자리를 세운다. 떠서 무언가를 덮는 면은 elevation 이고, elevation 의 그림자가 있으면 그것이 이긴다.
  // sticky 는 그림자가 없는 tier 라 shadow 를 그대로 받는다 — 창에 붙어 서는 사이드바도 바탕 위 첫 면이다.
  // 카드 헤어라인 — 켜면 border.base 로 얇은 선. 면 위에 얹는다.
  border?: boolean;
  // 모서리 — 안 주면 각지게 둔다. full 은 알약(높이의 절반).
  radius?: SurfaceRadius;
  // 높이 — position · 쌓임 순서(z) · 그림자를 한 번에 정한다. 그림자는 떠 있는 층만 갖고, 지면에 붙은 면은 prop 을 생략한다.
  elevation?: Elevation;
  // sticky 면이 멈추는 자리. 다른 tier 의 자리는 흐름이나 Floating 이 정하므로 sticky 일 때만 읽는다. 안 주면 앱의 className 이 정한다.
  top?: StickyTop;
  // 이 면의 테마 — light · dark 는 고정, inverse 는 주변의 반대(라이트 위 어두운 판, 다크 위 밝은 판).
  // 안쪽 글자는 이 테마의 잉크를 받고, 이 Surface 자신의 포커스 링과 그림자는 바깥 지면의 모드를 따른다.
  theme?: SurfaceTheme;
  // 면이 항목이 된다 — 포인터가 올라가면 중립 tint 가 뜨고, 눌리면 더 짙어지고, 선택되면 선택 tint 를 입는다. 눌림이 선택을 이기고
  // 선택이 hover 를 이기며, 막힌 대상(disabled · aria-disabled · data-disabled)과 터치에는 hover 가 없다.
  hoverable?: boolean;
  // data-selected 를 단다. 색은 prop 이 아니라 그 속성을 읽는 CSS 가 입히므로, 선택된 모습은 hoverable 면이 얻는다.
  selected?: boolean;
};

export type SurfaceProps<As extends ElementType = "div"> = PolymorphicProps<SurfaceOwnProps, As>;

// theme 이 필요로 하는 context 를 뺀 나머지 — class 로 갈 수 있는 모든 것.
export const surfaceClass = ({ fill, border, radius, elevation, top, hoverable, shadow }: Pick<SurfaceOwnProps, "border" | "radius" | "elevation" | "top" | "hoverable"> & { fill?: SurfaceFill; shadow?: boolean }): string =>
  joinClass(resolveFill(fill), border && surfaceBorder, radius && surfaceRadius[radius], elevation && elevationClass[elevation], elevation === "sticky" && top && stickyTop[top], shadow && fill && (!elevation || elevation === "sticky") && restingShadow, hoverable && surfaceItem);

const SurfaceImpl = forwardRef<HTMLElement, Omit<SurfaceProps, "as" | "ref"> & { as?: ElementType }>(function Surface({
  fill,
  border,
  radius,
  elevation,
  top,
  theme,
  hoverable,
  selected,
  shadow,
  className,
  ...rest
}, ref) {
  const scope = useThemeScope(theme);
  const node = (
    <Box
      ref={ref}
      className={joinClass(surfaceClass({ fill: theme !== undefined ? (fill ?? "canvas") : fill, border, radius, elevation, top, hoverable, shadow }), className)}
      {...scope.attributes}
      {...stateAttributes({ selected })}
      {...rest}
    />
  );
  return scope.provide(node);
});

export const Surface = SurfaceImpl as PolymorphicComponent<SurfaceOwnProps, "div">;
