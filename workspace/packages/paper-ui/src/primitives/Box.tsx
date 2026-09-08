// Box — 면 하나. raw HTML 을 렌더하는 4 개 자리 중 하나.
//
// 이 시스템의 Box 는 "무엇이든 되는 div" 가 아니다. 종이 위의 *칸* 이다:
// 면(surface 깊이) · 테두리(border) · 간격(space) · 모서리(radius) · 그림자(shadow) 만
// 말할 수 있다. 색(잉크)은 여기 없다 — 큰 면을 색으로 채우지 않는 게 정체성이라, 색은
// Button·Badge·Alert(color × variant)가, 잉크는 글자(Text)가 정한다. 검은 판은 inverse 로.
// width/height/position 같은 건 없다 — 필요하면 className 으로 앱이 가져간다.
//
// `as` 는 상위 레이어가 raw 태그에 닿는 유일한 통로다 — Molecule 이 <button> 을
// 직접 못 쓰는 대신 <Box as="button"> 을 쓴다. 그래서 DOM prop 을 통과시킨다.

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { resolveBoxClass, type BoxLike } from "../resolvers";
import { joinClass } from "../internal/joinClass";
import { boxRadius, boxShadow, boxBorder } from "./Box.css";
import { ResolvedThemeContext, useResolvedTheme } from "./theme-context";

// `as` 를 제네릭으로 묶어야 <Box as="button" type="submit"> 의 type 이 검사된다.
type OwnProps<As extends ElementType> = BoxLike & {
  as?: As;
  // 카드 헤어라인 — 켜면 border.base 로 얇은 선. 면 위에 얹는다.
  border?: boolean;
  // 모서리 — 안 주면 각지게 둔다. full 은 알약(높이의 절반).
  radius?: "sm" | "md" | "lg" | "full";
  // 뜨는 건 overlay 뿐이다 (Modal · Popover). 면은 그림자로 뜨지 않는다.
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
  children,
  className,
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
