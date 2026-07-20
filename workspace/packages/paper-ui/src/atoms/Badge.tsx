// Badge — 상태 한 낱말. status 를 주면 옅은 색 면(wash)이 붙는다.

import type { ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { resolveStatus } from "../resolvers";
import type { StatusName } from "../tokens";
import { badgeRoot, badgeNeutral } from "./Badge.css";

export type BadgeProps = {
  status?: StatusName;
  children?: ReactNode;
  className?: string;
};

export const Badge = ({ status, children, className }: BadgeProps) => (
  <span className={joinClass(badgeRoot, status ? resolveStatus(status, "wash") : badgeNeutral, className)}>
    {children}
  </span>
);
