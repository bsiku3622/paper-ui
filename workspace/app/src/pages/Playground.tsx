// Playground — 20 개 컴포넌트를 한 화면에 전수 배치한다.
//
// 두 독자를 위한 표면:
//   1. 사람 — variant/state 를 한눈에 훑고 결이 맞는지 본다.
//   2. Playwright — 각 specimen 에 data-testid 를 달아 구조·정렬·색·포커스를
//      자동 assert 한다. (tests/playground.spec.ts)
//
// 특정 앱에 치우치지 않은 중립 표본이다 — 여기서 어긋나면 시스템이 어긋난 것.

import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Field,
  Icon,
  Inline,
  Link,
  Modal,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  TextField,
  Tooltip,
  tokens,
  type Column,
} from "@studio-baeks/paper-ui";

import { SiteNav, NAV_HEIGHT } from "../site/chrome";

// 사이드바 → 섹션 (:entry 딥링크). id = sec-{entry}.
const NAV = [
  { entry: "type", label: "Type scale" },
  { entry: "color", label: "Color" },
  { entry: "button", label: "Button" },
  { entry: "form", label: "Form controls" },
  { entry: "badge", label: "Badge · Link · Icon" },
  { entry: "mol", label: "Card · Tabs · Tooltip" },
  { entry: "comp", label: "Table · Modal" },
] as const;

// ── 배치 헬퍼 (paper 프리미티브로만 조립) ──────────────────────────────────

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <Stack as="section" gap="lg" id={id}>
    <Text variant="label">{title}</Text>
    <Stack gap="md">{children}</Stack>
  </Stack>
);

// 한 표본 = 캡션 + 내용. testid 로 테스트가 집어낸다.
const Spec = ({ label, testid, children }: { label: string; testid?: string; children: React.ReactNode }) => (
  <Stack gap="sm" data-testid={testid}>
    <Text variant="caption">{label}</Text>
    <Inline gap="md" wrap align="center">
      {children}
    </Inline>
  </Stack>
);

const TEXT_VARIANTS = ["title", "heading", "label", "body", "mono", "caption"] as const;
const PAPERS = ["base", "subtle", "muted"] as const;
const ACCENTS = ["blue", "green", "red"] as const;
const STATUSES = ["info", "success", "error"] as const;

export const Playground = () => {
  const [tab, setTab] = useState("one");
  const [checked, setChecked] = useState(true);
  const [modal, setModal] = useState(false);

  const columns: Column<{ id: string; k: string; s: "info" | "success" | "error"; n: number }>[] = [
    { key: "k", header: "키", render: (r) => <Text variant="body" as="span">{r.k}</Text> },
    { key: "s", header: "상태", render: (r) => <Badge status={r.s}>{r.s}</Badge> },
    { key: "n", header: "값", numeric: true, render: (r) => <Text variant="body" as="span">{r.n.toLocaleString()}</Text> },
  ];
  const rows = [
    { id: "1", k: "PG-1", s: "info" as const, n: 1240 },
    { id: "2", k: "PG-2", s: "success" as const, n: 88 },
    { id: "3", k: "PG-3", s: "error" as const, n: 5 },
  ];

  // :entry 로 들어오면 해당 섹션으로 스크롤
  const { entry } = useParams();
  useEffect(() => {
    if (!entry) return;
    const el = document.getElementById(`sec-${entry}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [entry]);

  return (
    <Stack>
      <SiteNav />
      <Box style={{ display: "grid", gridTemplateColumns: "14rem 1fr", maxWidth: "72rem", marginInline: "auto", width: "100%" }}>
        {/* 컴포넌트 사이드바 */}
        <Box as="nav" paddingX="lg" paddingY="xl" style={{ borderRight: `1px solid ${tokens.color.border.base}`, minHeight: `calc(100vh - ${NAV_HEIGHT})`, position: "sticky", top: NAV_HEIGHT, alignSelf: "start" }}>
          <Stack gap="xs">
            <Text variant="label">컴포넌트</Text>
            <Stack gap="xs">
              {NAV.map((n) => (
                <RouterLink key={n.entry} to={`/playground/${n.entry}`} style={{ textDecoration: "none" }}>
                  <Text variant="body" as="span" style={{ fontSize: "0.875rem", color: entry === n.entry ? tokens.color.accent.blue.ink : tokens.color.ink.soft, fontWeight: entry === n.entry ? 550 : 400 }}>
                    {n.label}
                  </Text>
                </RouterLink>
              ))}
            </Stack>
          </Stack>
        </Box>

      <Box paddingX="xl" paddingY="xl">
        <Stack gap="xl" style={{ maxWidth: "48rem" }}>
          <Stack gap="xs">
            <Text variant="label">Studio Baeks · Design System</Text>
            <Text variant="title">Component Playground</Text>
            <Text variant="caption">20 컴포넌트 · variant · state 전수. 이 페이지가 자동 테스트의 대상이다.</Text>
          </Stack>

          {/* ── Tokens ─────────────────────────────────────────── */}
          <Section id="sec-type" title="Type scale">
            <Stack gap="sm">
              {TEXT_VARIANTS.map((v) => (
                <Inline key={v} gap="lg" align="baseline">
                  <Box style={{ width: "6rem" }}>
                    <Text variant="caption" as="span">{v}</Text>
                  </Box>
                  <Text variant={v} as="span" data-testid={`text-${v}`}>
                    다람쥐 헌 쳇바퀴 Aa 0123
                  </Text>
                </Inline>
              ))}
            </Stack>
          </Section>

          <Section id="sec-color" title="Color">
            <Spec label="paper — 흰 바탕 3 단">
              {PAPERS.map((s) => (
                <Box key={s} paper={s} radius="md" padding="lg" data-testid={`swatch-paper-${s}`}
                  style={{ border: `1px solid ${tokens.color.border.base}`, minWidth: "5rem" }}>
                  <Text variant="caption" as="span">{s}</Text>
                </Box>
              ))}
            </Spec>
            <Spec label="accent — 작게 얹는 색 (dot=채운 점, ink=글자, wash=옅은 면)">
              {ACCENTS.map((a) => (
                <Inline key={a} gap="sm" align="center">
                  <Box accent={a} tone="dot" radius="pill" data-testid={`dot-${a}`}
                    style={{ width: "1rem", height: "1rem" }} />
                  <Text variant="body" as="span" className={`pui-${a}-ink`} data-testid={`ink-${a}`}>{a}</Text>
                  <Badge status={STATUSES[ACCENTS.indexOf(a)]}>{STATUSES[ACCENTS.indexOf(a)]}</Badge>
                </Inline>
              ))}
            </Spec>
          </Section>

          {/* ── Atoms ─────────────────────────────────────────── */}
          <Section id="sec-button" title="Button">
            <Spec label="kind" testid="spec-button-kinds">
              <Button kind="solid" data-testid="btn-solid">solid</Button>
              <Button kind="outline" data-testid="btn-outline">outline</Button>
              <Button kind="quiet" data-testid="btn-quiet">quiet</Button>
            </Spec>
            <Spec label="state">
              <Button kind="solid" disabled data-testid="btn-disabled">disabled</Button>
              <Button kind="solid" danger data-testid="btn-danger">삭제</Button>
            </Spec>
          </Section>

          <Section id="sec-form" title="Field · Label · Select · Checkbox">
            {/* 정렬 표본 — Field 와 Button 이 같은 높이/기준선에 앉는가 */}
            <Spec label="정렬 (Field ⇄ Button, 같은 baseline)" testid="spec-align">
              <Box style={{ width: "16rem" }}>
                <Field placeholder="검색…" aria-label="검색" data-testid="align-field" />
              </Box>
              <Button kind="solid" data-testid="align-button">실행</Button>
            </Spec>
            <Spec label="Field state">
              <Box style={{ width: "12rem" }}><Field placeholder="기본" data-testid="field-default" /></Box>
              <Box style={{ width: "12rem" }}><Field placeholder="에러" invalid data-testid="field-invalid" /></Box>
              <Box style={{ width: "12rem" }}><Field placeholder="비활성" disabled /></Box>
            </Spec>
            <Spec label="Select">
              <Box style={{ width: "12rem" }}>
                <Select data-testid="select" options={[
                  { value: "a", label: "옵션 A" },
                  { value: "b", label: "옵션 B" },
                ]} />
              </Box>
            </Spec>
            <Spec label="Checkbox">
              <Inline as="label" gap="sm">
                <Checkbox checked={checked} onChange={(e) => setChecked(e.currentTarget.checked)} data-testid="checkbox" />
                <Text variant="body" as="span">동의</Text>
              </Inline>
            </Spec>
            <Spec label="TextField (Label + Field + hint/error)">
              <Box style={{ width: "16rem" }}>
                <TextField label="이름" placeholder="입력" hint="공백 없이" data-testid="textfield" />
              </Box>
              <Box style={{ width: "16rem" }}>
                <TextField label="금액" numeric placeholder="0" error="숫자만 입력하세요" />
              </Box>
            </Spec>
          </Section>

          <Section id="sec-badge" title="Badge · Divider · Link · Icon">
            <Spec label="Badge — status 색 + 중립">
              {STATUSES.map((s) => <Badge key={s} status={s} data-testid={`badge-${s}`}>{s}</Badge>)}
              <Badge data-testid="badge-neutral">중립</Badge>
            </Spec>
            <Spec label="Link · Icon">
              <Link href="#/" data-testid="link">링크</Link>
              <Icon aria-label="정보" data-testid="icon">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" />
              </Icon>
            </Spec>
            <Divider />
          </Section>

          {/* ── Molecules ─────────────────────────────────────── */}
          <Section id="sec-mol" title="Card · Tabs · Tooltip">
            <Spec label="Card">
              <Card style={{ width: "16rem" }} data-testid="card">
                <Stack gap="xs">
                  <Text variant="heading">카드 제목</Text>
                  <Text variant="caption">옅은 면으로 정의되는 컨테이너.</Text>
                </Stack>
              </Card>
            </Spec>
            <Spec label="Tabs (segmented)">
              <Tabs value={tab} onChange={setTab} items={[
                { value: "one", label: "하나" },
                { value: "two", label: "둘" },
                { value: "three", label: "셋" },
              ]} />
            </Spec>
            <Spec label="Tooltip (hover)">
              <Tooltip label="툴팁 내용">
                <Button kind="outline" data-testid="tooltip-trigger">hover 해보세요</Button>
              </Tooltip>
            </Spec>
          </Section>

          {/* ── Components ─────────────────────────────────────── */}
          <Section id="sec-comp" title="Table · Modal">
            <Spec label="Table">
              <Box paper="subtle" radius="md" style={{ overflow: "hidden", width: "28rem" }}>
                <Table columns={columns} rows={rows} rowKey={(r) => r.id} />
              </Box>
            </Spec>
            <Spec label="Modal (열기)">
              <Button kind="solid" onClick={() => setModal(true)} data-testid="modal-open">모달 열기</Button>
            </Spec>
          </Section>
        </Stack>
      </Box>
      </Box>

      <Modal
        open={modal}
        title="모달 제목"
        onClose={() => setModal(false)}
        footer={
          <>
            <Button kind="quiet" onClick={() => setModal(false)}>취소</Button>
            <Button kind="solid" onClick={() => setModal(false)}>확인</Button>
          </>
        }
      >
        <Text variant="body">떠 있는 것만 그림자를 갖는다. Esc 로 닫힌다.</Text>
      </Modal>
    </Stack>
  );
};
