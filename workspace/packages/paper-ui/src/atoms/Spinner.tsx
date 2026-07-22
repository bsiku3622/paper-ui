// Spinner — 진행 중 표시. currentColor 가 아니라 잉크/괘선 토큰으로 그린다.

import { joinClass } from "../internal/joinClass";
import { spinnerRoot } from "./Spinner.css";

export type SpinnerProps = {
  label?: string;
  className?: string;
};

export const Spinner = ({ label = "불러오는 중", className }: SpinnerProps) => (
  <span role="status" aria-label={label} className={joinClass(spinnerRoot, className)} />
);
