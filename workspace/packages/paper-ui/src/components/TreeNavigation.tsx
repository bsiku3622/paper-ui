// TreeNavigation — 접고 펴는 계층 navigation. 깊이는 시각적으로 4단까지 제한한다.

import { useState, type ElementType, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

import { Icon } from "../atoms";
import { Box, type BoxProps } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { treeChevron, treeChevronOpen, treeDepth, treeGroup, treeLabel, treeRoot, treeRow, treeRowActive, treeSpacer } from "./TreeNavigation.css";

export type TreeNavigationItem = {
  value: string;
  label: ReactNode;
  children?: readonly TreeNavigationItem[];
  as?: ElementType;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  [prop: string]: unknown;
};
export type TreeNavigationProps = Omit<BoxProps<"div">, "as" | "children" | "onSelect"> & {
  items: readonly TreeNavigationItem[];
  active?: string;
  expanded?: readonly string[];
  defaultExpanded?: readonly string[];
  onExpandedChange?: (values: string[]) => void;
  onSelect?: (value: string) => void;
  "aria-label"?: string;
};

type TreeItemViewProps = {
  item: TreeNavigationItem;
  depth: 1 | 2 | 3 | 4;
  active?: string;
  expanded: Set<string>;
  toggle: (value: string, next?: boolean) => void;
  onSelect?: (value: string) => void;
};

const TreeItemView = ({ item, depth, active, expanded, toggle, onSelect }: TreeItemViewProps) => {
  const branch = Boolean(item.children?.length);
  const open = branch && expanded.has(item.value);
  const { value, label, children, as, onClick, ...itemRest } = item;
  const nextDepth = Math.min(4, depth + 1) as 1 | 2 | 3 | 4;
  return (
    <Box>
      <Box
        as={branch ? "button" : (as ?? "button")}
        {...(branch || !as ? { type: "button" as const } : null)}
        {...itemRest}
        role="treeitem"
        aria-level={depth}
        aria-expanded={branch ? open : undefined}
        aria-current={value === active ? "page" : undefined}
        data-tree-row
        className={joinClass(treeRow, treeDepth[depth], value === active && treeRowActive)}
        onClick={(event: MouseEvent<HTMLElement>) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (branch) toggle(value);
          else onSelect?.(value);
        }}
        onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
          if (!branch) return;
          if (event.key === "ArrowRight") { event.preventDefault(); toggle(value, true); }
          if (event.key === "ArrowLeft") { event.preventDefault(); toggle(value, false); }
        }}
      >
        {branch ? (
          <Box as="span" className={joinClass(treeChevron, open && treeChevronOpen)}>
            <Icon size="sm" aria-hidden><path d="m9 6 6 6-6 6" /></Icon>
          </Box>
        ) : <Box as="span" className={treeSpacer} />}
        <Box as="span" className={treeLabel}>{label}</Box>
      </Box>
      {open ? (
        <Box role="group" className={treeGroup}>
          {children?.map((child) => <TreeItemView key={child.value} item={child} depth={nextDepth} active={active} expanded={expanded} toggle={toggle} onSelect={onSelect} />)}
        </Box>
      ) : null}
    </Box>
  );
};

export const TreeNavigation = ({ items, active, expanded, defaultExpanded = [], onExpandedChange, onSelect, "aria-label": ariaLabel = "계층 탐색", className, ...rest }: TreeNavigationProps) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const controlled = expanded !== undefined;
  const values = controlled ? expanded : internalExpanded;
  const valueSet = new Set(values);
  const toggle = (value: string, next?: boolean) => {
    const output = new Set(values);
    const shouldOpen = next ?? !output.has(value);
    if (shouldOpen) output.add(value); else output.delete(value);
    const array = Array.from(output);
    if (!controlled) setInternalExpanded(array);
    onExpandedChange?.(array);
  };
  return (
    <Box
      aria-label={ariaLabel}
      role="tree"
      className={joinClass(treeRoot, className)}
      onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        const rows = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-tree-row]"));
        const current = rows.indexOf(document.activeElement as HTMLElement);
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const next = rows[Math.min(rows.length - 1, Math.max(0, current + direction))];
        if (next) { event.preventDefault(); next.focus(); }
      }}
      {...rest}
    >
      {items.map((item) => <TreeItemView key={item.value} item={item} depth={1} active={active} expanded={valueSet} toggle={toggle} onSelect={onSelect} />)}
    </Box>
  );
};
