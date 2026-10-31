// Playground overview — the index of specimens. Each section is a handful of live components next to
// the facts they show, and every list in it comes from the vocabulary; a number in a caption is read
// from the tokens the specimen is built on, or the caption names the role instead.

import { Fragment, useState, type ReactNode } from "react";

import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Field,
  Icon,
  IconButton,
  Inline,
  Label,
  Link,
  Radio,
  Select,
  Spinner,
  Stack,
  Surface,
  Switch,
  Text,
  Textarea,
} from "@studio-baeks/paper-ui";
import { ACCENTS, CONTROL_SIZES, STATUSES, SURFACE_FILLS, TEXT_VARIANTS, VARIANTS, tokens, type ControlSize } from "@studio-baeks/paper-ui/tokens";

import { Dot } from "../compositions/Dot";
import { Computed, px } from "./foundations/kit";
import { PlaygroundLayout, ReferenceHeading } from "./shell";

// ── 배치 헬퍼 (paper 프리미티브로만 조립) ──────────────────────────────────

const Section = ({ id, title, children }: { id: string; title: string; children: ReactNode }) => (
  <Stack as="section" gap="lg" id={id}>
    <Text as="h2" variant="label">{title}</Text>
    <Stack gap="md">{children}</Stack>
  </Stack>
);

// 한 표본 = 캡션 + 내용. testid 로 테스트가 집어낸다.
const Spec = ({ label, testid, children }: { label: ReactNode; testid?: string; children: ReactNode }) => (
  <Stack gap="sm" data-testid={testid}>
    <Text variant="caption">{label}</Text>
    <Inline gap="md" wrap align="center">
      {children}
    </Inline>
  </Stack>
);

// family=mono 표본 — 해당 variant 행 바로 밑에 같은 크기 mono 로 깔아 sans 와 비교시킨다.
const MONO_DEMO: Partial<Record<(typeof TEXT_VARIANTS)[number], string>> = {
  title: "paper-ui",
  body: 'const paper = "ui"; // 0123',
};

// What each rung of the control ladder is called beside its measured height.
const SIZE_NAMES: Record<ControlSize, string> = { sm: "compact", md: "default", lg: "roomy" };

export const Overview = () => {
  const [checked, setChecked] = useState(true);

  return (
    <PlaygroundLayout value="overview">
      <Stack gap="xl" style={{ maxWidth: "48rem" }}>
        <ReferenceHeading
          group="REFERENCE"
          name="Playground"
          description="Paper UI의 토큰과 기반 요소, 개별 컨트롤을 한곳에서 살펴봅니다."
        />

        {/* ── Tokens ─────────────────────────────────────────── */}
        <Section id="sec-type" title="Type scale">
          {/* sans 기본. family="mono" 를 주면 어느 variant 에도 등폭이 교차한다 (· mono 행). */}
          <Text variant="caption" ink="secondary">sans 기본 · family=&quot;mono&quot; 는 어느 variant 에도 교차한다 (바로 밑 · mono 행에서 비교).</Text>
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
                      <Text variant="caption" as="span" ink="tertiary">{v} · mono</Text>
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
          <Spec label="fill — 면의 깊이 (Surface 의 구조 축, 색 아님)">
            {SURFACE_FILLS.map((s) => (
              <Surface key={s} fill={s} border radius="md" padding="lg" data-testid={`swatch-paper-${s}`}
                style={{ minWidth: "5rem" }}>
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
        <Section id="sec-button" title="Button">
          <Spec label="variant — 시각 무게" testid="spec-button-variants">
            {VARIANTS.map((variant) => <Button key={variant} variant={variant} data-testid={`btn-${variant}`}>{variant}</Button>)}
          </Spec>
          <Spec label="accent — 의미 색 (variant 와 직교)">
            <Button accent="error" data-testid="btn-danger">삭제</Button>
            <Button variant="soft" accent="success" data-testid="btn-soft-success">완료</Button>
            <Button variant="soft" accent="warning" data-testid="btn-soft-warning">주의</Button>
            <Button variant="ghost" accent="error">지우기</Button>
          </Spec>
          <Spec label="solid — 선명한 채움과 밝은 글자 · primary는 무채색 반전">
            {ACCENTS.map((accent) => <Button key={accent} accent={accent}>{accent}</Button>)}
          </Spec>
          <Spec label={`size — 컨트롤 사다리 ${CONTROL_SIZES.join(" · ")}`} testid="spec-button-sizes">
            {CONTROL_SIZES.map((size) => <Button key={size} size={size} data-testid={`btn-${size}`}>{size}</Button>)}
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
                fill="sunken"
                clearable
                placeholder="작업 검색..."
                aria-label="작업 검색"
                leading={<Icon size="body" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon>}
                trailing={<Surface as="kbd" fill="raised" border radius="sm" paddingX="xs"><Text variant="caption">⌘ K</Text></Surface>}
              />
            </Box>
          </Spec>
          <Spec label="Select">
            <Box style={{ width: "12rem" }}>
              <Select data-testid="select"><Select.Option value="">선택하세요</Select.Option><Select.Option value="a">옵션 A</Select.Option><Select.Option value="b">옵션 B</Select.Option></Select>
            </Box>
          </Spec>
          {/* size 정렬 — Field·Select·Button 이 같은 사다리라 나란히 두면 높이가 맞는다 */}
          {CONTROL_SIZES.map((size) => (
            <Spec key={size} label={`size ${size} — ${SIZE_NAMES[size]} ${px(tokens.shape.control.height[size])}${size === "md" ? ` · radius ${px(tokens.shape.radius.control)}` : ""}`} testid={`spec-size-${size}`}>
              <Box style={{ width: "10rem" }}>
                {size === "sm" ? <Field size={size} defaultValue="11.25" trailing="pt" aria-label={`field ${size}`} /> : <Field size={size} placeholder="Field" aria-label={`field ${size}`} />}
              </Box>
              <Box style={{ width: "9rem" }}>
                <Select size={size} aria-label={`select ${size}`}><Select.Option value="a">{size === "sm" ? "본명조" : "Select"}</Select.Option></Select>
              </Box>
              <Button size={size}>Button</Button>
            </Spec>
          ))}
          {/* 공통 base — 넷이 같은 컨트롤 여백을 쓰는가. 높이가 아니라 *글자 시작점* 을 본다:
              Textarea 는 줄 수만큼 자라 높이로는 줄을 못 세우고, Select 는 화살표 때문에
              오른쪽만 넓다. 왼쪽 여백 하나가 넷을 한 세로선에 세운다. */}
          <Spec
            label={<>base — radius {px(tokens.shape.radius.control)} · 라벨 padding <Computed value={tokens.shape.control.inset.button.md} /> · 값 padding <Computed value={tokens.shape.control.inset.input.md} /></>}
            testid="spec-control-base"
          >
            <Button variant="hairline" size="md" data-testid="base-button">hairline</Button>
            <Box style={{ width: "9rem" }}><Field size="md" placeholder="Field" aria-label="field base" data-testid="base-field" /></Box>
            <Box style={{ width: "9rem" }}><Select size="md" data-testid="base-select"><Select.Option value="a">Select</Select.Option></Select></Box>
            <Box style={{ width: "12rem" }}><Textarea size="md" placeholder="Textarea" aria-label="textarea base" data-testid="base-textarea" /></Box>
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
              {/* 꺼진 상태 — 경계가 유일한 단서인 자리라 비텍스트 대비 계약(3:1, color.md)이 여기 걸린다. tokens/color.test.ts 가 값을, overview.spec 이 이 표식들을 지킨다. */}
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
          <Spec label="Label · Field — 화면에서 필요한 조합을 구성합니다">
            <Stack gap="xs" style={{ width: "16rem" }}>
              <Label htmlFor="playground-name">이름</Label>
              <Field id="playground-name" placeholder="입력" data-testid="formfield-field" />
              <Text variant="caption" ink="secondary">공백 없이 입력하세요</Text>
            </Stack>
            <Stack gap="xs" style={{ width: "16rem" }}>
              <Label htmlFor="playground-amount">금액</Label>
              <Field id="playground-amount" numeric align="end" status="error" placeholder="0" />
              <Text variant="caption" ink="error">숫자만 입력하세요</Text>
            </Stack>
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
          <Spec label="Badge — size (높이만 움직이고 글자는 고정)" testid="spec-badge-size">
            {CONTROL_SIZES.map((size) => <Badge key={size} size={size} accent="info" data-testid={`badge-${size}`}>{size}</Badge>)}
          </Spec>
          <Spec label="Badge — shape (Button 과 같은 어휘라 나란히 서면 곡선이 맞는다)" testid="spec-badge-shape">
            <Badge accent="success" data-testid="badge-shape-default">완료</Badge>
            <Badge accent="success" shape="pill" data-testid="badge-shape-pill">완료</Badge>
            <Badge accent="error" variant="solid" shape="pill">3</Badge>
            <Badge accent="info" dot shape="pill">진행</Badge>
          </Spec>
          {/* Divider 는 세로로 세워 표본으로 보인다. 가로 한 줄을 그으면 섹션을 가르는
              선처럼 읽혀, 예제 화면이 줄무늬가 된다 — orientation 과 level 은 상세 페이지에서 전환한다. */}
          <Spec label="Divider · Link · Icon">
            <Link href="#/" data-testid="link">링크</Link>
            <Divider orientation="vertical" />
            <Icon aria-label="정보" data-testid="icon">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5M12 8h.01" />
            </Icon>
          </Spec>
        </Section>

      </Stack>
    </PlaygroundLayout>
  );
};
