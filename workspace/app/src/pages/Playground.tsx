// Playground(전수) — 컴포넌트를 한 화면에 전부 깔아둔 레퍼런스.
//
// 두 독자를 위한 표면:
//   1. 사람 — variant/state 를 한눈에 훑고 결이 맞는지 본다. 개별 컴포넌트를 만져
//      보려면 사이드바에서 상세(/playground/:slug)로 들어간다.
//   2. Playwright — 각 specimen 에 data-testid 를 달아 구조·정렬·색·포커스를
//      자동 assert 한다. (tests/playground.spec.ts) — 이 페이지가 그 대상이다.
//
// 사이트 chrome·사이드바는 PlaygroundLayout 이 세운다. 여기선 표본만 깐다.

import { Fragment, useState } from "react";

import {
  Alert,
  Badge,
  Box,
  Breadcrumb,
  Button,
  Checkbox,
  CommandMenu,
  Divider,
  DropdownMenu,
  Field,
  FormField,
  Icon,
  IconButton,
  Inline,
  Link,
  Modal,
  Menu,
  EmptyState,
  PageHeader,
  Pagination,
  Radio,
  RadioGroup,
  SegmentedControl,
  Select,
  Spinner,
  Stack,
  Sidebar,
  Steps,
  Switch,
  Table,
  TableOfContents,
  Tabs,
  Text,
  Textarea,
  Tooltip,
  TreeNavigation,
} from "@studio-baeks/paper-ui";

import { PlaygroundLayout } from "../playground/shell";

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

const TEXT_VARIANTS = ["display", "title", "heading", "subheading", "body", "caption", "label"] as const;
const searchIcon = <Icon size="caption" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon>;
// family=mono 표본 — 해당 variant 행 바로 밑에 같은 크기 mono 로 깔아 sans 와 비교시킨다.
const MONO_DEMO: Partial<Record<(typeof TEXT_VARIANTS)[number], string>> = {
  title: "paper-ui",
  body: 'const paper = "ui"; // 0123',
};
const PAPERS = ["canvas", "raised", "sunken"] as const;
const ACCENTS = ["info", "success", "warning", "error"] as const;
const STATUSES = ["info", "success", "warning", "error"] as const;
const COLOR_ACCENTS = ["primary", ...ACCENTS] as const;
const BUTTON_VARIANTS = ["solid", "soft", "hairline", "ghost", "muted"] as const;

export const Playground = () => {
  const [tab, setTab] = useState("one");
  const [checked, setChecked] = useState(true);
  const [modal, setModal] = useState(false);
  const [longModal, setLongModal] = useState(false);
  const [page, setPage] = useState(4);
  const [radio, setRadio] = useState("one");
  const [menuActive, setMenuActive] = useState("overview");
  const [step, setStep] = useState("review");
  const [tocActive, setTocActive] = useState("props");
  const [treeActive, setTreeActive] = useState("button");

  const rows = [
    { id: "1", k: "PG-1", s: "info" as const, n: 1240 },
    { id: "2", k: "PG-2", s: "success" as const, n: 88 },
    { id: "3", k: "PG-3", s: "error" as const, n: 5 },
  ];
  const renderTable = (variant: "plain" | "ruled" | "striped", density: "compact" | "default" | "comfortable", limit = 3) => (
    <Table variant={variant} density={density}>
      <Table.Header><Table.Column>키</Table.Column><Table.Column>상태</Table.Column><Table.Column numeric>값</Table.Column></Table.Header>
      <Table.Body>{rows.slice(0, limit).map((row) => <Table.Row key={row.id}><Table.Cell>{row.k}</Table.Cell><Table.Cell><Badge accent={row.s}>{row.s}</Badge></Table.Cell><Table.Cell numeric>{row.n.toLocaleString()}</Table.Cell></Table.Row>)}</Table.Body>
    </Table>
  );

  return (
    <PlaygroundLayout value="all">
      <Stack gap="xl" style={{ maxWidth: "48rem" }}>
        <PageHeader>
          <PageHeader.Location><Text variant="label">Studio Baeks · Design System</Text></PageHeader.Location>
          <PageHeader.Content>
            <PageHeader.Title>Component Playground</PageHeader.Title>
            <PageHeader.Description>38 컴포넌트 · variant · state 전수. 이 페이지가 자동 테스트의 대상이다. 개별 컴포넌트는 사이드바에서 상세로.</PageHeader.Description>
          </PageHeader.Content>
        </PageHeader>

        {/* ── Tokens ─────────────────────────────────────────── */}
        <Section id="sec-type" title="Type scale">
          {/* sans 기본. family="mono" 를 주면 어느 variant 에도 등폭이 교차한다 (· mono 행). */}
          <Text variant="caption" ink="soft">sans 기본 · family=&quot;mono&quot; 는 어느 variant 에도 교차한다 (바로 밑 · mono 행에서 비교).</Text>
          <Stack gap="sm">
            {TEXT_VARIANTS.map((v) => (
              <Fragment key={v}>
                <Inline gap="lg" align="baseline">
                  <Box style={{ width: "6rem" }}>
                    <Text variant="caption" as="span">{v}</Text>
                  </Box>
                  <Text variant={v} as="span" data-testid={`text-${v}`}>
                    다람쥐 헌 쳇바퀴 Aa 0123
                  </Text>
                </Inline>
                {MONO_DEMO[v] && (
                  <Inline gap="lg" align="baseline">
                    <Box style={{ width: "6rem" }}>
                      <Text variant="caption" as="span" ink="faint">{v} · mono</Text>
                    </Box>
                    <Text variant={v} family="mono" as="span" data-testid={v === "body" ? "text-mono" : undefined}>
                      {MONO_DEMO[v]}
                    </Text>
                  </Inline>
                )}
              </Fragment>
            ))}
          </Stack>
        </Section>

        <Section id="sec-color" title="Color">
          <Spec label="surface — 면 깊이 3 단 (Box 의 구조 축, 색 아님)">
            {PAPERS.map((s) => (
              <Box key={s} surface={s} border radius="md" padding="lg" data-testid={`swatch-paper-${s}`}
                style={{ minWidth: "5rem" }}>
                <Text variant="caption" as="span">{s}</Text>
              </Box>
            ))}
          </Spec>
          <Spec label="accent — 작게 얹는 색 (dot=채운 점, ink=글자, wash=옅은 면)">
            {ACCENTS.map((a) => (
              <Inline key={a} gap="sm" align="center">
                <Box className={`pui-${a}-dot`} radius="full" data-testid={`dot-${a}`}
                  style={{ width: "1rem", height: "1rem" }} />
                <Text variant="body" as="span" ink={a} data-testid={`ink-${a}`}>{a}</Text>
                <Badge accent={STATUSES[ACCENTS.indexOf(a)]}>{STATUSES[ACCENTS.indexOf(a)]}</Badge>
              </Inline>
            ))}
          </Spec>
          <Stack gap="sm">
            <Text variant="caption" ink="soft">
              Accent × variant · 각 칸은 실제 accent와 variant 조합입니다.
            </Text>
            <Box surface="raised" border radius="md" style={{ maxWidth: "100%", overflowX: "auto" }}>
              <Table variant="ruled" density="compact" data-testid="color-variant-matrix" aria-label="Accent and button variant combinations" style={{ minWidth: "max-content" }}>
              <Table.Caption>Accent × variant combinations</Table.Caption>
              <Table.Header>
                <Table.Column>Variant</Table.Column>
                {COLOR_ACCENTS.map((accent) => <Table.Column key={accent}>{accent}</Table.Column>)}
              </Table.Header>
              <Table.Body>
                {BUTTON_VARIANTS.map((variant) => (
                  <Table.Row key={variant}>
                    <Table.Cell><Text variant="caption" family="mono" as="span">{variant}</Text></Table.Cell>
                    {COLOR_ACCENTS.map((accent) => (
                      <Table.Cell key={`${accent}-${variant}`}>
                        <Button size="sm" accent={accent} variant={variant}>{accent}</Button>
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Body>
              </Table>
            </Box>
          </Stack>
        </Section>

        {/* ── Primitives · Box ──────────────────────────────── */}
        <Section id="sec-box" title="Box · 구조 패널">
          <Spec label="surface + border (붙은 면의 헤어라인) · inverse (검은 판)">
            <Box surface="raised" padding="md" radius="md">
              <Text variant="caption" as="span">raised</Text>
            </Box>
            <Box surface="raised" border padding="md" radius="md" data-testid="box-border">
              <Text variant="caption" as="span">raised + border</Text>
            </Box>
            <Box surface="sunken" padding="md" radius="md">
              <Text variant="caption" as="span">sunken</Text>
            </Box>
            <Box inverse surface="canvas" border padding="md" radius="md">
              <Text variant="caption" as="span">inverse</Text>
            </Box>
          </Spec>
          <Spec label="radius — 작은 면 4 · 카드 6 · 큰 면 8" testid="spec-layout-radius">
            <Box surface="raised" border radius="sm" padding="md" data-testid="radius-small"><Text variant="caption">4px · small</Text></Box>
            <Box surface="raised" border radius="md" padding="md" data-testid="radius-card"><Text variant="caption">6px · card</Text></Box>
            <Box surface="raised" border radius="lg" padding="md" data-testid="radius-large"><Text variant="caption">8px · large</Text></Box>
          </Spec>
        </Section>

        {/* ── Atoms ─────────────────────────────────────────── */}
        <Section id="sec-button" title="Button">
          <Spec label="variant — 시각 무게" testid="spec-button-variants">
            <Button variant="solid" data-testid="btn-solid">solid</Button>
            <Button variant="soft" data-testid="btn-soft">soft</Button>
            <Button variant="hairline" data-testid="btn-hairline">hairline</Button>
            <Button variant="ghost" data-testid="btn-ghost">ghost</Button>
            <Button variant="muted" data-testid="btn-muted">muted</Button>
          </Spec>
          <Spec label="color — 의미 색 (variant 와 직교)">
            <Button accent="error" data-testid="btn-danger">삭제</Button>
            <Button variant="soft" accent="success" data-testid="btn-soft-success">완료</Button>
            <Button variant="soft" accent="warning" data-testid="btn-soft-warning">주의</Button>
            <Button variant="ghost" accent="error">지우기</Button>
          </Spec>
          <Spec label="solid — 선명한 채움과 밝은 글자 · primary는 무채색 반전">
            <Button accent="primary">primary</Button>
            <Button accent="info">info</Button>
            <Button accent="success">success</Button>
            <Button accent="warning">warning</Button>
            <Button accent="error">error</Button>
          </Spec>
          <Spec label="size — 크기 3 단 sm·md·lg (fontSize 는 14 고정, lg 만 semibold)" testid="spec-button-sizes">
            <Button size="sm" data-testid="btn-sm">sm</Button>
            <Button size="md" data-testid="btn-md">md</Button>
            <Button size="lg" data-testid="btn-lg">lg</Button>
          </Spec>
          <Spec label="state">
            <Button disabled data-testid="btn-disabled">disabled</Button>
          </Spec>
          <Spec label="loading · IconButton (정사각, aria-label 필수)">
            <Button loading data-testid="btn-loading">저장 중</Button>
            <Button variant="soft" loading>불러오기</Button>
            <IconButton aria-label="추가" data-testid="btn-icononly">
              <Icon><path d="M12 5v14M5 12h14" /></Icon>
            </IconButton>
            <IconButton variant="hairline" aria-label="닫기">
              <Icon><path d="M6 6l12 12M18 6 6 18" /></Icon>
            </IconButton>
            <IconButton accent="error" aria-label="삭제">
              <Icon><path d="M4 7h16M9 7V5h6v2M6 7l1 12h10l1-12" /></Icon>
            </IconButton>
          </Spec>
          <Spec label="fullWidth">
            <Box style={{ width: "20rem" }}>
              <Button fullWidth data-testid="btn-fullwidth">가로 꽉 (폼·모바일)</Button>
            </Box>
          </Spec>
          {/* 알약은 기본값이 아니라 선택이다 — 화면에 하나둘 있을 때만 "여기가 가장 중요한
              행동" 이라는 뜻을 진다. 고르는 건 곡선의 크기가 아니라 알약이냐 아니냐뿐. */}
          <Spec label="shape — 시스템 곡선 ⇄ 알약(pill)" testid="spec-button-shape">
            <Button data-testid="btn-shape-default">기본</Button>
            <Button shape="pill" data-testid="btn-shape-pill">알약</Button>
            <Button variant="hairline" shape="pill">알약 hairline</Button>
            <Button size="lg" shape="pill">알약 lg</Button>
          </Spec>
        </Section>

        <Section id="sec-form" title="Field · Label · Select · Checkbox">
          {/* 정렬 표본 — Field 와 Button 이 같은 높이/기준선에 앉는가 */}
          <Spec label="정렬 (Field ⇄ Button, 같은 baseline)" testid="spec-align">
            <Box style={{ width: "16rem" }}>
              <Field placeholder="검색…" aria-label="검색" data-testid="align-field" />
            </Box>
            <Button data-testid="align-button">실행</Button>
          </Spec>
          <Spec label="Field status">
            <Box style={{ width: "12rem" }}><Field placeholder="기본" data-testid="field-default" /></Box>
            <Box style={{ width: "12rem" }}><Field placeholder="에러" status="error" data-testid="field-invalid" /></Box>
            <Box style={{ width: "12rem" }}><Field placeholder="성공" status="success" /></Box>
            <Box style={{ width: "12rem" }}><Field placeholder="비활성" disabled /></Box>
          </Spec>
          <Spec label="Field 어도먼트 — 아이콘 · clear · 비밀번호 · prefix/suffix">
            <Box style={{ width: "12rem" }}>
              <Field placeholder="검색" leading={<Icon size="caption"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon>} />
            </Box>
            <Box style={{ width: "12rem" }}>
              <Field defaultValue="지울 값" clearable data-testid="field-clearable" />
            </Box>
            <Box style={{ width: "12rem" }}>
              <Field type="password" showPasswordToggle defaultValue="secret" data-testid="field-password" />
            </Box>
            <Box style={{ width: "9rem" }}>
              <Field numeric align="end" placeholder="0" leading="$" />
            </Box>
            <Box style={{ width: "9rem" }}>
              <Field numeric align="end" placeholder="0" trailing="kg" />
            </Box>
          </Spec>
          <Spec label="Field recessed — sunken surface · leading icon · trailing shortcut">
            <Box style={{ width: "22rem" }}>
              <Field
                type="search"
                surface="sunken"
                placeholder="작업 검색..."
                aria-label="작업 검색"
                leading={<Icon size="body" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon>}
                trailing={<Box as="kbd" surface="raised" border radius="sm" paddingX="xs"><Text variant="caption">⌘ K</Text></Box>}
              />
            </Box>
          </Spec>
          <Spec label="Select">
            <Box style={{ width: "12rem" }}>
              <Select data-testid="select"><Select.Option value="">선택하세요</Select.Option><Select.Option value="a">옵션 A</Select.Option><Select.Option value="b">옵션 B</Select.Option></Select>
            </Box>
          </Spec>
          {/* size 정렬 — Field·Select·Button 이 같은 사다리라 나란히 두면 높이가 맞는다 */}
          <Spec label="size sm — compact 30px" testid="spec-size-sm">
            <Box style={{ width: "10rem" }}><Field size="sm" defaultValue="11.25" trailing="pt" aria-label="field sm" /></Box>
            <Box style={{ width: "9rem" }}><Select size="sm" aria-label="select sm"><Select.Option value="a">본명조</Select.Option></Select></Box>
            <Button size="sm">Button</Button>
          </Spec>
          <Spec label="size md — default 32px · radius 4px" testid="spec-size-md">
            <Box style={{ width: "10rem" }}><Field size="md" placeholder="Field" aria-label="field md" /></Box>
            <Box style={{ width: "9rem" }}><Select size="md"><Select.Option value="a">Select</Select.Option></Select></Box>
            <Button size="md">Button</Button>
          </Spec>
          <Spec label="size lg — roomy 36px" testid="spec-size-lg">
            <Box style={{ width: "10rem" }}><Field size="lg" placeholder="Field" aria-label="field lg" /></Box>
            <Box style={{ width: "9rem" }}><Select size="lg"><Select.Option value="a">Select</Select.Option></Select></Box>
            <Button size="lg">Button</Button>
          </Spec>
          {/* 공통 base — 넷이 같은 컨트롤 여백을 쓰는가. 높이가 아니라 *글자 시작점* 을 본다:
              Textarea 는 줄 수만큼 자라 높이로는 줄을 못 세우고, Select 는 화살표 때문에
              오른쪽만 넓다. 왼쪽 여백 하나가 넷을 한 세로선에 세운다. */}
          <Spec label="base — radius 4 · 라벨 padding 11 · 값 padding 8" testid="spec-control-base">
            <Button variant="hairline" size="md" data-testid="base-button">hairline</Button>
            <Box style={{ width: "9rem" }}><Field size="md" placeholder="Field" aria-label="field base" data-testid="base-field" /></Box>
            <Box style={{ width: "9rem" }}><Select size="md" data-testid="base-select"><Select.Option value="a">Select</Select.Option></Select></Box>
            <Box style={{ width: "12rem" }}><Textarea size="md" rows={2} placeholder="Textarea" aria-label="textarea base" data-testid="base-textarea" /></Box>
          </Spec>
          {/* 알약은 컨트롤 어휘 하나다 — Button·Field·Select 가 같은 곡선을 든다. 검색
              한 줄에 셋이 나란히 서는 게 이 어휘가 있는 이유고, 여백은 안 움직인다
              (shape 은 실루엣 축이지 밀도 축이 아니다).
              Textarea 에는 없다 — 알약은 "높이의 절반" 이라 한 줄짜리에서만 성립한다. */}
          <Spec label="shape=pill — 검색 한 줄 (Field · Select · Button 같은 곡선)" testid="spec-pill-row">
            <Box style={{ width: "12rem" }}>
              <Field shape="pill" placeholder="검색" aria-label="검색" data-testid="field-pill"
                leading={<Icon size="caption"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon>} />
            </Box>
            <Box style={{ width: "8rem" }}>
              <Select shape="pill" data-testid="select-pill"><Select.Option value="a">전체</Select.Option></Select>
            </Box>
            <Button shape="pill" data-testid="button-pill-row">검색</Button>
          </Spec>
          <Spec label="Checkbox">
            <Inline as="label" gap="sm">
              <Checkbox checked={checked} onChange={(e) => setChecked(e.currentTarget.checked)} data-testid="checkbox" />
              <Text variant="body" as="span">동의</Text>
            </Inline>
          </Spec>
          {/* 작은 표식들이 한 줄에 섰을 때 서로 같은 무게로 읽히는지 — 숫자가 같은 것과
              같아 보이는 것은 다르다. 아이콘은 24 아트보드 안에서 여백을 갖고, 스위치는
              폭이 넓어 같은 높이여도 더 크게 읽힌다. */}
          <Spec label="작은 표식 — 한 줄에 세웠을 때 (md)" testid="spec-marks">
            <Inline gap="lg" align="center">
              <Checkbox defaultChecked data-testid="mark-checkbox" />
              {/* 꺼진 상태 — 경계가 유일한 단서인 자리라 대비 계약이 여기 걸린다. */}
              <Checkbox data-testid="mark-checkbox-off" aria-label="꺼진 체크박스" />
              <Radio name="mark" defaultChecked data-testid="mark-radio" />
              <Radio name="mark-off" data-testid="mark-radio-off" aria-label="꺼진 라디오" />
              <Switch defaultChecked data-testid="mark-switch" />
              <Icon aria-label="정보" data-testid="mark-icon">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8h.01M12 11v5" />
              </Icon>
              <Spinner data-testid="mark-spinner" />
              <Badge data-testid="mark-badge">배지</Badge>
              <Button size="sm" data-testid="mark-button">버튼</Button>
            </Inline>
          </Spec>
          <Spec label="FormField + Field — label · hint · error">
            <Box style={{ width: "16rem" }}>
              <FormField>
                <FormField.Label>이름</FormField.Label>
                <FormField.Control><Field placeholder="입력" data-testid="formfield-field" /></FormField.Control>
                <FormField.Hint>공백 없이</FormField.Hint>
              </FormField>
            </Box>
            <Box style={{ width: "16rem" }}>
              <FormField align="end">
                <FormField.Label>금액</FormField.Label>
                <FormField.Control><Field numeric align="end" status="error" placeholder="0" /></FormField.Control>
                <FormField.Error>숫자만 입력하세요</FormField.Error>
              </FormField>
            </Box>
          </Spec>
        </Section>

        <Section id="sec-badge" title="Badge · Divider · Link · Icon">
          <Spec label="Badge — status 색 + 중립 (soft)">
            {STATUSES.map((s) => <Badge key={s} accent={s} data-testid={`badge-${s}`}>{s}</Badge>)}
            <Badge data-testid="badge-neutral">중립</Badge>
          </Spec>
          <Spec label="Badge — shared variant · dot">
            <Badge accent="error" variant="solid">3</Badge>
            <Badge accent="success" variant="solid">완료</Badge>
            <Badge accent="info" variant="hairline">검토</Badge>
            <Badge variant="muted">보조 정보</Badge>
            <Badge accent="info" dot>진행</Badge>
            <Badge accent="success" dot>정상</Badge>
          </Spec>
          {/* 배지도 컨트롤과 같은 규칙 — 높이만 움직이고 글자는 12 로 고정이다. 예전엔
              11·12·14 로 높이를 따라가서, 작은 배지의 글자가 가독성 하한 아래로 떨어졌다. */}
          <Spec label="Badge — size (높이 20·22·24, 글자는 12 고정)" testid="spec-badge-size">
            <Badge size="sm" accent="info" data-testid="badge-sm">sm</Badge>
            <Badge size="md" accent="info" data-testid="badge-md">md</Badge>
            <Badge size="lg" accent="info" data-testid="badge-lg">lg</Badge>
          </Spec>
          <Spec label="Badge — shape (Button 과 같은 어휘라 나란히 서면 곡선이 맞는다)" testid="spec-badge-shape">
            <Badge accent="success" data-testid="badge-shape-default">완료</Badge>
            <Badge accent="success" shape="pill" data-testid="badge-shape-pill">완료</Badge>
            <Badge accent="error" variant="solid" shape="pill">3</Badge>
            <Badge accent="info" dot shape="pill">진행</Badge>
          </Spec>
          {/* Divider 는 세로로 세워 표본으로 보인다. 가로 한 줄을 그으면 섹션을 가르는
              선처럼 읽혀, 예제 화면이 줄무늬가 된다 — 두 축은 상세 페이지에서 전환한다. */}
          <Spec label="Divider · Link · Icon">
            <Link href="#/" data-testid="link">링크</Link>
            <Divider axis="vertical" />
            <Icon aria-label="정보" data-testid="icon">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5M12 8h.01" />
            </Icon>
          </Spec>
        </Section>

        {/* ── Molecules ─────────────────────────────────────── */}
        <Section id="sec-mol" title="FormField · SegmentedControl · Tabs · Tooltip">
          <Spec label="SegmentedControl — sm 기본 · default/pill shape" testid="spec-segmented-shape">
            <Inline gap="lg" wrap align="center">
              <Box data-testid="segmented-shape-default">
                <SegmentedControl value={tab} onValueChange={setTab}><SegmentedControl.Item value="one">하나</SegmentedControl.Item><SegmentedControl.Item value="two">둘</SegmentedControl.Item><SegmentedControl.Item value="three">셋</SegmentedControl.Item></SegmentedControl>
              </Box>
              <Box data-testid="segmented-shape-pill">
                <SegmentedControl value={tab} onValueChange={setTab} shape="pill"><SegmentedControl.Item value="one">하나</SegmentedControl.Item><SegmentedControl.Item value="two">둘</SegmentedControl.Item><SegmentedControl.Item value="three">셋</SegmentedControl.Item></SegmentedControl>
              </Box>
            </Inline>
          </Spec>
          <Spec label="Tabs — md 기본 · underline trigger와 panel" testid="spec-tabs">
            <Box style={{ width: "24rem", maxWidth: "100%" }}>
              <Tabs value={tab} onValueChange={setTab}>
                <Tabs.List aria-label="컴포넌트 문서"><Tabs.Trigger value="one">개요</Tabs.Trigger><Tabs.Trigger value="two">Props</Tabs.Trigger><Tabs.Trigger value="three">예제</Tabs.Trigger></Tabs.List>
                <Tabs.Content value="one"><Stack gap="xs"><Text variant="subheading">컴포넌트 개요</Text><Text ink="soft">역할과 기본 사용 원칙을 읽습니다.</Text></Stack></Tabs.Content>
                <Tabs.Content value="two"><Stack gap="xs"><Text variant="subheading">Props 문서</Text><Text ink="soft">공개된 축과 기본값을 확인합니다.</Text></Stack></Tabs.Content>
                <Tabs.Content value="three"><Stack gap="xs"><Text variant="subheading">사용 예제</Text><Text ink="soft">실제 content composition을 살펴봅니다.</Text></Stack></Tabs.Content>
              </Tabs>
            </Box>
          </Spec>
          <Spec label="RadioGroup — 세로 질문과 가로 선택지">
            <RadioGroup
              value={radio}
              onValueChange={setRadio}
              orientation="horizontal"
              aria-label="보기 방식"
            ><RadioGroup.Item value="one">목록</RadioGroup.Item><RadioGroup.Item value="two">보드</RadioGroup.Item><RadioGroup.Item value="three">달력</RadioGroup.Item></RadioGroup>
          </Spec>
          <Spec label="FormField — Select·Textarea도 Label·설명 연결을 같은 리듬으로">
            <Box style={{ width: "16rem" }}>
              <FormField>
                <FormField.Label>우선순위</FormField.Label>
                <FormField.Control><Select><Select.Option value="">선택하세요</Select.Option><Select.Option value="high">높음</Select.Option><Select.Option value="normal">보통</Select.Option></Select></FormField.Control>
                <FormField.Hint>저장 후에도 변경할 수 있습니다.</FormField.Hint>
              </FormField>
            </Box>
          </Spec>
          <Spec label="검색 Field — type · leading · clearable 조합">
            <Box style={{ width: "16rem" }}>
              <Field type="search" leading={searchIcon} clearable aria-label="검색" placeholder="이슈 검색" defaultValue="focus" />
            </Box>
          </Spec>
          <Spec label="Tooltip — trigger와 content가 드러나는 구조">
            <Tooltip>
              <Tooltip.Trigger asChild><Button variant="hairline" data-testid="tooltip-trigger">hover 해보세요</Button></Tooltip.Trigger>
              <Tooltip.Content><Stack gap="xs"><Text variant="label" ink="inherit">새 이슈</Text><Text variant="caption" ink="inherit">단축키 C로도 열 수 있습니다.</Text></Stack></Tooltip.Content>
            </Tooltip>
          </Spec>
          <Spec label="Breadcrumb · Sidebar — location과 local navigation">
            <Breadcrumb><Breadcrumb.Item>Atoms</Breadcrumb.Item><Breadcrumb.Item>Component</Breadcrumb.Item><Breadcrumb.Item current>Checkbox</Breadcrumb.Item></Breadcrumb>
            <Box style={{ width: "14rem" }}>
              <Sidebar value="components">
                <Sidebar.Group label="문서">
                  <Sidebar.Item value="overview">개요</Sidebar.Item>
                  <Sidebar.Item value="tokens">토큰<Sidebar.Badge accent="warning">MOD</Sidebar.Badge></Sidebar.Item>
                  <Sidebar.Item value="components">컴포넌트<Sidebar.Badge accent="info">NEW</Sidebar.Badge></Sidebar.Item>
                </Sidebar.Group>
              </Sidebar>
            </Box>
          </Spec>
        </Section>

        <Section id="sec-navigation" title="Menu · Steps · TableOfContents · DropdownMenu · CommandMenu · TreeNavigation">
          <Spec label="Menu — 한 열의 action과 현재 위치">
            <Box style={{ width: "18rem" }}>
              <Menu value={menuActive} onValueChange={setMenuActive}><Menu.Item value="overview" description="시스템의 기본 원칙">개요</Menu.Item><Menu.Item value="tokens" shortcut="⌘ T">토큰</Menu.Item><Menu.Item value="archive" danger>보관하기</Menu.Item></Menu>
            </Box>
          </Spec>
          <Spec label="Steps — 실제 순서를 번호와 연결선으로">
            <Box style={{ width: "32rem", maxWidth: "100%" }}>
              <Steps value={step} onValueChange={setStep}><Steps.Item value="draft" description="내용 작성">초안</Steps.Item><Steps.Item value="review" description="구조 확인">검토</Steps.Item><Steps.Item value="publish" description="문서 공개">배포</Steps.Item></Steps>
            </Box>
          </Spec>
          <Spec label="TableOfContents — 문서 내부의 현재 위치">
            <Box style={{ width: "16rem" }}>
              <TableOfContents value={tocActive} onValueChange={setTocActive}><TableOfContents.Item value="overview">개요</TableOfContents.Item><TableOfContents.Item value="props" depth={1}>Props</TableOfContents.Item><TableOfContents.Item value="examples" depth={1}>예제</TableOfContents.Item></TableOfContents>
            </Box>
          </Spec>
          <Spec label="DropdownMenu — 떠 있는 action surface만 overlay shadow">
            <DropdownMenu><DropdownMenu.Trigger><Button variant="hairline">문서 작업</Button></DropdownMenu.Trigger><DropdownMenu.Content><DropdownMenu.Item value="duplicate" shortcut="⌘ D">복제</DropdownMenu.Item><DropdownMenu.Item value="move">이동</DropdownMenu.Item><DropdownMenu.Item value="delete" danger>삭제</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu>
          </Spec>
          <Spec label="CommandMenu — 검색과 키보드 선택을 한 listbox로">
            <Box style={{ width: "28rem", maxWidth: "100%" }}>
              <CommandMenu><CommandMenu.Group label="컴포넌트"><CommandMenu.Item value="button" description="Atoms" shortcut="B">Button</CommandMenu.Item><CommandMenu.Item value="sidebar" description="Components" shortcut="S">Sidebar</CommandMenu.Item></CommandMenu.Group><CommandMenu.Group label="문서"><CommandMenu.Item value="colors" description="Foundations" keywords={["palette"]}>Color tokens</CommandMenu.Item></CommandMenu.Group></CommandMenu>
            </Box>
          </Spec>
          <Spec label="TreeNavigation — 접고 펴는 계층 탐색">
            <Box style={{ width: "18rem" }}>
              <TreeNavigation value={treeActive} onValueChange={setTreeActive} defaultExpandedValues={["components", "atoms"]}><TreeNavigation.Item value="foundations" label="Foundations"><TreeNavigation.Item value="colors" label="Color" /><TreeNavigation.Item value="shape" label="Shape" /></TreeNavigation.Item><TreeNavigation.Item value="components" label="Components"><TreeNavigation.Item value="atoms" label="Atoms"><TreeNavigation.Item value="button" label="Button" /><TreeNavigation.Item value="badge" label="Badge" /></TreeNavigation.Item><TreeNavigation.Item value="molecules" label="Molecules" /></TreeNavigation.Item></TreeNavigation>
            </Box>
          </Spec>
        </Section>

        {/* ── Components ─────────────────────────────────────── */}
        <Section id="sec-feedback" title="Alert · variants">
          {/* Alert 은 Button·Badge 와 같은 color × variant 매트릭스를 문다. 면을 위한
              별도 축을 세우지 않은 건 variant 가 이미 *면의 무게* 축이기 때문이다. */}
          <Spec label="Alert — variant (같은 색, 다섯 가지 면의 무게)" testid="spec-alert-variant">
            <Inline gap="md" wrap align="start">
              {(["solid", "soft", "hairline", "ghost", "muted"] as const).map((v) => (
                <Box key={v} style={{ width: "15rem" }} data-testid={`alert-${v}`}>
                  <Alert accent="error" variant={v}>
                    <Alert.Title>확인이 필요합니다</Alert.Title>
                    <Alert.Description>이 작업은 되돌릴 수 없습니다.</Alert.Description>
                  </Alert>
                </Box>
              ))}
            </Inline>
          </Spec>
          <Spec label="Alert — color (primary 는 중립 안내)" testid="spec-alert-color">
            <Inline gap="md" wrap align="start">
              {(["primary", "info", "success", "warning", "error"] as const).map((c) => (
                <Box key={c} style={{ width: "11rem" }}>
                  <Alert accent={c}><Alert.Title>{c}</Alert.Title></Alert>
                </Box>
              ))}
            </Inline>
          </Spec>
          <Spec label="hairline — 지면이 소유한 선 (붙은 면·빈 입력칸과 같은 헤어라인)" testid="spec-hairline">
            <Inline gap="sm" wrap align="center">
              <Button variant="hairline" data-testid="hairline-primary">기본</Button>
              {STATUSES.map((c) => (
                <Button key={c} accent={c} variant="hairline" data-testid={`hairline-${c}`}>{c}</Button>
              ))}
              {STATUSES.map((c) => (
                <Badge key={c} accent={c} variant="hairline">{c}</Badge>
              ))}
              <Box style={{ width: "9rem" }}>
                <Field placeholder="같은 선" aria-label="같은 선" data-testid="hairline-field" />
              </Box>
            </Inline>
          </Spec>
        </Section>


        <Section id="sec-comp" title="PageHeader · EmptyState · Pagination · Table · Modal">
          <Spec label="PageHeader — 페이지 제목과 행동의 시작선">
            <Box style={{ width: "28rem" }}>
              <PageHeader>
                <PageHeader.Location><Breadcrumb><Breadcrumb.Item>Components</Breadcrumb.Item><Breadcrumb.Item current>Checkbox</Breadcrumb.Item></Breadcrumb></PageHeader.Location>
                <PageHeader.Content><PageHeader.Title>이슈</PageHeader.Title><PageHeader.Description>12건이 현재 필터와 일치합니다.</PageHeader.Description></PageHeader.Content>
                <PageHeader.Actions><Button size="sm">새 이슈</Button></PageHeader.Actions>
              </PageHeader>
            </Box>
          </Spec>
          <Spec label="EmptyState — 빈 결과에서 다음 행동 하나를 남긴다">
            <Box surface="raised" border radius="md" style={{ width: "28rem" }}>
              <EmptyState>
                <EmptyState.Title>일치하는 이슈가 없습니다</EmptyState.Title>
                <EmptyState.Description>필터를 바꾸거나 새 이슈를 만들어 시작하세요.</EmptyState.Description>
                <EmptyState.Action><Button size="sm">필터 초기화</Button></EmptyState.Action>
              </EmptyState>
            </Box>
          </Spec>
          <Spec label="Pagination — outline · soft · minimal">
            {(["outline", "soft", "minimal"] as const).map((variant) => (
              <Pagination key={variant} variant={variant} page={page} totalPages={12} onPageChange={setPage} />
            ))}
          </Spec>
          <Spec label="Table — 행을 구분하는 방식" testid="spec-table-variant">
            {(["plain", "ruled", "striped"] as const).map((variant) => (
              <Box key={variant} surface="raised" border radius="md" style={{ overflow: "hidden", width: "15rem" }} data-testid={`table-${variant}`}>
                {renderTable(variant, "default")}
              </Box>
            ))}
          </Spec>
          <Spec label="Table — 같은 14px 글자, 다른 정보 밀도" testid="spec-table-density">
            {(["compact", "default", "comfortable"] as const).map((density) => (
              <Box key={density} surface="raised" border radius="md" style={{ overflow: "hidden", width: "15rem" }} data-testid={`table-density-${density}`}>
                {renderTable("plain", density, 2)}
              </Box>
            ))}
          </Spec>
          <Spec label="Table anatomy — Column별 align과 조합 가능한 semantic parts">
            <Box style={{ width: "30rem", maxWidth: "100%" }}>
              <Table variant="plain">
                <Table.Header>
                  <Table.Column>키</Table.Column>
                  <Table.Column>이슈</Table.Column>
                  <Table.Column align="center">담당</Table.Column>
                  <Table.Column align="end">상태</Table.Column>
                </Table.Header>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell><Text as="span" variant="caption" ink="soft">STU-142</Text></Table.Cell>
                    <Table.Cell>토큰 트리를 두 번 걷는 emit 파이프라인</Table.Cell>
                    <Table.Cell align="center">재원</Table.Cell>
                    <Table.Cell align="end"><Badge accent="info">진행</Badge></Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell><Text as="span" variant="caption" ink="soft">STU-139</Text></Table.Cell>
                    <Table.Cell>Select 포커스 링이 사파리에서 잘림</Table.Cell>
                    <Table.Cell align="center">민주</Table.Cell>
                    <Table.Cell align="end"><Badge accent="error">막힘</Badge></Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Box>
          </Spec>
          {/* 긴 본문 모달이 따로 있는 이유 — backdrop 이 fixed 라 패널이 뷰포트보다 커지면
              넘친 부분에 닿을 방법이 없다(body 스크롤도 잠겨 있다). 예전엔 700px 화면에서
              패널이 1069px 로 자라 푸터 버튼이 화면 밖으로 나갔다. */}
          <Spec label="Modal (열기 · 긴 본문은 본문만 구른다)">
            <Inline gap="sm">
              <Button onClick={() => setModal(true)} data-testid="modal-open">모달 열기</Button>
              <Button variant="hairline" onClick={() => setLongModal(true)} data-testid="modal-open-long">
                긴 본문 열기
              </Button>
            </Inline>
          </Spec>
        </Section>
      </Stack>

      <Modal open={modal} onOpenChange={setModal} size="sm">
        <Modal.Header>
          <Modal.Title>모달 제목</Modal.Title>
          <Modal.Description>변경할 내용을 확인하세요.</Modal.Description>
        </Modal.Header>
        <Modal.Body><Text variant="body">떠 있는 것만 그림자를 갖는다. Esc 로 닫힌다.</Text></Modal.Body>
        <Modal.Footer>
          <Modal.Close variant="muted">취소</Modal.Close>
          <Modal.Close>확인</Modal.Close>
        </Modal.Footer>
      </Modal>

      <Modal open={longModal} onOpenChange={setLongModal} size="lg">
        <Modal.Header><Modal.Title>긴 본문</Modal.Title></Modal.Header>
        <Modal.Body>
          <Stack gap="md" data-testid="long-modal-body">
            {Array.from({ length: 24 }, (_, i) => (
              <Text key={i} variant="body">
                {i + 1}. 패널에 높이 상한이 있어 이 본문만 구른다. 제목과 푸터는 붙박이다.
              </Text>
            ))}
          </Stack>
        </Modal.Body>
        <Modal.Footer><Modal.Close data-testid="long-modal-confirm">확인</Modal.Close></Modal.Footer>
      </Modal>
    </PlaygroundLayout>
  );
};
