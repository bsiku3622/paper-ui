// Divider — 칸을 나누는 선. 이 시스템에서 가장 자주 등장하는 시각 요소다.

import { joinClass } from "../internal/joinClass";
import { dividerRoot, dividerWeight, dividerAxis } from "./Divider.css";

export type DividerProps = {
  axis?: "horizontal" | "vertical";
  weight?: "base" | "strong";
  className?: string;
};

export const Divider = ({ axis = "horizontal", weight = "base", className }: DividerProps) => (
  <hr
    aria-orientation={axis}
    className={joinClass(dividerRoot, dividerWeight[weight], dividerAxis[axis], className)}
  />
);
