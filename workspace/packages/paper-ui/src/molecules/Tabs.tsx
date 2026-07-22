// Tabs — 같은 자리에 다른 장(章).
//
// raw <button> 대신 <Box as="button"> — Molecule 이 raw 태그에 닿는 유일한 통로.

import { Box, Inline } from "../primitives";
import { joinClass } from "../internal/joinClass";
import type { Space } from "../tokens";
import { tabsList, tabItem, tabItemSize, tabItemActive } from "./Tabs.css";

export type TabItem = { value: string; label: string };

export type TabsProps = {
  items: readonly TabItem[];
  value: string;
  onChange: (value: string) => void;
  // 크기 사다리 5 단 (xs~xl). 세그먼트는 컴팩트해서 기본 sm.
  size?: Space;
  className?: string;
};

export const Tabs = ({ items, value, onChange, size = "sm", className }: TabsProps) => (
  <Inline role="tablist" gap="lg" className={joinClass(tabsList, className)}>
    {items.map((t) => (
      <Box
        key={t.value}
        as="button"
        type="button"
        role="tab"
        aria-selected={t.value === value}
        className={joinClass(tabItem, tabItemSize[size], t.value === value && tabItemActive)}
        onClick={() => onChange(t.value)}
      >
        {t.label}
      </Box>
    ))}
  </Inline>
);
