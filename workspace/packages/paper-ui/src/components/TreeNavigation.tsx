// TreeNavigation — 중첩 JSX가 실제 정보 계층과 같은 compound tree.

import { createContext, useContext, useState, type ComponentPropsWithoutRef, type ElementType, type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode } from "react";

import { Icon } from "../primitives";
import { Box, type BoxProps } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { useControllableState } from "../internal/useControllableState";
import { treeChevron, treeChevronOpen, treeDepth, treeGroup, treeLabel, treeRoot, treeRow, treeRowActive, treeSpacer } from "./TreeNavigation.css";

type TreeContextValue = { value?: string; expandedValues: Set<string>; toggle: (value: string, next?: boolean) => void; onValueChange?: (value: string) => void; depth: 1 | 2 | 3 | 4 };
const TreeContext = createContext<TreeContextValue | null>(null);
export type TreeNavigationProps = Omit<BoxProps<"div">, "as"> & { value?: string; defaultValue?: string; expandedValues?: readonly string[]; defaultExpandedValues?: readonly string[]; onExpandedValuesChange?: (values: string[]) => void; onValueChange?: (value: string) => void; "aria-label"?: string };
const TreeNavigationRoot = ({ value: controlledValue, defaultValue = "", expandedValues, defaultExpandedValues = [], onExpandedValuesChange, onValueChange, "aria-label": ariaLabel = "계층 탐색", className, children, ...rest }: TreeNavigationProps) => {
  const [value, setValue] = useControllableState({ value: controlledValue, defaultValue, onValueChange });
  const [internal, setInternal] = useState(defaultExpandedValues); const controlled = expandedValues !== undefined; const values = controlled ? expandedValues : internal;
  const toggle = (itemValue: string, next?: boolean) => { const output = new Set(values); const open = next ?? !output.has(itemValue); if (open) output.add(itemValue); else output.delete(itemValue); const array = Array.from(output); if (!controlled) setInternal(array); onExpandedValuesChange?.(array); };
  return <TreeContext.Provider value={{ value, expandedValues: new Set(values), toggle, onValueChange: setValue, depth: 1 }}><Box role="tree" aria-label={ariaLabel} className={joinClass(treeRoot, className)} onKeyDown={(event: KeyboardEvent<HTMLElement>) => { if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return; const rows = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-tree-row]")); const current = rows.indexOf(document.activeElement as HTMLElement); const next = rows[Math.min(rows.length - 1, Math.max(0, current + (event.key === "ArrowDown" ? 1 : -1)))]; if (next) { event.preventDefault(); next.focus(); } }} {...rest}>{children}</Box></TreeContext.Provider>;
};

type TreeItemOwn<As extends ElementType> = { as?: As; value: string; label: ReactNode; children?: ReactNode; className?: string };
export type TreeNavigationItemProps<As extends ElementType = "button"> = TreeItemOwn<As> & Omit<ComponentPropsWithoutRef<As>, keyof TreeItemOwn<As>>;
const TreeNavigationItemImpl = <As extends ElementType = "button">({ as, value, label, children, className, onClick, ...rest }: TreeNavigationItemProps<As>) => {
  const context = useContext(TreeContext); if (!context) throw new Error("TreeNavigation.Item must be used inside TreeNavigation"); const branch = children != null; const open = branch && context.expandedValues.has(value); const Tag = branch ? "button" : (as ?? "button"); const nextDepth = Math.min(4, context.depth + 1) as 1 | 2 | 3 | 4;
  return <Box><Box as={Tag as ElementType} {...(Tag === "button" ? { type: "button" as const } : null)} {...(rest as object)} role="treeitem" aria-level={context.depth} aria-expanded={branch ? open : undefined} aria-current={value === context.value ? "page" : undefined} data-tree-row className={joinClass(treeRow, treeDepth[context.depth], value === context.value && treeRowActive, className)} onClick={(event: MouseEvent<HTMLElement>) => { (onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined)?.(event); if (event.defaultPrevented) return; if (branch) context.toggle(value); else context.onValueChange?.(value); }} onKeyDown={(event: KeyboardEvent<HTMLElement>) => { if (!branch) return; if (event.key === "ArrowRight") { event.preventDefault(); context.toggle(value, true); } if (event.key === "ArrowLeft") { event.preventDefault(); context.toggle(value, false); } }}>
    {branch ? <Box as="span" className={joinClass(treeChevron, open && treeChevronOpen)}><Icon size="caption" aria-hidden><path d="m9 6 6 6-6 6" /></Icon></Box> : <Box as="span" className={treeSpacer} />}<Box as="span" className={treeLabel}>{label}</Box>
  </Box>{open ? <TreeContext.Provider value={{ ...context, depth: nextDepth }}><Box role="group" className={treeGroup}>{children}</Box></TreeContext.Provider> : null}</Box>;
};
export const TreeNavigationItem = TreeNavigationItemImpl as <As extends ElementType = "button">(props: TreeNavigationItemProps<As>) => ReactElement;
export const TreeNavigation = Object.assign(TreeNavigationRoot, { Item: TreeNavigationItem });
