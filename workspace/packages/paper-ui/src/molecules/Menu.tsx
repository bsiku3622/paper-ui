// Menu — action과 navigation link가 같은 한 열에 서는 기본 목록.

import type { ElementType, KeyboardEvent, MouseEvent, ReactNode } from "react";

import { Box, Stack, Text, type BoxProps } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { menuItem, menuItemActive, menuItemCopy, menuItemDanger, menuItemIcon, menuRoot, menuShortcut } from "./Menu.css";

export type MenuItem = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  shortcut?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  as?: ElementType;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  [prop: string]: unknown;
};

export type MenuProps = Omit<BoxProps<"div">, "as" | "children" | "onSelect"> & {
  items: readonly MenuItem[];
  active?: string;
  onSelect?: (value: string) => void;
  "aria-label"?: string;
};

const focusItem = (root: HTMLElement, direction: 1 | -1 | "first" | "last") => {
  const items = Array.from(root.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])'));
  if (items.length === 0) return;
  if (direction === "first") { items[0]?.focus(); return; }
  if (direction === "last") { items.at(-1)?.focus(); return; }
  const current = items.indexOf(document.activeElement as HTMLElement);
  const next = current < 0 ? 0 : (current + direction + items.length) % items.length;
  items[next]?.focus();
};

export const Menu = ({ items, active, onSelect, className, "aria-label": ariaLabel = "메뉴", ...rest }: MenuProps) => (
  <Box
    role="menu"
    aria-label={ariaLabel}
    surface="raised"
    border
    radius="md"
    className={joinClass(menuRoot, className)}
    onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "ArrowDown") { event.preventDefault(); focusItem(event.currentTarget, 1); }
      if (event.key === "ArrowUp") { event.preventDefault(); focusItem(event.currentTarget, -1); }
      if (event.key === "Home") { event.preventDefault(); focusItem(event.currentTarget, "first"); }
      if (event.key === "End") { event.preventDefault(); focusItem(event.currentTarget, "last"); }
    }}
    {...rest}
  >
    {items.map(({ value, label, description, icon, shortcut, disabled, danger, as, onClick, ...itemRest }, index) => (
      <Box
        key={value}
        as={as ?? "button"}
        {...(as ? null : { type: "button" as const })}
        {...itemRest}
        role="menuitem"
        tabIndex={!disabled && index === items.findIndex((item) => !item.disabled) ? 0 : -1}
        aria-disabled={disabled || undefined}
        aria-current={value === active ? "page" : undefined}
        className={joinClass(menuItem, value === active && menuItemActive, danger && menuItemDanger)}
        onClick={(event: MouseEvent<HTMLElement>) => {
          if (disabled) { event.preventDefault(); return; }
          onClick?.(event);
          if (!event.defaultPrevented) onSelect?.(value);
        }}
      >
        {icon ? <Box as="span" className={menuItemIcon}>{icon}</Box> : null}
        <Stack gap="xs" className={menuItemCopy}>
          <Text as="span" variant="body" ink="inherit">{label}</Text>
          {description ? <Text as="span" variant="caption" ink="soft">{description}</Text> : null}
        </Stack>
        {shortcut ? <Text as="span" variant="label" className={menuShortcut}>{shortcut}</Text> : null}
      </Box>
    ))}
  </Box>
);
