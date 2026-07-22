// Switch — 켬/끔 토글. Checkbox 와 형제지만 즉시 적용되는 설정 자리에 쓴다.

import type { InputHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import { switchRoot } from "./Switch.css";

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> & {
  className?: string;
};

export const Switch = ({ className, ...rest }: SwitchProps) => (
  <input type="checkbox" role="switch" className={joinClass(switchRoot, className)} {...rest} />
);
