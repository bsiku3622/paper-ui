// Radio — 여럿 중 하나. 보통 RadioGroup 이 묶어 쓰지만 단독으로도 된다.

import type { InputHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import type { Space } from "../tokens";
import { radioRoot, radioSize } from "./Radio.css";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "size"> & {
  // 크기 사다리 5 단 (xs~xl). Checkbox 와 같은 변 사다리.
  size?: Space;
  className?: string;
};

export const Radio = ({ size = "md", className, ...rest }: RadioProps) => (
  <input type="radio" className={joinClass(radioRoot, radioSize[size], className)} {...rest} />
);
