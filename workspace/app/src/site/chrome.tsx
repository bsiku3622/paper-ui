// 공유 site chrome — 모든 화면 위에 얹는 통합 GNB.
//
// 브랜드는 손글씨 "Paper UI" 워드마크(Logo). 지면·데모 어디서나 같은 한 줄이 뜨고,
// 데모에는 escape 가 달린 얇은 DemoBar 로 같은 브랜드를 이어 붙인다 (GNB 통일).

import { Link, useLocation } from "react-router-dom";

import { Box, Inline, Navbar, Banner, Text, tokens, useTheme, type Theme, type ResolvedTheme } from "@studio-baeks/paper-ui";

import { Logo } from "./Logo";
import "./site.css";

// 테마 토글 — 라이트 ⇄ 다크 둘만 오간다.
//
// 라이브러리는 system 모드도 갖고 있고(첫 방문 때 OS 를 따라가는 건 좋은 기본값이다),
// PaperProvider 의 defaultTheme 은 여전히 system 이다. 다만 **버튼이 그 자리를 거치지는
// 않는다** — 3단 순환이면 어느 방향으로 가든 매번 중간에 한 번 더 눌러야 하고, 그 중간
// 상태가 지금 화면과 같은 색이면 눌러도 아무 일이 안 일어난 것처럼 보인다. 그래서
// **해석된 테마(resolved)의 반대로 곧장 간다.**
const THEME_GLYPH: Record<ResolvedTheme, string> = { light: "☀", dark: "☾" };
const THEME_LABEL: Record<ResolvedTheme, string> = { light: "라이트", dark: "다크" };

const ThemeToggle = () => {
  const { resolved, setTheme } = useTheme();
  const next: Theme = resolved === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className="gnb-theme"
      onClick={() => setTheme(next)}
      title={`${THEME_LABEL[next]}로 전환`}
      aria-label={`${THEME_LABEL[next]} 테마로 전환`}
    >
      {THEME_GLYPH[resolved]}
    </button>
  );
};

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

// 사이트 GNB — **라이브러리 Navbar 를 그대로 쓴다.**
//
// 오래 여기서 손으로 다시 짜고 있었다. 이유는 하나였다: Navbar 항목이 `<button>` 이라
// 라우터 링크가 될 수 없었다. 자기 시스템으로 자기 사이트의 헤더를 못 짜는 건 시스템
// 쪽의 결함이지 사이트 쪽 사정이 아니라, Navbar 에 `as` 를 열어 고쳤다.
// `width="content"` 는 안쪽 줄만 본문 격자에 맞추고 괘선은 화면 끝까지 보낸다.
export const SiteNav = () => {
  const { pathname } = useLocation();
  const active = SITE_NAV.find((n) => isActive(pathname, n.to))?.to;
  return (
    <Navbar
      width="content"
      brand={<Brand />}
      active={active}
      items={SITE_NAV.map((n) => ({ value: n.to, label: n.label, as: Link, to: n.to }))}
      trailing={
        <Inline gap="sm" align="center">
          <ThemeToggle />
          <Box
            surface="sunken"
            radius="full"
            paddingX="sm"
            paddingY="xs"
            style={{ border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}` }}
          >
            <Text variant="caption" as="span" ink="soft" style={{ fontVariantNumeric: "tabular-nums" }}>
              v0.1.0
            </Text>
          </Box>
        </Inline>
      }
    />
  );
};

// 데모용 얇은 통합 바 — 라이브러리 Banner(검정 solid)로 브랜드를 이어 붙이고 사이트로
// 돌아가는 escape 를 준다. 데모의 제품 Navbar 는 이 아래에 그대로 살아 사실감을 지킨다.
export const DemoBar = () => (
  <Banner
    action={
      <Link to="/" style={{ textDecoration: "none" }}>
        <Text variant="caption" as="span" style={{ color: tokens.color.paper.canvas, fontWeight: tokens.text.weight.medium }}>
          ← 사이트로
        </Text>
      </Link>
    }
  >
    <Link to="/" style={{ textDecoration: "none", color: tokens.color.paper.canvas, display: "inline-flex" }} aria-label="Paper UI 홈">
      <Logo height={17} />
    </Link>
    <Text variant="caption" as="span" style={{ color: tokens.color.paper.well }}>
      데모 · 이슈 트래커
    </Text>
  </Banner>
);

// Navbar 를 직접 쓰고 싶은 페이지용 (data API). 위 SiteNav 가 기본.
export { Navbar };
