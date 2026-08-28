// Icon — 선으로 그린 표시. children 은 SVG path.
//
// 아이콘 세트를 시스템이 소유하지 않는다. viewBox 24 규격의 path 를 앱이 넣는다
// (lucide 등). 시스템이 정하는 건 크기·획 굵기·색이 잉크를 따른다는 것뿐이다.

import type { ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { resolveInk, type Ink } from "../resolvers";
import type { ControlSize } from "../tokens";
import { iconRoot, iconSize } from "./Icon.css";

export type IconProps = {
  // 크기 3 단 (sm·md·lg). dot 사다리(14·16·18). Spinner 와 같은 사다리.
  size?: ControlSize;
  // 잉크 농도 — 아이콘은 마크라 자기 색을 정한다(Text 로 감싸는 꼼수 없이). 안 주면
  // 부모 색(currentColor)을 따른다.
  ink?: Ink;
  children?: ReactNode;
  className?: string;
  "aria-label"?: string;
};

export const Icon = ({ size = "md", ink, children, className, ...rest }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={joinClass(iconRoot, iconSize[size], resolveInk(ink), className)}
    aria-hidden={rest["aria-label"] ? undefined : true}
    {...rest}
  >
    {children}
  </svg>
);
