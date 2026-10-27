// Paper UI landing page. Product-level compositions stay local to this app.

import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Badge,
  Box,
  Button,
  Field,
  Inline,
  Stack,
  Text,
  tokens,
  type StatusName,
} from "@studio-baeks/paper-ui";

import { SiteNav } from "../site/chrome";
import { Logo } from "../site/Logo";
import "../site/home.css";

type Issue = { id: string; key: string; title: string; who: string; status: StatusName; label: string };

const ISSUES: Issue[] = [
  { id: "1", key: "STU-142", title: "토큰 트리를 두 번 걷는 emit 파이프라인", who: "재원", status: "info", label: "진행" },
  { id: "2", key: "STU-139", title: "Select 포커스 링이 사파리에서 잘림", who: "민주", status: "error", label: "막힘" },
  { id: "3", key: "STU-137", title: "Table hover 배경을 subtle 로 통일", who: "재원", status: "success", label: "완료" },
  { id: "4", key: "STU-135", title: "Badge wash 대비 AA 재검증", who: "지현", status: "warning", label: "검토" },
  { id: "5", key: "STU-131", title: "Modal 진입 애니메이션 곡선 조정", who: "민주", status: "success", label: "완료" },
  { id: "6", key: "STU-128", title: "eslint 규칙 4 — Box as 예외 문서화", who: "지현", status: "info", label: "진행" },
];

const NAV = [
  { label: "이슈", active: true },
  { label: "보드", active: false },
  { label: "리포트", active: false },
  { label: "멤버", active: false },
];

const FILTERS: { label: string; accent: "info" | "success" | "warning" | "error" }[] = [
  { label: "진행 중", accent: "info" },
  { label: "막힘", accent: "error" },
  { label: "검토", accent: "warning" },
  { label: "완료", accent: "success" },
];

// App-local issue tracker composition used to show the primitives and atoms in context.
const AppMockup = () => {
  const [tab, setTab] = useState("all");
  return (
    <div className="home-mockup">
      <div className="home-mockup-bar">
        <Inline gap="xs">
          {[0, 1, 2].map((i) => (
            <Box key={i} surface="sunken" radius="full" style={{ width: "0.6rem", height: "0.6rem" }} />
          ))}
        </Inline>
        <Box surface="canvas" radius="full" paddingX="sm" style={{ marginInline: "auto", border: `1px solid ${tokens.color.border.base}` }}>
          <Text variant="caption" as="span" ink="faint">app.studio-baeks.dev / issues</Text>
        </Box>
      </div>

      <div className="home-mockup-body">
        <aside className="home-mockup-side">
          <Inline gap="sm" align="center" style={{ paddingInline: tokens.shape.space.sm }}>
            <Box style={{ width: "1.5rem", height: "1.5rem", borderRadius: tokens.shape.radius.control, background: tokens.color.ink.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Text variant="caption" as="span" style={{ color: tokens.color.bg.canvas, fontWeight: tokens.text.palette.weight.bold }}>S</Text>
            </Box>
            <Text variant="subheading" as="span">Studio</Text>
          </Inline>

          <div className="home-nav">
            {NAV.map((n) => (
              <div key={n.label} className="home-navitem" data-active={n.active}>
                <Box radius="full" style={{ width: "0.4rem", height: "0.4rem", background: n.active ? tokens.color.ink.primary : tokens.color.ink.tertiary }} />
                {n.label}
              </div>
            ))}
          </div>

          <Stack gap="xs">
            <Text variant="label" as="p" ink="soft" className="home-filterhead">필터</Text>
            {FILTERS.map((f) => (
              <Inline key={f.label} className="home-filterrow" gap="sm" align="center">
                <Box className={`pui-${f.accent}-dot`} radius="full" style={{ width: "0.55rem", height: "0.55rem" }} />
                <Text variant="caption" as="span" ink="soft">{f.label}</Text>
              </Inline>
            ))}
          </Stack>
        </aside>

        <main className="home-mockup-main">
          {/* 제목 줄과 필터 줄은 **한 덩어리**다 — 사이에 선이 없으니 각자 여백을 갖는 두
              밴드일 이유가 없다. 따로 두면 12(위) / 20(사이) / 9(아래) 로 리듬이 어긋나고,
              선이 없어진 순간 그게 "제목이 위로 붙은" 인상으로 드러난다. */}
          <Stack gap="md" paddingX="lg" paddingY="md">
            <Inline align="center" justify="between" gap="sm">
              <Text variant="heading" as="h3">이슈</Text>
              <Inline gap="sm" align="center">
                <Box style={{ width: "12rem" }}>
                  <Field placeholder="검색…" aria-label="검색" />
                </Box>
                <Button>새 이슈</Button>
              </Inline>
            </Inline>

            <Inline align="center" justify="between" gap="sm">
              <Inline gap="xs" role="group" aria-label="이슈 필터">
                {([["all", "전체"], ["open", "열림"], ["done", "완료"]] as const).map(([value, label]) => <Button key={value} size="sm" shape="pill" variant={tab === value ? "soft" : "ghost"} aria-pressed={tab === value} onClick={() => setTab(value)}>{label}</Button>)}
              </Inline>
              <Text variant="caption" as="span" ink="soft">6건 · 열림 4</Text>
            </Inline>
          </Stack>

          <Box style={{ padding: tokens.shape.space.md }}>
            <Box as="table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <Box as="thead"><Box as="tr">{["키", "이슈", "담당", "상태"].map((label) => <Box as="th" key={label} style={{ padding: tokens.shape.space.sm, color: tokens.color.ink.tertiary, borderBottom: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}` }}>{label}</Box>)}</Box></Box>
              <Box as="tbody">{ISSUES.map((issue) => <Box as="tr" key={issue.id}>
                <Box as="td" style={{ padding: tokens.shape.space.sm, borderBottom: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}` }}><Text variant="caption" family="mono" as="span" ink="soft">{issue.key}</Text></Box>
                <Box as="td" style={{ padding: tokens.shape.space.sm, borderBottom: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}` }}>{issue.title}</Box>
                <Box as="td" style={{ padding: tokens.shape.space.sm, borderBottom: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}` }}><Text variant="caption" as="span" ink="soft">{issue.who}</Text></Box>
                <Box as="td" style={{ padding: tokens.shape.space.sm, borderBottom: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}` }}><Badge accent={issue.status}>{issue.label}</Badge></Box>
              </Box>)}</Box>
            </Box>
          </Box>
        </main>
      </div>
    </div>
  );
};

export const Home = () => (
  <Stack>
    <SiteNav />

    <Box paddingX="xl">
      <Box style={{ maxWidth: tokens.layout.container.content, marginInline: "auto", width: "100%" }}>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="home-hero">
          <Inline gap="sm" align="center" style={{ marginBottom: tokens.shape.space.lg }}>
            <Badge accent="info">Studio Baeks</Badge>
            <Text variant="caption" ink="soft">Design System · v0.1.0</Text>
          </Inline>

          <Text as="h1" variant="display" className="home-headline">
            복잡한 웹앱을 위한<br />
            조용한 바탕<span className="home-dot">.</span>
          </Text>

          <Text variant="body" as="p" ink="soft" className="home-sub">
            레이아웃은 Primitive로, 상호작용은 Atom으로 시작합니다. 색은 의미가 있을 때만 쓰고, 순백 위에 부드럽게.
          </Text>

          {/* Both actions navigate, so Button renders the router link directly. */}
          <Inline gap="sm" style={{ marginTop: tokens.shape.space.xl }}>
            <Button as={Link} to="/docs" size="lg" shape="pill" style={{ textDecoration: "none" }}>
              문서 읽기
            </Button>
            <Button as={Link} to="/playground" size="lg" variant="hairline" shape="pill" style={{ textDecoration: "none" }}>
              Playground 살펴보기
            </Button>
          </Inline>
        </div>

        {/* ── 완전한 앱 목업 ──────────────────────────────────────── */}
        <AppMockup />

        <Inline gap="sm" align="center" wrap style={{ paddingBlock: tokens.layout.padding.lg }}>
          <Text variant="caption" ink="soft">갤러리가 아니라 실제 화면(이슈 트래커)으로 검증합니다.</Text>
          <Link to="/demo" style={{ textDecoration: "none" }}>
            <Text variant="caption" as="span" className="pui-info-ink" style={{ fontWeight: tokens.text.palette.weight.medium }}>데모 열기 →</Text>
          </Link>
        </Inline>

        {/* ── 푸터 ────────────────────────────────────────────────── */}
        <Box as="footer" style={{ borderTop: `1px solid ${tokens.color.border.base}`, marginTop: tokens.shape.space.lg, paddingBlock: "1.5rem 2.5rem" }}>
          <Inline justify="between" align="center" wrap gap="md">
            <Logo height={18} style={{ opacity: 0.7 }} />
            <Inline gap="md" wrap align="center">
              <Link to="/docs/get-started/philosophy" style={{ textDecoration: "none" }}><Text variant="caption" as="span" ink="soft">원칙</Text></Link>
              <Link to="/docs/foundations/tokens" style={{ textDecoration: "none" }}><Text variant="caption" as="span" ink="soft">토큰</Text></Link>
              <Link to="/docs" style={{ textDecoration: "none" }}><Text variant="caption" as="span" ink="soft">문서</Text></Link>
              <Text variant="caption" ink="faint" as="span">© Studio Baeks</Text>
            </Inline>
          </Inline>
        </Box>
      </Box>
    </Box>
  </Stack>
);
