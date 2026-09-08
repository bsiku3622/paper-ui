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
  Button,
  Card,
  Checkbox,
  Divider,
  Field,
  Icon,
  Inline,
  Link,
  Modal,
  Radio,
  Select,
  Spinner,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  Textarea,
  TextField,
  Tooltip,
  type Column,
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
// family=mono 표본 — 해당 variant 행 바로 밑에 같은 크기 mono 로 깔아 sans 와 비교시킨다.
const MONO_DEMO: Partial<Record<(typeof TEXT_VARIANTS)[number], string>> = {
  title: "paper-ui",
  body: 'const paper = "ui"; // 0123',
};
const PAPERS = ["canvas", "raised", "sunken", "well"] as const;
const ACCENTS = ["info", "success", "warning", "error"] as const;
const STATUSES = ["info", "success", "warning", "error"] as const;

export const Playground = () => {
  const [tab, setTab] = useState("one");
  const [checked, setChecked] = useState(true);
  const [modal, setModal] = useState(false);
  const [longModal, setLongModal] = useState(false);

  const columns: Column<{ id: string; k: string; s: "info" | "success" | "error"; n: number }>[] = [
    { key: "k", header: "키", render: (r) => <Text variant="body" as="span">{r.k}</Text> },
    { key: "s", header: "상태", render: (r) => <Badge color={r.s}>{r.s}</Badge> },
    { key: "n", header: "값", numeric: true, render: (r) => <Text variant="body" as="span">{r.n.toLocaleString()}</Text> },
  ];
  const rows = [
    { id: "1", k: "PG-1", s: "info" as const, n: 1240 },
    { id: "2", k: "PG-2", s: "success" as const, n: 88 },
    { id: "3", k: "PG-3", s: "error" as const, n: 5 },
  ];

  return (
    <PlaygroundLayout active="all">
      <Stack gap="xl" style={{ maxWidth: "48rem" }}>
        <Stack gap="xs">
          <Text variant="label">Studio Baeks · Design System</Text>
          <Text variant="title">Component Playground</Text>
          <Text variant="caption">27 컴포넌트 · variant · state 전수. 이 페이지가 자동 테스트의 대상이다. 개별 컴포넌트는 사이드바에서 상세로.</Text>
        </Stack>

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
          <Spec label="surface — 면 깊이 4 단 (Box 의 구조 축, 색 아님)">
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
                <Badge color={STATUSES[ACCENTS.indexOf(a)]}>{STATUSES[ACCENTS.indexOf(a)]}</Badge>
              </Inline>
            ))}
          </Spec>
        </Section>

        {/* ── Primitives · Box ──────────────────────────────── */}
        <Section id="sec-box" title="Box · 구조 패널">
          <Spec label="surface + border (카드 헤어라인) · inverse (검은 판)">
            <Box surface="raised" padding="md" radius="md">
              <Text variant="caption" as="span">raised</Text>
            </Box>
            <Box surface="raised" border padding="md" radius="md">
              <Text variant="caption" as="span">raised + border</Text>
            </Box>
            <Box surface="sunken" padding="md" radius="md">
              <Text variant="caption" as="span">sunken</Text>
            </Box>
            <Box inverse surface="canvas" border padding="md" radius="md">
              <Text variant="caption" as="span">inverse</Text>
            </Box>
          </Spec>
        </Section>

        {/* ── Atoms ─────────────────────────────────────────── */}
        <Section id="sec-button" title="Button">
          <Spec label="variant — 시각 무게" testid="spec-button-variants">
            <Button variant="solid" data-testid="btn-solid">solid</Button>
            <Button variant="soft" data-testid="btn-soft">soft</Button>
            <Button variant="outline" data-testid="btn-outline">outline</Button>
            <Button variant="quiet" data-testid="btn-quiet">quiet</Button>
          </Spec>
          <Spec label="color — 의미 색 (variant 와 직교)">
            <Button color="error" data-testid="btn-danger">삭제</Button>
            <Button variant="soft" color="success">완료</Button>
            <Button variant="soft" color="warning">주의</Button>
            <Button variant="quiet" color="error">지우기</Button>
          </Spec>
          <Spec label="solid — 텍스트도 그 색의 톤으로 (모노크로매틱, 버튼 전체가 한 색)">
            <Button color="primary">primary</Button>
            <Button color="info">info</Button>
            <Button color="success">success</Button>
            <Button color="warning">warning</Button>
            <Button color="error">error</Button>
          </Spec>
          <Spec label="size — 크기 3 단 sm·md·lg (fontSize 는 14 고정, lg 만 semibold)" testid="spec-button-sizes">
            <Button size="sm" data-testid="btn-sm">sm</Button>
            <Button size="md" data-testid="btn-md">md</Button>
            <Button size="lg" data-testid="btn-lg">lg</Button>
          </Spec>
          <Spec label="state">
            <Button disabled data-testid="btn-disabled">disabled</Button>
          </Spec>
          <Spec label="loading · iconOnly (정사각, aria-label 필수)">
            <Button loading data-testid="btn-loading">저장 중</Button>
            <Button variant="soft" loading>불러오기</Button>
            <Button iconOnly aria-label="추가" data-testid="btn-icononly">
              <Icon><path d="M12 5v14M5 12h14" /></Icon>
            </Button>
            <Button variant="outline" iconOnly aria-label="닫기">
              <Icon><path d="M6 6l12 12M18 6 6 18" /></Icon>
            </Button>
            <Button color="error" iconOnly aria-label="삭제">
              <Icon><path d="M4 7h16M9 7V5h6v2M6 7l1 12h10l1-12" /></Icon>
            </Button>
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
            <Button variant="outline" shape="pill">알약 outline</Button>
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
              <Field placeholder="검색" leading={<Icon size="sm"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon>} />
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
          <Spec label="Select">
            <Box style={{ width: "12rem" }}>
              <Select data-testid="select" options={[
                { value: "a", label: "옵션 A" },
                { value: "b", label: "옵션 B" },
              ]} />
            </Box>
          </Spec>
          {/* size 정렬 — Field·Select·Button 이 같은 사다리라 나란히 두면 높이가 맞는다 */}
          <Spec label="size md — Field · Select · Button 같은 높이" testid="spec-size-md">
            <Box style={{ width: "10rem" }}><Field size="md" placeholder="Field" aria-label="field md" /></Box>
            <Box style={{ width: "9rem" }}><Select size="md" options={[{ value: "a", label: "Select" }]} /></Box>
            <Button size="md">Button</Button>
          </Spec>
          <Spec label="size lg — 셋이 함께 커진다" testid="spec-size-lg">
            <Box style={{ width: "10rem" }}><Field size="lg" placeholder="Field" aria-label="field lg" /></Box>
            <Box style={{ width: "9rem" }}><Select size="lg" options={[{ value: "a", label: "Select" }]} /></Box>
            <Button size="lg">Button</Button>
          </Spec>
          {/* 공통 base — 넷이 같은 컨트롤 여백을 쓰는가. 높이가 아니라 *글자 시작점* 을 본다:
              Textarea 는 줄 수만큼 자라 높이로는 줄을 못 세우고, Select 는 화살표 때문에
              오른쪽만 넓다. 왼쪽 여백 하나가 넷을 한 세로선에 세운다. */}
          <Spec label="base — 높이·글자는 공유, 가로 여백은 역할로 갈린다 (버튼 13 · 입력류 9)" testid="spec-control-base">
            <Button size="md" data-testid="base-button">Button</Button>
            <Box style={{ width: "9rem" }}><Field size="md" placeholder="Field" aria-label="field base" data-testid="base-field" /></Box>
            <Box style={{ width: "9rem" }}><Select size="md" options={[{ value: "a", label: "Select" }]} data-testid="base-select" /></Box>
            <Box style={{ width: "12rem" }}><Textarea size="md" rows={2} placeholder="Textarea" aria-label="textarea base" data-testid="base-textarea" /></Box>
          </Spec>
          {/* 알약은 컨트롤 어휘 하나다 — Button·Field·Select 가 같은 곡선을 든다. 검색
              한 줄에 셋이 나란히 서는 게 이 어휘가 있는 이유고, 여백은 안 움직인다
              (shape 은 실루엣 축이지 밀도 축이 아니다).
              Textarea 에는 없다 — 알약은 "높이의 절반" 이라 한 줄짜리에서만 성립한다. */}
          <Spec label="shape=pill — 검색 한 줄 (Field · Select · Button 같은 곡선)" testid="spec-pill-row">
            <Box style={{ width: "12rem" }}>
              <Field shape="pill" placeholder="검색" aria-label="검색" data-testid="field-pill"
                leading={<Icon size="sm"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon>} />
            </Box>
            <Box style={{ width: "8rem" }}>
              <Select shape="pill" options={[{ value: "a", label: "전체" }]} data-testid="select-pill" />
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
          <Spec label="TextField (Label + Field + hint/error)">
            <Box style={{ width: "16rem" }}>
              <TextField label="이름" placeholder="입력" hint="공백 없이" data-testid="textfield" />
            </Box>
            <Box style={{ width: "16rem" }}>
              <TextField label="금액" numeric align="end" placeholder="0" error="숫자만 입력하세요" />
            </Box>
          </Spec>
        </Section>

        <Section id="sec-badge" title="Badge · Divider · Link · Icon">
          <Spec label="Badge — status 색 + 중립 (soft)">
            {STATUSES.map((s) => <Badge key={s} color={s} data-testid={`badge-${s}`}>{s}</Badge>)}
            <Badge data-testid="badge-neutral">중립</Badge>
          </Spec>
          <Spec label="Badge — variant (solid·outline·quiet) · dot">
            <Badge color="error" variant="solid">3</Badge>
            <Badge color="success" variant="solid">완료</Badge>
            <Badge color="info" variant="outline">검토</Badge>
            <Badge color="warning" variant="quiet">주의</Badge>
            <Badge color="info" dot>진행</Badge>
            <Badge color="success" dot>정상</Badge>
          </Spec>
          {/* 배지도 컨트롤과 같은 규칙 — 높이만 움직이고 글자는 12 로 고정이다. 예전엔
              11·12·14 로 높이를 따라가서, 작은 배지의 글자가 가독성 하한 아래로 떨어졌다. */}
          <Spec label="Badge — size (높이 20·22·24, 글자는 12 고정)" testid="spec-badge-size">
            <Badge size="sm" color="info" data-testid="badge-sm">sm</Badge>
            <Badge size="md" color="info" data-testid="badge-md">md</Badge>
            <Badge size="lg" color="info" data-testid="badge-lg">lg</Badge>
          </Spec>
          <Spec label="Badge — shape (Button 과 같은 어휘라 나란히 서면 곡선이 맞는다)" testid="spec-badge-shape">
            <Badge color="success" data-testid="badge-shape-default">완료</Badge>
            <Badge color="success" shape="pill" data-testid="badge-shape-pill">완료</Badge>
            <Badge color="error" variant="solid" shape="pill">3</Badge>
            <Badge color="info" dot shape="pill">진행</Badge>
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
        <Section id="sec-mol" title="Card · Tabs · Tooltip">
          <Spec label="Card">
            <Card style={{ width: "16rem" }} data-testid="card">
              <Stack gap="xs">
                <Text variant="subheading">카드 제목</Text>
                <Text variant="caption">흰 면 + 헤어라인으로 정의되는 컨테이너.</Text>
              </Stack>
            </Card>
          </Spec>
          <Spec label="Tabs — shape (트랙·항목이 함께 갈린다. 각진 쪽 안쪽 반경 = 6 − 트랙 여백 3)" testid="spec-tabs-shape">
            <Inline gap="lg" wrap align="center">
              <Box data-testid="tabs-shape-default">
                <Tabs value={tab} onChange={setTab} items={[
                  { value: "one", label: "하나" },
                  { value: "two", label: "둘" },
                  { value: "three", label: "셋" },
                ]} />
              </Box>
              <Box data-testid="tabs-shape-pill">
                <Tabs value={tab} onChange={setTab} shape="pill" items={[
                  { value: "one", label: "하나" },
                  { value: "two", label: "둘" },
                  { value: "three", label: "셋" },
                ]} />
              </Box>
            </Inline>
          </Spec>
          <Spec label="Tooltip (hover)">
            <Tooltip label="툴팁 내용">
              <Button variant="outline" data-testid="tooltip-trigger">hover 해보세요</Button>
            </Tooltip>
          </Spec>
        </Section>

        {/* ── Components ─────────────────────────────────────── */}
        <Section id="sec-feedback" title="Alert · outline">
          {/* Alert 은 Button·Badge 와 같은 color × variant 매트릭스를 문다. 면을 위한
              별도 축을 세우지 않은 건 variant 가 이미 *면의 무게* 축이기 때문이다. */}
          <Spec label="Alert — variant (같은 색, 네 가지 면의 무게)" testid="spec-alert-variant">
            <Inline gap="md" wrap align="start">
              {(["soft", "solid", "outline", "quiet"] as const).map((v) => (
                <Box key={v} style={{ width: "15rem" }} data-testid={`alert-${v}`}>
                  <Alert color="error" variant={v} title="확인이 필요합니다">
                    이 작업은 되돌릴 수 없습니다.
                  </Alert>
                </Box>
              ))}
            </Inline>
          </Spec>
          <Spec label="Alert — color (primary 는 중립 안내)" testid="spec-alert-color">
            <Inline gap="md" wrap align="start">
              {(["primary", "info", "success", "warning", "error"] as const).map((c) => (
                <Box key={c} style={{ width: "11rem" }}>
                  <Alert color={c} title={c} />
                </Box>
              ))}
            </Inline>
          </Spec>
          {/* outline 의 테두리는 wash 괘선(edge)이 아니라 edgeStrong 이다 — 면을 안 칠하는
              변형에서 테두리는 장식이 아니라 형태 그 자체라, 지면 대비 3:1 로 맞춰 뒀다. */}
          <Spec label="outline — 테두리가 곧 형태 (지면 대비 3:1)" testid="spec-outline">
            <Inline gap="sm" wrap align="center">
              <Button variant="outline" data-testid="outline-primary">기본</Button>
              {STATUSES.map((c) => (
                <Button key={c} color={c} variant="outline" data-testid={`outline-${c}`}>{c}</Button>
              ))}
              {STATUSES.map((c) => (
                <Badge key={c} color={c} variant="outline">{c}</Badge>
              ))}
            </Inline>
          </Spec>
        </Section>


        <Section id="sec-comp" title="Table · Modal">
          <Spec label="Table">
            <Box surface="raised" border radius="md" style={{ overflow: "hidden", width: "28rem" }}>
              <Table columns={columns} rows={rows} rowKey={(r) => r.id} />
            </Box>
          </Spec>
          {/* 긴 본문 모달이 따로 있는 이유 — backdrop 이 fixed 라 패널이 뷰포트보다 커지면
              넘친 부분에 닿을 방법이 없다(body 스크롤도 잠겨 있다). 예전엔 700px 화면에서
              패널이 1069px 로 자라 푸터 버튼이 화면 밖으로 나갔다. */}
          <Spec label="Modal (열기 · 긴 본문은 본문만 구른다)">
            <Inline gap="sm">
              <Button onClick={() => setModal(true)} data-testid="modal-open">모달 열기</Button>
              <Button variant="outline" onClick={() => setLongModal(true)} data-testid="modal-open-long">
                긴 본문 열기
              </Button>
            </Inline>
          </Spec>
        </Section>
      </Stack>

      <Modal
        open={modal}
        title="모달 제목"
        onClose={() => setModal(false)}
        footer={
          <>
            <Button variant="quiet" onClick={() => setModal(false)}>취소</Button>
            <Button onClick={() => setModal(false)}>확인</Button>
          </>
        }
      >
        <Text variant="body">떠 있는 것만 그림자를 갖는다. Esc 로 닫힌다.</Text>
      </Modal>

      <Modal
        open={longModal}
        title="긴 본문"
        onClose={() => setLongModal(false)}
        footer={<Button onClick={() => setLongModal(false)} data-testid="long-modal-confirm">확인</Button>}
      >
        <Stack gap="md" data-testid="long-modal-body">
          {Array.from({ length: 24 }, (_, i) => (
            <Text key={i} variant="body">
              {i + 1}. 패널에 높이 상한이 있어 이 본문만 구른다. 제목과 푸터는 붙박이다.
            </Text>
          ))}
        </Stack>
      </Modal>
    </PlaygroundLayout>
  );
};
