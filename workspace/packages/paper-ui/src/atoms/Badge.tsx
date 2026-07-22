// Badge — 상태 한 낱말. Button 과 같은 색 시스템을 쓴다: soft variant + status.
// status 를 주면 옅은 색 면(wash), 없으면 뉴트럴 회색 면.

import type { HTMLAttributes, ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { resolveColorClassnames } from "../resolvers";
import type { StatusName, Space } from "../tokens";
import { badgeRoot, badgeSize } from "./Badge.css";

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "className"> & {
  status?: StatusName;
  // 크기 사다리 5 단 (xs~xl). 배지 높이 사다리(18~28).
  size?: Space;
  children?: ReactNode;
  className?: string;
};

export const Badge = ({ status, size = "md", children, className, ...rest }: BadgeProps) => (
  <span
    className={joinClass(badgeRoot, badgeSize[size], resolveColorClassnames("soft", status ?? "default"), className)}
    {...rest}
  >
    {children}
  </span>
);
