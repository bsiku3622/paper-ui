// Badge — 상태 한 낱말. status 를 주면 색이 따라온다 (info 는 무채색).

import type { ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { resolveStatus } from "../resolvers";
import type { StatusName } from "../tokens";
import { badgeRoot } from "./Badge.css";

export type BadgeProps = {
  status?: StatusName;
  children?: ReactNode;
  className?: string;
};

export const Badge = ({ status, children, className }: BadgeProps) => (
  <span className={joinClass(badgeRoot, status ? resolveStatus(status, "wash") : "paper-surface-sunk", className)}>
    {children}
  </span>
);
