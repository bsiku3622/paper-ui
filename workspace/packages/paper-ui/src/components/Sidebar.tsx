// Sidebar — JSX 계층이 실제 navigation 계층과 같은 compound API.

import {
  createContext,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementType,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";

import { Badge, type BadgeProps } from "../atoms";
import { Box, Text, type BoxProps } from "../primitives";
import { joinClass } from "../internal/joinClass";
import {
  sidebarBadge,
  sidebarBadgeSelectedOverlay,
  sidebarGroup,
  sidebarGroupLabel,
  sidebarItem,
  sidebarItemActive,
  sidebarRoot,
} from "./Sidebar.css";

type SidebarContextValue = { active?: string; onSelect?: (value: string) => void };
const SidebarContext = createContext<SidebarContextValue>({});
const SidebarItemContext = createContext(false);

export type SidebarProps = Omit<BoxProps<"nav">, "as" | "onSelect"> & {
  active?: string;
  onSelect?: (value: string) => void;
};

const SidebarRoot = ({ active, onSelect, className, children, ...rest }: SidebarProps) => (
  <SidebarContext.Provider value={{ active, onSelect }}>
    <Box as="nav" className={joinClass(sidebarRoot, className)} {...rest}>{children}</Box>
  </SidebarContext.Provider>
);

export type SidebarGroupProps = Omit<BoxProps<"div">, "children"> & {
  label?: ReactNode;
  children: ReactNode;
};
export const SidebarGroup = ({ label, children, className, ...rest }: SidebarGroupProps) => (
  <Box className={joinClass(sidebarGroup, className)} {...rest}>
    {label ? <Text variant="caption" className={sidebarGroupLabel}>{label}</Text> : null}
    {children}
  </Box>
);

type SidebarItemOwn<As extends ElementType> = {
  as?: As;
  value: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
};
export type SidebarItemProps<As extends ElementType = "button"> = SidebarItemOwn<As> &
  Omit<ComponentPropsWithoutRef<As>, keyof SidebarItemOwn<As>>;

const SidebarItemImpl = <As extends ElementType = "button">({ as, value, disabled, children, className, onClick, ...rest }: SidebarItemProps<As>) => {
  const { active, onSelect } = useContext(SidebarContext);
  const selected = value === active;
  const Tag = as ?? "button";
  return (
    <Box
      as={Tag as ElementType}
      {...(Tag === "button" ? { type: "button" as const } : null)}
      {...(rest as object)}
      aria-current={selected ? "page" : undefined}
      aria-disabled={disabled || undefined}
      className={joinClass(sidebarItem, selected && sidebarItemActive, className)}
      onClick={(event: MouseEvent<HTMLElement>) => {
        if (disabled) { event.preventDefault(); return; }
        (onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined)?.(event);
        if (!event.defaultPrevented) onSelect?.(value);
      }}
    >
      <SidebarItemContext.Provider value={selected}>{children}</SidebarItemContext.Provider>
    </Box>
  );
};

export const SidebarItem = SidebarItemImpl as <As extends ElementType = "button">(
  props: SidebarItemProps<As>,
) => ReactElement;

export type SidebarBadgeProps = BadgeProps & { activeVariant?: BadgeProps["variant"] };
export const SidebarBadge = ({ variant = "soft", activeVariant, className, ...rest }: SidebarBadgeProps) => {
  const active = useContext(SidebarItemContext);
  const resolved = active ? (activeVariant ?? variant) : variant;
  return (
    <Badge
      {...rest}
      variant={resolved}
      size={rest.size ?? "sm"}
      shape={rest.shape ?? "pill"}
      className={joinClass(sidebarBadge, active && resolved === "soft" && sidebarBadgeSelectedOverlay, className)}
    />
  );
};

export const Sidebar = Object.assign(SidebarRoot, {
  Group: SidebarGroup,
  Item: SidebarItem,
  Badge: SidebarBadge,
});
