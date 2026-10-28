// Divider — 칸을 나누는 선. 이 시스템에서 가장 자주 등장하는 시각 요소다.

import { joinClass } from "../internal/joinClass";
import type { DividerLevel, Orientation } from "../tokens";
import { dividerRoot, dividerLevel, dividerOrientation } from "./Divider.css";

export type DividerProps = {
  orientation?: Orientation;
  level?: DividerLevel;
  className?: string;
};

export const Divider = ({ orientation = "horizontal", level = "base", className }: DividerProps) => (
  <hr
    aria-orientation={orientation}
    className={joinClass(dividerRoot, dividerLevel[level], dividerOrientation[orientation], className)}
  />
);
