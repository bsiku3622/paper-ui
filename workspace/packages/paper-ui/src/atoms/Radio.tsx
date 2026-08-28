// Radio — 여럿 중 하나. 보통 RadioGroup 이 묶어 쓰지만 단독으로도 된다.

import { forwardRef, type InputHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import type { ControlSize } from "../tokens";
import { radioRoot, radioSize } from "./Radio.css";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "size"> & {
  // 크기 3 단 (sm·md·lg). Checkbox 와 같은 변 사다리.
  size?: ControlSize;
  className?: string;
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { size = "md", className, ...rest },
  ref,
) {
  return <input type="radio" ref={ref} className={joinClass(radioRoot, radioSize[size], className)} {...rest} />;
});
