// Spinner — 진행 중 표시. currentColor 가 아니라 잉크/괘선 토큰으로 그린다.

import { joinClass } from "../internal/joinClass";
import type { Space } from "../tokens";
import { spinnerRoot, spinnerSize } from "./Spinner.css";

export type SpinnerProps = {
  // 크기 사다리 5 단 (xs~xl). Icon 과 같은 dot 사다리.
  size?: Space;
  label?: string;
  className?: string;
};

export const Spinner = ({ size = "md", label = "불러오는 중", className }: SpinnerProps) => (
  <span role="status" aria-label={label} className={joinClass(spinnerRoot, spinnerSize[size], className)} />
);
