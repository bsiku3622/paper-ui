import { forwardRef, type ElementType } from "react";

import { joinClass } from "../../internal/joinClass";
import { resolveFill } from "../../resolvers";
import { elevation as elevationClass, stickyTop, type StickyTop } from "../../styles/elevation.css";
import { useThemeScope } from "../../theme/scope";
import { stateAttributes, type Elevation, type LineSide, type SurfaceFill, type SurfaceRadius, type SurfaceTheme } from "../../tokens";
import { Box, type BoxOwnProps } from "../Box";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";
import { restingShadow, surfaceBorder, surfaceItem, surfaceRadius } from "./Surface.css";

type SurfaceFace = { fill?: SurfaceFill; shadow?: false } | { fill: SurfaceFill; shadow?: boolean };

export type SurfaceOwnProps = BoxOwnProps & SurfaceFace & {
  border?: boolean | LineSide;
  radius?: SurfaceRadius;
  elevation?: Elevation;
  top?: StickyTop;
  theme?: SurfaceTheme;
  hoverable?: boolean;
  selected?: boolean;
};

export type SurfaceProps<As extends ElementType = "div"> = PolymorphicProps<SurfaceOwnProps, As>;

export const surfaceClass = ({ fill, border, radius, elevation, top, hoverable, shadow }: Pick<SurfaceOwnProps, "border" | "radius" | "elevation" | "top" | "hoverable"> & { fill?: SurfaceFill; shadow?: boolean }): string =>
  joinClass(resolveFill(fill), border && surfaceBorder[border === true ? "all" : border], radius && surfaceRadius[radius], elevation && elevationClass[elevation], elevation === "sticky" && top && stickyTop[top], shadow && fill && (!elevation || elevation === "sticky") && restingShadow, hoverable && surfaceItem);

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
