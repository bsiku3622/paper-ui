// Navbar — brand·item·actions를 JSX로 조합하는 상단 navigation.

import { createContext, useContext, type ComponentPropsWithoutRef, type ElementType, type MouseEvent, type ReactElement, type ReactNode } from "react";

import { Box, Inline } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { useControllableState } from "../internal/useControllableState";
import { navbarActions, navbarBrand, navbarInner, navbarRoot, navItem, navItemActive } from "./Navbar.css";

type NavbarContextValue = { value?: string; onValueChange?: (value: string) => void };
const NavbarContext = createContext<NavbarContextValue>({});
export type NavbarProps = { value?: string; defaultValue?: string; onValueChange?: (value: string) => void; width?: "full" | "content"; children: ReactNode };
const NavbarRoot = ({ value: controlledValue, defaultValue = "", onValueChange, width = "full", children }: NavbarProps) => {
  const [value, setValue] = useControllableState({ value: controlledValue, defaultValue, onValueChange });
  return <NavbarContext.Provider value={{ value, onValueChange: setValue }}>
  <Box as="header" surface="canvas" paddingX="lg" className={navbarRoot}><Inline as="nav" gap="xs" align="center" className={navbarInner[width]}>{children}</Inline></Box>
</NavbarContext.Provider>;
};

export type NavbarBrandProps = { children: ReactNode; className?: string };
export const NavbarBrand = ({ children, className }: NavbarBrandProps) => <Box className={joinClass(navbarBrand, className)}>{children}</Box>;
export type NavbarActionsProps = { children: ReactNode; className?: string };
export const NavbarActions = ({ children, className }: NavbarActionsProps) => <Box className={joinClass(navbarActions, className)}>{children}</Box>;

type NavbarItemOwn<As extends ElementType> = { as?: As; value: string; children: ReactNode; className?: string };
export type NavbarItemProps<As extends ElementType = "button"> = NavbarItemOwn<As> & Omit<ComponentPropsWithoutRef<As>, keyof NavbarItemOwn<As>>;
const NavbarItemImpl = <As extends ElementType = "button">({ as, value, children, className, onClick, ...rest }: NavbarItemProps<As>) => {
  const { value: selectedValue, onValueChange } = useContext(NavbarContext); const Tag = as ?? "button";
  return <Box as={Tag as ElementType} {...(Tag === "button" ? { type: "button" as const } : null)} {...(rest as object)} aria-current={value === selectedValue ? "page" : undefined} className={joinClass(navItem, value === selectedValue && navItemActive, className)} onClick={(event: MouseEvent<HTMLElement>) => {
    (onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined)?.(event); if (!event.defaultPrevented) onValueChange?.(value);
  }}>{children}</Box>;
};
export const NavbarItem = NavbarItemImpl as <As extends ElementType = "button">(props: NavbarItemProps<As>) => ReactElement;
export const Navbar = Object.assign(NavbarRoot, { Brand: NavbarBrand, Item: NavbarItem, Actions: NavbarActions });
