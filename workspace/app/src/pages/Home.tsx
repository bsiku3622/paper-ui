// 홈 — paper-ui 랜딩. 정체성 그대로: 순백·검정·여백, 색은 작게.
//
// hero 는 손글씨 워드마크(애플 hello 결) + 살아 있는 컴포넌트 샘플러 한 장.
// 갤러리가 아니라 *만져지는* 증거를 앞에 둔다 — 오른쪽 카드는 실제 paper-ui 다.

import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Inline,
  Select,
  Stack,
  Tabs,
  Text,
  TextField,
  tokens,
  type StatusName,
} from "@studio-baeks/paper-ui";

import { SiteNav } from "../site/chrome";
import { Logo } from "../site/Logo";

const PRINCIPLES = [
  { k: "색은 점이다", v: "흰색·검정이 골격. 색은 의미가 있을 때만 작게 얹는다. 검정이 일꾼이라 primary도 파랑이 아니다." },
  { k: "선보다 면", v: "구획은 얇은 선이 아니라 옅은 면과 여백으로. 경계는 거의 안 보인다." },
  { k: "조용한 밀도", v: "복잡한 앱의 밀도(14px)를 지키되 넉넉한 radius로 부드럽게. hover는 한 단 또렷해지고 포커스는 파랗다." },
  { k: "빌드가 지킨다", v: "원칙은 문서가 아니라 lint·테스트가 강제한다. 정본 하나를 한 번 걷는다." },
] as const;

const STAT = [
  { n: "25", l: "컴포넌트" },
  { n: "3", l: "포인트 색" },
  { n: "4", l: "빌드가 강제하는 규칙" },
] as const;

// hero 오른쪽 — 실제 paper-ui 로 조립한, 만져지는 샘플러.
const LiveSampler = () => {
  const [tab, setTab] = useState("form");
  const [agree, setAgree] = useState(true);
  const [priority, setPriority] = useState("보통");
  const STATUSES: StatusName[] = ["info", "success", "warning", "danger"];

  return (
    <Card style={{ width: "100%" }}>
      <Stack gap="lg">
        <Inline justify="between" align="center">
          <Text variant="subheading">라이브 샘플러</Text>
          <Text variant="caption" ink="faint">실제 컴포넌트</Text>
        </Inline>

        <Inline>
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { value: "form", label: "입력" },
              { value: "status", label: "상태" },
              { value: "action", label: "액션" },
            ]}
          />
        </Inline>

        {tab === "form" && (
          <Stack gap="md">
            <TextField label="제목" placeholder="무엇을 해야 하나요" hint="포커스는 파란 링 하나로만." />
            <Stack gap="xs">
              <Text variant="label">우선순위</Text>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.currentTarget.value)}
                options={[
                  { value: "높음", label: "높음" },
                  { value: "보통", label: "보통" },
                  { value: "낮음", label: "낮음" },
                ]}
              />
            </Stack>
            <Inline as="label" gap="sm" align="center">
              <Checkbox checked={agree} onChange={(e) => setAgree(e.currentTarget.checked)} />
              <Text variant="body" as="span">담당자에게 알림 보내기</Text>
            </Inline>
          </Stack>
        )}

        {tab === "status" && (
          <Stack gap="md">
            <Text variant="caption" ink="soft">status 3종은 전부 색을 갖는다 — 의미가 있는 자리라서.</Text>
            <Inline gap="sm" wrap>
              {STATUSES.map((s) => (
                <Badge key={s} status={s}>{s}</Badge>
              ))}
              <Badge>중립</Badge>
            </Inline>
            <Divider />
            <Inline gap="sm" wrap align="center">
              {(["blue", "green", "amber", "red"] as const).map((a) => (
                <Inline key={a} gap="sm" align="center">
                  <Box accent={a} tone="dot" radius="pill" style={{ width: "0.75rem", height: "0.75rem" }} />
                  <Text variant="caption" as="span" className={`pui-${a}-ink`}>{a}</Text>
                </Inline>
              ))}
            </Inline>
          </Stack>
        )}

        {tab === "action" && (
          <Stack gap="md">
            <Text variant="caption" ink="soft">variant(무게) × status(색)가 직교한다. 큰 면을 채우는 건 검정뿐, 색은 뜻을 질 때만.</Text>
            <Inline gap="sm" wrap>
              <Button>저장</Button>
              <Button variant="soft">미리보기</Button>
              <Button variant="quiet">취소</Button>
            </Inline>
            <Inline gap="sm" wrap>
              <Button status="danger">삭제</Button>
              <Button variant="soft" status="success">완료</Button>
              <Button variant="outline" disabled>비활성</Button>
            </Inline>
          </Stack>
        )}
      </Stack>
    </Card>
  );
};

// 데모 프리뷰 — Mobbin 처럼 실제 화면 한 조각을 액자에 담아 /demo 로 보낸다.
const PREVIEW_ROWS = [
  { key: "STU-142", title: "토큰 트리를 두 번 걷는 emit 파이프라인", status: "info" as StatusName, label: "진행" },
  { key: "STU-139", title: "Select 포커스 링이 사파리에서 잘림", status: "error" as StatusName, label: "막힘" },
  { key: "STU-137", title: "Table hover 배경을 subtle 로 통일", status: "success" as StatusName, label: "완료" },
];

const DemoPreview = () => (
  <Box paper="subtle" radius="lg" style={{ overflow: "hidden", border: `1px solid ${tokens.color.border.base}` }}>
    {/* 창 머리 — 중립 점 세 개(색은 장식으로 쓰지 않는다) + 경로 pill */}
    <Inline gap="sm" align="center" paddingX="md" style={{ height: "2.25rem", borderBottom: `1px solid ${tokens.color.border.base}` }}>
      <Inline gap="xs">
        {[0, 1, 2].map((i) => (
          <Box key={i} paper="muted" radius="pill" style={{ width: "0.625rem", height: "0.625rem" }} />
        ))}
      </Inline>
      <Box paper="base" radius="pill" paddingX="sm" style={{ marginInline: "auto" }}>
        <Text variant="caption" as="span" ink="faint">paper-ui / demo</Text>
      </Box>
    </Inline>
    {/* 미니 이슈 목록 */}
    <Box paper="base" padding="md">
      <Stack gap="xs">
        {PREVIEW_ROWS.map((r) => (
          <Inline key={r.key} gap="md" align="center" paddingX="sm" paddingY="sm" style={{ borderRadius: tokens.shape.radius.interaction }}>
            <Text variant="caption" as="span" ink="soft" style={{ width: "4.5rem", fontVariantNumeric: "tabular-nums" }}>{r.key}</Text>
            <Text variant="body" as="span" style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</Text>
            <Badge status={r.status}>{r.label}</Badge>
          </Inline>
        ))}
      </Stack>
    </Box>
  </Box>
);

export const Home = () => (
  <Stack>
    <SiteNav />

    <Box paddingX="xl">
      <Stack gap="xl" style={{ maxWidth: tokens.layout.container.content, marginInline: "auto", width: "100%" }}>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <Box className="hero-grid" style={{ paddingBlock: "3.5rem 3rem" }}>
          <Stack gap="lg">
            <Inline gap="sm" align="center">
              <Badge status="info">Studio Baeks</Badge>
              <Text variant="caption">Design System</Text>
            </Inline>

            <Logo height={112} style={{ maxWidth: "100%", height: "auto", width: "min(26rem, 72vw)" }} />

            <Text variant="title" style={{ maxWidth: "30rem" }}>
              순백과 검정, 그리고 의미가 있을 때만의 색.
            </Text>
            <Text variant="body" ink="soft" style={{ maxWidth: "32rem" }}>
              복잡한 웹앱을 위한 디자인 시스템입니다. Atlassian의 밀도, shadcn의 뉴트럴, ChatGPT의 조용함, SwiftUI의 마감을 한 결로 묶었습니다.
            </Text>

            <Inline gap="sm" style={{ marginTop: "0.25rem" }}>
              <Link to="/docs" style={{ textDecoration: "none" }}>
                <Button>문서 보기</Button>
              </Link>
              <Link to="/playground" style={{ textDecoration: "none" }}>
                <Button variant="outline">플레이그라운드</Button>
              </Link>
            </Inline>

            <Inline gap="xl" style={{ marginTop: "0.5rem" }}>
              {STAT.map((s) => (
                <Stack key={s.l} gap="xs">
                  <Text variant="title" as="span" style={{ fontVariantNumeric: "tabular-nums" }}>{s.n}</Text>
                  <Text variant="caption" ink="soft">{s.l}</Text>
                </Stack>
              ))}
            </Inline>
          </Stack>

          <LiveSampler />
        </Box>

        {/* ── 실제 화면에서 ────────────────────────────────────── */}
        <Stack gap="md" style={{ paddingBlock: "1rem 0" }}>
          <Inline justify="between" align="baseline">
            <Text variant="label">실제 화면에서</Text>
            <Link to="/demo" style={{ textDecoration: "none" }}>
              <Text variant="caption" as="span" className="pui-blue-ink" style={{ fontWeight: 550 }}>데모 전체 보기 →</Text>
            </Link>
          </Inline>
          <Link to="/demo" style={{ textDecoration: "none" }}>
            <DemoPreview />
          </Link>
          <Text variant="caption" ink="soft">
            컴포넌트 갤러리가 아니라 실제 화면(이슈 트래커)으로 검증합니다. 20개로 이게 서면 20개면 충분한 것.
          </Text>
        </Stack>

        {/* ── 원칙 ─────────────────────────────────────────────── */}
        <Stack gap="md" style={{ paddingBlock: "1rem" }}>
          <Text variant="label">여섯 원칙 중 넷</Text>
          <Box className="principles-grid">
            {PRINCIPLES.map((p) => (
              <Card key={p.k}>
                <Stack gap="xs">
                  <Text variant="subheading">{p.k}</Text>
                  <Text variant="caption" ink="soft">{p.v}</Text>
                </Stack>
              </Card>
            ))}
          </Box>
          <Inline gap="sm" align="center">
            <Text variant="caption">더 알아보기 —</Text>
            <Link to="/docs/get-started/principles" style={{ textDecoration: "none" }}><Text variant="caption" as="span" className="pui-blue-ink">여섯 원칙 전문</Text></Link>
            <Text variant="caption" ink="faint">·</Text>
            <Link to="/docs/foundations/tokens" style={{ textDecoration: "none" }}><Text variant="caption" as="span" className="pui-blue-ink">토큰</Text></Link>
            <Text variant="caption" ink="faint">·</Text>
            <Link to="/docs/foundations/architecture" style={{ textDecoration: "none" }}><Text variant="caption" as="span" className="pui-blue-ink">아키텍처</Text></Link>
          </Inline>
        </Stack>

        {/* ── 푸터 ─────────────────────────────────────────────── */}
        <Box style={{ borderTop: `1px solid ${tokens.color.border.base}`, paddingBlock: "1.5rem 2.5rem" }}>
          <Inline justify="between" align="center" wrap gap="md">
            <Logo height={20} style={{ opacity: 0.7 }} />
            <Text variant="caption" ink="faint">© Studio Baeks · 순백과 검정, 그리고 의미가 있을 때만의 색.</Text>
          </Inline>
        </Box>
      </Stack>
    </Box>
  </Stack>
);
