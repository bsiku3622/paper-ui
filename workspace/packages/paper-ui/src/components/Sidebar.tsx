// Sidebar — 여러 navigation group과 현재 위치를 한 세로 rail에 놓는다.

import type { ElementType, MouseEvent, ReactNode } from "react";

import { Badge } from "../atoms";
import { Box, Text, type BoxProps } from "../primitives";
import type { Color } from "../resolvers";
import { joinClass } from "../internal/joinClass";
import { sidebarGroup, sidebarGroupAfter, sidebarGroupLabel, sidebarItem, sidebarItemActive, sidebarItemLabel, sidebarRoot } from "./Sidebar.css";

export type SidebarBadge = { label: ReactNode; color?: Color };

export type SidebarItem = {
  value: string;
  label: ReactNode;
  as?: ElementType;
  badge?: SidebarBadge;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  [prop: string]: unknown;
};

export type SidebarGroup = { value: string; label?: ReactNode; items: readonly SidebarItem[] };

export type SidebarProps = Omit<BoxProps<"nav">, "as" | "children"> & {
  groups: readonly SidebarGroup[];
  active?: string;
  onSelect?: (value: string) => void;
};

export const Sidebar = ({ groups, active, onSelect, className, ...rest }: SidebarProps) => (
  <Box as="nav" className={joinClass(sidebarRoot, className)} {...rest}>
    {groups.map((group, groupIndex) => (
      <Box key={group.value} className={joinClass(sidebarGroup, groupIndex > 0 && sidebarGroupAfter)}>
        {group.label ? <Text variant="caption" className={sidebarGroupLabel}>{group.label}</Text> : null}
        {group.items.map(({ value, label, as, badge, disabled, onClick, ...itemRest }) => (
          <Box
            key={value}
            as={as ?? "button"}
            {...(as ? null : { type: "button" as const })}
            {...itemRest}
            aria-current={value === active ? "page" : undefined}
            aria-disabled={disabled || undefined}
            className={joinClass(sidebarItem, value === active && sidebarItemActive)}
            onClick={(event: MouseEvent<HTMLElement>) => {
              if (disabled) { event.preventDefault(); return; }
              onClick?.(event);
              if (event.defaultPrevented) return;
              onSelect?.(value);
            }}
          >
            <Box as="span" className={sidebarItemLabel}>{label}</Box>
            {badge ? <Badge color={badge.color ?? "primary"} variant="soft" size="sm" shape="pill">{badge.label}</Badge> : null}
          </Box>
        ))}
      </Box>
    ))}
  </Box>
);
