// Menu — action과 navigation link를 JSX item으로 조합하는 한 열.

import { createContext, useContext, type ComponentPropsWithoutRef, type ElementType, type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode } from "react";

import { Box, Stack, Text, type BoxProps } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { menuItem, menuItemActive, menuItemCopy, menuItemDanger, menuItemIcon, menuRoot, menuShortcut } from "./Menu.css";

type MenuContextValue = { active?: string; onSelect?: (value: string) => void };
const MenuContext = createContext<MenuContextValue>({});

export type MenuProps = Omit<BoxProps<"div">, "as" | "onSelect"> & { active?: string; onSelect?: (value: string) => void; "aria-label"?: string };
const focusItem = (root: HTMLElement, direction: 1 | -1 | "first" | "last") => {
  const items = Array.from(root.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])'));
  if (!items.length) return;
  if (direction === "first") return items[0]?.focus();
  if (direction === "last") return items.at(-1)?.focus();
  const current = items.indexOf(document.activeElement as HTMLElement);
  items[current < 0 ? 0 : (current + direction + items.length) % items.length]?.focus();
};
const MenuRoot = ({ active, onSelect, className, children, "aria-label": ariaLabel = "메뉴", ...rest }: MenuProps) => (
  <MenuContext.Provider value={{ active, onSelect }}>
    <Box role="menu" aria-label={ariaLabel} surface="raised" border radius="md" className={joinClass(menuRoot, className)}
      onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
        if (event.key === "ArrowDown") { event.preventDefault(); focusItem(event.currentTarget, 1); }
        if (event.key === "ArrowUp") { event.preventDefault(); focusItem(event.currentTarget, -1); }
        if (event.key === "Home") { event.preventDefault(); focusItem(event.currentTarget, "first"); }
        if (event.key === "End") { event.preventDefault(); focusItem(event.currentTarget, "last"); }
      }} {...rest}>{children}</Box>
  </MenuContext.Provider>
);

type MenuItemOwn<As extends ElementType> = { as?: As; value: string; description?: ReactNode; icon?: ReactNode; shortcut?: ReactNode; disabled?: boolean; danger?: boolean; children: ReactNode; className?: string };
export type MenuItemProps<As extends ElementType = "button"> = MenuItemOwn<As> & Omit<ComponentPropsWithoutRef<As>, keyof MenuItemOwn<As>>;
const MenuItemImpl = <As extends ElementType = "button">({ as, value, description, icon, shortcut, disabled, danger, children, className, onClick, ...rest }: MenuItemProps<As>) => {
  const { active, onSelect } = useContext(MenuContext);
  const Tag = as ?? "button";
  return <Box as={Tag as ElementType} {...(Tag === "button" ? { type: "button" as const } : null)} {...(rest as object)} role="menuitem" tabIndex={disabled ? -1 : 0}
    aria-disabled={disabled || undefined} aria-current={value === active ? "page" : undefined} className={joinClass(menuItem, value === active && menuItemActive, danger && menuItemDanger, className)}
    onClick={(event: MouseEvent<HTMLElement>) => {
      if (disabled) { event.preventDefault(); return; }
      (onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined)?.(event);
      if (!event.defaultPrevented) onSelect?.(value);
    }}>
    {icon ? <Box as="span" className={menuItemIcon}>{icon}</Box> : null}
    <Stack gap="xs" className={menuItemCopy}><Text as="span" variant="body" ink="inherit">{children}</Text>{description ? <Text as="span" variant="caption" ink="soft">{description}</Text> : null}</Stack>
    {shortcut ? <Text as="span" variant="label" className={menuShortcut}>{shortcut}</Text> : null}
  </Box>;
};
export const MenuItem = MenuItemImpl as <As extends ElementType = "button">(props: MenuItemProps<As>) => ReactElement;
export const Menu = Object.assign(MenuRoot, { Item: MenuItem });
