// Badge — 상태 한 낱말. Button 과 같은 색 시스템을 쓴다: soft variant + status.
// status 를 주면 옅은 색 면(wash), 없으면 뉴트럴 회색 면.

import type { HTMLAttributes, ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { resolveColorClassnames } from "../resolvers";
import type { StatusName } from "../tokens";
import { badgeRoot } from "./Badge.css";

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "className"> & {
  status?: StatusName;
  children?: ReactNode;
  className?: string;
};

export const Badge = ({ status, children, className, ...rest }: BadgeProps) => (
  <span
    className={joinClass(badgeRoot, resolveColorClassnames("soft", status ?? "default"), className)}
    {...rest}
  >
    {children}
  </span>
);
