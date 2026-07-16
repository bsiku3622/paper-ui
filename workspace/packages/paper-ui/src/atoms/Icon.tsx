// Icon — 선으로 그린 표시. children 은 SVG path.
//
// 아이콘 세트를 시스템이 소유하지 않는다. viewBox 24 규격의 path 를 앱이 넣는다
// (lucide 등). 시스템이 정하는 건 크기·획 굵기·색이 잉크를 따른다는 것뿐이다.

import type { ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { iconRoot } from "./Icon.css";

export type IconProps = {
  children?: ReactNode;
  className?: string;
  "aria-label"?: string;
};

export const Icon = ({ children, className, ...rest }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={joinClass(iconRoot, className)}
    aria-hidden={rest["aria-label"] ? undefined : true}
    {...rest}
  >
    {children}
  </svg>
);
