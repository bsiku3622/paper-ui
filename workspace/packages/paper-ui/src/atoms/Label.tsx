// Label — 입력의 이름표. label variant(mono·uppercase) 를 그대로 쓴다.

import type { LabelHTMLAttributes, ReactNode } from "react";

import { joinClass } from "../internal/joinClass";

export type LabelProps = Omit<LabelHTMLAttributes<HTMLLabelElement>, "className"> & {
  children?: ReactNode;
  className?: string;
};

export const Label = ({ children, className, ...rest }: LabelProps) => (
  <label className={joinClass("pui-text-label", className)} {...rest}>
    {children}
  </label>
);
