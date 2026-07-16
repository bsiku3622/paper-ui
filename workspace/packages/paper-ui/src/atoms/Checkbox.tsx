// Checkbox — 표시한다/안 한다.

import type { InputHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import { checkboxRoot } from "./Checkbox.css";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> & {
  className?: string;
};

export const Checkbox = ({ className, ...rest }: CheckboxProps) => (
  <input type="checkbox" className={joinClass(checkboxRoot, className)} {...rest} />
);
