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
import { useControllableState } from "../internal/useControllableState";
import {
  sidebarBadge,
  sidebarGroup,
  sidebarGroupLabel,
  sidebarItem,
  sidebarItemActive,
  sidebarRoot,
} from "./Sidebar.css";

type SidebarContextValue = { value?: string; onValueChange?: (value: string) => void };
const SidebarContext = createContext<SidebarContextValue>({});
const SidebarItemContext = createContext(false);

export type SidebarProps = Omit<BoxProps<"nav">, "as"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

const SidebarRoot = ({ value: controlledValue, defaultValue = "", onValueChange, className, children, ...rest }: SidebarProps) => {
  const [value, setValue] = useControllableState({ value: controlledValue, defaultValue, onValueChange });
  return <SidebarContext.Provider value={{ value, onValueChange: setValue }}>
    <Box as="nav" className={joinClass(sidebarRoot, className)} {...rest}>{children}</Box>
  </SidebarContext.Provider>;
};

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
  const { value: selectedValue, onValueChange } = useContext(SidebarContext);
  const selected = value === selectedValue;
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
        if (!event.defaultPrevented) onValueChange?.(value);
      }}
    >
      <SidebarItemContext.Provider value={selected}>{children}</SidebarItemContext.Provider>
    </Box>
  );
};

export const SidebarItem = SidebarItemImpl as <As extends ElementType = "button">(
  props: SidebarItemProps<As>,
) => ReactElement;

export type SidebarBadgeProps = BadgeProps & { selectedVariant?: BadgeProps["variant"] };
export const SidebarBadge = ({ variant = "soft", selectedVariant, className, ...rest }: SidebarBadgeProps) => {
  const selected = useContext(SidebarItemContext);
  const resolved = selected ? (selectedVariant ?? variant) : variant;
  return (
    <Badge
      {...rest}
      variant={resolved}
      size={rest.size ?? "sm"}
      shape={rest.shape ?? "pill"}
      className={joinClass(sidebarBadge, className)}
    />
  );
};

export const Sidebar = Object.assign(SidebarRoot, {
  Group: SidebarGroup,
  Item: SidebarItem,
  Badge: SidebarBadge,
});
