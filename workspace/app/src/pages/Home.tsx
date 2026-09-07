// 홈 — paper-ui 랜딩.
//
// shadcn/ui 전략: 정제된 헤드라인 + CTA 아래에 "완전한 앱 목업 하나"를 주인공으로
// 세운다. 조각난 컴포넌트 카드를 나열하지 않고, 사이드바·검색·탭·테이블·배지가 다
// 들어간 실제 이슈 트래커 화면으로 "컴포넌트가 함께 선다"를 증명한다 — paper 정체성
// (갤러리가 아니라 실제 화면으로 검증)과 같은 결.

import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Badge,
  Box,
  Button,
  Field,
  Inline,
  Stack,
  Table,
  Tabs,
  Text,
  tokens,
  type Column,
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

const columns: Column<Issue>[] = [
  { key: "key", header: "키", render: (r) => <Text variant="caption" family="mono" as="span" ink="soft">{r.key}</Text> },
  { key: "title", header: "이슈", render: (r) => <Text variant="body" as="span">{r.title}</Text> },
  { key: "who", header: "담당", render: (r) => <Text variant="caption" as="span" ink="soft">{r.who}</Text> },
  { key: "status", header: "상태", render: (r) => <Badge color={r.status}>{r.label}</Badge> },
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

// 완전한 앱 목업 — 랜딩의 주인공. 실제 paper 컴포넌트로만 조립한 이슈 트래커.
const AppMockup = () => {
  const [tab, setTab] = useState("all");
  return (
    <div className="home-mockup">
      <div className="home-mockup-bar">
        <Inline gap="xs">
          {[0, 1, 2].map((i) => (
            <Box key={i} surface="well" radius="pill" style={{ width: "0.6rem", height: "0.6rem" }} />
          ))}
        </Inline>
        <Box surface="canvas" radius="pill" paddingX="sm" style={{ marginInline: "auto", border: `1px solid ${tokens.color.border.base}` }}>
          <Text variant="caption" as="span" ink="faint">app.studio-baeks.dev / issues</Text>
        </Box>
      </div>

      <div className="home-mockup-body">
        <aside className="home-mockup-side">
          <Inline gap="sm" align="center" style={{ paddingInline: tokens.shape.padding.sm.interaction }}>
            <Box style={{ width: "1.5rem", height: "1.5rem", borderRadius: tokens.shape.radius.interaction, background: tokens.color.ink.base, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Text variant="caption" as="span" style={{ color: tokens.color.paper.canvas, fontWeight: tokens.text.weight.bold }}>S</Text>
            </Box>
            <Text variant="subheading" as="span">Studio</Text>
          </Inline>

          <div className="home-nav">
            {NAV.map((n) => (
              <div key={n.label} className="home-navitem" data-active={n.active}>
                <Box radius="pill" style={{ width: "0.4rem", height: "0.4rem", background: n.active ? tokens.color.ink.base : tokens.color.ink.faint }} />
                {n.label}
              </div>
            ))}
          </div>

          <Stack gap="xs">
            <Text variant="label" as="p" ink="soft" className="home-filterhead">필터</Text>
            {FILTERS.map((f) => (
              <Inline key={f.label} className="home-filterrow" gap="sm" align="center">
                <Box className={`pui-${f.accent}-dot`} radius="pill" style={{ width: "0.55rem", height: "0.55rem" }} />
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
              <Tabs
                value={tab}
                onChange={setTab}
                items={[
                  { value: "all", label: "전체" },
                  { value: "open", label: "열림" },
                  { value: "done", label: "완료" },
                ]}
              />
              <Text variant="caption" as="span" ink="soft">6건 · 열림 4</Text>
            </Inline>
          </Stack>

          <Box style={{ padding: tokens.shape.padding.md.interaction }}>
            <Table columns={columns} rows={ISSUES} rowKey={(r) => r.id} />
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
          <Inline gap="sm" align="center" style={{ marginBottom: tokens.shape.gap.lg }}>
            <Badge color="info">Studio Baeks</Badge>
            <Text variant="caption" ink="soft">Design System · v0.1.0</Text>
          </Inline>

          <h1 className="home-headline">
            복잡한 웹앱을 위한<br />
            조용한 바탕<span className="home-dot">.</span>
          </h1>

          <Text variant="subheading" as="p" ink="soft" className="home-sub">
            스물일곱 개의 컴포넌트로 실제 화면을 세웁니다. 색은 의미가 있을 때만 쓰고, 구조는 빌드가 지킵니다 — 순백 위에 부드럽게.
          </Text>

          <Inline className="home-cta" gap="sm" style={{ marginTop: tokens.shape.gap.xl }}>
            <Link to="/docs" style={{ textDecoration: "none" }}>
              <Button size="lg">문서 읽기</Button>
            </Link>
            <Link to="/playground" style={{ textDecoration: "none" }}>
              <Button size="lg" variant="outline">컴포넌트 보기</Button>
            </Link>
          </Inline>
        </div>

        {/* ── 완전한 앱 목업 ──────────────────────────────────────── */}
        <AppMockup />

        <Inline gap="sm" align="center" wrap style={{ paddingBlock: tokens.shape.padding.lg.layout }}>
          <Text variant="caption" ink="soft">갤러리가 아니라 실제 화면(이슈 트래커)으로 검증합니다.</Text>
          <Link to="/demo" style={{ textDecoration: "none" }}>
            <Text variant="caption" as="span" className="pui-info-ink" style={{ fontWeight: tokens.text.weight.medium }}>데모 열기 →</Text>
          </Link>
        </Inline>

        {/* ── 푸터 ────────────────────────────────────────────────── */}
        <Box as="footer" style={{ borderTop: `1px solid ${tokens.color.border.base}`, marginTop: tokens.shape.gap.lg, paddingBlock: "1.5rem 2.5rem" }}>
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
