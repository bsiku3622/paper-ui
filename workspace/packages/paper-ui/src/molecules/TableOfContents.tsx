// TableOfContents — 문서 내부 계층을 JSX item으로 조합한다.

import { createContext, useContext, type ComponentPropsWithoutRef, type ElementType, type MouseEvent, type ReactElement, type ReactNode } from "react";

import { Box, Text, type BoxProps } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { tocDepth, tocItem, tocItemActive, tocLabel, tocRoot } from "./TableOfContents.css";

type TocContextValue = { active?: string; onSelect?: (value: string) => void };
const TocContext = createContext<TocContextValue>({});
export type TableOfContentsProps = Omit<BoxProps<"nav">, "as" | "onSelect"> & { active?: string; label?: ReactNode; onSelect?: (value: string) => void };
const TableOfContentsRoot = ({ active, label = "이 페이지에서", onSelect, className, children, ...rest }: TableOfContentsProps) => <TocContext.Provider value={{ active, onSelect }}>
  <Box as="nav" aria-label={typeof label === "string" ? label : "목차"} className={joinClass(tocRoot, className)} {...rest}>
    {label ? <Text as="span" variant="label" className={tocLabel}>{label}</Text> : null}{children}
  </Box>
</TocContext.Provider>;

type TocItemOwn<As extends ElementType> = { as?: As; value: string; depth?: 0 | 1 | 2; children: ReactNode; className?: string };
export type TableOfContentsItemProps<As extends ElementType = "a"> = TocItemOwn<As> & Omit<ComponentPropsWithoutRef<As>, keyof TocItemOwn<As>>;
const TableOfContentsItemImpl = <As extends ElementType = "a">({ as, value, depth = 0, children, className, onClick, ...rest }: TableOfContentsItemProps<As>) => {
  const { active, onSelect } = useContext(TocContext);
  const Tag = as ?? "a";
  return <Box as={Tag as ElementType} {...(Tag === "a" ? { href: `#${value}` } : null)} {...(rest as object)} aria-current={value === active ? "location" : undefined}
    className={joinClass(tocItem, tocDepth[depth], value === active && tocItemActive, className)} onClick={(event: MouseEvent<HTMLElement>) => {
      (onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined)?.(event);
      if (!event.defaultPrevented) onSelect?.(value);
    }}>{children}</Box>;
};
export const TableOfContentsItem = TableOfContentsItemImpl as <As extends ElementType = "a">(props: TableOfContentsItemProps<As>) => ReactElement;
export const TableOfContents = Object.assign(TableOfContentsRoot, { Item: TableOfContentsItem });
