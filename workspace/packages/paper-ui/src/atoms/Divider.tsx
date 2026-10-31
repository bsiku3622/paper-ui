// Divider — 칸을 나누는 선. 이 시스템에서 가장 자주 등장하는 시각 요소다.
// 선은 border 로 긋는다 — 색을 OS 가 정하는 모드에서도 남는다. ref 와 나머지 속성은 hr 로, className 도 hr 로 간다.

import { forwardRef, type HTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import { Box } from "../primitives";
import { linePaint } from "../primitives/paint/recipes.css";
import type { DividerLevel, Orientation } from "../tokens";
import { dividerRoot, dividerOrientation } from "./Divider.css";

export type DividerProps = Omit<HTMLAttributes<HTMLHRElement>, "className" | "children"> & {
  orientation?: Orientation;
  level?: DividerLevel;
  className?: string;
};

export const Divider = forwardRef<HTMLHRElement, DividerProps>(function Divider({ orientation = "horizontal", level = "base", className, ...rest }, ref) {
  return (
    <Box
      as="hr"
      ref={ref}
      aria-orientation={orientation}
      className={joinClass(dividerRoot, linePaint[level], dividerOrientation[orientation], className)}
      {...rest}
    />
  );
});
