// Box — 1차 바탕. raw HTML 을 렌더하는 4 개 자리 중 하나.
//
// Box 는 "무엇이든 되는 div" 가 아니다. 종이 위의 *칸* 이다: 안쪽 여백(padding)과
// box model의 크기·잘림을 말할 수 있다. 색은 어떤 것도 없다 — 면 · 테두리 · 모서리 · 높이 · 테마는
// Surface(2차, paint)가, accent × variant 는 Paint 가, 잉크는 Text 가 정한다.
// position·flex layout은 열지 않는다. 그건 Stack·Inline 또는 소비처 className의 책임이다.
//
// `as` preserves the semantic tag when a caller needs a native element.

import { forwardRef, type CSSProperties, type ElementType, type ReactNode } from "react";

import { BOX_STYLE_KEYS, resolveBoxClass, type BoxStyleProps } from "../resolvers";
import { joinClass } from "../internal/joinClass";
import { boxOverflow, boxSize, type BoxKeyword, type BoxOverflow } from "./Box.css";
import type { PolymorphicComponent, PolymorphicProps } from "./polymorphic";
import type { Container, Dimension, Measure } from "../tokens";

// 크기는 이름 가족 넷 중 하나이거나 CSS 길이다. 이름(Shape dimension · measure, Layout container, 키워드)은
// class 가 되고, Primitive 인 Box 는 앱 고유 layout 도 담아야 하므로 CSS 길이 escape hatch 만 inline 으로 간다.
export type BoxWidth = Dimension | `measure.${Measure}` | `container.${Container}` | BoxKeyword | number | (string & {});
export type BoxHeight = Dimension | BoxKeyword | number | (string & {});

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
};

const SIZE_AXES = ["width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight"] as const;
const OVERFLOW_AXES = ["overflow", "overflowX", "overflowY"] as const;

// `md` 는 dimension 이고 `measure.md` · `container.content` 는 가족을 앞에 단다. 이름이 아니면 undefined.
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

// 자기 prop 을 뺀 나머지 DOM 속성은 그대로 통과 (onClick · role · aria-*). `as` 를 제네릭으로 묶어야
// <Box as="button" type="submit"> 의 type 이 검사된다.
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
  children,
  className,
  style: styleOverride,
  ...rest
}, ref) {
  const Tag = (as ?? "div") as ElementType;

  // styling prop 은 클래스로, 나머지는 DOM 으로. 한 객체에서 갈라낸다.
  const style: Record<string, unknown> = {};
  const dom: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rest)) {
    if ((BOX_STYLE_KEYS as readonly string[]).includes(k)) style[k] = v;
    else dom[k] = v;
  }

  // 이름은 class 로, 그 밖의 길이는 inline 으로.
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
