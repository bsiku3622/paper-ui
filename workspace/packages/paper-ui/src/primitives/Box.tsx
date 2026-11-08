import { forwardRef, type CSSProperties, type ElementType, type ReactNode } from "react";

import { BOX_STYLE_KEYS, resolveBoxClass, type BoxStyleProps } from "../resolvers";
import { joinClass } from "../internal/joinClass";
import { boxHideBelow, boxOverflow, boxSize, type BoxKeyword, type BoxOverflow } from "./Box.css";
import type { PolymorphicComponent, PolymorphicProps } from "./polymorphic";
import type { Breakpoint, Container, Dimension, Measure } from "../tokens";

export type BoxWidth = Dimension | `measure.${Measure}` | `container.${Container}` | BoxKeyword | number | (string & {});
export type BoxHeight = Dimension | BoxKeyword | "viewport" | number | (string & {});

export type BoxLayoutProps = {
  width?: BoxWidth;
  minWidth?: BoxWidth;
  maxWidth?: BoxWidth;
  height?: BoxHeight;
  minHeight?: BoxHeight;
  maxHeight?: BoxHeight;
  overflow?: BoxOverflow;
  overflowX?: BoxOverflow;
  overflowY?: BoxOverflow;
  hideBelow?: Breakpoint;
};

const SIZE_AXES = ["width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight"] as const;
const OVERFLOW_AXES = ["overflow", "overflowX", "overflowY"] as const;

const namedSize = (axis: (typeof SIZE_AXES)[number], value: string): string | undefined => {
  const families: Record<string, Record<string, string>> = boxSize[axis];
  const dot = value.indexOf(".");
  if (dot > 0) {
    const steps = families[value.slice(0, dot)];
    const step = value.slice(dot + 1);
    return steps && Object.hasOwn(steps, step) ? steps[step] : undefined;
  }
  for (const family of ["dimension", "keyword"]) {
    const steps = families[family];
    if (steps && Object.hasOwn(steps, value)) return steps[value];
  }
  return undefined;
};

export type BoxOwnProps = BoxStyleProps & BoxLayoutProps & {
  children?: ReactNode;
  className?: string;
};

export type BoxProps<As extends ElementType = "div"> = PolymorphicProps<BoxOwnProps, As>;

const BoxImpl = forwardRef<HTMLDivElement, Omit<BoxProps, "as" | "ref"> & { as?: ElementType }>(function Box({
  as,
  width,
  minWidth,
  maxWidth,
  height,
  minHeight,
  maxHeight,
  overflow,
  overflowX,
  overflowY,
  hideBelow,
  children,
  className,
  style: styleOverride,
  ...rest
}, ref) {
  const Tag = (as ?? "div") as ElementType;

  const style: Record<string, unknown> = {};
  const dom: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rest)) {
    if ((BOX_STYLE_KEYS as readonly string[]).includes(k)) style[k] = v;
    else dom[k] = v;
  }

  const classes: string[] = [];
  const lengths: CSSProperties = {};
  const sizes = { width, minWidth, maxWidth, height, minHeight, maxHeight };
  for (const axis of SIZE_AXES) {
    const value = sizes[axis];
    if (value === undefined) continue;
    const named = typeof value === "string" ? namedSize(axis, value) : undefined;
    if (named) classes.push(named);
    else lengths[axis] = value;
  }
  const overflows = { overflow, overflowX, overflowY };
  for (const axis of OVERFLOW_AXES) {
    const value = overflows[axis];
    if (value !== undefined) classes.push(boxOverflow[axis][value]);
  }

  return (
    <Tag
      ref={ref}
      className={joinClass(
        resolveBoxClass(style as BoxStyleProps),
        ...classes,
        hideBelow && boxHideBelow[hideBelow],
        className,
      )}
      style={{ ...lengths, ...styleOverride }}
      {...dom}
    >
      {children}
    </Tag>
  );
});

export const Box = BoxImpl as PolymorphicComponent<BoxOwnProps, "div">;
