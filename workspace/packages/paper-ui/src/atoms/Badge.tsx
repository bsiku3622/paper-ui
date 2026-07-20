// Badge — 상태 한 낱말. status 를 주면 옅은 색 면(wash)이 붙는다.

import type { HTMLAttributes, ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { resolveStatus } from "../resolvers";
import type { StatusName } from "../tokens";
import { badgeRoot, badgeNeutral } from "./Badge.css";

// 나머지 span 속성(data-* · aria-* · id 등)은 그대로 통과한다 — 다른 atom 과 동일.
export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "className"> & {
  status?: StatusName;
  children?: ReactNode;
  className?: string;
};

export const Badge = ({ status, children, className, ...rest }: BadgeProps) => (
  <span
    className={joinClass(badgeRoot, status ? resolveStatus(status, "wash") : badgeNeutral, className)}
    {...rest}
  >
    {children}
  </span>
);
