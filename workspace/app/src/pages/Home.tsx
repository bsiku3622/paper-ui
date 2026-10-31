// Paper UI landing page. Product-level compositions stay local to this app.

import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import {
  Badge,
  Box,
  Button,
  Field,
  Inline,
  Link,
  Paint,
  SelectableGroup,
  Stack,
  Surface,
  Text,
} from "@studio-baeks/paper-ui";
import type { Status } from "@studio-baeks/paper-ui/tokens";

import { Dot } from "../compositions/Dot";
import { ArrowRightIcon } from "../compositions/icons";
import { Logo } from "../site/Logo";
import * as s from "../site/home.css";
import { navLink } from "../site/shell.css";

type Issue = { id: string; key: string; title: string; who: string; status: Status; label: string };

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

const TABS = [["all", "전체"], ["open", "열림"], ["done", "완료"]] as const;

// App-local issue tracker composition used to show the primitives and atoms in context.
const AppMockup = () => {
  const [tab, setTab] = useState<string>("all");
  return (
    <Surface fill="raised" border radius="lg" elevation="overlay" className={s.mockup}>
      <Surface as={Inline} fill="sunken" gap="sm" align="center" paddingX="md" className={s.mockupBar}>
        <Inline gap="xs">
          {[0, 1, 2].map((i) => (
            <Surface key={i} fill="sunken" radius="full" width="0.6rem" height="0.6rem" />
          ))}
        </Inline>
        <Surface fill="canvas" radius="full" border paddingX="sm" className={s.urlPill}>
          <Text variant="caption" as="span" ink="tertiary">app.studio-baeks.dev / issues</Text>
        </Surface>
      </Surface>

      <Box className={s.mockupBody}>
        <Surface as={Stack} fill="sunken" gap="md" padding="md" className={s.mockupSide} data-testid="home-mockup-side">
          <Inline gap="sm" align="center" paddingX="sm">
            <Paint accent="primary" variant="solid" className={s.brandMark}>
              <Text variant="caption" as="span" ink="inherit" className={s.brandInitial}>S</Text>
            </Paint>
            <Text variant="subheading" as="span">Studio</Text>
          </Inline>

          <Stack gap="xs">
            {NAV.map((n) => (
              <Box key={n.label} className={s.navItem} data-selected={n.active || undefined}>
                <Dot ink={n.active ? "primary" : "tertiary"} size="xs" />
                {n.label}
              </Box>
            ))}
          </Stack>

          <Stack gap="xs">
            <Text variant="label" as="p" ink="secondary" className={s.filterHead}>필터</Text>
            {FILTERS.map((f) => (
              <Inline key={f.label} className={s.filterRow} gap="sm" align="center">
                <Dot status={f.accent} size="sm" />
                <Text variant="caption" as="span" ink="secondary">{f.label}</Text>
              </Inline>
            ))}
          </Stack>
        </Surface>

        <Stack className={s.mockupMain}>
          {/* 제목 줄과 필터 줄은 **한 덩어리**다 — 사이에 선이 없으니 각자 여백을 갖는 두
              밴드일 이유가 없다. 따로 두면 12(위) / 20(사이) / 9(아래) 로 리듬이 어긋나고,
              선이 없어진 순간 그게 "제목이 위로 붙은" 인상으로 드러난다. */}
          <Stack gap="md" paddingX="lg" paddingY="md">
            <Inline align="center" justify="between" gap="sm">
              <Text variant="heading" as="h3">이슈</Text>
              <Inline gap="sm" align="center">
                <Box width="12rem">
                  <Field placeholder="검색…" aria-label="검색" />
                </Box>
                <Button>새 이슈</Button>
              </Inline>
            </Inline>

            <Inline align="center" justify="between" gap="sm">
              <SelectableGroup aria-label="이슈 필터" selectionRequired selectedValues={[tab]} onSelectedValuesChange={([next]) => next && setTab(next)} className={s.tabs}>
                {TABS.map(([value, label]) => <Button key={value} as={SelectableGroup.Item} value={value} size="sm" shape="pill" variant="ghost">{label}</Button>)}
              </SelectableGroup>
              <Text variant="caption" as="span" ink="secondary">6건 · 열림 4</Text>
            </Inline>
          </Stack>

          <Box padding="md">
            <Box as="table" className={s.table}>
              <Box as="thead"><Box as="tr">{["키", "이슈", "담당", "상태"].map((label) => <Box as="th" key={label} className={s.headCell}>{label}</Box>)}</Box></Box>
              <Box as="tbody">{ISSUES.map((issue) => <Box as="tr" key={issue.id}>
                <Box as="td" className={s.cell}><Text variant="caption" family="mono" as="span" ink="secondary">{issue.key}</Text></Box>
                <Box as="td" className={s.cell}>{issue.title}</Box>
                <Box as="td" className={s.cell}><Text variant="caption" as="span" ink="secondary">{issue.who}</Text></Box>
                <Box as="td" className={s.cell}><Badge accent={issue.status}>{issue.label}</Badge></Box>
              </Box>)}</Box>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Surface>
  );
};

export const Home = () => (
  <Box paddingX="xl">
    <Box data-testid="home-column" maxWidth="container.content" width="full" className={s.column}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <Box className={s.hero}>
        <Inline gap="sm" align="center" className={s.heroMeta}>
          <Badge>Studio Baeks</Badge>
          <Text variant="caption" ink="secondary">{`Design System · v${__PAPER_UI_VERSION__}`}</Text>
        </Inline>

        <Text variant="hero">
          복잡한 웹앱을 위한<br />
          조용한 바탕.
        </Text>

        <Text variant="body" as="p" ink="secondary" className={s.sub}>
          레이아웃은 Primitive로, 상호작용은 Atom으로 시작합니다. 색은 의미가 있을 때만 쓰고, 순백 위에 부드럽게.
        </Text>

        {/* Both actions navigate, so Button renders the router link directly. */}
        <Inline gap="sm" className={s.heroActions}>
          <Button as={RouterLink} to="/docs" size="lg" shape="pill">
            문서 읽기
          </Button>
          <Button as={RouterLink} to="/playground" size="lg" variant="hairline" shape="pill">
            Playground 살펴보기
          </Button>
        </Inline>
      </Box>

      {/* ── 완전한 앱 목업 ──────────────────────────────────────── */}
      <Box as="figure" className={s.figure}>
        <AppMockup />

        <Inline as="figcaption" gap="sm" align="center" wrap paddingY="xl">
          <Text variant="caption" ink="secondary">갤러리가 아니라 실제 화면(이슈 트래커)으로 검증합니다.</Text>
          <Link as={RouterLink} to="/demo" underline="hover">
            <Text variant="caption" as="span" ink="inherit" className={s.demoLink}>데모 열기<ArrowRightIcon size="label" className={s.demoArrow} /></Text>
          </Link>
        </Inline>
      </Box>

      {/* ── 푸터 ────────────────────────────────────────────────── */}
      <Box as="footer" className={s.footer}>
        <Inline justify="between" align="center" wrap gap="md">
          <Logo height={18} className={s.footerLogo} />
          <Inline gap="md" wrap align="center">
            <RouterLink to="/docs/get-started/philosophy" className={navLink.plain}><Text variant="caption" as="span" ink="secondary">원칙</Text></RouterLink>
            <RouterLink to="/docs/foundations" className={navLink.plain}><Text variant="caption" as="span" ink="secondary">Foundations</Text></RouterLink>
            <RouterLink to="/docs" className={navLink.plain}><Text variant="caption" as="span" ink="secondary">문서</Text></RouterLink>
            <Text variant="caption" ink="tertiary" as="span">© Studio Baeks</Text>
          </Inline>
        </Inline>
      </Box>
    </Box>
  </Box>
);
