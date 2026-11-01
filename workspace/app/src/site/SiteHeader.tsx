// The site's header — the banner of every page that has the shell's chrome. The brand goes home, the
// navigation names the four parts of the site, and the tools hold the theme switch and the version.

import { Link as RouterLink, useLocation } from "react-router-dom";

import { Box, Inline, Link, Surface, Text } from "@studio-baeks/paper-ui";

import { ThemeToggle } from "../compositions/ThemeToggle";
import { Logo } from "./Logo";
import { SITE_NAV } from "./site-map";
import * as s from "./shell.css";

const isActive = (pathname: string, to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

export const SiteHeader = () => {
  const { pathname } = useLocation();
  const active = SITE_NAV.find((entry) => isActive(pathname, entry.to))?.to;
  return (
    <Surface as="header" fill="canvas" elevation="sticky" className={s.header}>
      <Box className={s.headerInner}>
        <Link as={RouterLink} to="/" underline="hover" className={`${s.navLink.plain} ${s.brand}`} aria-label="Paper UI 홈">
          <Logo height={26} />
        </Link>
        <Inline as="nav" aria-label="주요 메뉴" gap="sm" align="center" className={s.headerNav}>
          {SITE_NAV.map(({ to, label }) => (
            <Link as={RouterLink} key={to} to={to} underline="hover" className={s.navLink.bar} aria-current={active === to ? "page" : undefined}>{label}</Link>
          ))}
        </Inline>
        <Inline gap="sm" align="center" className={s.headerTools}>
          <ThemeToggle />
          <Surface fill="sunken" radius="full" border paddingX="sm" paddingY="xs">
            <Text variant="caption" as="span" ink="secondary" numeric>{`v${__PAPER_UI_VERSION__}`}</Text>
          </Surface>
        </Inline>
      </Box>
    </Surface>
  );
};
