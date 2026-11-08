import { Link as RouterLink, useLocation } from "react-router-dom";

import { Box, Inline, Link, Surface, Text } from "@studio-baeks/paper-ui";

import { LocaleToggle } from "../compositions/LocaleToggle";
import { ThemeToggle } from "../compositions/ThemeToggle";
import { useSiteLocale } from "./locale";
import { Logo } from "./Logo";
import { SITE_NAV } from "./site-map";
import * as s from "./shell.css";

const isActive = (pathname: string, to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

const WORDS = {
  ko: { home: "Paper UI 홈", nav: "주요 메뉴" },
  en: { home: "Paper UI home", nav: "Main menu" },
} as const;

export const SiteHeader = () => {
  const { pathname } = useLocation();
  const { locale } = useSiteLocale();
  const words = WORDS[locale];
  const active = SITE_NAV.find((entry) => isActive(pathname, entry.to))?.to;
  return (
    <Surface as="header" fill="canvas" elevation="sticky" top="none" className={s.header}>
      <Box className={s.headerInner}>
        <Inline gap="md" className={s.brand}>
          <Link as={RouterLink} to="/" underline="hover" className={s.navLink.plain} aria-label={words.home}>
            <Logo height={24} />
          </Link>
          <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{`v${__PAPER_UI_VERSION__}`}</Text>
        </Inline>
        <Inline as="nav" aria-label={words.nav} gap="xl" className={s.headerNav}>
          {SITE_NAV.map(({ to, label }) => (
            <Link as={RouterLink} key={to} to={to} underline="hover" className={s.navLink.bar} aria-current={active === to ? "page" : undefined}>{label[locale]}</Link>
          ))}
        </Inline>
        <Inline gap="xs" align="center" className={s.headerTools}>
          <LocaleToggle />
          <ThemeToggle />
        </Inline>
      </Box>
    </Surface>
  );
};
