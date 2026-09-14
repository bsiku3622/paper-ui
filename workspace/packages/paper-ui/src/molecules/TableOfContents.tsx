// TableOfContents — 한 문서 안의 위치. 계층은 깊이 3단까지만 허용한다.

import type { ElementType, MouseEvent, ReactNode } from "react";

import { Box, Text, type BoxProps } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { tocDepth, tocItem, tocItemActive, tocLabel, tocRoot } from "./TableOfContents.css";

export type TableOfContentsItem = {
  value: string;
  label: ReactNode;
  depth?: 0 | 1 | 2;
  as?: ElementType;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  [prop: string]: unknown;
};
export type TableOfContentsProps = Omit<BoxProps<"nav">, "as" | "children" | "onSelect"> & {
  items: readonly TableOfContentsItem[];
  active?: string;
  label?: ReactNode;
  onSelect?: (value: string) => void;
};

export const TableOfContents = ({ items, active, label = "이 페이지에서", onSelect, className, ...rest }: TableOfContentsProps) => (
  <Box as="nav" aria-label={typeof label === "string" ? label : "목차"} className={joinClass(tocRoot, className)} {...rest}>
    {label ? <Text as="span" variant="label" className={tocLabel}>{label}</Text> : null}
    {items.map(({ value, label: itemLabel, depth = 0, as, onClick, ...itemRest }) => (
      <Box
        key={value}
        as={as ?? "a"}
        {...(as ? null : { href: `#${value}` })}
        {...itemRest}
        aria-current={value === active ? "location" : undefined}
        className={joinClass(tocItem, tocDepth[depth], value === active && tocItemActive)}
        onClick={(event: MouseEvent<HTMLElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) onSelect?.(value);
        }}
      >
        {itemLabel}
      </Box>
    ))}
  </Box>
);
