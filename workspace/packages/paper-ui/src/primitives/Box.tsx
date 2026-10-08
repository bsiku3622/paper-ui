// Box — 면 하나. raw HTML 을 렌더하는 4 개 자리 중 하나.
//
// 이 시스템의 Box 는 "무엇이든 되는 div" 가 아니다. 종이 위의 *칸* 이다:
// 면(surface 깊이) · 테두리(border) · 간격(space) · 모서리(radius) · 그림자(shadow)와
// box model의 크기·잘림을 말할 수 있다. 색(잉크)은 여기 없다 — 큰 면을 색으로 채우지
// 않는 게 정체성이라, 색은 Button·Badge(accent × variant)가, 잉크는 Text가 정한다.
// position·flex layout은 열지 않는다. 그건 Stack·Inline 또는 소비처 className의 책임이다.
//
// `as` preserves the semantic tag when a caller needs a native element.

import type { ComponentPropsWithoutRef, CSSProperties, ElementType, ReactNode } from "react";

import { resolveBoxClass, type BoxLike } from "../resolvers";
import { joinClass } from "../internal/joinClass";
import { boxRadius, boxShadow, boxBorder } from "./Box.css";
import { ResolvedThemeContext, useResolvedTheme } from "./theme-context";
import { SHAPE_SIZES, tokens, type ShapeSize } from "../tokens";

// named size는 layout token으로 해석한다. Primitive인 Box는 앱 고유 layout도 담아야 하므로
// CSS 길이 escape hatch를 함께 둔다. `full`과 `fit`은 자주 쓰는 의도를 이름으로 남긴다.
export type BoxDimension = ShapeSize | "full" | "fit" | "min-content" | "max-content" | number | (string & {});

export type BoxLayoutProps = {
  width?: BoxDimension;
  minWidth?: BoxDimension;
  maxWidth?: BoxDimension;
  height?: BoxDimension;
  minHeight?: BoxDimension;
  maxHeight?: BoxDimension;
  overflow?: CSSProperties["overflow"];
  overflowX?: CSSProperties["overflowX"];
  overflowY?: CSSProperties["overflowY"];
};

const resolveDimension = (value: BoxDimension | undefined, axis: "width" | "height") => {
  if (value === undefined) return undefined;
  if (value === "full") return "100%";
  if (value === "fit") return "fit-content";
  if ((SHAPE_SIZES as readonly string[]).includes(String(value))) {
    return axis === "width"
      ? tokens.shape.width[value as ShapeSize].layout
      : tokens.shape.height[value as ShapeSize].layout;
  }
  return value;
};

// `as` 를 제네릭으로 묶어야 <Box as="button" type="submit"> 의 type 이 검사된다.
type OwnProps<As extends ElementType> = BoxLike & BoxLayoutProps & {
  as?: As;
  // 카드 헤어라인 — 켜면 border.base 로 얇은 선. 면 위에 얹는다.
  border?: boolean;
  // 모서리 — 안 주면 각지게 둔다. full 은 알약(높이의 절반).
  radius?: "sm" | "md" | "lg" | "full";
  // Shadow is reserved for surfaces that float above the page.
  shadow?: "overlay" | "overlayMinimal";
  // 이 면을 주변의 반대 테마로 — 라이트 위 어두운 판, 다크 위 밝은 판. ThemeScope
  // inverse 와 같은 엔진을 이 Box 자신에 건다(별도 DOM 노드 없이).
  inverse?: boolean;
  children?: ReactNode;
  className?: string;
};

// 자기 prop 을 뺀 나머지 DOM 속성은 그대로 통과 (onClick · role · aria-*).
export type BoxProps<As extends ElementType = "div"> = OwnProps<As> &
  Omit<ComponentPropsWithoutRef<As>, keyof OwnProps<As>>;

const OWN_KEYS = [
  "surface",
  "padding",
  "paddingX",
  "paddingY",
  "gap",
] as const;

export const Box = <As extends ElementType = "div">({
  as,
  border,
  radius,
  shadow,
  inverse,
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
}: BoxProps<As>) => {
  const Tag = (as ?? "div") as ElementType;
  const ambient = useResolvedTheme();
  // inverse 면 이 Box 자신에 반대 테마를 심는다 — data-theme 로 색 var 를 갈고,
  // 자식들이 기준 삼도록 context 도 덮는다(중첩 inverse 가 이 스코프를 본다).
  const scoped = inverse ? (ambient === "dark" ? "light" : "dark") : undefined;

  // styling prop 은 클래스로, 나머지는 DOM 으로. 한 객체에서 갈라낸다.
  const style: Record<string, unknown> = {};
  const dom: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rest)) {
    if ((OWN_KEYS as readonly string[]).includes(k)) style[k] = v;
    else dom[k] = v;
  }

  const node = (
    <Tag
      className={joinClass(
        resolveBoxClass(style as BoxLike),
        border && boxBorder,
        radius && boxRadius[radius],
        shadow && boxShadow[shadow],
        className,
      )}
      data-theme={scoped}
      style={{
        width: resolveDimension(width, "width"),
        minWidth: resolveDimension(minWidth, "width"),
        maxWidth: resolveDimension(maxWidth, "width"),
        height: resolveDimension(height, "height"),
        minHeight: resolveDimension(minHeight, "height"),
        maxHeight: resolveDimension(maxHeight, "height"),
        overflow,
        overflowX,
        overflowY,
        ...styleOverride,
      }}
      {...dom}
    >
      {children}
    </Tag>
  );

  return scoped ? (
    <ResolvedThemeContext.Provider value={scoped}>{node}</ResolvedThemeContext.Provider>
  ) : (
    node
  );
};
