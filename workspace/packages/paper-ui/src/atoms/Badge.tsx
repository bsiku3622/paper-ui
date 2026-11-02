// Badge — 상태 한 낱말. Button 과 같은 accent 시스템(accent × variant)을 쓴다. Paint as="span" 에 서고, 표시용이라
// hoverable 을 안 줘 hover 색이 뜨지 않는다.
//   variant  soft(옅은 면, 기본) · solid(강조) · hairline · dashed · ghost · muted(accent subtle 보조 글자)
//   dot      앞에 작은 색 점 — 상태 표시자
//
// 예) <Badge accent="success">완료</Badge>            옅은 초록 pill
//     <Badge accent="error" variant="solid">3</Badge>  진한 빨강 카운트
//     <Badge accent="info" dot>진행</Badge>            점 + 라벨
//     <Badge accent="success" shape="rounded">완료</Badge> 버튼과 같은 곡선

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { Paint, type PaintFace } from "../primitives/paint/Paint";
import { dotPaint } from "../primitives/paint/recipes.css";
import { resolveControlFontSize, resolvePreset } from "../resolvers";
import type { Accent, ControlFontSize, ControlShape, ControlSize } from "../tokens";
import { badgeRoot, badgeSize, badgeDot, badgeRounded } from "./Badge.css";

// 시각 무게는 variant — 기본 soft(옅은 면). solid · hairline · dashed · ghost · muted 도 된다.
export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "className"> & PaintFace & {
  // 의미 색 (info·success·warning·error). 안 주면 뉴트럴 회색.
  accent?: Accent;
  // 크기 4 단 (xs·sm·md·lg). 높이는 Shape 의 배지 사다리.
  size?: ControlSize;
  fontSize?: ControlFontSize;
  // 앞에 작은 색 점(상태 표시자). 글자색(currentColor)을 따른다.
  dot?: boolean;
  // 실루엣 — 기본은 알약(radius.pill), rounded 는 같은 크기의 컨트롤 곡선(radius.control).
  // Button 과 같은 어휘라 나란히 서는 두 알약이 같은 곡선을 갖는다.
  shape?: ControlShape;
  children?: ReactNode;
  className?: string;
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { accent = "primary", variant = "soft", fill, shadow, size = "md", fontSize, shape = "pill", dot, children, className, ...rest },
  ref,
) {
  return (
    <Paint
      as="span"
      ref={ref}
      accent={accent}
      {...({ variant, fill, shadow } as PaintFace)}
      className={joinClass(
        badgeRoot,
        badgeSize[size],
        resolvePreset("badge"),
        resolveControlFontSize(fontSize),
        shape === "rounded" && badgeRounded[size],
        className,
      )}
      {...rest}
    >
      {dot ? <span className={joinClass(badgeDot, dotPaint)} aria-hidden /> : null}
      {children}
    </Paint>
  );
});
