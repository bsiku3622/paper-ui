// Icon — 선으로 그린 표시. children 은 SVG path.
//
// 아이콘 세트를 시스템이 소유하지 않는다. viewBox 24 규격의 path 를 앱이 넣는다
// (lucide 등). 크기는 typography ladder의 어휘를 따르되, 아이콘 아트보드에 맞는
// 광학 크기로 보정한다.

import { forwardRef, type SVGProps } from "react";

import { joinClass } from "../internal/joinClass";
import { resolveInk, type Ink } from "../resolvers";
import type { IconSize } from "../tokens";
import { iconRoot, iconSize } from "./Icon.css";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "size"> & {
  // typography ladder와 같은 이름을 쓰는 아이콘 아트보드 크기.
  size?: IconSize;
  // 잉크 농도 — 아이콘은 마크라 자기 색을 정한다(Text 로 감쌀 필요 없이). 안 주면
  // 부모 색(currentColor)을 따른다.
  ink?: Ink;
  className?: string;
  "aria-label"?: string;
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon({ size = "body", ink, children, className, ...rest }, ref) {
  return (
  <svg
    ref={ref}
    focusable="false"
    viewBox="0 0 24 24"
    className={joinClass(iconRoot, iconSize[size], resolveInk(ink), className)}
    aria-hidden={rest["aria-label"] || rest["aria-labelledby"] ? undefined : true}
    {...rest}
  >
    {children}
  </svg>
);
});
