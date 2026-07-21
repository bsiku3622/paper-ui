// 공유 site chrome — 모든 화면 위에 얹는 통합 GNB.
//
// 브랜드는 손글씨 "Paper UI" 워드마크(Logo). 지면·데모 어디서나 같은 한 줄이 뜨고,
// 데모에는 escape 가 달린 얇은 DemoBar 로 같은 브랜드를 이어 붙인다 (GNB 통일).

import { Link, useLocation } from "react-router-dom";

import { Box, Inline, Navbar, Text, tokens } from "@studio-baeks/paper-ui";

import { Logo } from "./Logo";
import "./site.css";

export const SITE_NAV = [
  { to: "/", label: "홈" },
  { to: "/demo", label: "데모" },
  { to: "/playground", label: "플레이그라운드" },
  { to: "/docs", label: "문서" },
] as const;

const isActive = (pathname: string, to: string) =>
  to === "/" ? pathname === "/" : pathname.startsWith(to);

export const NAV_HEIGHT = "3.5rem";

// 브랜드 — 손글씨 로고. 홈으로 가는 통로.
const Brand = ({ height = 26 }: { height?: number }) => (
  <Link to="/" style={{ textDecoration: "none", color: tokens.color.ink.base, display: "inline-flex" }} aria-label="Paper UI 홈">
    <Logo height={height} />
  </Link>
);

// paper-ui Navbar 는 data API(items+onSelect)라, 라우팅을 위해 얇게 감싼 사이트 전용 GNB.
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
      <Inline gap="xl" justify="between" style={{ height: NAV_HEIGHT, maxWidth: "72rem", marginInline: "auto" }}>
        <Inline gap="xl" align="center">
          <Brand />
          <Inline as="nav" gap="lg">
            {SITE_NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                style={{
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: isActive(pathname, n.to) ? 550 : 450,
                  color: isActive(pathname, n.to) ? tokens.color.ink.base : tokens.color.ink.soft,
                }}
              >
                {n.label}
              </Link>
            ))}
          </Inline>
        </Inline>
        <Inline gap="md" align="center">
          <Text variant="caption" as="span" ink="faint" style={{ fontVariantNumeric: "tabular-nums" }}>
            v0.1.0
          </Text>
        </Inline>
      </Inline>
    </Box>
  );
};

// 데모용 얇은 통합 바 — 브랜드를 이어 붙이고 사이트로 돌아가는 escape 를 준다.
// 데모의 제품 Navbar 는 이 아래에 그대로 살아 데모의 사실감을 지킨다.
export const DemoBar = () => (
  <Box
    as="header"
    paddingX="xl"
    style={{
      background: tokens.color.ink.base,
      color: tokens.color.paper.base,
    }}
  >
    <Inline gap="md" justify="between" align="center" style={{ height: "2.5rem", maxWidth: "72rem", marginInline: "auto" }}>
      <Inline gap="sm" align="center">
        <Link to="/" style={{ textDecoration: "none", color: tokens.color.paper.base, display: "inline-flex" }} aria-label="Paper UI 홈">
          <Logo height={17} />
        </Link>
        <Text variant="caption" as="span" style={{ color: tokens.color.paper.muted }}>
          데모 · 이슈 트래커
        </Text>
      </Inline>
      <Link to="/" style={{ textDecoration: "none" }}>
        <Text variant="caption" as="span" style={{ color: tokens.color.paper.base, fontWeight: 550 }}>
          ← 사이트로
        </Text>
      </Link>
    </Inline>
  </Box>
);

// Navbar 를 직접 쓰고 싶은 페이지용 (data API). 위 SiteNav 가 기본.
export { Navbar };
