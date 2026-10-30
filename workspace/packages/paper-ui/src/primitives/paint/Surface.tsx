// Surface — 면. Box 위에 색을 얹는 2차 primitive: 어떤 면(fill)에, 테두리 · 모서리 · 높이 · 테마를 두는가.
//
// Box 가 칸이라면 Surface 는 그 칸이 놓인 종이다. 면의 색 · 테두리 선 · 그림자는 모두 여기서 오고 Box 에는 없다.
// 요소는 하나다 — `as` 로 다른 primitive 를 고르면(<Surface as={Stack} gap="md" fill="raised">) 그 요소가 면이 된다.

import { forwardRef, type ElementType } from "react";

import { joinClass } from "../../internal/joinClass";
import { resolveFill } from "../../resolvers";
import { useThemeScope } from "../../theme/scope";
import type { Elevation, SurfaceFill, SurfaceRadius, SurfaceTheme } from "../../tokens";
import { Box, type BoxOwnProps } from "../Box";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";
import { surfaceBorder, surfaceElevation, surfaceRadius } from "./Surface.css";

export type SurfaceOwnProps = BoxOwnProps & {
  // 면의 깊이 — canvas · raised · sunken. 테마가 있는 Surface 는 fill 을 안 줘도 그 테마의 canvas 를 깐다.
  fill?: SurfaceFill;
  // 카드 헤어라인 — 켜면 border.base 로 얇은 선. 면 위에 얹는다.
  border?: boolean;
  // 모서리 — 안 주면 각지게 둔다. full 은 알약(높이의 절반).
  radius?: SurfaceRadius;
  // 높이 — 쌓임 순서(z)와 그림자를 한 번에 정한다. 그림자는 떠 있는 층만 갖는다.
  elevation?: Exclude<Elevation, "base">;
  // 이 면의 테마 — light · dark 는 고정, inverse 는 주변의 반대(라이트 위 어두운 판, 다크 위 밝은 판).
  // 안쪽 글자는 이 테마의 잉크를 받고, 이 Surface 자신의 포커스 링과 그림자는 바깥 지면의 모드를 따른다.
  theme?: SurfaceTheme;
};

export type SurfaceProps<As extends ElementType = "div"> = PolymorphicProps<SurfaceOwnProps, As>;

// theme 이 필요로 하는 context 를 뺀 나머지 — class 로 갈 수 있는 모든 것.
export const surfaceClass = ({ fill, border, radius, elevation }: Pick<SurfaceOwnProps, "fill" | "border" | "radius" | "elevation">): string =>
  joinClass(resolveFill(fill), border && surfaceBorder, radius && surfaceRadius[radius], elevation && surfaceElevation[elevation]);

const SurfaceImpl = forwardRef<HTMLElement, Omit<SurfaceProps, "as" | "ref"> & { as?: ElementType }>(function Surface({
  fill,
  border,
  radius,
  elevation,
  theme,
  className,
  ...rest
}, ref) {
  const scope = useThemeScope(theme);
  const node = (
    <Box
      ref={ref}
      className={joinClass(surfaceClass({ fill: theme !== undefined ? (fill ?? "canvas") : fill, border, radius, elevation }), className)}
      {...scope.attributes}
      {...rest}
    />
  );
  return scope.provide(node);
});

export const Surface = SurfaceImpl as PolymorphicComponent<SurfaceOwnProps, "div">;
