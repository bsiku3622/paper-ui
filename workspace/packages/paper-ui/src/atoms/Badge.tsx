// Badge — 상태 한 낱말. Button 과 같은 accent 시스템(accent × variant)을 쓴다. 표시용이라
// paintClass 에 hoverable 을 안 줘 hover 색이 뜨지 않는다.
//   variant  soft(옅은 면, 기본) · solid(강조) · hairline · ghost · muted(accent subtle 보조 글자)
//   dot      앞에 작은 색 점 — 상태 표시자
//
// 예) <Badge accent="success">완료</Badge>            옅은 초록 pill
//     <Badge accent="error" variant="solid">3</Badge>  진한 빨강 카운트
//     <Badge accent="info" dot>진행</Badge>            점 + 라벨
//     <Badge accent="success" shape="pill">완료</Badge>   알약

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { paintClass } from "../primitives/paint/Paint";
import { resolveControlFontSize, resolvePreset } from "../resolvers";
import type { Accent, ControlFontSize, ControlShape, ControlSize, Variant } from "../tokens";
import { badgeRoot, badgeSize, badgeDot, badgePill } from "./Badge.css";

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "className"> & {
  // 의미 색 (info·success·warning·error). 안 주면 뉴트럴 회색.
  accent?: Accent;
  // 시각 무게 — 기본 soft(옅은 면). solid·hairline·ghost·muted 도 된다.
  variant?: Variant;
  // 크기 3 단 (sm·md·lg). 배지 높이 사다리(20·22·24).
  size?: ControlSize;
  fontSize?: ControlFontSize;
  // 앞에 작은 색 점(상태 표시자). 글자색(currentColor)을 따른다.
  dot?: boolean;
  // 실루엣 — rounded 는 시스템 곡선(radius.control), pill 은 알약(높이의 절반).
  // Button 과 같은 어휘라 나란히 서는 두 알약이 같은 곡선을 갖는다.
  shape?: ControlShape;
  children?: ReactNode;
  className?: string;
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { accent = "primary", variant = "soft", size = "md", fontSize, shape = "rounded", dot, children, className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={joinClass(
        badgeRoot,
        badgeSize[size],
        resolvePreset("badge"),
        resolveControlFontSize(fontSize),
        paintClass({ accent, variant }),
        shape === "pill" && badgePill,
        className,
      )}
      {...rest}
    >
      {dot ? <span className={badgeDot} aria-hidden /> : null}
      {children}
    </span>
  );
});
