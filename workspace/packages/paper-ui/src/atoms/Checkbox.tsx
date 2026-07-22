// Checkbox — 표시한다/안 한다.

import type { InputHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import type { Space } from "../tokens";
import { checkboxRoot, checkboxSize } from "./Checkbox.css";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "size"> & {
  // 크기 사다리 5 단 (xs~xl). 변 14·15·16·18·20. 큰 폼에서 라벨과 함께 커진다.
  size?: Space;
  className?: string;
};

export const Checkbox = ({ size = "md", className, ...rest }: CheckboxProps) => (
  <input type="checkbox" className={joinClass(checkboxRoot, checkboxSize[size], className)} {...rest} />
);
