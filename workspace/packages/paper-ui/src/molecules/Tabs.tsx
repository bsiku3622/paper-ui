// Tabs — 탭 목록을 JSX item으로 드러내는 compound control.

import { createContext, useContext, type KeyboardEvent, type ReactNode } from "react";

import { Box, Inline } from "../primitives";
import { joinClass } from "../internal/joinClass";
import type { ControlSize } from "../tokens";
import { tabsList, tabsListVariant, tabsListShape, tabItem, tabItemVariant, tabItemSize, tabItemShape, tabItemActive, tabItemActiveVariant } from "./Tabs.css";

export type TabsVariant = "segmented" | "underline";
type TabsContextValue = { value: string; onChange: (value: string) => void; size: ControlSize; variant: TabsVariant; shape: "default" | "pill" };
const TabsContext = createContext<TabsContextValue | null>(null);
export type TabsProps = { value: string; onChange: (value: string) => void; size?: ControlSize; variant?: TabsVariant; shape?: "default" | "pill"; className?: string; children: ReactNode };
const TabsRoot = ({ value, onChange, size = "sm", variant = "segmented", shape = "default", className, children }: TabsProps) => <TabsContext.Provider value={{ value, onChange, size, variant, shape }}>
  <Inline role="tablist" className={joinClass(tabsList, tabsListVariant[variant], variant === "segmented" && tabsListShape[shape], className)} onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]'));
    const current = tabs.indexOf(document.activeElement as HTMLElement);
    let next = current;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % tabs.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0; else if (event.key === "End") next = tabs.length - 1; else return;
    event.preventDefault(); tabs[next]?.click(); tabs[next]?.focus();
  }}>{children}</Inline>
</TabsContext.Provider>;

export type TabItemProps = { value: string; panelId?: string; children: ReactNode };
export const TabItem = ({ value, panelId, children }: TabItemProps) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tabs.Item must be used inside Tabs");
  const selected = value === context.value;
  return <Box as="button" type="button" role="tab" aria-selected={selected} aria-controls={panelId} tabIndex={selected ? 0 : -1}
    className={joinClass(tabItem, tabItemVariant[context.variant], tabItemSize[context.size], context.variant === "segmented" && tabItemShape[context.shape], selected && tabItemActive, selected && tabItemActiveVariant[context.variant])}
    onClick={() => context.onChange(value)}>{children}</Box>;
};
export const Tabs = Object.assign(TabsRoot, { Item: TabItem });
