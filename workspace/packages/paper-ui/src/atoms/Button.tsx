// Button — 누르는 자리. Atom 은 자기 root 태그에 한해 raw 를 쓴다.

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { buttonRoot, buttonKind, buttonDanger } from "./Button.css";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  kind?: "solid" | "outline" | "quiet";
  // 되돌릴 수 없는 액션 — 잉크가 빨강으로 바뀐다. kind 와 직교.
  danger?: boolean;
  children?: ReactNode;
  className?: string;
};

export const Button = ({
  kind = "outline",
  danger,
  children,
  className,
  type = "button",
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={joinClass(
      buttonRoot,
      buttonKind[kind],
      danger && kind === "solid" && buttonDanger,
      className,
    )}
    {...rest}
  >
    {children}
  </button>
);
