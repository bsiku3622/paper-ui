// Box — 면 하나. raw HTML 을 렌더하는 4 개 자리 중 하나.
//
// 이 시스템의 Box 는 "무엇이든 되는 div" 가 아니다. 종이 위의 *칸* 이다:
// 면(paper) · 잉크(ink) · 괘선(ruled) · 간격(space) 만 말할 수 있다.
// width/height/position 같은 건 없다 — 필요하면 className 으로 앱이 가져간다.
// (studio-ui 는 Box 에 30 개 넘는 prop 을 달았고, 그게 Box 를 시스템이 아니라
//  CSS 를 TS 로 다시 쓴 물건으로 만들었다.)
//
// `as` 는 상위 레이어가 raw 태그에 닿는 유일한 통로다 — Molecule 이 <button> 을
// 직접 못 쓰는 대신 <Box as="button"> 을 쓴다. 그래서 DOM prop 을 통과시킨다.

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { resolveBoxClass, type BoxLike } from "../resolvers";
import { joinClass } from "../internal/joinClass";
import { boxRadius, boxShadow } from "./Box.css";

// `as` 를 제네릭으로 묶어야 <Box as="button" type="submit"> 의 type 이 검사된다.
type OwnProps<As extends ElementType> = BoxLike & {
  as?: As;
  // 모서리 — 안 주면 각지게 둔다.
  radius?: "sm" | "md" | "lg" | "pill";
  // 뜨는 건 overlay 뿐이다 (Modal · Popover). 면은 그림자로 뜨지 않는다.
  shadow?: "raised" | "overlay";
  children?: ReactNode;
  className?: string;
};

// 자기 prop 을 뺀 나머지 DOM 속성은 그대로 통과 (onClick · role · aria-*).
export type BoxProps<As extends ElementType = "div"> = OwnProps<As> &
  Omit<ComponentPropsWithoutRef<As>, keyof OwnProps<As>>;

const OWN_KEYS = [
  "paper",
  "ink",
  "accent",
  "tone",
  "status",
  "padding",
  "paddingX",
  "paddingY",
  "gap",
] as const;

export const Box = <As extends ElementType = "div">({
  as,
  radius,
  shadow,
  children,
  className,
  ...rest
}: BoxProps<As>) => {
  const Tag = (as ?? "div") as ElementType;

  // styling prop 은 클래스로, 나머지는 DOM 으로. 한 객체에서 갈라낸다.
  const style: Record<string, unknown> = {};
  const dom: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rest)) {
    if ((OWN_KEYS as readonly string[]).includes(k)) style[k] = v;
    else dom[k] = v;
  }

  return (
    <Tag
      className={joinClass(
        resolveBoxClass(style as BoxLike),
        radius && boxRadius[radius],
        shadow && boxShadow[shadow],
        className,
      )}
      {...dom}
    >
      {children}
    </Tag>
  );
};
