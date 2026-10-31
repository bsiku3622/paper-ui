// Icon — 선으로 그린 표시. children 은 SVG path.
//
// 아이콘 세트를 시스템이 소유하지 않는다. viewBox 24 규격의 path 를 앱이 넣는다
// (lucide 등). 크기 이름은 Text 역할 이름의 부분집합이고, 아이콘 아트보드에 맞는
// 광학 크기로 보정한다.

import { forwardRef, useContext, type SVGProps } from "react";

import { joinClass } from "../internal/joinClass";
import { resolveInk } from "../resolvers";
import type { IconSize, Ink } from "../tokens";
import { iconRoot, iconSize } from "./Icon.css";
import { IconSizeContext } from "./icon-context";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "size"> & {
  // Text 역할 이름을 쓰는 아이콘 아트보드 크기. 안 주면 컨트롤 안에서는 그 컨트롤이 정한 크기, 그 밖에서는 body.
  size?: IconSize;
  // 잉크 농도 — 아이콘은 마크라 자기 색을 정한다(Text 로 감쌀 필요 없이). 안 주면
  // 부모 색(currentColor)을 따른다.
  ink?: Ink;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

// A name makes the icon an image; without one it is decoration and hidden from assistive technology.
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon({ size, ink, children, className, ...rest }, ref) {
  const inherited = useContext(IconSizeContext);
  const labelled = Boolean(rest["aria-label"] || rest["aria-labelledby"]);
  return (
  <svg
    ref={ref}
    focusable="false"
    viewBox="0 0 24 24"
    className={joinClass(iconRoot, iconSize[size ?? inherited ?? "body"], resolveInk(ink), className)}
    role={labelled ? "img" : undefined}
    aria-hidden={labelled ? undefined : true}
    {...rest}
  >
    {children}
  </svg>
);
});
