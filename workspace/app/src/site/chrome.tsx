// 공유 site chrome — 모든 화면 위에 얹는 통합 GNB.
//
// 브랜드는 손글씨 "Paper UI" 워드마크(Logo). 지면·데모 어디서나 같은 한 줄이 뜨고,
// 데모에는 escape 가 달린 얇은 DemoBar 로 같은 브랜드를 이어 붙인다 (GNB 통일).

import { Link, useLocation } from "react-router-dom";

import { Box, Inline, Navbar, Banner, Text, tokens } from "@studio-baeks/paper-ui";

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

export const NAV_HEIGHT = tokens.shape.atom.navbar;

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
    <Box as="header" paddingX="xl" className="gnb">
      <div className="gnb-inner">
        <Inline gap="lg" align="center">
          <Brand />
          <nav className="gnb-nav">
            {SITE_NAV.map((n) => (
              <Link key={n.to} to={n.to} className="gnb-link" data-active={isActive(pathname, n.to)}>
                {n.label}
              </Link>
            ))}
          </nav>
        </Inline>
        <Inline gap="sm" align="center">
          <Box
            paper="subtle"
            radius="pill"
            paddingX="sm"
            paddingY="xs"
            style={{ border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}` }}
          >
            <Text variant="caption" as="span" ink="soft" style={{ fontVariantNumeric: "tabular-nums" }}>
              v0.1.0
            </Text>
          </Box>
        </Inline>
      </div>
    </Box>
  );
};

// 데모용 얇은 통합 바 — 라이브러리 Banner(검정 solid)로 브랜드를 이어 붙이고 사이트로
// 돌아가는 escape 를 준다. 데모의 제품 Navbar 는 이 아래에 그대로 살아 사실감을 지킨다.
export const DemoBar = () => (
  <Banner
    action={
      <Link to="/" style={{ textDecoration: "none" }}>
        <Text variant="caption" as="span" style={{ color: tokens.color.paper.base, fontWeight: tokens.text.weight.medium }}>
          ← 사이트로
        </Text>
      </Link>
    }
  >
    <Link to="/" style={{ textDecoration: "none", color: tokens.color.paper.base, display: "inline-flex" }} aria-label="Paper UI 홈">
      <Logo height={17} />
    </Link>
    <Text variant="caption" as="span" style={{ color: tokens.color.paper.muted }}>
      데모 · 이슈 트래커
    </Text>
  </Banner>
);

// Navbar 를 직접 쓰고 싶은 페이지용 (data API). 위 SiteNav 가 기본.
export { Navbar };
