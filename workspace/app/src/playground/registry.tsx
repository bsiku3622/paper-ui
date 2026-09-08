// 컴포넌트 상세 registry — prop 토글로 살아 있는 미리보기와 코드가 함께 움직인다.
//
// 한 컴포넌트를 데이터로 기술한다: 어떤 prop 을 만질 수 있고(controls), 지금 상태로
// 무엇을 그리며(render), 그 상태의 코드가 무엇인지(code). Detail 페이지는 이 셋을
// 읽어 preview·controls·code 세 판을 세운다. render 와 code 가 같은 상태를 보므로
// 화면과 코드가 어긋날 수 없다.

import { useState, type ReactNode } from "react";

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
  Label,
  Link,
  Modal,
  Navbar,
  Banner,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  TextField,
  Textarea,
  Switch,
  Radio,
  RadioGroup,
  Spinner,
  Alert,
  Tooltip,
  tokens,
  type Column,
  type Surface,
  type Color,
  type Variant,
  type Accent,
  type Ink,
  type StatusName,
  type TextVariant,
} from "@studio-baeks/paper-ui";

// ── 컨트롤 ───────────────────────────────────────────────────────────────────
export type Control =
  | { kind: "bool"; prop: string; label: string; def: boolean }
  | { kind: "enum"; prop: string; label: string; options: string[]; def: string }
  | { kind: "text"; prop: string; label: string; def: string };

export type State = Record<string, string | boolean>;

export type CompSpec = {
  slug: string;
  name: string;
  group: "Primitives" | "Atoms" | "Molecules" | "Components";
  blurb: string;
  controls: Control[];
  render: (s: State) => ReactNode;
  code: (s: State) => string;
};

// ── 코드 문자열 헬퍼 ─────────────────────────────────────────────────────────
// prop 을 JSX 속성으로. boolean 은 true 일 때만, 문자열은 값이 있을 때만 적는다.
const A = (k: string, v: string | boolean | undefined): string => {
  if (v === undefined || v === "" || v === false) return "";
  if (v === true) return ` ${k}`;
  return ` ${k}="${v}"`;
};
// enum 은 기본값이면 생략(코드를 조용하게).
const AE = (k: string, v: string, def: string): string => (v === def ? "" : ` ${k}="${v}"`);

const s = (v: string | boolean | undefined): string => (v === undefined ? "" : String(v));
const b = (v: string | boolean | undefined): boolean => v === true || v === "true";

// ── registry ────────────────────────────────────────────────────────────────
export const COMPONENTS: CompSpec[] = [
  // ─ Primitives ─
  {
    slug: "text",
    name: "Text",
    group: "Primitives",
    blurb: "일곱 variant 로 위계를 정한다. variant 가 크기·굵기·잉크를, family 가 서체(sans·mono)를 정한다.",
    controls: [
      { kind: "enum", prop: "variant", label: "variant", options: ["display", "title", "heading", "subheading", "body", "caption", "label"], def: "body" },
      { kind: "enum", prop: "family", label: "family", options: ["sans", "mono"], def: "sans" },
      { kind: "enum", prop: "ink", label: "ink", options: ["default", "base", "soft", "faint", "info", "success", "warning", "error"], def: "default" },
      { kind: "text", prop: "children", label: "children", def: "다람쥐 헌 쳇바퀴 Aa 0123" },
    ],
    render: (st) => (
      <Text
        variant={s(st.variant) as TextVariant}
        family={(s(st.family) || "sans") as "sans" | "mono"}
        ink={st.ink === "default" ? undefined : (s(st.ink) as Ink)}
      >
        {s(st.children)}
      </Text>
    ),
    code: (st) =>
      `<Text${AE("variant", s(st.variant), "body")}${AE("family", s(st.family) || "sans", "sans")}${st.ink === "default" ? "" : A("ink", s(st.ink))}>${s(st.children)}</Text>`,
  },
  {
    slug: "box",
    name: "Box",
    group: "Primitives",
    blurb: "구조 패널. surface(면 깊이)에 border(카드 헤어라인)·radius·shadow·padding 을 얹는다. 넷 다 안 주는 게 기본이라(none) 아무것도 안 준 Box 는 투명한 각진 칸이다. 색(잉크)은 여기 없다 — 큰 면은 색으로 안 채운다. 검은 판은 inverse. 간격 축은 padding 말고 paddingX·paddingY·gap 도 같은 사다리로 받는다. as 로 어떤 태그든.",
    controls: [
      { kind: "enum", prop: "surface", label: "surface", options: ["none", "raised", "canvas", "sunken", "well"], def: "raised" },
      { kind: "bool", prop: "border", label: "border", def: false },
      { kind: "bool", prop: "inverse", label: "inverse", def: false },
      { kind: "enum", prop: "shadow", label: "shadow", options: ["none", "overlay", "overlayMinimal"], def: "none" },
      { kind: "enum", prop: "radius", label: "radius", options: ["none", "sm", "md", "lg", "full"], def: "md" },
      { kind: "enum", prop: "padding", label: "padding", options: ["none", "sm", "md", "lg", "xl"], def: "lg" },
    ],
    render: (st) => (
      <Box
        surface={s(st.surface) === "none" ? undefined : (s(st.surface) as Surface)}
        border={b(st.border)}
        inverse={b(st.inverse)}
        shadow={s(st.shadow) === "none" ? undefined : (s(st.shadow) as "overlay" | "overlayMinimal")}
        radius={s(st.radius) === "none" ? undefined : (s(st.radius) as "sm" | "md" | "lg" | "full")}
        padding={s(st.padding) === "none" ? undefined : (s(st.padding) as "sm" | "md" | "lg" | "xl")}
        style={{ minWidth: "8rem" }}
      >
        <Text variant="caption" as="span">surface={s(st.surface)}</Text>
      </Box>
    ),
    code: (st) => `<Box${st.surface === "none" ? "" : A("surface", s(st.surface))}${A("border", b(st.border))}${A("inverse", b(st.inverse))}${AE("shadow", s(st.shadow), "none")}${AE("radius", s(st.radius), "none")}${AE("padding", s(st.padding), "none")}>…</Box>`,
  },
  {
    slug: "stack",
    name: "Stack",
    group: "Primitives",
    blurb: "세로로 쌓는다. gap 으로 사이 간격을, align 으로 가로 정렬을 정한다.",
    controls: [
      { kind: "enum", prop: "gap", label: "gap", options: ["xs", "sm", "md", "lg", "xl"], def: "md" },
      { kind: "enum", prop: "align", label: "align", options: ["stretch", "start", "center", "end"], def: "stretch" },
    ],
    render: (st) => (
      <Stack gap={s(st.gap) as "xs" | "sm" | "md" | "lg" | "xl"} align={s(st.align) as "start" | "center" | "end" | "stretch"} style={{ width: "12rem" }}>
        {["하나", "둘", "셋"].map((t) => (
          <Box key={t} surface="well" radius="sm" padding="sm">
            <Text variant="caption" as="span">{t}</Text>
          </Box>
        ))}
      </Stack>
    ),
    code: (st) => `<Stack gap="${s(st.gap)}"${AE("align", s(st.align), "stretch")}>\n  <Box>…</Box>\n  <Box>…</Box>\n</Stack>`,
  },
  {
    slug: "inline",
    name: "Inline",
    group: "Primitives",
    blurb: "가로로 늘어놓는다. gap · justify · align · wrap 으로 한 줄 배치를 정한다.",
    controls: [
      { kind: "enum", prop: "gap", label: "gap", options: ["xs", "sm", "md", "lg", "xl"], def: "sm" },
      { kind: "enum", prop: "align", label: "align", options: ["center", "start", "end", "baseline"], def: "center" },
      { kind: "enum", prop: "justify", label: "justify", options: ["start", "center", "end", "between"], def: "start" },
      { kind: "bool", prop: "wrap", label: "wrap", def: false },
    ],
    render: (st) => (
      <Inline gap={s(st.gap) as "xs" | "sm" | "md" | "lg" | "xl"} align={s(st.align) as "start" | "center" | "end" | "baseline"} justify={s(st.justify) as "start" | "center" | "end" | "between"} wrap={b(st.wrap)} style={{ width: "18rem", height: "4rem" }}>
        {["A", "B", "C"].map((t) => (
          <Box key={t} surface="well" radius="sm" padding="sm">
            <Text variant="caption" as="span">{t}</Text>
          </Box>
        ))}
      </Inline>
    ),
    code: (st) => `<Inline gap="${s(st.gap)}"${AE("align", s(st.align), "center")}${AE("justify", s(st.justify), "start")}${A("wrap", b(st.wrap))}>\n  …\n</Inline>`,
  },

  // ─ Atoms ─
  {
    slug: "button",
    name: "Button",
    group: "Atoms",
    blurb: "두 축이 직교한다 — color(primary·의미 4색) × variant(solid·soft·outline·quiet, 시각 무게). 큰 면을 채우는 건 검정(primary)뿐, 색은 뜻을 질 때만. radius=\"full\" 은 알약 — 화면에서 가장 중요한 행동 한둘에만.",
    controls: [
      { kind: "enum", prop: "color", label: "color", options: ["primary", "info", "success", "warning", "error"], def: "primary" },
      { kind: "enum", prop: "variant", label: "variant", options: ["solid", "soft", "outline", "quiet"], def: "solid" },
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
      { kind: "bool", prop: "loading", label: "loading", def: false },
      { kind: "bool", prop: "fullWidth", label: "fullWidth", def: false },
      { kind: "bool", prop: "iconOnly", label: "iconOnly(aria-label 필수)", def: false },
      { kind: "enum", prop: "radius", label: "radius", options: ["default", "full"], def: "default" },
      { kind: "bool", prop: "disabled", label: "disabled", def: false },
      { kind: "text", prop: "children", label: "children", def: "버튼" },
    ],
    render: (st) => {
      // iconOnly 는 접근 이름이 타입으로 강제된다 — 라벨 대신 aria-label 을 진다.
      const common = {
        color: s(st.color) as Color,
        variant: s(st.variant) as Variant,
        size: s(st.size) as "sm" | "md" | "lg",
        loading: b(st.loading),
        fullWidth: b(st.fullWidth),
        radius: s(st.radius) === "full" ? ("full" as const) : undefined,
        disabled: b(st.disabled),
      };
      return b(st.iconOnly) ? (
        <Button {...common} iconOnly aria-label={s(st.children) || "추가"}>
          <Icon><path d="M12 5v14M5 12h14" /></Icon>
        </Button>
      ) : (
        <Button {...common}>{s(st.children)}</Button>
      );
    },
    code: (st) =>
      `<Button${AE("color", s(st.color), "primary")}${AE("variant", s(st.variant), "solid")}${AE("size", s(st.size), "md")}${A("loading", b(st.loading))}${A("fullWidth", b(st.fullWidth))}${AE("radius", s(st.radius), "default")}${A("disabled", b(st.disabled))}${b(st.iconOnly) ? ` iconOnly aria-label="${s(st.children) || "추가"}"><Icon>…</Icon>` : `>${s(st.children)}`}</Button>`,
  },
  {
    slug: "badge",
    name: "Badge",
    group: "Atoms",
    blurb: "상태 한 낱말. color × variant(soft·solid·outline·quiet). dot 으로 앞에 상태 점. 표시용이라 hover 없음. radius=\"full\" 이면 알약.",
    controls: [
      { kind: "enum", prop: "color", label: "color", options: ["primary", "info", "success", "warning", "error"], def: "primary" },
      { kind: "enum", prop: "variant", label: "variant", options: ["soft", "solid", "outline", "quiet"], def: "soft" },
      { kind: "bool", prop: "dot", label: "dot", def: false },
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
      { kind: "enum", prop: "radius", label: "radius", options: ["default", "full"], def: "default" },
      { kind: "text", prop: "children", label: "children", def: "진행" },
    ],
    render: (st) => (
      <Badge color={s(st.color) as Color} variant={s(st.variant) as Variant} dot={b(st.dot)} size={s(st.size) as "sm" | "md" | "lg"} radius={s(st.radius) === "full" ? "full" : undefined}>{s(st.children)}</Badge>
    ),
    code: (st) => `<Badge${AE("color", s(st.color), "primary")}${AE("variant", s(st.variant), "soft")}${A("dot", b(st.dot))}${AE("size", s(st.size), "md")}${AE("radius", s(st.radius), "default")}>${s(st.children)}</Badge>`,
  },
  {
    slug: "field",
    name: "Field",
    group: "Atoms",
    blurb: "input group — leading/trailing 어도먼트(아이콘·$·단위) + clear(×) + 비밀번호 보기. 래퍼가 테두리·포커스링·상태를 진다.",
    controls: [
      { kind: "text", prop: "placeholder", label: "placeholder", def: "검색…" },
      { kind: "enum", prop: "type", label: "type", options: ["text", "password"], def: "text" },
      { kind: "bool", prop: "leading", label: "leading(검색 아이콘)", def: false },
      { kind: "bool", prop: "trailing", label: "trailing(단위 kg)", def: false },
      { kind: "bool", prop: "clearable", label: "clearable", def: false },
      { kind: "bool", prop: "showPasswordToggle", label: "showPasswordToggle", def: false },
      { kind: "enum", prop: "align", label: "align", options: ["start", "center", "end"], def: "start" },
      { kind: "enum", prop: "status", label: "status", options: ["default", "info", "success", "warning", "error"], def: "default" },
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
      { kind: "bool", prop: "disabled", label: "disabled", def: false },
      { kind: "bool", prop: "numeric", label: "numeric", def: false },
    ],
    render: (st) => (
      <Box style={{ width: "18rem" }}>
        <Field
          placeholder={s(st.placeholder)}
          type={s(st.type)}
          leading={b(st.leading) ? <Icon size="sm"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon> : undefined}
          trailing={b(st.trailing) ? <Text variant="caption" as="span" ink="faint">kg</Text> : undefined}
          clearable={b(st.clearable)}
          showPasswordToggle={b(st.showPasswordToggle)}
          defaultValue={b(st.clearable) ? "지울 값" : undefined}
          align={s(st.align) as "start" | "center" | "end"}
          status={s(st.status) as "default" | StatusName}
          size={s(st.size) as "sm" | "md" | "lg"}
          disabled={b(st.disabled)}
          numeric={b(st.numeric)}
        />
      </Box>
    ),
    code: (st) =>
      `<Field${A("placeholder", s(st.placeholder))}${AE("type", s(st.type), "text")}${b(st.leading) ? " leading={<Icon>…</Icon>}" : ""}${b(st.trailing) ? ' trailing={<Text ink="faint">kg</Text>}' : ""}${A("clearable", b(st.clearable))}${A("showPasswordToggle", b(st.showPasswordToggle))}${AE("align", s(st.align), "start")}${AE("status", s(st.status), "default")}${AE("size", s(st.size), "md")}${A("disabled", b(st.disabled))}${A("numeric", b(st.numeric))} />`,
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    group: "Atoms",
    blurb: "켜고 끄는 네모. 라벨과 나란히 두면 통째로 누를 수 있다.",
    controls: [
      { kind: "bool", prop: "checked", label: "checked", def: true },
      { kind: "bool", prop: "indeterminate", label: "indeterminate", def: false },
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
      { kind: "bool", prop: "disabled", label: "disabled", def: false },
      { kind: "text", prop: "label", label: "label", def: "동의합니다" },
    ],
    render: (st) => (
      <Inline as="label" gap="sm" align="center">
        <Checkbox checked={b(st.checked)} indeterminate={b(st.indeterminate)} size={s(st.size) as "sm" | "md" | "lg"} disabled={b(st.disabled)} readOnly />
        <Text variant="body" as="span">{s(st.label)}</Text>
      </Inline>
    ),
    code: (st) =>
      `<Inline as="label" gap="sm" align="center">\n  <Checkbox checked={${b(st.checked)}}${A("indeterminate", b(st.indeterminate))}${AE("size", s(st.size), "md")}${A("disabled", b(st.disabled))} />\n  <Text variant="body" as="span">${s(st.label)}</Text>\n</Inline>`,
  },
  {
    slug: "link",
    name: "Link",
    group: "Atoms",
    blurb: "파란 글자. 포인트 색을 쓰는 몇 안 되는 자리 중 하나.",
    controls: [{ kind: "text", prop: "children", label: "children", def: "링크" }],
    render: (st) => <Link href="#/" onClick={(e) => e.preventDefault()}>{s(st.children)}</Link>,
    code: (st) => `<Link href="/path">${s(st.children)}</Link>`,
  },
  {
    slug: "label",
    name: "Label",
    group: "Atoms",
    blurb: "폼 라벨. sentence-case medium — mono·uppercase 아님.",
    controls: [{ kind: "text", prop: "children", label: "children", def: "이메일" }],
    render: (st) => <Label>{s(st.children)}</Label>,
    code: (st) => `<Label>${s(st.children)}</Label>`,
  },
  {
    slug: "select",
    name: "Select",
    group: "Atoms",
    blurb: "native select 를 종이 결로 감싼 것. options 를 data 로 받는다.",
    controls: [
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
      { kind: "bool", prop: "disabled", label: "disabled", def: false },
    ],
    render: (st) => (
      <Box style={{ width: "12rem" }}>
        <Select
          size={s(st.size) as "sm" | "md" | "lg"}
          disabled={b(st.disabled)}
          options={[
            { value: "a", label: "옵션 A" },
            { value: "b", label: "옵션 B" },
            { value: "c", label: "옵션 C" },
          ]}
        />
      </Box>
    ),
    code: (st) =>
      `<Select${AE("size", s(st.size), "md")}${A("disabled", b(st.disabled))}\n  options={[\n    { value: "a", label: "옵션 A" },\n    { value: "b", label: "옵션 B" },\n  ]}\n/>`,
  },
  {
    slug: "icon",
    name: "Icon",
    group: "Atoms",
    blurb: "24 그리드 stroke 아이콘. 자식 svg path 를 감싸 currentColor 로 그린다. ink 로 자기 색을 정한다(Text 로 감쌀 필요 없이).",
    controls: [
      { kind: "enum", prop: "ink", label: "ink", options: ["default", "base", "soft", "faint", "info", "success", "warning", "error"], def: "default" },
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
    ],
    render: (st) => (
      <Icon aria-label="정보" ink={st.ink === "default" ? undefined : (s(st.ink) as Ink)} size={s(st.size) as "sm" | "md" | "lg"}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </Icon>
    ),
    code: (st) => `<Icon aria-label="정보"${AE("ink", s(st.ink), "default")}${AE("size", s(st.size), "md")}>\n  <circle cx="12" cy="12" r="9" />\n  <path d="M12 11v5M12 8h.01" />\n</Icon>`,
  },
  {
    slug: "divider",
    name: "Divider",
    group: "Atoms",
    blurb: "아주 옅은 괘선. axis 로 가로·세로, weight 로 굵기. 선이 꼭 필요한 자리에만.",
    controls: [
      { kind: "enum", prop: "axis", label: "axis", options: ["horizontal", "vertical"], def: "horizontal" },
      { kind: "enum", prop: "weight", label: "weight", options: ["base", "strong"], def: "base" },
    ],
    render: (st) => {
      const weight = s(st.weight) as "base" | "strong";
      return s(st.axis) === "vertical" ? (
        <Inline gap="md" align="center" style={{ height: "3rem" }}>
          <Text variant="body" as="span">왼</Text>
          <Divider axis="vertical" weight={weight} />
          <Text variant="body" as="span">오</Text>
        </Inline>
      ) : (
        <Box style={{ width: "18rem" }}>
          <Stack gap="md">
            <Text variant="body" as="span">위</Text>
            <Divider weight={weight} />
            <Text variant="body" as="span">아래</Text>
          </Stack>
        </Box>
      );
    },
    code: (st) => `<Divider${AE("axis", s(st.axis), "horizontal")}${AE("weight", s(st.weight), "base")} />`,
  },
  {
    slug: "textarea",
    name: "Textarea",
    group: "Atoms",
    blurb: "여러 줄 입력. Field 와 같은 status 축, 세로로만 resize.",
    controls: [
      { kind: "text", prop: "placeholder", label: "placeholder", def: "여러 줄 입력…" },
      { kind: "enum", prop: "status", label: "status", options: ["default", "info", "success", "warning", "error"], def: "default" },
      { kind: "bool", prop: "disabled", label: "disabled", def: false },
    ],
    render: (st) => (
      <Box style={{ width: "18rem" }}>
        <Textarea placeholder={s(st.placeholder)} status={s(st.status) as "default" | StatusName} disabled={b(st.disabled)} rows={3} />
      </Box>
    ),
    code: (st) =>
      `<Textarea${A("placeholder", s(st.placeholder))}${AE("status", s(st.status), "default")}${A("disabled", b(st.disabled))} />`,
  },
  {
    slug: "switch",
    name: "Switch",
    group: "Atoms",
    blurb: "켬/끔 토글. 즉시 적용되는 설정 자리. 켜지면 검정 트랙(색이 아니라 primary).",
    controls: [
      { kind: "bool", prop: "checked", label: "checked", def: true },
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
      { kind: "bool", prop: "disabled", label: "disabled", def: false },
      { kind: "text", prop: "label", label: "label", def: "알림 받기" },
    ],
    render: (st) => (
      <Inline as="label" gap="sm" align="center">
        <Switch checked={b(st.checked)} size={s(st.size) as "sm" | "md" | "lg"} disabled={b(st.disabled)} readOnly />
        <Text variant="body" as="span">{s(st.label)}</Text>
      </Inline>
    ),
    code: (st) =>
      `<Inline as="label" gap="sm" align="center">\n  <Switch checked={${b(st.checked)}}${AE("size", s(st.size), "md")}${A("disabled", b(st.disabled))} />\n  <Text variant="body" as="span">${s(st.label)}</Text>\n</Inline>`,
  },
  {
    slug: "radio",
    name: "Radio",
    group: "Atoms",
    blurb: "여럿 중 하나. 보통 RadioGroup 이 묶지만 단독 원자로도 쓴다.",
    controls: [
      { kind: "bool", prop: "checked", label: "checked", def: true },
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
      { kind: "bool", prop: "disabled", label: "disabled", def: false },
      { kind: "text", prop: "label", label: "label", def: "옵션" },
    ],
    render: (st) => (
      <Inline as="label" gap="sm" align="center">
        <Radio checked={b(st.checked)} size={s(st.size) as "sm" | "md" | "lg"} disabled={b(st.disabled)} readOnly />
        <Text variant="body" as="span">{s(st.label)}</Text>
      </Inline>
    ),
    code: (st) =>
      `<Inline as="label" gap="sm" align="center">\n  <Radio checked={${b(st.checked)}}${AE("size", s(st.size), "md")}${A("disabled", b(st.disabled))} />\n  <Text variant="body" as="span">${s(st.label)}</Text>\n</Inline>`,
  },
  {
    slug: "spinner",
    name: "Spinner",
    group: "Atoms",
    blurb: "진행 중 표시. 옅은 링에 한 조각만 진해 회전으로 읽힌다. 주기는 motion 토큰.",
    controls: [
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
    ],
    render: (st) => <Spinner size={s(st.size) as "sm" | "md" | "lg"} />,
    code: (st) => `<Spinner${AE("size", s(st.size), "md")} />`,
  },

  // ─ Molecules ─
  {
    slug: "textfield",
    name: "TextField",
    group: "Molecules",
    blurb: "Label + Field + 도움말 한 묶음. id 연결을 대신한다.",
    controls: [
      { kind: "text", prop: "label", label: "label", def: "이름" },
      { kind: "text", prop: "placeholder", label: "placeholder", def: "입력" },
      { kind: "text", prop: "hint", label: "hint", def: "공백 없이" },
      { kind: "text", prop: "error", label: "error", def: "" },
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
      { kind: "enum", prop: "status", label: "status", options: ["default", "info", "success", "warning", "error"], def: "default" },
      { kind: "bool", prop: "numeric", label: "numeric", def: false },
      { kind: "bool", prop: "disabled", label: "disabled", def: false },
    ],
    render: (st) => (
      <Box style={{ width: "18rem" }}>
        <TextField label={s(st.label)} placeholder={s(st.placeholder)} hint={s(st.hint) || undefined} error={s(st.error) || undefined} size={s(st.size) as "sm" | "md" | "lg"} status={s(st.status) as "default" | StatusName} numeric={b(st.numeric)} disabled={b(st.disabled)} />
      </Box>
    ),
    code: (st) =>
      `<TextField${A("label", s(st.label))}${A("placeholder", s(st.placeholder))}${A("hint", s(st.hint))}${A("error", s(st.error))}${AE("size", s(st.size), "md")}${AE("status", s(st.status), "default")}${A("numeric", b(st.numeric))}${A("disabled", b(st.disabled))} />`,
  },
  {
    slug: "card",
    name: "Card",
    group: "Molecules",
    blurb: "흰 면 + 헤어라인으로 정의되는 칸. 회색으로 감싸지 않고 그림자로 뜨지도 않는다 — 회색은 카드를 받치는 바닥에만 온다. padding=\"none\" 은 자기 여백을 스스로 갖는 것(Table 등)을 담을 때.",
    controls: [
      { kind: "enum", prop: "radius", label: "radius", options: ["sm", "md", "lg", "full"], def: "md" },
      { kind: "enum", prop: "padding", label: "padding", options: ["none", "sm", "md", "lg", "xl"], def: "lg" },
    ],
    render: (st) => (
      <Card radius={s(st.radius) as "sm" | "md" | "lg" | "full"} padding={s(st.padding) as "none" | "sm" | "md" | "lg" | "xl"} style={{ width: "18rem" }}>
        <Stack gap="xs">
          <Text variant="subheading">카드 제목</Text>
          <Text variant="caption" ink="soft">옅은 면으로 정의되는 컨테이너.</Text>
        </Stack>
      </Card>
    ),
    code: (st) =>
      `<Card${AE("radius", s(st.radius), "md")}${AE("padding", s(st.padding), "lg")}>\n  <Stack gap="xs">\n    <Text variant="subheading">카드 제목</Text>\n    <Text variant="caption" ink="soft">…</Text>\n  </Stack>\n</Card>`,
  },
  {
    slug: "tabs",
    name: "Tabs",
    group: "Molecules",
    blurb: "세그먼트 컨트롤. 활성은 흰 pill 로 떠오른다(그림자 없이).",
    controls: [
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "sm" },
    ],
    render: (st) => <TabsDemo size={s(st.size) as "sm" | "md" | "lg"} />,
    code: (st) =>
      `const [tab, setTab] = useState("one");\n<Tabs value={tab} onChange={setTab}${AE("size", s(st.size), "sm")} items={[\n  { value: "one", label: "하나" },\n  { value: "two", label: "둘" },\n  { value: "three", label: "셋" },\n]} />`,
  },
  {
    slug: "tooltip",
    name: "Tooltip",
    group: "Molecules",
    blurb: "잠깐 뜨는 쪽지. 위 공간이 없으면 자동으로 아래로 뒤집는다.",
    controls: [{ kind: "text", prop: "label", label: "label", def: "툴팁 내용" }],
    render: (st) => (
      <Tooltip label={s(st.label)}>
        <Button variant="outline">hover 해보세요</Button>
      </Tooltip>
    ),
    code: (st) => `<Tooltip label="${s(st.label)}">\n  <Button variant="outline">hover</Button>\n</Tooltip>`,
  },
  {
    slug: "radiogroup",
    name: "RadioGroup",
    group: "Molecules",
    blurb: "여럿 중 하나. Radio + Label 을 options 로 묶고 한 그룹으로 만든다.",
    controls: [
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
    ],
    render: (st) => <RadioGroupDemo size={s(st.size) as "sm" | "md" | "lg"} />,
    code: (st) =>
      `const [v, setV] = useState("a");\n<RadioGroup value={v} onChange={setV}${AE("size", s(st.size), "md")} options={[\n  { value: "a", label: "옵션 A" },\n  { value: "b", label: "옵션 B" },\n  { value: "c", label: "옵션 C" },\n]} />`,
  },
  {
    slug: "alert",
    name: "Alert",
    group: "Molecules",
    blurb: "상태 한 줄을 옅은 색 면으로 알린다. color 로 의미를 정한다 (언제나 soft).",
    controls: [
      { kind: "enum", prop: "color", label: "color", options: ["info", "success", "warning", "error"], def: "info" },
      { kind: "text", prop: "title", label: "title", def: "확인이 필요합니다" },
      { kind: "text", prop: "children", label: "children", def: "이 작업은 되돌릴 수 없습니다." },
    ],
    render: (st) => (
      <Box style={{ width: "22rem" }}>
        <Alert color={s(st.color) as Accent} title={s(st.title)}>
          {s(st.children)}
        </Alert>
      </Box>
    ),
    code: (st) => `<Alert color="${s(st.color)}" title="${s(st.title)}">${s(st.children)}</Alert>`,
  },

  // ─ Components ─
  {
    slug: "table",
    name: "Table",
    group: "Components",
    blurb: "column 을 data 로 받는다. numeric 열은 sans 그대로 tabular·우측정렬(등폭 아님).",
    controls: [],
    render: () => <TableDemo />,
    code: () =>
      `const columns = [\n  { key: "k", header: "키", render: (r) => r.k },\n  { key: "s", header: "상태", render: (r) => <Badge color={r.s}>{r.s}</Badge> },\n  { key: "n", header: "값", numeric: true, render: (r) => r.n.toLocaleString() },\n];\n<Table columns={columns} rows={rows} rowKey={(r) => r.id} />`,
  },
  {
    slug: "modal",
    name: "Modal",
    group: "Components",
    blurb: "떠 있는 것만 그림자를 갖는다. Esc 로 닫힌다.",
    controls: [{ kind: "text", prop: "title", label: "title", def: "새 이슈" }],
    render: (st) => <ModalDemo title={s(st.title)} />,
    code: (st) =>
      `const [open, setOpen] = useState(false);\n<Modal open={open} title="${s(st.title)}" onClose={() => setOpen(false)}\n  footer={<><Button variant="quiet" onClick={() => setOpen(false)}>취소</Button>\n           <Button onClick={() => setOpen(false)}>확인</Button></>}>\n  <Text variant="body">본문</Text>\n</Modal>`,
  },
  {
    slug: "navbar",
    name: "Navbar",
    group: "Components",
    blurb: "지면 맨 위 한 줄. brand·items·trailing 을 받는다.",
    controls: [],
    render: () => (
      <Box style={{ width: "100%", border: `1px solid ${tokens.color.border.base}`, borderRadius: tokens.shape.radius.layout.md, overflow: "hidden" }}>
        <Navbar
          brand={<Text variant="subheading">Studio</Text>}
          items={[
            { value: "issues", label: "이슈" },
            { value: "boards", label: "보드" },
          ]}
          active="issues"
          trailing={<Button>새 이슈</Button>}
        />
      </Box>
    ),
    code: () =>
      `<Navbar\n  brand={<Text variant="subheading">Studio</Text>}\n  items={[{ value: "issues", label: "이슈" }, { value: "boards", label: "보드" }]}\n  active="issues"\n  trailing={<Button>새 이슈</Button>}\n/>`,
  },
  {
    slug: "banner",
    name: "Banner",
    group: "Components",
    blurb: "얇은 풀폭 상단 바. 화면을 채우는 색은 검정(solid)뿐 — status 색은 그 색의 의미를 짊어질 때(공지·경고)만. 좌 콘텐츠 + 우 액션.",
    controls: [
      { kind: "enum", prop: "tone", label: "tone", options: ["solid", "info", "success", "warning", "error"], def: "solid" },
      { kind: "text", prop: "children", label: "children", def: "데모 · 이슈 트래커" },
    ],
    render: (st) => (
      <Box style={{ width: "100%", borderRadius: tokens.shape.radius.layout.md, overflow: "hidden" }}>
        {/* 글자색을 덮지 않는다. 채운 면 위 글자는 Banner 가 tone 마다 solidFg 로 정하고
            자식이 그걸 상속한다 — 여기서 색을 박으면 tone 토글이 그 계약을 못 보여준다.
            (Text 를 쓰면 variant 클래스가 자기 ink 를 들고 와 같은 문제가 난다.) */}
        <Banner
          tone={s(st.tone) as "solid" | StatusName}
          action={<span style={{ fontWeight: tokens.text.weight.medium }}>← 사이트로</span>}
        >
          <span style={{ fontWeight: tokens.text.weight.semibold }}>Paper UI</span>
          <span>{s(st.children)}</span>
        </Banner>
      </Box>
    ),
    code: (st) =>
      `<Banner${AE("tone", s(st.tone), "solid")} action={<span>← 사이트로</span>}>\n  Paper UI · ${s(st.children)}\n</Banner>`,
  },
];

// ── 상태가 필요한 미리보기(내부 컴포넌트) ────────────────────────────────────
const TabsDemo = ({ size }: { size?: "sm" | "md" | "lg" }) => {
  const [tab, setTab] = useState("one");
  return (
    <Tabs
      value={tab}
      onChange={setTab}
      size={size}
      items={[
        { value: "one", label: "하나" },
        { value: "two", label: "둘" },
        { value: "three", label: "셋" },
      ]}
    />
  );
};

const RadioGroupDemo = ({ size }: { size?: "sm" | "md" | "lg" }) => {
  const [v, setV] = useState("a");
  return (
    <RadioGroup
      value={v}
      onChange={setV}
      size={size}
      options={[
        { value: "a", label: "옵션 A" },
        { value: "b", label: "옵션 B" },
        { value: "c", label: "옵션 C" },
      ]}
    />
  );
};

type Row = { id: string; k: string; st: StatusName; n: number };
const TableDemo = () => {
  const columns: Column<Row>[] = [
    { key: "k", header: "키", render: (r) => <Text variant="body" as="span">{r.k}</Text> },
    { key: "st", header: "상태", render: (r) => <Badge color={r.st}>{r.st}</Badge> },
    { key: "n", header: "값", numeric: true, render: (r) => <Text variant="body" as="span">{r.n.toLocaleString()}</Text> },
  ];
  const rows: Row[] = [
    { id: "1", k: "PG-1", st: "info", n: 1240 },
    { id: "2", k: "PG-2", st: "success", n: 88 },
    { id: "3", k: "PG-3", st: "error", n: 5 },
  ];
  return (
    <Box surface="raised" border radius="md" style={{ overflow: "hidden", width: "28rem", maxWidth: "100%" }}>
      <Table columns={columns} rows={rows} rowKey={(r) => r.id} />
    </Box>
  );
};

const ModalDemo = ({ title }: { title: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>모달 열기</Button>
      <Modal
        open={open}
        title={title}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="quiet" onClick={() => setOpen(false)}>취소</Button>
            <Button onClick={() => setOpen(false)}>확인</Button>
          </>
        }
      >
        <Text variant="body">떠 있는 것만 그림자를 갖는다. Esc 로 닫힌다.</Text>
      </Modal>
    </>
  );
};

export const bySlug = (slug: string): CompSpec | undefined => COMPONENTS.find((c) => c.slug === slug);

export const GROUPS: CompSpec["group"][] = ["Primitives", "Atoms", "Molecules", "Components"];

export const defaultState = (spec: CompSpec): State => {
  const st: State = {};
  for (const c of spec.controls) st[c.prop] = c.def;
  return st;
};
