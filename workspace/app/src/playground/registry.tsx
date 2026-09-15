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
  Checkbox,
  CommandMenu,
  Divider,
  DropdownMenu,
  Field,
  FormField,
  Icon,
  Inline,
  Label,
  Link,
  Modal,
  Menu,
  Navbar,
  Banner,
  EmptyState,
  PageHeader,
  Pagination,
  SegmentedControl,
  Select,
  Stack,
  Steps,
  Table,
  TableOfContents,
  Tabs,
  Text,
  Textarea,
  Switch,
  Radio,
  RadioGroup,
  Spinner,
  Alert,
  Breadcrumb,
  Sidebar,
  Tooltip,
  TreeNavigation,
  tokens,
  type BoxDimension,
  type Surface,
  type Color,
  type Variant,
  type Ink,
  type StatusName,
  type TextVariant,
} from "@studio-baeks/paper-ui";

// ── 컨트롤 ───────────────────────────────────────────────────────────────────
export type Control =
  | { kind: "bool"; prop: string; label: string; def: boolean }
  | { kind: "enum"; prop: string; label: string; options: string[]; def: string; labels?: Record<string, string> }
  | { kind: "text"; prop: string; label: string; def: string };

export type State = Record<string, string | boolean>;

export type CompSpec = {
  slug: string;
  name: string;
  group: "Primitives" | "Atoms" | "Molecules" | "Components";
  change?: "new" | "mod";
  blurb: string;
  preview?: "stage" | "flush";
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
    blurb: "구조 패널. surface·border·radius·shadow와 padding을 얹고, width·height·min/max·overflow로 box model을 정한다. sm~xl 크기는 layout token, 실제 CSS 길이는 화면 고유 layout의 escape hatch다. 색과 flex/position 책임은 열지 않는다.",
    controls: [
      { kind: "enum", prop: "surface", label: "surface", options: ["none", "raised", "canvas", "sunken", "well"], def: "raised" },
      { kind: "bool", prop: "border", label: "border", def: false },
      { kind: "bool", prop: "inverse", label: "inverse", def: false },
      { kind: "enum", prop: "shadow", label: "shadow", options: ["none", "overlay", "overlayMinimal"], def: "none" },
      { kind: "enum", prop: "radius", label: "radius", options: ["none", "sm", "md", "lg", "full"], def: "md" },
      { kind: "enum", prop: "width", label: "width", options: ["fit", "xs", "sm", "md", "lg", "xl", "full"], def: "md" },
      { kind: "enum", prop: "maxWidth", label: "maxWidth", options: ["none", "xs", "sm", "md", "lg", "xl", "full"], def: "none" },
      { kind: "enum", prop: "overflow", label: "overflow", options: ["visible", "hidden", "auto"], def: "visible" },
    ],
    render: (st) => (
      <Box
        surface={s(st.surface) === "none" ? undefined : (s(st.surface) as Surface)}
        border={b(st.border)}
        inverse={b(st.inverse)}
        shadow={s(st.shadow) === "none" ? undefined : (s(st.shadow) as "overlay" | "overlayMinimal")}
        radius={s(st.radius) === "none" ? undefined : (s(st.radius) as "sm" | "md" | "lg" | "full")}
        padding={s(st.padding) === "none" ? undefined : (s(st.padding) as "sm" | "md" | "lg" | "xl")}
        width={s(st.width) as BoxDimension}
        maxWidth={s(st.maxWidth) === "none" ? undefined : s(st.maxWidth) as BoxDimension}
        overflow={s(st.overflow) as "visible" | "hidden" | "auto"}
      >
        <Text variant="caption" as="span">surface={s(st.surface)}</Text>
      </Box>
    ),
    code: (st) => `<Box${AE("surface", s(st.surface), "raised")}${A("border", b(st.border))}${A("inverse", b(st.inverse))}${AE("shadow", s(st.shadow), "none")}${AE("radius", s(st.radius), "md")}${AE("width", s(st.width), "md")}${AE("maxWidth", s(st.maxWidth), "none")}${AE("overflow", s(st.overflow), "visible")}>\n  <Text variant="caption" as="span">surface=${s(st.surface)}</Text>\n</Box>`,
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
    change: "mod",
    name: "Button",
    group: "Atoms",
    blurb: "두 축이 직교한다 — color(primary·의미 4색) × variant(solid·soft·plain·outline·hairline·quiet). plain은 soft 면과 outline 선을 함께 든다. 큰 면을 채우는 건 검정(primary)뿐, 색은 뜻을 질 때만.",
    controls: [
      { kind: "enum", prop: "color", label: "color", options: ["primary", "info", "success", "warning", "error"], def: "primary" },
      { kind: "enum", prop: "variant", label: "variant", options: ["solid", "soft", "plain", "outline", "hairline", "quiet"], def: "solid" },
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
      { kind: "bool", prop: "loading", label: "loading", def: false },
      { kind: "bool", prop: "fullWidth", label: "fullWidth", def: false },
      { kind: "bool", prop: "iconOnly", label: "iconOnly(aria-label 필수)", def: false },
      { kind: "enum", prop: "shape", label: "shape", options: ["rounded", "pill"], def: "rounded" },
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
        shape: s(st.shape) as "rounded" | "pill",
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
      `<Button${AE("color", s(st.color), "primary")}${AE("variant", s(st.variant), "solid")}${AE("size", s(st.size), "md")}${A("loading", b(st.loading))}${A("fullWidth", b(st.fullWidth))}${AE("shape", s(st.shape), "rounded")}${A("disabled", b(st.disabled))}${b(st.iconOnly) ? ` iconOnly aria-label="${s(st.children) || "추가"}"><Icon>…</Icon>` : `>${s(st.children)}`}</Button>`,
  },
  {
    slug: "badge",
    change: "mod",
    name: "Badge",
    group: "Atoms",
    blurb: "상태 한 낱말. color × variant(soft·solid·outline·quiet). dot 으로 앞에 상태 점. 표시용이라 hover 없음. shape=\"pill\" 이면 알약 — Button 과 같은 어휘라 나란히 서도 곡선이 갈리지 않는다.",
    controls: [
      { kind: "enum", prop: "color", label: "color", options: ["primary", "info", "success", "warning", "error"], def: "primary" },
      { kind: "enum", prop: "variant", label: "variant", options: ["soft", "solid", "plain", "outline", "hairline", "quiet"], def: "soft" },
      { kind: "bool", prop: "dot", label: "dot", def: false },
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
      { kind: "enum", prop: "shape", label: "shape", options: ["rounded", "pill"], def: "rounded" },
      { kind: "text", prop: "children", label: "children", def: "진행" },
    ],
    render: (st) => (
      <Badge color={s(st.color) as Color} variant={s(st.variant) as Variant} dot={b(st.dot)} size={s(st.size) as "sm" | "md" | "lg"} shape={s(st.shape) as "rounded" | "pill"}>{s(st.children)}</Badge>
    ),
    code: (st) => `<Badge${AE("color", s(st.color), "primary")}${AE("variant", s(st.variant), "soft")}${A("dot", b(st.dot))}${AE("size", s(st.size), "md")}${AE("shape", s(st.shape), "rounded")}>${s(st.children)}</Badge>`,
  },
  {
    slug: "field",
    name: "Field",
    group: "Atoms",
    blurb: "input group — leading/trailing 어도먼트(아이콘·$·단위) + clear(×) + 비밀번호 보기. 래퍼가 테두리·포커스링·상태를 진다. shape=\"pill\" 은 검색창 결 — Button·Badge 와 같은 어휘다.",
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
      { kind: "enum", prop: "shape", label: "shape", options: ["rounded", "pill"], def: "rounded" },
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
          size={s(st.size) === "default" ? undefined : s(st.size) as "sm" | "md" | "lg"}
          shape={s(st.shape) === "default" ? undefined : s(st.shape) as "rounded" | "pill"}
          disabled={b(st.disabled)}
          numeric={b(st.numeric)}
        />
      </Box>
    ),
    code: (st) =>
      `<Field${A("placeholder", s(st.placeholder))}${AE("type", s(st.type), "text")}${b(st.leading) ? " leading={<Icon>…</Icon>}" : ""}${b(st.trailing) ? ' trailing={<Text ink="faint">kg</Text>}' : ""}${A("clearable", b(st.clearable))}${A("showPasswordToggle", b(st.showPasswordToggle))}${AE("align", s(st.align), "start")}${AE("status", s(st.status), "default")}${AE("size", s(st.size), "md")}${AE("shape", s(st.shape), "rounded")}${A("disabled", b(st.disabled))}${A("numeric", b(st.numeric))} />`,
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
    change: "mod",
    name: "Select",
    group: "Atoms",
    blurb: "native select anatomy를 Select.Option과 Select.Group으로 드러낸다. Button·Field와 같은 사다리를 쓰고, option 안에는 native 계약에 맞게 텍스트만 둔다.",
    controls: [
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
      { kind: "enum", prop: "shape", label: "shape", options: ["rounded", "pill"], def: "rounded" },
      { kind: "bool", prop: "disabled", label: "disabled", def: false },
    ],
    render: (st) => (
      <Box style={{ width: "12rem" }}>
        <Select
          size={s(st.size) === "default" ? undefined : s(st.size) as "sm" | "md" | "lg"}
          shape={s(st.shape) === "default" ? undefined : s(st.shape) as "rounded" | "pill"}
          disabled={b(st.disabled)}
        >
          <Select.Option value="a">옵션 A</Select.Option>
          <Select.Group label="추가 옵션">
            <Select.Option value="b">옵션 B</Select.Option>
            <Select.Option value="c">옵션 C</Select.Option>
          </Select.Group>
        </Select>
      </Box>
    ),
    code: (st) =>
      `<Select${st.size === "default" ? "" : AE("size", s(st.size), "md")}${st.shape === "default" ? "" : AE("shape", s(st.shape), "rounded")}${A("disabled", b(st.disabled))}>\n  <Select.Option value="a">옵션 A</Select.Option>\n  <Select.Group label="추가 옵션">\n    <Select.Option value="b">옵션 B</Select.Option>\n  </Select.Group>\n</Select>`,
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
    blurb: "여러 줄 입력. Field 와 같은 status·size 축, 세로로만 resize. size 는 여백과 글자만 움직인다 — 높이는 rows 가 정한다.",
    controls: [
      { kind: "text", prop: "placeholder", label: "placeholder", def: "여러 줄 입력…" },
      { kind: "enum", prop: "status", label: "status", options: ["default", "info", "success", "warning", "error"], def: "default" },
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
      { kind: "bool", prop: "disabled", label: "disabled", def: false },
    ],
    render: (st) => (
      <Box style={{ width: "18rem" }}>
        <Textarea placeholder={s(st.placeholder)} status={s(st.status) as "default" | StatusName} size={s(st.size) as "sm" | "md" | "lg"} disabled={b(st.disabled)} rows={3} />
      </Box>
    ),
    code: (st) =>
      `<Textarea${A("placeholder", s(st.placeholder))}${AE("status", s(st.status), "default")}${AE("size", s(st.size), "md")}${A("disabled", b(st.disabled))} />`,
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
    slug: "formfield",
    change: "mod",
    name: "FormField",
    group: "Molecules",
    blurb: "Field·Select·Textarea를 Label·설명·오류의 한 구조로 감싸는 유일한 form composition이다. align은 묶음의 배치를, 각 control의 align은 입력값 정렬을 맡는다.",
    controls: [
      { kind: "enum", prop: "control", label: "control", options: ["field", "select", "textarea"], def: "field" },
      { kind: "enum", prop: "align", label: "align", options: ["start", "center", "end", "stretch"], def: "stretch" },
      { kind: "text", prop: "label", label: "label", def: "우선순위" },
      { kind: "text", prop: "hint", label: "hint", def: "저장 후에도 변경할 수 있습니다." },
      { kind: "text", prop: "error", label: "error", def: "" },
    ],
    render: (st) => (
      <Box style={{ width: "18rem" }}>
        <FormField align={s(st.align) as "start" | "center" | "end" | "stretch"}>
          <FormField.Label>{s(st.label)}</FormField.Label>
          <FormField.Control>
            {s(st.control) === "select" ? <Select><Select.Option value="">선택하세요</Select.Option><Select.Option value="high">높음</Select.Option><Select.Option value="normal">보통</Select.Option></Select> : s(st.control) === "textarea" ? <Textarea status={s(st.error) ? "error" : "default"} placeholder="내용을 입력하세요" /> : <Field status={s(st.error) ? "error" : "default"} placeholder="입력하세요" />}
          </FormField.Control>
          {s(st.hint) ? <FormField.Hint>{s(st.hint)}</FormField.Hint> : null}
          {s(st.error) ? <FormField.Error>{s(st.error)}</FormField.Error> : null}
        </FormField>
      </Box>
    ),
    code: (st) =>
      `<FormField${AE("align", s(st.align), "stretch")}>\n  <FormField.Label>${s(st.label)}</FormField.Label>\n  <FormField.Control>\n    ${s(st.control) === "select" ? `<Select>\n      <Select.Option value="">선택하세요</Select.Option>\n      <Select.Option value="high">높음</Select.Option>\n    </Select>` : s(st.control) === "textarea" ? `<Textarea${s(st.error) ? ' status="error"' : ""} placeholder="내용을 입력하세요" />` : `<Field${s(st.error) ? ' status="error"' : ""} placeholder="입력하세요" />`}\n  </FormField.Control>${s(st.error) ? `\n  <FormField.Error>${s(st.error)}</FormField.Error>` : s(st.hint) ? `\n  <FormField.Hint>${s(st.hint)}</FormField.Hint>` : ""}\n</FormField>`,
  },
  {
    slug: "segmentedcontrol",
    change: "new",
    name: "SegmentedControl",
    group: "Molecules",
    blurb: "닫힌 track 안에서 필터·보기 방식처럼 값 하나를 고른다. sm·pill이 기본이며 rounded와 pill은 같은 geometry 사다리에서 shape만 바꾼다.",
    controls: [
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "sm" },
      { kind: "enum", prop: "shape", label: "shape", options: ["rounded", "pill"], def: "pill" },
    ],
    render: (st) => <SegmentedControlDemo size={s(st.size) as "sm" | "md" | "lg"} shape={s(st.shape) as "rounded" | "pill"} />,
    code: (st) =>
      `const [filter, setFilter] = useState("all");\n<SegmentedControl value={filter} onValueChange={setFilter}${AE("size", s(st.size), "sm")}${AE("shape", s(st.shape), "default")}>\n  <SegmentedControl.Item value="all">전체</SegmentedControl.Item>\n  <SegmentedControl.Item value="open">열림</SegmentedControl.Item>\n  <SegmentedControl.Item value="done">완료</SegmentedControl.Item>\n</SegmentedControl>`,
  },
  {
    slug: "tabs",
    change: "mod",
    name: "Tabs",
    group: "Molecules",
    blurb: "넓은 페이지의 실제 content panel을 underline trigger로 전환한다. md가 기본이며 List·Trigger·Content가 aria 관계와 키보드 이동을 함께 소유한다.",
    controls: [
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
    ],
    render: (st) => <TabsDemo size={s(st.size) as "sm" | "md" | "lg"} />,
    code: (st) =>
      `const [tab, setTab] = useState("overview");\n<Tabs value={tab} onValueChange={setTab}${AE("size", s(st.size), "md")}>\n  <Tabs.List aria-label="문서 구역">\n    <Tabs.Trigger value="overview">개요</Tabs.Trigger>\n    <Tabs.Trigger value="props">Props</Tabs.Trigger>\n  </Tabs.List>\n  <Tabs.Content value="overview">\n    <Stack gap="xs">\n      <Text variant="subheading">페이지 구역을 나누는 Tabs</Text>\n      <Text ink="soft">선택한 panel의 실제 내용을 구성합니다.</Text>\n    </Stack>\n  </Tabs.Content>\n  <Tabs.Content value="props">\n    <Text>List·Trigger·Content가 접근성 관계를 소유합니다.</Text>\n  </Tabs.Content>\n</Tabs>`,
  },
  {
    slug: "tooltip",
    change: "mod",
    name: "Tooltip",
    group: "Molecules",
    blurb: "Trigger와 Content가 명시된 비상호작용 설명. Content는 내용 너비로 펼쳐지고 기본 xl 상한에서만 줄바꿈한다. Box layout props로 폭을 조절하며, 위 공간이 없으면 아래로 뒤집는다. 버튼·폼은 Popover의 책임이다.",
    controls: [
      { kind: "text", prop: "content", label: "content", def: "단축키 C로도 열 수 있습니다." },
      { kind: "enum", prop: "maxWidth", label: "maxWidth", options: ["sm", "md", "lg", "xl"], def: "xl" },
    ],
    render: (st) => (
      <Tooltip>
        <Tooltip.Trigger asChild><Button variant="outline">hover 해보세요</Button></Tooltip.Trigger>
        <Tooltip.Content maxWidth={s(st.maxWidth) as BoxDimension}><Stack gap="xs"><Text variant="label" ink="inherit">새 이슈</Text><Text variant="caption" ink="inherit">{s(st.content)}</Text></Stack></Tooltip.Content>
      </Tooltip>
    ),
    code: (st) => `<Tooltip>\n  <Tooltip.Trigger asChild>\n    <Button variant="outline">hover</Button>\n  </Tooltip.Trigger>\n  <Tooltip.Content${AE("maxWidth", s(st.maxWidth), "xl")}>\n    <Stack><Text>새 이슈</Text><Text>${s(st.content)}</Text></Stack>\n  </Tooltip.Content>\n</Tooltip>`,
  },
  {
    slug: "breadcrumb",
    change: "new",
    name: "Breadcrumb",
    group: "Molecules",
    blurb: "현재 위치의 계층만 보여주는 location navigation. 마지막 항목은 aria-current=page이며 앞 항목은 실제 링크로 교체할 수 있다.",
    controls: [{ kind: "text", prop: "current", label: "current", def: "Checkbox" }],
    render: (st) => (
      <Breadcrumb><Breadcrumb.Item>Atoms</Breadcrumb.Item><Breadcrumb.Item>Component</Breadcrumb.Item><Breadcrumb.Item current>{s(st.current)}</Breadcrumb.Item></Breadcrumb>
    ),
    code: (st) => `<Breadcrumb>\n  <Breadcrumb.Item as={Link} to="/atoms">Atoms</Breadcrumb.Item>\n  <Breadcrumb.Item>Component</Breadcrumb.Item>\n  <Breadcrumb.Item current>${s(st.current)}</Breadcrumb.Item>\n</Breadcrumb>`,
  },
  {
    slug: "radiogroup",
    change: "mod",
    name: "RadioGroup",
    group: "Molecules",
    blurb: "여럿 중 하나. Radio + Label을 options로 묶고 한 그룹으로 만든다. 세로가 기본이며 짧고 대등한 선택지는 horizontal로 두고 좁으면 wrap한다.",
    controls: [
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
      { kind: "enum", prop: "orientation", label: "orientation", options: ["vertical", "horizontal"], def: "vertical" },
    ],
    render: (st) => <RadioGroupDemo size={s(st.size) as "sm" | "md" | "lg"} orientation={s(st.orientation) as "vertical" | "horizontal"} />,
    code: (st) =>
      `const [value, setValue] = useState("a");\n<RadioGroup value={value} onValueChange={setValue}${AE("size", s(st.size), "md")}${AE("orientation", s(st.orientation), "vertical")}>\n  <RadioGroup.Item value="a">옵션 A</RadioGroup.Item>\n  <RadioGroup.Item value="b">옵션 B</RadioGroup.Item>\n  <RadioGroup.Item value="c">옵션 C</RadioGroup.Item>\n</RadioGroup>`,
  },
  {
    slug: "alert",
    change: "mod",
    name: "Alert",
    group: "Molecules",
    blurb: "상태 한 줄을 색이 깔린 면으로 알린다. Button·Badge 와 같은 color × variant 매트릭스를 그대로 문다 — variant 가 이미 면의 무게 축이라 Alert 전용 surface 축을 따로 세우지 않았다.",
    controls: [
      { kind: "enum", prop: "color", label: "color", options: ["primary", "info", "success", "warning", "error"], def: "info" },
      { kind: "enum", prop: "variant", label: "variant", options: ["soft", "solid", "plain", "outline", "hairline", "quiet"], def: "soft" },
      { kind: "text", prop: "title", label: "title", def: "확인이 필요합니다" },
      { kind: "text", prop: "children", label: "children", def: "이 작업은 되돌릴 수 없습니다." },
    ],
    render: (st) => (
      <Box style={{ width: "22rem" }}>
        <Alert color={s(st.color) as Color} variant={s(st.variant) as Variant}>
          <Alert.Title>{s(st.title)}</Alert.Title>
          <Alert.Description>{s(st.children)}</Alert.Description>
        </Alert>
      </Box>
    ),
    code: (st) =>
      `<Alert color="${s(st.color)}"${AE("variant", s(st.variant), "soft")}>\n  <Alert.Title>${s(st.title)}</Alert.Title>\n  <Alert.Description>${s(st.children)}</Alert.Description>\n</Alert>`,
  },

  {
    slug: "menu",
    change: "new",
    name: "Menu",
    group: "Molecules",
    blurb: "action과 navigation을 한 열에 놓는 기본 목록. 현재 위치·설명·단축키·위험·비활성 상태를 한 item 문법으로 다룬다.",
    controls: [{ kind: "enum", prop: "value", label: "value", options: ["overview", "tokens", "none"], def: "overview" }],
    render: (st) => <Box style={{ width: "18rem" }}><MenuDemo value={s(st.value) === "none" ? undefined : s(st.value)} /></Box>,
    code: (st) => `const [value, setValue] = useState("${s(st.value)}");\n<Menu value={value} onValueChange={setValue}>\n  <Menu.Item value="overview" description="시스템의 기본 원칙">개요</Menu.Item>\n  <Menu.Item value="tokens" shortcut="⌘ T">토큰</Menu.Item>\n  <Menu.Item value="archive" danger>보관하기</Menu.Item>\n</Menu>`,
  },
  {
    slug: "steps",
    change: "new",
    name: "Steps",
    group: "Molecules",
    blurb: "실제 순서가 있는 흐름만 번호와 연결선으로 보여준다. 완료·현재·예정의 무게가 다르고 가로·세로 방향을 공유한다.",
    controls: [
      { kind: "enum", prop: "value", label: "value", options: ["draft", "review", "publish"], def: "review" },
      { kind: "enum", prop: "orientation", label: "orientation", options: ["horizontal", "vertical"], def: "horizontal" },
    ],
    render: (st) => <StepsDemo value={s(st.value)} orientation={s(st.orientation) as "horizontal" | "vertical"} />,
    code: (st) => `<Steps value="${s(st.value)}"${AE("orientation", s(st.orientation), "horizontal")}>\n  <Steps.Item value="draft" description="내용 작성">초안</Steps.Item>\n  <Steps.Item value="review" description="구조 확인">검토</Steps.Item>\n  <Steps.Item value="publish" description="문서 공개">배포</Steps.Item>\n</Steps>`,
  },
  {
    slug: "tableofcontents",
    change: "new",
    name: "TableOfContents",
    group: "Molecules",
    blurb: "한 문서 안의 현재 위치를 깊이 3단과 왼쪽 rule로 표시한다. 전체 사이트 계층을 맡는 Sidebar·TreeNavigation과 범위를 나눈다.",
    controls: [{ kind: "enum", prop: "value", label: "value", options: ["overview", "props", "examples"], def: "props" }],
    render: (st) => <Box style={{ width: "16rem" }}><TableOfContentsDemo value={s(st.value)} /></Box>,
    code: (st) => `<TableOfContents value="${s(st.value)}">\n  <TableOfContents.Item value="overview">개요</TableOfContents.Item>\n  <TableOfContents.Item value="props" depth={1}>Props</TableOfContents.Item>\n  <TableOfContents.Item value="examples" depth={1}>예제</TableOfContents.Item>\n</TableOfContents>`,
  },

  // ─ Components ─
  {
    slug: "pageheader",
    change: "new",
    name: "PageHeader",
    group: "Components",
    blurb: "location → display title → description의 읽기 순서를 만들고 actions를 제목 기준선에 맞춘다. 별도 container나 eyebrow 장식을 강요하지 않는다.",
    controls: [
      { kind: "text", prop: "title", label: "title", def: "이슈" },
      { kind: "text", prop: "description", label: "description", def: "12건이 현재 필터와 일치합니다." },
    ],
    render: (st) => (
      <Box style={{ width: "28rem", maxWidth: "100%" }}>
        <PageHeader>
          <PageHeader.Location><Breadcrumb><Breadcrumb.Item>Components</Breadcrumb.Item><Breadcrumb.Item current>{s(st.title)}</Breadcrumb.Item></Breadcrumb></PageHeader.Location>
          <PageHeader.Content><PageHeader.Title>{s(st.title)}</PageHeader.Title>{s(st.description) ? <PageHeader.Description>{s(st.description)}</PageHeader.Description> : null}</PageHeader.Content>
          <PageHeader.Actions><Button>새 이슈</Button></PageHeader.Actions>
        </PageHeader>
      </Box>
    ),
    code: (st) =>
      `<PageHeader>\n  <PageHeader.Location><Breadcrumb>…</Breadcrumb></PageHeader.Location>\n  <PageHeader.Content>\n    <PageHeader.Title>${s(st.title)}</PageHeader.Title>${s(st.description) ? `\n    <PageHeader.Description>${s(st.description)}</PageHeader.Description>` : ""}\n  </PageHeader.Content>\n  <PageHeader.Actions><Button>새 이슈</Button></PageHeader.Actions>\n</PageHeader>`,
  },
  {
    slug: "sidebar",
    change: "new",
    name: "Sidebar",
    group: "Components",
    blurb: "Group·Item·Badge를 조합하는 compound local navigation rail. 선택 상태는 다른 collection과 같은 value/onValueChange를 쓰고 release 표식은 Root가 공유한다.",
    controls: [{ kind: "enum", prop: "value", label: "value", options: ["overview", "tokens", "components"], def: "components" }],
    render: (st) => (
      <Box style={{ width: "15rem", border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}` }}>
        <Sidebar value={s(st.value)}>
          <Sidebar.Group label="문서">
            <Sidebar.Item value="overview">개요</Sidebar.Item>
            <Sidebar.Item value="tokens">토큰<Sidebar.Badge color="warning">MOD</Sidebar.Badge></Sidebar.Item>
            <Sidebar.Item value="components">컴포넌트<Sidebar.Badge color="info">NEW</Sidebar.Badge></Sidebar.Item>
          </Sidebar.Group>
        </Sidebar>
      </Box>
    ),
    code: (st) => `<Sidebar value="${s(st.value)}">\n  <Sidebar.Group label="문서">\n    <Sidebar.Item value="overview">개요</Sidebar.Item>\n    <Sidebar.Item value="tokens">토큰<Sidebar.Badge color="warning">MOD</Sidebar.Badge></Sidebar.Item>\n    <Sidebar.Item value="components">컴포넌트<Sidebar.Badge color="info">NEW</Sidebar.Badge></Sidebar.Item>\n  </Sidebar.Group>\n</Sidebar>`,
  },
  {
    slug: "emptystate",
    change: "new",
    name: "EmptyState",
    group: "Components",
    blurb: "빈 결과를 막다른 곳으로 두지 않는다. 이유와 다음 행동 하나만 남기고 별도 container를 만들지 않는다.",
    controls: [
      { kind: "text", prop: "title", label: "title", def: "일치하는 이슈가 없습니다" },
      { kind: "text", prop: "description", label: "description", def: "필터를 바꾸거나 새 이슈를 만들어 시작하세요." },
    ],
    render: (st) => (
      <Box surface="raised" border radius="md" style={{ width: "28rem", maxWidth: "100%" }}>
        <EmptyState><EmptyState.Title>{s(st.title)}</EmptyState.Title>{s(st.description) ? <EmptyState.Description>{s(st.description)}</EmptyState.Description> : null}<EmptyState.Action><Button size="sm">필터 초기화</Button></EmptyState.Action></EmptyState>
      </Box>
    ),
    code: (st) =>
      `<EmptyState>\n  <EmptyState.Title>${s(st.title)}</EmptyState.Title>${s(st.description) ? `\n  <EmptyState.Description>${s(st.description)}</EmptyState.Description>` : ""}\n  <EmptyState.Action><Button size="sm">필터 초기화</Button></EmptyState.Action>\n</EmptyState>`,
  },
  {
    slug: "pagination",
    change: "new",
    name: "Pagination",
    group: "Components",
    blurb: "현재 위치와 앞뒤 이동. outline은 선, soft는 면, minimal은 현재 위치만 옅은 면으로 남겨 주변 화면의 밀도에 맞춘다.",
    controls: [
      { kind: "enum", prop: "variant", label: "variant", options: ["outline", "soft", "minimal"], def: "outline" },
      { kind: "enum", prop: "totalPages", label: "totalPages", options: ["3", "7", "12"], def: "12" },
    ],
    render: (st) => <PaginationDemo totalPages={Number(s(st.totalPages))} variant={s(st.variant) as "outline" | "soft" | "minimal"} />,
    code: (st) =>
      `const [page, setPage] = useState(1);\n<Pagination${AE("variant", s(st.variant), "outline")} page={page} totalPages={${s(st.totalPages)}} onPageChange={setPage} />`,
  },
  {
    slug: "table",
    change: "mod",
    name: "Table",
    group: "Components",
    preview: "flush",
    blurb: "외곽 container 없이 직각으로 서는 표. Header·Column·Body·Row·Cell의 semantic anatomy가 기본 API이며 variant는 행 구분법, density는 같은 14px 정보를 담는 높이만 정한다.",
    controls: [
      { kind: "enum", prop: "variant", label: "variant", options: ["plain", "ruled", "striped"], def: "plain" },
      { kind: "enum", prop: "density", label: "density", options: ["compact", "default", "comfortable"], def: "default" },
    ],
    render: (st) => <TableDemo variant={s(st.variant) as "plain" | "ruled" | "striped"} density={s(st.density) as "compact" | "default" | "comfortable"} />,
    code: (st) =>
      `<Table${AE("variant", s(st.variant), "plain")}${AE("density", s(st.density), "default")}>\n  <Table.Header>\n    <Table.Column>키</Table.Column>\n    <Table.Column>제목</Table.Column>\n    <Table.Column>상태</Table.Column>\n    <Table.Column align="end">수정</Table.Column>\n  </Table.Header>\n  <Table.Body>\n    {rows.map((row) => (\n      <Table.Row key={row.id}>\n        <Table.Cell>{row.key}</Table.Cell>\n        <Table.Cell>{row.title}</Table.Cell>\n        <Table.Cell><Badge color={row.status}>{row.status}</Badge></Table.Cell>\n        <Table.Cell align="end">{row.updated}</Table.Cell>\n      </Table.Row>\n    ))}\n  </Table.Body>\n</Table>`,
  },
  {
    slug: "modal",
    change: "mod",
    name: "Modal",
    group: "Components",
    blurb: "Header·Title·Description·Body·Footer·Close로 구조를 드러내는 compound dialog. size는 담는 일의 폭이며 포커스 trap과 복귀를 Root가 맡는다.",
    controls: [
      { kind: "text", prop: "title", label: "title", def: "새 이슈" },
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
    ],
    render: (st) => <ModalDemo title={s(st.title)} size={s(st.size) as "sm" | "md" | "lg"} />,
    code: (st) =>
      `const [open, setOpen] = useState(false);\n<Modal open={open} onOpenChange={setOpen}${AE("size", s(st.size), "md")}>\n  <Modal.Header><Modal.Title>${s(st.title)}</Modal.Title><Modal.Description>설명</Modal.Description></Modal.Header>\n  <Modal.Body><Text variant="body">본문</Text></Modal.Body>\n  <Modal.Footer><Modal.Close variant="quiet">취소</Modal.Close><Modal.Close>확인</Modal.Close></Modal.Footer>\n</Modal>`,
  },
  {
    slug: "navbar",
    change: "mod",
    name: "Navbar",
    group: "Components",
    blurb: "지면 맨 위 한 줄. Brand·Item·Actions를 JSX로 조합하고 Item은 as로 버튼과 링크를 오간다. width는 안쪽 줄의 폭만 정하며 괘선은 화면 끝까지 간다.",
    controls: [
      { kind: "enum", prop: "width", label: "width", options: ["full", "content"], def: "full" },
    ],
    render: (st) => (
      <Box style={{ width: "100%", border: `1px solid ${tokens.color.border.base}`, borderRadius: tokens.shape.radius.layout.md, overflow: "hidden" }}>
        <Navbar width={s(st.width) as "full" | "content"} value="issues">
          <Navbar.Brand><Text variant="subheading">Studio</Text></Navbar.Brand>
          <Navbar.Item value="issues">이슈</Navbar.Item><Navbar.Item value="boards">보드</Navbar.Item><Navbar.Item value="docs" as="a" href="#/">문서</Navbar.Item>
          <Navbar.Actions><Button>새 이슈</Button></Navbar.Actions>
        </Navbar>
      </Box>
    ),
    code: (st) =>
      `<Navbar${AE("width", s(st.width), "full")} value="issues">\n  <Navbar.Brand><Text variant="subheading">Studio</Text></Navbar.Brand>\n  <Navbar.Item value="issues">이슈</Navbar.Item>\n  <Navbar.Item value="docs" as={Link} to="/docs">문서</Navbar.Item>\n  <Navbar.Actions><Button>새 이슈</Button></Navbar.Actions>\n</Navbar>`,
  },
  {
    slug: "banner",
    change: "mod",
    name: "Banner",
    group: "Components",
    blurb: "얇은 풀폭 상단 바. 고정된 solid surface의 의미색도 shared color 이름을 쓴다. primary가 기본이고 status 색은 공지·경고의 의미를 짊어질 때만 고른다.",
    controls: [
      { kind: "enum", prop: "color", label: "color", options: ["primary", "info", "success", "warning", "error"], def: "primary" },
      { kind: "text", prop: "children", label: "children", def: "데모 · 이슈 트래커" },
    ],
    render: (st) => (
      <Box style={{ width: "100%", borderRadius: tokens.shape.radius.layout.md, overflow: "hidden" }}>
        {/* 글자색을 덮지 않는다. 채운 면 위 글자는 Banner 가 tone 마다 wash 로 정하고
            자식이 그걸 상속한다 — 여기서 색을 박으면 tone 토글이 그 계약을 못 보여준다.
            (Text 를 쓰면 variant 클래스가 자기 ink 를 들고 와 같은 문제가 난다.) */}
        <Banner color={s(st.color) as Color}>
          <Banner.Content><span style={{ fontWeight: tokens.text.weight.semibold }}>Paper UI</span><span>{s(st.children)}</span></Banner.Content>
          <Banner.Action><span style={{ fontWeight: tokens.text.weight.medium }}>← 사이트로</span></Banner.Action>
        </Banner>
      </Box>
    ),
    code: (st) =>
      `<Banner${AE("color", s(st.color), "primary")}>\n  <Banner.Content>Paper UI · ${s(st.children)}</Banner.Content>\n  <Banner.Action><span>← 사이트로</span></Banner.Action>\n</Banner>`,
  },
  {
    slug: "dropdownmenu",
    change: "new",
    name: "DropdownMenu",
    group: "Components",
    blurb: "Menu를 trigger에 붙이는 떠 있는 action surface. 바깥 클릭·Escape·초기 포커스·선택 후 닫힘을 Root가 맡고 이 surface만 overlay shadow를 갖는다.",
    controls: [{ kind: "enum", prop: "align", label: "align", options: ["start", "end"], def: "start" }],
    render: (st) => <Box style={{ paddingBottom: tokens.shape.height.xs.layout }}><DropdownMenu align={s(st.align) as "start" | "end"}><DropdownMenu.Trigger><Button variant="outline">문서 작업</Button></DropdownMenu.Trigger><DropdownMenu.Content><DropdownMenu.Item value="duplicate" shortcut="⌘ D">복제</DropdownMenu.Item><DropdownMenu.Item value="move">이동</DropdownMenu.Item><DropdownMenu.Item value="delete" danger>삭제</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu></Box>,
    code: (st) => `<DropdownMenu${AE("align", s(st.align), "start")}>\n  <DropdownMenu.Trigger><Button variant="outline">문서 작업</Button></DropdownMenu.Trigger>\n  <DropdownMenu.Content>\n    <DropdownMenu.Item value="duplicate" shortcut="⌘ D">복제</DropdownMenu.Item>\n    <DropdownMenu.Item value="move">이동</DropdownMenu.Item>\n    <DropdownMenu.Item value="delete" danger>삭제</DropdownMenu.Item>\n  </DropdownMenu.Content>\n</DropdownMenu>`,
  },
  {
    slug: "commandmenu",
    change: "new",
    name: "CommandMenu",
    group: "Components",
    blurb: "검색 Field와 키보드 선택 listbox를 묶은 빠른 이동 surface. label과 keywords를 검색하고 group·설명·단축키를 유지한다.",
    controls: [{ kind: "text", prop: "placeholder", label: "placeholder", def: "명령 또는 페이지 검색" }],
    render: (st) => <Box style={{ width: "28rem", maxWidth: "100%" }}><CommandMenuDemo placeholder={s(st.placeholder)} /></Box>,
    code: (st) => `<CommandMenu placeholder="${s(st.placeholder)}" onSelect={openPage}>\n  <CommandMenu.Group label="컴포넌트">\n    <CommandMenu.Item value="button" shortcut="B">Button</CommandMenu.Item>\n    <CommandMenu.Item value="sidebar" shortcut="S">Sidebar</CommandMenu.Item>\n  </CommandMenu.Group>\n  <CommandMenu.Group label="문서">\n    <CommandMenu.Item value="colors" keywords={["palette"]}>Color tokens</CommandMenu.Item>\n  </CommandMenu.Group>\n</CommandMenu>`,
  },
  {
    slug: "treenavigation",
    change: "new",
    name: "TreeNavigation",
    group: "Components",
    blurb: "깊은 정보 구조를 접고 펴는 계층 navigation. branch는 확장 상태를, leaf는 선택을 맡으며 키보드 화살표로 같은 구조를 탐색한다.",
    controls: [{ kind: "enum", prop: "value", label: "value", options: ["button", "badge", "colors"], def: "button" }],
    render: (st) => <Box style={{ width: "18rem" }}><TreeNavigationDemo value={s(st.value)} /></Box>,
    code: (st) => `<TreeNavigation value="${s(st.value)}" defaultExpandedValues={["components", "atoms"]}>\n  <TreeNavigation.Item value="foundations" label="Foundations">\n    <TreeNavigation.Item value="colors" label="Color" />\n  </TreeNavigation.Item>\n  <TreeNavigation.Item value="components" label="Components">\n    <TreeNavigation.Item value="atoms" label="Atoms">\n      <TreeNavigation.Item value="button" label="Button" />\n      <TreeNavigation.Item value="badge" label="Badge" />\n    </TreeNavigation.Item>\n  </TreeNavigation.Item>\n</TreeNavigation>`,
  },
];

// ── 상태가 필요한 미리보기(내부 컴포넌트) ────────────────────────────────────
const MenuDemo = ({ value: initialValue }: { value?: string }) => {
  const [value, setValue] = useState(initialValue);
  return <Menu value={value} onValueChange={setValue}><Menu.Item value="overview" description="시스템의 기본 원칙">개요</Menu.Item><Menu.Item value="tokens" shortcut="⌘ T">토큰</Menu.Item><Menu.Item value="archive" danger>보관하기</Menu.Item></Menu>;
};

const StepsDemo = ({ value: initialValue, orientation }: { value: string; orientation: "horizontal" | "vertical" }) => {
  const [value, setValue] = useState(initialValue);
  return <Steps value={value} orientation={orientation} onValueChange={setValue}><Steps.Item value="draft" description="내용 작성">초안</Steps.Item><Steps.Item value="review" description="구조 확인">검토</Steps.Item><Steps.Item value="publish" description="문서 공개">배포</Steps.Item></Steps>;
};

const TableOfContentsDemo = ({ value: initialValue }: { value: string }) => {
  const [value, setValue] = useState(initialValue);
  return <TableOfContents value={value} onValueChange={setValue}><TableOfContents.Item value="overview">개요</TableOfContents.Item><TableOfContents.Item value="props" depth={1}>Props</TableOfContents.Item><TableOfContents.Item value="examples" depth={1}>예제</TableOfContents.Item></TableOfContents>;
};

const CommandMenuDemo = ({ placeholder }: { placeholder: string }) => (
  <CommandMenu placeholder={placeholder}><CommandMenu.Group label="컴포넌트"><CommandMenu.Item value="button" description="Atoms" shortcut="B">Button</CommandMenu.Item><CommandMenu.Item value="sidebar" description="Components" shortcut="S">Sidebar</CommandMenu.Item></CommandMenu.Group><CommandMenu.Group label="문서"><CommandMenu.Item value="colors" description="Foundations" keywords={["palette"]}>Color tokens</CommandMenu.Item></CommandMenu.Group></CommandMenu>
);

const TreeNavigationDemo = ({ value: initialValue }: { value: string }) => {
  const [value, setValue] = useState(initialValue);
  return <TreeNavigation value={value} onValueChange={setValue} defaultExpandedValues={["components", "atoms"]}><TreeNavigation.Item value="foundations" label="Foundations"><TreeNavigation.Item value="colors" label="Color" /><TreeNavigation.Item value="shape" label="Shape" /></TreeNavigation.Item><TreeNavigation.Item value="components" label="Components"><TreeNavigation.Item value="atoms" label="Atoms"><TreeNavigation.Item value="button" label="Button" /><TreeNavigation.Item value="badge" label="Badge" /></TreeNavigation.Item><TreeNavigation.Item value="molecules" label="Molecules" /></TreeNavigation.Item></TreeNavigation>;
};

const SegmentedControlDemo = ({ size, shape }: { size?: "sm" | "md" | "lg"; shape?: "rounded" | "pill" }) => {
  const [value, setValue] = useState("all");
  return <SegmentedControl value={value} onValueChange={setValue} size={size} shape={shape}><SegmentedControl.Item value="all">전체</SegmentedControl.Item><SegmentedControl.Item value="open">열림</SegmentedControl.Item><SegmentedControl.Item value="done">완료</SegmentedControl.Item></SegmentedControl>;
};

const TabsDemo = ({ size }: { size?: "sm" | "md" | "lg" }) => {
  const [tab, setTab] = useState("overview");
  return <Box style={{ width: "22rem", maxWidth: "100%" }}><Tabs value={tab} onValueChange={setTab} size={size}><Tabs.List aria-label="문서 구역"><Tabs.Trigger value="overview">개요</Tabs.Trigger><Tabs.Trigger value="props">Props</Tabs.Trigger></Tabs.List><Tabs.Content value="overview"><Stack gap="xs"><Text variant="subheading">페이지 구역을 나누는 Tabs</Text><Text ink="soft">선택한 trigger와 연결된 panel만 보여주며, 본문의 surface는 강제하지 않습니다.</Text></Stack></Tabs.Content><Tabs.Content value="props"><Stack gap="xs"><Text variant="subheading">명시적인 compound anatomy</Text><Text ink="soft">List·Trigger·Content가 키보드 이동과 tab-panel 관계를 함께 소유합니다.</Text></Stack></Tabs.Content></Tabs></Box>;
};

const RadioGroupDemo = ({ size, orientation }: { size?: "sm" | "md" | "lg"; orientation?: "vertical" | "horizontal" }) => {
  const [v, setV] = useState("a");
  return (
    <RadioGroup value={v} onValueChange={setV} size={size} orientation={orientation}><RadioGroup.Item value="a">옵션 A</RadioGroup.Item><RadioGroup.Item value="b">옵션 B</RadioGroup.Item><RadioGroup.Item value="c">옵션 C</RadioGroup.Item></RadioGroup>
  );
};

const PaginationDemo = ({ totalPages, variant }: { totalPages: number; variant?: "outline" | "soft" | "minimal" }) => {
  const [page, setPage] = useState(1);
  return <Pagination variant={variant} page={page} totalPages={totalPages} onPageChange={setPage} />;
};

type Row = { id: string; k: string; st: StatusName; n: number };
const TableDemo = ({ variant, density }: { variant?: "plain" | "ruled" | "striped"; density?: "compact" | "default" | "comfortable" }) => {
  const rows: Row[] = [
    { id: "1", k: "PG-1", st: "info", n: 1240 },
    { id: "2", k: "PG-2", st: "success", n: 88 },
    { id: "3", k: "PG-3", st: "error", n: 5 },
  ];
  return (
    <Box style={{ width: "40rem", maxWidth: "100%", overflowX: "auto" }}>
      <Table variant={variant} density={density}>
        <Table.Header><Table.Column>키</Table.Column><Table.Column>제목</Table.Column><Table.Column>상태</Table.Column><Table.Column align="center">우선순위</Table.Column><Table.Column>담당</Table.Column><Table.Column align="end">수정</Table.Column></Table.Header>
        <Table.Body>{rows.map((row, index) => <Table.Row key={row.id}><Table.Cell>{row.k}</Table.Cell><Table.Cell>{["토큰 트리를 두 번 걷는 emit 파이프라인", "Select 포커스 링이 사파리에서 잘림", "Table hover 배경을 subtle로 통일"][index]}</Table.Cell><Table.Cell><Badge color={row.st}>{row.st}</Badge></Table.Cell><Table.Cell align="center">{index < 2 ? "높음" : "보통"}</Table.Cell><Table.Cell>{index === 1 ? "민주" : "재원"}</Table.Cell><Table.Cell align="end"><Text variant="caption" as="span" ink="soft">{["10분 전", "1시간 전", "3시간 전"][index]}</Text></Table.Cell></Table.Row>)}</Table.Body>
      </Table>
    </Box>
  );
};

const ModalDemo = ({ title, size }: { title: string; size?: "sm" | "md" | "lg" }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>모달 열기</Button>
      <Modal
        open={open}
        size={size}
        onOpenChange={setOpen}
      >
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
          <Modal.Description>변경할 내용을 확인하세요.</Modal.Description>
        </Modal.Header>
        <Modal.Body><Text variant="body">떠 있는 것만 그림자를 갖는다. Esc로 닫힌다.</Text></Modal.Body>
        <Modal.Footer>
          <Modal.Close variant="quiet">취소</Modal.Close>
          <Modal.Close>확인</Modal.Close>
        </Modal.Footer>
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
