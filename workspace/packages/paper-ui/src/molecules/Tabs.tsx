// Tabs — underline navigation과 연결된 panel을 소유하는 compound component.

import { Children, createContext, isValidElement, useContext, useId, type KeyboardEvent, type ReactElement, type ReactNode } from "react";

import { Box, Inline, type BoxProps } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { useControllableState } from "../internal/useControllableState";
import type { ControlSize } from "../tokens";
import { tabContent, tabItem, tabItemActive, tabItemSize, tabsList, tabsRoot } from "./Tabs.css";

type TabsContextValue = { value: string; onValueChange: (value: string) => void; size: ControlSize; id: string };
const TabsContext = createContext<TabsContextValue | null>(null);

export type TabsProps = Omit<BoxProps<"div">, "as" | "children"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: ControlSize;
  children: ReactNode;
};

const firstTriggerValue = (children: ReactNode): string => {
  const list = Children.toArray(children).find(
    (child): child is ReactElement<TabsListProps> => isValidElement(child) && child.type === TabsList,
  );
  return Children.toArray(list?.props.children).find(
    (child): child is ReactElement<TabsTriggerProps> => isValidElement(child) && child.type === TabsTrigger,
  )?.props.value ?? "";
};

const TabsRoot = ({ value: controlledValue, defaultValue, onValueChange, size = "md", className, children, ...rest }: TabsProps) => {
  const id = useId();
  const [value, setValue] = useControllableState({ value: controlledValue, defaultValue: defaultValue ?? firstTriggerValue(children), onValueChange });
  return <TabsContext.Provider value={{ value, onValueChange: setValue, size, id }}><Box className={joinClass(tabsRoot, className)} {...rest}>{children}</Box></TabsContext.Provider>;
};

export type TabsListProps = Omit<BoxProps<"div">, "as">;
export const TabsList = ({ className, onKeyDown, ...rest }: TabsListProps) => <Inline {...rest} role="tablist" className={joinClass(tabsList, className)} onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
  onKeyDown?.(event); if (event.defaultPrevented) return;
  const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]'));
  const current = tabs.indexOf(document.activeElement as HTMLElement); let next = current;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % tabs.length;
  else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + tabs.length) % tabs.length;
  else if (event.key === "Home") next = 0; else if (event.key === "End") next = tabs.length - 1; else return;
  event.preventDefault(); tabs[next]?.click(); tabs[next]?.focus();
}} />;

const valueId = (id: string, kind: "tab" | "panel", value: string) => `${id}-${kind}-${value.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

export type TabsTriggerProps = Omit<BoxProps<"button">, "as" | "value"> & { value: string };
export const TabsTrigger = ({ value, className, onClick, ...rest }: TabsTriggerProps) => {
  const context = useContext(TabsContext); if (!context) throw new Error("Tabs.Trigger must be used inside Tabs"); const selected = value === context.value;
  return <Box {...rest} as="button" type="button" role="tab" id={valueId(context.id, "tab", value)} aria-selected={selected} aria-controls={valueId(context.id, "panel", value)} tabIndex={selected ? 0 : -1} className={joinClass(tabItem, tabItemSize[context.size], selected && tabItemActive, className)} onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) context.onValueChange(value); }} />;
};

export type TabsContentProps = Omit<BoxProps<"div">, "as" | "value"> & { value: string };
export const TabsContent = ({ value, className, ...rest }: TabsContentProps) => {
  const context = useContext(TabsContext); if (!context) throw new Error("Tabs.Content must be used inside Tabs");
  return <Box {...rest} role="tabpanel" id={valueId(context.id, "panel", value)} aria-labelledby={valueId(context.id, "tab", value)} hidden={value !== context.value} tabIndex={0} className={joinClass(tabContent, className)} />;
};

export const Tabs = Object.assign(TabsRoot, { List: TabsList, Trigger: TabsTrigger, Content: TabsContent });
