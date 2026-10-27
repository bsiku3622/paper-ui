// 공유 site chrome — 모든 화면 위에 얹는 통합 GNB.
//
// 브랜드는 손글씨 "Paper UI" 워드마크(Logo). 지면·데모 어디서나 같은 한 줄이 뜨고,
// 데모에는 escape 가 달린 얇은 DemoBar 로 같은 브랜드를 이어 붙인다 (GNB 통일).

import { Link, useLocation } from "react-router-dom";

import { Box, Inline, Text, tokens, useTheme, type Theme, type ResolvedTheme } from "@studio-baeks/paper-ui";

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

export const NAV_HEIGHT = "52px";

// 브랜드 — 손글씨 로고. 홈으로 가는 통로.
const Brand = ({ height = 26 }: { height?: number }) => (
  <Link to="/" style={{ textDecoration: "none", color: tokens.color.ink.primary, display: "inline-flex" }} aria-label="Paper UI 홈">
    <Logo height={height} />
  </Link>
);

// Site navigation belongs to the documentation app, not the component package.
export const SiteNav = () => {
  const { pathname } = useLocation();
  const active = SITE_NAV.find((n) => isActive(pathname, n.to))?.to;
  return (
    <Box as="header" style={{ position: "sticky", top: 0, zIndex: tokens.layout.elevation.sticky.z, height: NAV_HEIGHT, background: tokens.color.bg.canvas, borderBottom: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}` }}>
      <Inline align="center" gap="lg" style={{ maxWidth: tokens.layout.container.content, height: "100%", paddingInline: tokens.shape.inset.lg, marginInline: "auto" }}>
        <Brand />
        <Box as="nav" aria-label="주요 메뉴" style={{ display: "flex", alignItems: "center", gap: tokens.layout.gap.sm, flex: 1 }}>
          {SITE_NAV.map((n) => <Link key={n.to} to={n.to} aria-current={active === n.to ? "page" : undefined} style={{ color: active === n.to ? tokens.color.ink.primary : tokens.color.ink.secondary, textDecoration: "none", padding: `${tokens.shape.inset.xs} ${tokens.shape.inset.sm}` }}>{n.label}</Link>)}
        </Box>
        <Inline gap="sm" align="center">
          <ThemeToggle />
          <Box surface="sunken" radius="full" paddingX="sm" paddingY="xs" style={{ border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}` }}>
            <Text variant="caption" as="span" ink="soft" style={{ fontVariantNumeric: "tabular-nums" }}>v0.1.0</Text>
          </Box>
        </Inline>
      </Inline>
    </Box>
  );
};

// Demo escape bar is app chrome and stays outside the component package.
export const DemoBar = () => (
  <Inline as="header" align="center" justify="between" paddingX="md" paddingY="xs" style={{ background: tokens.color.ink.primary, color: tokens.color.bg.canvas }}>
    <Inline gap="md" align="center">
      <Link to="/" style={{ textDecoration: "none", color: "inherit", display: "inline-flex" }} aria-label="Paper UI 홈"><Logo height={17} /></Link>
      <Text variant="caption" as="span" style={{ color: tokens.color.accent.primary.wash }}>데모 · 이슈 트래커</Text>
    </Inline>
    <Link to="/" style={{ textDecoration: "none", color: "inherit" }}><Text variant="caption" as="span">← 사이트로</Text></Link>
  </Inline>
);
