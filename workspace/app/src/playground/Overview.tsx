// Playground overview — the index of specimens. First the tokens, each section a handful of live specimens next to the facts they
// show; then a board for every Atom with a size (Boards.tsx): every value of its main axis against every size, in the state and the
// props its controls choose; then the specimens that only mean something side by side, and the Atoms with no size. Every list comes
// from the vocabulary or the registry; a number in a caption is read from the tokens the specimen is built on, or the caption names
// the role instead.

import { Fragment, useLayoutEffect, useState, type ReactNode } from "react";

import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Field,
  Grid,
  Inline,
  Label,
  Link,
  Marker,
  Radio,
  Select,
  Spinner,
  Stack,
  Surface,
  Switch,
  Text,
  Textarea,
} from "@studio-baeks/paper-ui";
import { CONTROL_SIZES, STATUSES, SURFACE_FILLS, TEXT_VARIANTS, tokens, type ControlSize } from "@studio-baeks/paper-ui/tokens";

import { Dot } from "../compositions/Dot";
import { InfoIcon, SearchIcon } from "../compositions/icons";
import { useWords, type Bilingual } from "../site/locale";
import { PageHeader } from "../site/PageHeader";
import { SectionHeading } from "../site/SectionHeading";
import { Boards } from "./Boards";
import { Computed, px } from "./foundations/kit";

// ── 배치 헬퍼 (paper 프리미티브로만 조립) ──────────────────────────────────

const Section = ({ id, title, children }: { id: string; title: string; children: ReactNode }) => (
  <Stack as="section" gap="lg" id={id}>
    <SectionHeading title={title} />
    <Surface fill="raised" radius="lg" shadow padding="lg" overflowX="auto"><Stack gap="lg">{children}</Stack></Surface>
  </Stack>
);

// 캡션과 표본이 서는 두 칸. 모든 절이 같은 칸을 써서 표본이 세로 한 줄에서 시작한다.
const ROW = { base: "minmax(0, 1fr)", lg: "12rem minmax(0, 1fr)" };

// 한 표본 = 캡션 + 내용. testid 로 테스트가 집어낸다.
const Spec = ({ label, testid, children }: { label: ReactNode; testid?: string; children: ReactNode }) => (
  <Grid columns={ROW} gap="md" align="center" data-testid={testid}>
    <Text variant="caption">{label}</Text>
    <Inline gap="md" wrap align="center">
      {children}
    </Inline>
  </Grid>
);

// What a specimen is drawn at, read off the drawing: size / line · weight, in px. The hero grows with the window, so it is read
// again when the window changes. The numbers are the computed style, so they cannot drift from the role.
const useDrawn = () => {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [drawn, setDrawn] = useState("");
  useLayoutEffect(() => {
    if (!node) return;
    const read = () => {
      const style = getComputedStyle(node);
      setDrawn(`${Math.round(parseFloat(style.fontSize))} / ${Math.round(parseFloat(style.lineHeight))} · ${style.fontWeight}`);
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, [node]);
  return [setNode, drawn] as const;
};

// One row of the scale: the role's name with what it is drawn at under it, beside the specimen. The name sits on the specimen's
// baseline, so the eye reads across.
const TypeRow = ({ variant, family, name, testid, children }: { variant: (typeof TEXT_VARIANTS)[number]; family?: "mono"; name: string; testid: string; children: ReactNode }) => {
  const [ref, drawn] = useDrawn();
  return (
    <Grid columns={ROW} gap="md" align="baseline">
      <Stack gap="xs">
        <Text variant="caption" as="span">{name}</Text>
        <Text variant="caption" family="mono" ink="tertiary" as="span" data-testid={`drawn-${testid}`}>{drawn}</Text>
      </Stack>
      <Text ref={ref} variant={variant} family={family} as="span" truncate data-testid={`text-${testid}`}>
        {children}
      </Text>
    </Grid>
  );
};

// family=mono 표본 — 해당 variant 행 바로 밑에 같은 크기 mono 로 깔아 sans 와 비교시킨다.
const MONO_DEMO: Partial<Record<(typeof TEXT_VARIANTS)[number], string>> = {
  title: "paper-ui",
  body: 'const paper = "ui"; // 0123',
};

// What each rung of the control ladder is called beside its measured height.
const SIZE_NAMES: Record<ControlSize, string> = { xs: "tool", sm: "compact", md: "default", lg: "roomy", xl: "spacious" };

type OverviewWords = {
  description: string;
  typeNote: string;
  fillLabel: string;
  accentLabel: string;
  surfaceTitle: string;
  surfaceLabel: string;
  radiusLabel: (sm: string, md: string, lg: string) => string;
  atomsDescription: string;
  togetherTitle: string;
  alignLabel: string;
  searchPlaceholder: string;
  search: string;
  run: string;
  serif: string;
  baseLabel: string;
  valueLabel: string;
  pillLabel: string;
  all: string;
  marksLabel: string;
  checkboxOff: string;
  radioOff: string;
  info: string;
  badge: string;
  button: string;
  adornmentsLabel: string;
  clearable: string;
  recessedLabel: string;
  taskSearch: string;
  taskSearchLabel: string;
  labelFieldLabel: string;
  name: string;
  input: string;
  noSpaces: string;
  amount: string;
  digitsOnly: string;
  fullWidthLabel: string;
  fullWidth: string;
  otherTitle: string;
  link: string;
  linkLabel: string;
  markerLead: string;
  markerWord: string;
  markerTail: string;
};

const OVERVIEW: Bilingual<OverviewWords> = {
  ko: {
    description: "Paper UI의 토큰과 기반 요소, 개별 컨트롤을 한곳에서 살펴봅니다.",
    typeNote: "숫자는 그려진 글자를 잰 크기 / 줄 · 굵기입니다. · mono 줄은 바로 위 역할에 family=\"mono\"를 준 모습입니다.",
    fillLabel: "fill — 면의 깊이 (Surface 의 구조 축, 색 아님)",
    accentLabel: "accent — 상태 점(solid) · 잉크 · Badge",
    surfaceTitle: "Surface · 면",
    surfaceLabel: "fill + border (붙은 면의 헤어라인) · inverse (검은 판)",
    radiusLabel: (sm, md, lg) => `radius — 작은 면 ${sm} · 카드 ${md} · 큰 면 ${lg}`,
    atomsDescription: "크기가 있는 Atom마다 한 판입니다. 왼쪽은 한 축의 모든 값을 다섯 크기에 맞세운 표이고, 오른쪽은 그 표를 그릴 상태와 나머지 prop입니다. 상태는 포인터나 키보드 없이 미리보기로 그리고, 모든 상태를 펼치면 표가 상태마다 되풀이됩니다.",
    togetherTitle: "정렬 · 조합",
    alignLabel: "정렬 (Field ⇄ Button, 같은 baseline)",
    searchPlaceholder: "검색…",
    search: "검색",
    run: "실행",
    serif: "본명조",
    baseLabel: "라벨 padding",
    valueLabel: "값 padding",
    pillLabel: "shape=pill — 검색 한 줄 (Field · Select · Button 같은 곡선)",
    all: "전체",
    marksLabel: "작은 표식 — 한 줄에 세웠을 때 (md)",
    checkboxOff: "꺼진 체크박스",
    radioOff: "꺼진 라디오",
    info: "정보",
    badge: "배지",
    button: "버튼",
    adornmentsLabel: "Field 어도먼트 — 아이콘 · clear · 비밀번호 · prefix/suffix",
    clearable: "지울 값",
    recessedLabel: "Field recessed — sunken surface · leading icon · trailing shortcut",
    taskSearch: "작업 검색...",
    taskSearchLabel: "작업 검색",
    labelFieldLabel: "Label · Field — 화면에서 필요한 조합을 구성합니다",
    name: "이름",
    input: "입력",
    noSpaces: "공백 없이 입력하세요",
    amount: "금액",
    digitsOnly: "숫자만 입력하세요",
    fullWidthLabel: "fullWidth — 폼 · 모바일에서 가로를 채운다",
    fullWidth: "가로 꽉",
    otherTitle: "그 밖의 Atom",
    link: "링크",
    linkLabel: "Link · Divider · Icon",
    markerLead: "문장 속 낱말에 ",
    markerWord: "칠",
    markerTail: "을 깝니다",
  },
  en: {
    description: "Paper UI's tokens, foundations and individual controls in one place.",
    typeNote: "The numbers are the measured size / line · weight of the drawn text. The mono row is the role just above it with family=\"mono\".",
    fillLabel: "fill — depth of a face (Surface's structural axis, not a color)",
    accentLabel: "accent — status dot (solid) · ink · Badge",
    surfaceTitle: "Surface",
    surfaceLabel: "fill + border (hairline on a flat face) · inverse (the dark slab)",
    radiusLabel: (sm, md, lg) => `radius — small face ${sm} · card ${md} · large face ${lg}`,
    atomsDescription: "One board for every Atom that has a size. On the left, every value of one axis against the five sizes; on the right, the state the table is drawn in and the remaining props. States are drawn by preview, without a pointer or keyboard; spread all states and the table repeats once per state.",
    togetherTitle: "Alignment and combinations",
    alignLabel: "Alignment (Field ⇄ Button, same baseline)",
    searchPlaceholder: "Search…",
    search: "Search",
    run: "Run",
    serif: "Serif",
    baseLabel: "label padding",
    valueLabel: "value padding",
    pillLabel: "shape=pill — one search row (Field · Select · Button, the same curve)",
    all: "All",
    marksLabel: "Small marks — side by side in one row (md)",
    checkboxOff: "Unchecked checkbox",
    radioOff: "Unchecked radio",
    info: "Info",
    badge: "Badge",
    button: "Button",
    adornmentsLabel: "Field adornments — icon · clear · password · prefix/suffix",
    clearable: "Value to clear",
    recessedLabel: "Field recessed — sunken surface · leading icon · trailing shortcut",
    taskSearch: "Search tasks...",
    taskSearchLabel: "Search tasks",
    labelFieldLabel: "Label · Field — compose the combination a screen needs",
    name: "Name",
    input: "Enter",
    noSpaces: "Enter without spaces",
    amount: "Amount",
    digitsOnly: "Enter digits only",
    fullWidthLabel: "fullWidth — fills the row in forms and on mobile",
    fullWidth: "Full width",
    otherTitle: "Other Atoms",
    link: "Link",
    linkLabel: "Link · Divider · Icon",
    markerLead: "Mark a word ",
    markerWord: "like this",
    markerTail: " inside a sentence",
  },
};

const PLAYGROUND = { ko: "플레이그라운드", en: "Playground" } as const;

export const Overview = () => {
  const w = useWords(OVERVIEW);
  return (
  <Stack gap="3xl">
    <PageHeader
      group={useWords(PLAYGROUND)}
      name="Overview"
      description={w.description}
    />

    {/* ── Tokens ─────────────────────────────────────────── */}
    <Section id="sec-type" title="Type scale">
      <Text variant="caption" ink="secondary">{w.typeNote}</Text>
      <Stack gap="md">
        {TEXT_VARIANTS.map((v) => (
          <Fragment key={v}>
            <TypeRow variant={v} name={v} testid={v}>{v === "hero" ? "다람쥐 헌 쳇바퀴" : "다람쥐 헌 쳇바퀴 Aa 0123"}</TypeRow>
            {MONO_DEMO[v] ? <TypeRow variant={v} family="mono" name={`${v} · mono`} testid={`${v}-mono`}>{MONO_DEMO[v]}</TypeRow> : null}
          </Fragment>
        ))}
      </Stack>
    </Section>

    <Section id="sec-color" title="Color">
      <Spec label={w.fillLabel}>
        {SURFACE_FILLS.map((s) => (
          <Surface key={s} fill={s} border radius="md" padding="lg" data-testid={`swatch-paper-${s}`}
            minWidth="5rem">
            <Text variant="caption" as="span">{s}</Text>
          </Surface>
        ))}
      </Spec>
      <Spec label={w.accentLabel}>
        {STATUSES.map((a) => (
          <Inline key={a} gap="sm" align="center">
            <Dot status={a} size="md" data-testid={`dot-${a}`} />
            <Text variant="body" as="span" ink={a} data-testid={`ink-${a}`}>{a}</Text>
            <Badge accent={a}>{a}</Badge>
          </Inline>
        ))}
      </Spec>
    </Section>

    {/* ── Primitives · Surface ───────────────────────────── */}
    <Section id="sec-surface" title={w.surfaceTitle}>
      <Spec label={w.surfaceLabel}>
        <Surface fill="raised" padding="md" radius="md">
          <Text variant="caption" as="span">raised</Text>
        </Surface>
        <Surface fill="raised" border padding="md" radius="md" data-testid="surface-border">
          <Text variant="caption" as="span">raised + border</Text>
        </Surface>
        <Surface fill="sunken" padding="md" radius="md">
          <Text variant="caption" as="span">sunken</Text>
        </Surface>
        <Surface theme="inverse" fill="canvas" border padding="md" radius="md">
          <Text variant="caption" as="span">inverse</Text>
        </Surface>
      </Spec>
      <Spec label={w.radiusLabel(px(tokens.shape.radius.surface.sm), px(tokens.shape.radius.surface.md), px(tokens.shape.radius.surface.lg))} testid="spec-layout-radius">
        <Surface fill="raised" border radius="sm" padding="md" data-testid="radius-small"><Text variant="caption">{px(tokens.shape.radius.surface.sm)} · small</Text></Surface>
        <Surface fill="raised" border radius="md" padding="md" data-testid="radius-card"><Text variant="caption">{px(tokens.shape.radius.surface.md)} · card</Text></Surface>
        <Surface fill="raised" border radius="lg" padding="md" data-testid="radius-large"><Text variant="caption">{px(tokens.shape.radius.surface.lg)} · large</Text></Surface>
      </Spec>
    </Section>

    {/* ── Atoms ─────────────────────────────────────────── */}
    <Stack as="section" gap="lg" id="sec-atoms">
      <SectionHeading
        title="Atoms"
        description={w.atomsDescription}
      />
      <Boards />
    </Stack>

    {/* ── 나란히 서야 보이는 것 ─────────────────────────── */}
    <Section id="sec-together" title={w.togetherTitle}>
      {/* 정렬 표본 — Field 와 Button 이 같은 높이/기준선에 앉는가 */}
      <Spec label={w.alignLabel} testid="spec-align">
        <Box width="16rem">
          <Field placeholder={w.searchPlaceholder} aria-label={w.search} data-testid="align-field" />
        </Box>
        <Button data-testid="align-button">{w.run}</Button>
      </Spec>
      {/* size 정렬 — Field·Select·Button 이 같은 사다리라 나란히 두면 높이가 맞는다 */}
      {CONTROL_SIZES.map((size) => (
        <Spec key={size} label={`size ${size} — ${SIZE_NAMES[size]} ${px(tokens.shape.control.height[size])} · radius ${px(tokens.shape.radius.control[size])}`} testid={`spec-size-${size}`}>
          <Box width="10rem">
            {size === "sm" ? <Field size={size} defaultValue="11.25" trailing="pt" aria-label={`field ${size}`} /> : <Field size={size} placeholder="Field" aria-label={`field ${size}`} />}
          </Box>
          <Box width="9rem">
            <Select size={size} aria-label={`select ${size}`}><Select.Option value="a">{size === "sm" ? w.serif : "Select"}</Select.Option></Select>
          </Box>
          <Button size={size}>Button</Button>
        </Spec>
      ))}
      {/* 공통 base — 넷이 같은 컨트롤 여백을 쓰는가. 높이가 아니라 *글자 시작점* 을 본다:
          Textarea 는 줄 수만큼 자라 높이로는 줄을 못 세우고, Select 는 화살표 때문에
          오른쪽만 넓다. 왼쪽 여백 하나가 넷을 한 세로선에 세운다. */}
      <Spec
        label={<>base — radius {px(tokens.shape.radius.control.md)} · {w.baseLabel} <Computed value={tokens.shape.control.inset.button.md} /> · {w.valueLabel} <Computed value={tokens.shape.control.inset.input.md} /></>}
        testid="spec-control-base"
      >
        <Button variant="hairline" size="md" shape="rounded" data-testid="base-button">hairline</Button>
        <Box width="9rem"><Field size="md" placeholder="Field" aria-label="field base" data-testid="base-field" /></Box>
        <Box width="9rem"><Select size="md" data-testid="base-select"><Select.Option value="a">Select</Select.Option></Select></Box>
        <Box width="12rem"><Textarea size="md" placeholder="Textarea" aria-label="textarea base" data-testid="base-textarea" /></Box>
      </Spec>
      {/* 알약은 컨트롤 어휘 하나다 — Button·Field·Select 가 같은 곡선을 든다. 검색
          한 줄에 셋이 나란히 서는 게 이 어휘가 있는 이유고, 여백은 안 움직인다
          (shape 은 실루엣 축이지 밀도 축이 아니다).
          Textarea 에는 없다 — 알약은 "높이의 절반" 이라 한 줄짜리에서만 성립한다. */}
      <Spec label={w.pillLabel} testid="spec-pill-row">
        <Box width="12rem">
          <Field shape="pill" placeholder={w.search} aria-label={w.search} data-testid="field-pill"
            leading={<SearchIcon size="caption" />} />
        </Box>
        <Box width="8rem">
          <Select shape="pill" data-testid="select-pill"><Select.Option value="a">{w.all}</Select.Option></Select>
        </Box>
        <Button shape="pill" data-testid="button-pill-row">{w.search}</Button>
      </Spec>
      {/* 작은 표식들이 한 줄에 섰을 때 서로 같은 무게로 읽히는지 — 숫자가 같은 것과
          같아 보이는 것은 다르다. 아이콘은 24 아트보드 안에서 여백을 갖고, 스위치는
          폭이 넓어 같은 높이여도 더 크게 읽힌다. */}
      <Spec label={w.marksLabel} testid="spec-marks">
        <Inline gap="lg" align="center">
          <Checkbox defaultChecked data-testid="mark-checkbox" />
          {/* 꺼진 상태 — 경계가 유일한 단서인 자리라 비텍스트 대비 계약(3:1, color.md)이 여기 걸린다. tokens/color.test.ts 가 값을, overview.spec 이 이 표식들을 지킨다. */}
          <Checkbox data-testid="mark-checkbox-off" aria-label={w.checkboxOff} />
          <Radio name="mark" defaultChecked data-testid="mark-radio" />
          <Radio name="mark-off" data-testid="mark-radio-off" aria-label={w.radioOff} />
          <Switch defaultChecked data-testid="mark-switch" />
          <InfoIcon aria-label={w.info} data-testid="mark-icon" />
          <Spinner data-testid="mark-spinner" />
          <Badge data-testid="mark-badge">{w.badge}</Badge>
          <Button size="sm" data-testid="mark-button">{w.button}</Button>
        </Inline>
      </Spec>
      <Spec label={w.adornmentsLabel}>
        <Box width="12rem">
          <Field placeholder={w.search} leading={<SearchIcon size="caption" />} />
        </Box>
        <Box width="12rem">
          <Field defaultValue={w.clearable} clearable data-testid="field-clearable" />
        </Box>
        <Box width="12rem">
          <Field type="password" showPasswordToggle defaultValue="secret" data-testid="field-password" />
        </Box>
        <Box width="9rem">
          <Field numeric textAlign="end" placeholder="0" leading="$" />
        </Box>
        <Box width="9rem">
          <Field numeric textAlign="end" placeholder="0" trailing="kg" />
        </Box>
      </Spec>
      <Spec label={w.recessedLabel}>
        <Box width="22rem">
          <Field
            type="search"
            fill="sunken"
            clearable
            placeholder={w.taskSearch}
            aria-label={w.taskSearchLabel}
            leading={<SearchIcon size="body" aria-hidden />}
            trailing={<Surface as="kbd" fill="raised" border radius="sm" paddingX="xs"><Text variant="caption">⌘ K</Text></Surface>}
          />
        </Box>
      </Spec>
      <Spec label={w.labelFieldLabel}>
        <Stack gap="xs" width="16rem">
          <Label htmlFor="playground-name">{w.name}</Label>
          <Field id="playground-name" placeholder={w.input} data-testid="formfield-field" />
          <Text variant="caption" ink="secondary">{w.noSpaces}</Text>
        </Stack>
        <Stack gap="xs" width="16rem">
          <Label htmlFor="playground-amount">{w.amount}</Label>
          <Field id="playground-amount" numeric textAlign="end" status="error" placeholder="0" />
          <Text variant="caption" ink="error">{w.digitsOnly}</Text>
        </Stack>
      </Spec>
      <Spec label={w.fullWidthLabel}>
        <Box width="20rem">
          <Button fullWidth data-testid="btn-fullwidth">{w.fullWidth}</Button>
        </Box>
      </Spec>
    </Section>

    <Section id="sec-other" title={w.otherTitle}>
      {/* Divider 는 세로로 세워 표본으로 보인다. 가로 한 줄을 그으면 섹션을 가르는
          선처럼 읽혀, 예제 화면이 줄무늬가 된다 — orientation 과 level 은 상세 페이지에서 전환한다. */}
      <Spec label={w.linkLabel}>
        <Link href="#/" data-testid="link">{w.link}</Link>
        <Divider orientation="vertical" />
        <InfoIcon aria-label={w.info} data-testid="icon" />
      </Spec>
      <Spec label="Marker">
        <Text variant="body">{w.markerLead}<Marker>{w.markerWord}</Marker>{w.markerTail}</Text>
      </Spec>
    </Section>
  </Stack>
  );
};
