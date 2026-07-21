// Navbar — 지면 맨 위 한 줄. 높이가 line 이라 본문 격자와 이어진다.

import type { ReactNode } from "react";

import { Box, Inline } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { navbarRoot, navItem, navItemActive } from "./Navbar.css";

export type NavItem = { value: string; label: string };

export type NavbarProps = {
  brand?: ReactNode;
  items?: readonly NavItem[];
  active?: string;
  onSelect?: (value: string) => void;
  trailing?: ReactNode;
};

export const Navbar = ({ brand, items = [], active, onSelect, trailing }: NavbarProps) => (
  <Inline
    as="header"
    paper="base"
    paddingX="lg"
    gap="xl"
    justify="between"
    className={navbarRoot}
  >
    <Inline gap="xl">
      {brand}
      <Inline as="nav" gap="lg">
        {items.map((i) => (
          <Box
            key={i.value}
            as="button"
            type="button"
            aria-current={i.value === active ? "page" : undefined}
            className={joinClass(navItem, i.value === active && navItemActive)}
            onClick={() => onSelect?.(i.value)}
          >
            {i.label}
          </Box>
        ))}
      </Inline>
    </Inline>
    {trailing}
  </Inline>
);
