// Link — 딴 데로 가는 글자.

import type { AnchorHTMLAttributes, ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { linkRoot } from "./Link.css";

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & {
  children?: ReactNode;
  className?: string;
};

export const Link = ({ children, className, ...rest }: LinkProps) => (
  <a className={joinClass(linkRoot, className)} {...rest}>
    {children}
  </a>
);
