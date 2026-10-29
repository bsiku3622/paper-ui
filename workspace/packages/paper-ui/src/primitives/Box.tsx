// Box — 면 하나. raw HTML 을 렌더하는 4 개 자리 중 하나.
//
// 이 시스템의 Box 는 "무엇이든 되는 div" 가 아니다. 종이 위의 *칸* 이다:
// 면(surface 깊이) · 테두리(border) · 안쪽 여백(padding) · 모서리(radius) · 높이(elevation)와
// box model의 크기·잘림을 말할 수 있다. 색(잉크)은 여기 없다 — 큰 면을 색으로 채우지
// 않는 게 정체성이라, 색은 Button·Badge(accent × variant)가, 잉크는 Text가 정한다.
// position·flex layout은 열지 않는다. 그건 Stack·Inline 또는 소비처 className의 책임이다.
//
// `as` preserves the semantic tag when a caller needs a native element.

import { forwardRef, type CSSProperties, type ElementType, type ReactElement, type ReactNode } from "react";

import { BOX_STYLE_KEYS, resolveBoxClass, type BoxStyleProps } from "../resolvers";
import { joinClass } from "../internal/joinClass";
import { boxRadius, boxElevation, boxBorder, boxOverflow, boxSize, type BoxKeyword, type BoxOverflow } from "./Box.css";
import type { PolymorphicProps } from "./polymorphic";
import { useThemeScope } from "../theme/scope";
import type { BoxRadius, BoxTheme, Container, Dimension, Elevation, Measure } from "../tokens";

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
  // 카드 헤어라인 — 켜면 border.base 로 얇은 선. 면 위에 얹는다.
  border?: boolean;
  // 모서리 — 안 주면 각지게 둔다. full 은 알약(높이의 절반).
  radius?: BoxRadius;
  // 높이 — 쌓임 순서(z)와 그림자를 한 번에 정한다. 그림자는 떠 있는 층만 갖는다.
  elevation?: Exclude<Elevation, "base">;
  // 이 면의 테마 — light · dark 는 고정, inverse 는 주변의 반대(라이트 위 어두운 판, 다크 위 밝은 판).
  // 테마가 있는 Box 는 면을 따로 주지 않아도 그 테마의 canvas 를 깐다. 안쪽 글자는 이 테마의 잉크를 받고,
  // 이 Box 자신의 포커스 링과 그림자는 바깥 지면의 모드를 따른다.
  theme?: BoxTheme;
  children?: ReactNode;
  className?: string;
};

export type BoxProps<As extends ElementType = "div"> = PolymorphicProps<BoxOwnProps, As>;

const BoxImpl = forwardRef<HTMLDivElement, Omit<BoxProps, "as" | "ref"> & { as?: ElementType }>(function Box({
  as,
  border,
  radius,
  elevation,
  theme,
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
  const scope = useThemeScope(theme);

  // styling prop 은 클래스로, 나머지는 DOM 으로. 한 객체에서 갈라낸다.
  const style: Record<string, unknown> = {};
  const dom: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rest)) {
    if ((BOX_STYLE_KEYS as readonly string[]).includes(k)) style[k] = v;
    else dom[k] = v;
  }
  if (theme !== undefined) style.surface ??= "canvas";

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

  const node = (
    <Tag
      ref={ref}
      className={joinClass(
        resolveBoxClass(style as BoxStyleProps),
        border && boxBorder,
        radius && boxRadius[radius],
        elevation && boxElevation[elevation],
        ...classes,
        className,
      )}
      {...scope.attributes}
      style={{ ...lengths, ...styleOverride }}
      {...dom}
    >
      {children}
    </Tag>
  );

  return scope.provide(node);
});

export const Box = BoxImpl as <As extends ElementType = "div">(props: BoxProps<As>) => ReactElement;
