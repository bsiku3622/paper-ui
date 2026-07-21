// 공유 site chrome — 모든 화면 위 nav. paper-ui Navbar 로 조립.

import { Link, useLocation } from "react-router-dom";

import { Box, Inline, Navbar, Text, tokens } from "@studio-baeks/paper-ui";

export const SITE_NAV = [
  { to: "/", label: "홈" },
  { to: "/demo", label: "데모" },
  { to: "/playground", label: "플레이그라운드" },
  { to: "/docs", label: "문서" },
] as const;

const isActive = (pathname: string, to: string) =>
  to === "/" ? pathname === "/" : pathname.startsWith(to);

// paper-ui Navbar 는 items+onSelect(data API) 라, 라우팅을 위해 얇게 감싼 버전.
export const SiteNav = () => {
  const { pathname } = useLocation();
  return (
    <Box
      as="header"
      paper="base"
      paddingX="xl"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        borderBottom: `1px solid ${tokens.color.border.base}`,
      }}
    >
      <Inline gap="xl" style={{ height: "3.25rem" }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <Inline gap="sm">
            <Box
              radius="sm"
              aria-hidden
              style={{
                width: "1.5rem", height: "1.5rem", background: tokens.color.primary.base,
                color: tokens.color.primary.fg, display: "grid", placeItems: "center",
                fontSize: "0.75rem", fontWeight: 700,
              }}
            >
              P
            </Box>
            <Text variant="heading" as="span">paper-ui</Text>
          </Inline>
        </Link>
        <Inline as="nav" gap="lg">
          {SITE_NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              style={{
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: isActive(pathname, n.to) ? 550 : 400,
                color: isActive(pathname, n.to) ? tokens.color.ink.base : tokens.color.ink.soft,
              }}
            >
              {n.label}
            </Link>
          ))}
        </Inline>
      </Inline>
    </Box>
  );
};

// Navbar 를 직접 쓰고 싶은 페이지용 (data API). 위 SiteNav 가 기본.
export { Navbar };
