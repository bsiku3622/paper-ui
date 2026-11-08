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

export const Overview = () => (
  <Stack gap="3xl">
    <PageHeader
      group="Playground"
      name="Overview"
      description="Paper UI의 토큰과 기반 요소, 개별 컨트롤을 한곳에서 살펴봅니다."
    />

    {/* ── Tokens ─────────────────────────────────────────── */}
    <Section id="sec-type" title="Type scale">
      <Text variant="caption" ink="secondary">숫자는 그려진 글자를 잰 크기 / 줄 · 굵기입니다. · mono 줄은 바로 위 역할에 family=&quot;mono&quot;를 준 모습입니다.</Text>
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
      <Spec label="fill — 면의 깊이 (Surface 의 구조 축, 색 아님)">
        {SURFACE_FILLS.map((s) => (
          <Surface key={s} fill={s} border radius="md" padding="lg" data-testid={`swatch-paper-${s}`}
            minWidth="5rem">
            <Text variant="caption" as="span">{s}</Text>
          </Surface>
        ))}
      </Spec>
      <Spec label="accent — 상태 점(solid) · 잉크 · Badge">
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
    <Section id="sec-surface" title="Surface · 면">
      <Spec label="fill + border (붙은 면의 헤어라인) · inverse (검은 판)">
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
      <Spec label={`radius — 작은 면 ${px(tokens.shape.radius.surface.sm)} · 카드 ${px(tokens.shape.radius.surface.md)} · 큰 면 ${px(tokens.shape.radius.surface.lg)}`} testid="spec-layout-radius">
        <Surface fill="raised" border radius="sm" padding="md" data-testid="radius-small"><Text variant="caption">{px(tokens.shape.radius.surface.sm)} · small</Text></Surface>
        <Surface fill="raised" border radius="md" padding="md" data-testid="radius-card"><Text variant="caption">{px(tokens.shape.radius.surface.md)} · card</Text></Surface>
        <Surface fill="raised" border radius="lg" padding="md" data-testid="radius-large"><Text variant="caption">{px(tokens.shape.radius.surface.lg)} · large</Text></Surface>
      </Spec>
    </Section>

    {/* ── Atoms ─────────────────────────────────────────── */}
    <Stack as="section" gap="lg" id="sec-atoms">
      <SectionHeading
        title="Atoms"
        description="크기가 있는 Atom마다 한 판입니다. 왼쪽은 한 축의 모든 값을 다섯 크기에 맞세운 표이고, 오른쪽은 그 표를 그릴 상태와 나머지 prop입니다. 상태는 포인터나 키보드 없이 미리보기로 그리고, 모든 상태를 펼치면 표가 상태마다 되풀이됩니다."
      />
      <Boards />
    </Stack>

    {/* ── 나란히 서야 보이는 것 ─────────────────────────── */}
    <Section id="sec-together" title="정렬 · 조합">
      {/* 정렬 표본 — Field 와 Button 이 같은 높이/기준선에 앉는가 */}
      <Spec label="정렬 (Field ⇄ Button, 같은 baseline)" testid="spec-align">
        <Box width="16rem">
          <Field placeholder="검색…" aria-label="검색" data-testid="align-field" />
        </Box>
        <Button data-testid="align-button">실행</Button>
      </Spec>
      {/* size 정렬 — Field·Select·Button 이 같은 사다리라 나란히 두면 높이가 맞는다 */}
      {CONTROL_SIZES.map((size) => (
        <Spec key={size} label={`size ${size} — ${SIZE_NAMES[size]} ${px(tokens.shape.control.height[size])} · radius ${px(tokens.shape.radius.control[size])}`} testid={`spec-size-${size}`}>
          <Box width="10rem">
            {size === "sm" ? <Field size={size} defaultValue="11.25" trailing="pt" aria-label={`field ${size}`} /> : <Field size={size} placeholder="Field" aria-label={`field ${size}`} />}
          </Box>
          <Box width="9rem">
            <Select size={size} aria-label={`select ${size}`}><Select.Option value="a">{size === "sm" ? "본명조" : "Select"}</Select.Option></Select>
          </Box>
          <Button size={size}>Button</Button>
        </Spec>
      ))}
      {/* 공통 base — 넷이 같은 컨트롤 여백을 쓰는가. 높이가 아니라 *글자 시작점* 을 본다:
          Textarea 는 줄 수만큼 자라 높이로는 줄을 못 세우고, Select 는 화살표 때문에
          오른쪽만 넓다. 왼쪽 여백 하나가 넷을 한 세로선에 세운다. */}
      <Spec
        label={<>base — radius {px(tokens.shape.radius.control.md)} · 라벨 padding <Computed value={tokens.shape.control.inset.button.md} /> · 값 padding <Computed value={tokens.shape.control.inset.input.md} /></>}
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
      <Spec label="shape=pill — 검색 한 줄 (Field · Select · Button 같은 곡선)" testid="spec-pill-row">
        <Box width="12rem">
          <Field shape="pill" placeholder="검색" aria-label="검색" data-testid="field-pill"
            leading={<SearchIcon size="caption" />} />
        </Box>
        <Box width="8rem">
          <Select shape="pill" data-testid="select-pill"><Select.Option value="a">전체</Select.Option></Select>
        </Box>
        <Button shape="pill" data-testid="button-pill-row">검색</Button>
      </Spec>
      {/* 작은 표식들이 한 줄에 섰을 때 서로 같은 무게로 읽히는지 — 숫자가 같은 것과
          같아 보이는 것은 다르다. 아이콘은 24 아트보드 안에서 여백을 갖고, 스위치는
          폭이 넓어 같은 높이여도 더 크게 읽힌다. */}
      <Spec label="작은 표식 — 한 줄에 세웠을 때 (md)" testid="spec-marks">
        <Inline gap="lg" align="center">
          <Checkbox defaultChecked data-testid="mark-checkbox" />
          {/* 꺼진 상태 — 경계가 유일한 단서인 자리라 비텍스트 대비 계약(3:1, color.md)이 여기 걸린다. tokens/color.test.ts 가 값을, overview.spec 이 이 표식들을 지킨다. */}
          <Checkbox data-testid="mark-checkbox-off" aria-label="꺼진 체크박스" />
          <Radio name="mark" defaultChecked data-testid="mark-radio" />
          <Radio name="mark-off" data-testid="mark-radio-off" aria-label="꺼진 라디오" />
          <Switch defaultChecked data-testid="mark-switch" />
          <InfoIcon aria-label="정보" data-testid="mark-icon" />
          <Spinner data-testid="mark-spinner" />
          <Badge data-testid="mark-badge">배지</Badge>
          <Button size="sm" data-testid="mark-button">버튼</Button>
        </Inline>
      </Spec>
      <Spec label="Field 어도먼트 — 아이콘 · clear · 비밀번호 · prefix/suffix">
        <Box width="12rem">
          <Field placeholder="검색" leading={<SearchIcon size="caption" />} />
        </Box>
        <Box width="12rem">
          <Field defaultValue="지울 값" clearable data-testid="field-clearable" />
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
      <Spec label="Field recessed — sunken surface · leading icon · trailing shortcut">
        <Box width="22rem">
          <Field
            type="search"
            fill="sunken"
            clearable
            placeholder="작업 검색..."
            aria-label="작업 검색"
            leading={<SearchIcon size="body" aria-hidden />}
            trailing={<Surface as="kbd" fill="raised" border radius="sm" paddingX="xs"><Text variant="caption">⌘ K</Text></Surface>}
          />
        </Box>
      </Spec>
      <Spec label="Label · Field — 화면에서 필요한 조합을 구성합니다">
        <Stack gap="xs" width="16rem">
          <Label htmlFor="playground-name">이름</Label>
          <Field id="playground-name" placeholder="입력" data-testid="formfield-field" />
          <Text variant="caption" ink="secondary">공백 없이 입력하세요</Text>
        </Stack>
        <Stack gap="xs" width="16rem">
          <Label htmlFor="playground-amount">금액</Label>
          <Field id="playground-amount" numeric textAlign="end" status="error" placeholder="0" />
          <Text variant="caption" ink="error">숫자만 입력하세요</Text>
        </Stack>
      </Spec>
      <Spec label="fullWidth — 폼 · 모바일에서 가로를 채운다">
        <Box width="20rem">
          <Button fullWidth data-testid="btn-fullwidth">가로 꽉</Button>
        </Box>
      </Spec>
    </Section>

    <Section id="sec-other" title="그 밖의 Atom">
      {/* Divider 는 세로로 세워 표본으로 보인다. 가로 한 줄을 그으면 섹션을 가르는
          선처럼 읽혀, 예제 화면이 줄무늬가 된다 — orientation 과 level 은 상세 페이지에서 전환한다. */}
      <Spec label="Link · Divider · Icon">
        <Link href="#/" data-testid="link">링크</Link>
        <Divider orientation="vertical" />
        <InfoIcon aria-label="정보" data-testid="icon" />
      </Spec>
      <Spec label="Marker">
        <Text variant="body">문장 속 낱말에 <Marker>칠</Marker>을 깝니다</Text>
      </Spec>
    </Section>
  </Stack>
);
