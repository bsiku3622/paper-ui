// Radio — 여럿 중 하나. 보통 RadioGroup 이 묶어 쓰지만 단독으로도 된다.

import type { InputHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import { radioRoot } from "./Radio.css";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> & {
  className?: string;
};

export const Radio = ({ className, ...rest }: RadioProps) => (
  <input type="radio" className={joinClass(radioRoot, className)} {...rest} />
);
