// Badge — 상태 한 낱말. Button 과 같은 색 시스템(color × variant)을 쓴다. 표시용이라
// hover gate(pui-interactive)는 안 붙인다.
//   variant  soft(옅은 면, 기본) · solid(진한 채움 — 카운트·강조) · outline(테두리) · quiet(글자만)
//   dot      앞에 작은 색 점 — 상태 표시자
//
// 예) <Badge color="success">완료</Badge>            옅은 초록 pill
//     <Badge color="error" variant="solid">3</Badge>  진한 빨강 카운트
//     <Badge color="info" dot>진행</Badge>            점 + 라벨
//     <Badge color="success" radius="full">완료</Badge>  알약

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { resolveColor, type Color, type Variant } from "../resolvers";
import type { ControlSize } from "../tokens";
import { badgeRoot, badgeSize, badgeDot, badgeRadiusFull } from "./Badge.css";

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "className"> & {
  // 의미 색 (info·success·warning·error). 안 주면 뉴트럴 회색.
  color?: Color;
  // 시각 무게 — 기본 soft(옅은 면). solid·outline·quiet 도 된다.
  variant?: Variant;
  // 크기 3 단 (sm·md·lg). 배지 높이 사다리(20·22·24).
  size?: ControlSize;
  // 앞에 작은 색 점(상태 표시자). 글자색(currentColor)을 따른다.
  dot?: boolean;
  // 모서리 — 생략하면 시스템 곡선(radius.interaction). "full" 이면 알약.
  // Button 과 같은 어휘라 나란히 서는 두 알약이 같은 곡선을 갖는다.
  radius?: "full";
  children?: ReactNode;
  className?: string;
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { color = "primary", variant = "soft", size = "md", dot, radius, children, className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={joinClass(
        badgeRoot,
        badgeSize[size],
        resolveColor(color, variant),
        radius === "full" && badgeRadiusFull,
        className,
      )}
      {...rest}
    >
      {dot ? <span className={badgeDot} aria-hidden /> : null}
      {children}
    </span>
  );
});
