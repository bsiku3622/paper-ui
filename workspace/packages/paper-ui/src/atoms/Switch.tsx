// Switch — 켬/끔 토글. Checkbox 와 형제지만 즉시 적용되는 설정 자리에 쓴다.

import type { InputHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import type { ControlSize } from "../tokens";
import { switchRoot, switchSize } from "./Switch.css";

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "size"> & {
  // 크기 3 단 (sm·md·lg). 트랙·손잡이 비례 스케일.
  size?: ControlSize;
  className?: string;
};

export const Switch = ({ size = "md", className, ...rest }: SwitchProps) => (
  <input type="checkbox" role="switch" className={joinClass(switchRoot, switchSize[size], className)} {...rest} />
);
