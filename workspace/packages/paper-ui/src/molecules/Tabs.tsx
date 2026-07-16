// Tabs — 같은 자리에 다른 장(章).
//
// raw <button> 대신 <Box as="button"> — Molecule 이 raw 태그에 닿는 유일한 통로.

import { Box, Inline } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { tabsList, tabItem, tabItemActive } from "./Tabs.css";

export type TabItem = { value: string; label: string };

export type TabsProps = {
  items: readonly TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export const Tabs = ({ items, value, onChange, className }: TabsProps) => (
  <Inline role="tablist" gap="lg" className={joinClass(tabsList, className)}>
    {items.map((t) => (
      <Box
        key={t.value}
        as="button"
        type="button"
        role="tab"
        aria-selected={t.value === value}
        className={joinClass(tabItem, t.value === value && tabItemActive)}
        onClick={() => onChange(t.value)}
      >
        {t.label}
      </Box>
    ))}
  </Inline>
);
