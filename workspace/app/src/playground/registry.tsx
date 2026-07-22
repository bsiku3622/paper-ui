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
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  TextField,
  Tooltip,
  tokens,
  type Column,
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
    blurb: "여덟 variant 로 위계를 정한다. variant 가 크기·굵기·서체·잉크를 한 번에 결정.",
    controls: [
      { kind: "enum", prop: "variant", label: "variant", options: ["title", "heading", "label", "body", "mono", "caption"], def: "body" },
      { kind: "enum", prop: "ink", label: "ink", options: ["default", "base", "soft", "faint"], def: "default" },
      { kind: "text", prop: "children", label: "children", def: "다람쥐 헌 쳇바퀴 Aa 0123" },
    ],
    render: (st) => (
      <Text variant={s(st.variant) as TextVariant} ink={st.ink === "default" ? undefined : (s(st.ink) as "base" | "soft" | "faint")}>
        {s(st.children)}
      </Text>
    ),
    code: (st) =>
      `<Text${AE("variant", s(st.variant), "body")}${st.ink === "default" ? "" : A("ink", s(st.ink))}>${s(st.children)}</Text>`,
  },
  {
    slug: "box",
    name: "Box",
    group: "Primitives",
    blurb: "면 하나. paper(면색)·radius·padding 을 말한다. as 로 어떤 태그든 된다.",
    controls: [
      { kind: "enum", prop: "paper", label: "paper", options: ["base", "subtle", "muted"], def: "subtle" },
      { kind: "enum", prop: "radius", label: "radius", options: ["sm", "md", "lg", "pill"], def: "md" },
      { kind: "enum", prop: "padding", label: "padding", options: ["sm", "md", "lg", "xl"], def: "lg" },
    ],
    render: (st) => (
      <Box paper={s(st.paper) as "base" | "subtle" | "muted"} radius={s(st.radius) as "sm" | "md" | "lg" | "pill"} padding={s(st.padding) as "sm" | "md" | "lg" | "xl"} style={{ minWidth: "8rem", border: `1px solid ${tokens.color.border.base}` }}>
        <Text variant="caption" as="span">paper.{s(st.paper)}</Text>
      </Box>
    ),
    code: (st) => `<Box paper="${s(st.paper)}" radius="${s(st.radius)}" padding="${s(st.padding)}">…</Box>`,
  },

  // ─ Atoms ─
  {
    slug: "button",
    name: "Button",
    group: "Atoms",
    blurb: "두 축이 직교한다 — variant(solid·soft·outline·quiet, 시각 무게) × status(색). 큰 면을 채우는 건 검정(solid)뿐, 색은 뜻을 질 때만.",
    controls: [
      { kind: "enum", prop: "variant", label: "variant", options: ["solid", "soft", "outline", "quiet"], def: "solid" },
      { kind: "enum", prop: "status", label: "status", options: ["default", "info", "success", "warning", "danger"], def: "default" },
      { kind: "bool", prop: "disabled", label: "disabled", def: false },
      { kind: "text", prop: "children", label: "children", def: "버튼" },
    ],
    render: (st) => (
      <Button
        variant={s(st.variant) as "solid" | "soft" | "outline" | "quiet"}
        status={s(st.status) as "default" | StatusName}
        disabled={b(st.disabled)}
      >
        {s(st.children)}
      </Button>
    ),
    code: (st) =>
      `<Button${AE("variant", s(st.variant), "solid")}${AE("status", s(st.status), "default")}${A("disabled", b(st.disabled))}>${s(st.children)}</Button>`,
  },
  {
    slug: "badge",
    name: "Badge",
    group: "Atoms",
    blurb: "상태 한 낱말. status 를 주면 옅은 색 면(wash)이 붙는다. 없으면 중립.",
    controls: [
      { kind: "enum", prop: "status", label: "status", options: ["none", "info", "success", "warning", "danger"], def: "info" },
      { kind: "text", prop: "children", label: "children", def: "진행" },
    ],
    render: (st) => (
      <Badge status={st.status === "none" ? undefined : (s(st.status) as StatusName)}>{s(st.children)}</Badge>
    ),
    code: (st) => `<Badge${st.status === "none" ? "" : A("status", s(st.status))}>${s(st.children)}</Badge>`,
  },
  {
    slug: "field",
    name: "Field",
    group: "Atoms",
    blurb: "한 줄 입력. 상태는 status 축 하나로 받는다(invalid boolean 대신). 포커스 때만 파란 링.",
    controls: [
      { kind: "text", prop: "placeholder", label: "placeholder", def: "검색…" },
      { kind: "enum", prop: "status", label: "status", options: ["default", "info", "success", "warning", "danger"], def: "default" },
      { kind: "bool", prop: "disabled", label: "disabled", def: false },
      { kind: "bool", prop: "numeric", label: "numeric", def: false },
    ],
    render: (st) => (
      <Box style={{ width: "16rem" }}>
        <Field placeholder={s(st.placeholder)} status={s(st.status) as "default" | StatusName} disabled={b(st.disabled)} numeric={b(st.numeric)} />
      </Box>
    ),
    code: (st) =>
      `<Field${A("placeholder", s(st.placeholder))}${AE("status", s(st.status), "default")}${A("disabled", b(st.disabled))}${A("numeric", b(st.numeric))} />`,
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    group: "Atoms",
    blurb: "켜고 끄는 네모. 라벨과 나란히 두면 통째로 누를 수 있다.",
    controls: [
      { kind: "bool", prop: "checked", label: "checked", def: true },
      { kind: "bool", prop: "disabled", label: "disabled", def: false },
      { kind: "text", prop: "label", label: "label", def: "동의합니다" },
    ],
    render: (st) => (
      <Inline as="label" gap="sm" align="center">
        <Checkbox checked={b(st.checked)} disabled={b(st.disabled)} readOnly />
        <Text variant="body" as="span">{s(st.label)}</Text>
      </Inline>
    ),
    code: (st) =>
      `<Inline as="label" gap="sm" align="center">\n  <Checkbox checked={${b(st.checked)}}${A("disabled", b(st.disabled))} />\n  <Text variant="body" as="span">${s(st.label)}</Text>\n</Inline>`,
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
    controls: [{ kind: "bool", prop: "disabled", label: "disabled", def: false }],
    render: (st) => (
      <Box style={{ width: "12rem" }}>
        <Select
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
      `<Select${A("disabled", b(st.disabled))}\n  options={[\n    { value: "a", label: "옵션 A" },\n    { value: "b", label: "옵션 B" },\n  ]}\n/>`,
  },
  {
    slug: "icon",
    name: "Icon",
    group: "Atoms",
    blurb: "24 그리드 stroke 아이콘. 자식 svg path 를 감싸 currentColor 로 그린다.",
    controls: [{ kind: "enum", prop: "ink", label: "잉크", options: ["base", "soft", "faint"], def: "base" }],
    render: (st) => (
      <Text ink={s(st.ink) as "base" | "soft" | "faint"} as="span">
        <Icon aria-label="정보">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </Icon>
      </Text>
    ),
    code: () => `<Icon aria-label="정보">\n  <circle cx="12" cy="12" r="9" />\n  <path d="M12 11v5M12 8h.01" />\n</Icon>`,
  },
  {
    slug: "divider",
    name: "Divider",
    group: "Atoms",
    blurb: "아주 옅은 가로 괘선. 선이 꼭 필요한 자리에만.",
    controls: [],
    render: () => (
      <Box style={{ width: "18rem" }}>
        <Stack gap="md">
          <Text variant="body" as="span">위</Text>
          <Divider />
          <Text variant="body" as="span">아래</Text>
        </Stack>
      </Box>
    ),
    code: () => `<Divider />`,
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
    ],
    render: (st) => (
      <Box style={{ width: "18rem" }}>
        <TextField label={s(st.label)} placeholder={s(st.placeholder)} hint={s(st.hint) || undefined} error={s(st.error) || undefined} />
      </Box>
    ),
    code: (st) =>
      `<TextField${A("label", s(st.label))}${A("placeholder", s(st.placeholder))}${A("hint", s(st.hint))}${A("error", s(st.error))} />`,
  },
  {
    slug: "card",
    name: "Card",
    group: "Molecules",
    blurb: "옅은 면으로 정의되는 칸. 선도 그림자도 없다.",
    controls: [
      { kind: "enum", prop: "radius", label: "radius", options: ["sm", "md", "lg"], def: "md" },
      { kind: "enum", prop: "padding", label: "padding", options: ["md", "lg", "xl"], def: "lg" },
    ],
    render: (st) => (
      <Card radius={s(st.radius) as "sm" | "md" | "lg"} padding={s(st.padding) as "md" | "lg" | "xl"} style={{ width: "18rem" }}>
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
    controls: [],
    render: () => <TabsDemo />,
    code: () =>
      `const [tab, setTab] = useState("one");\n<Tabs value={tab} onChange={setTab} items={[\n  { value: "one", label: "하나" },\n  { value: "two", label: "둘" },\n  { value: "three", label: "셋" },\n]} />`,
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

  // ─ Components ─
  {
    slug: "table",
    name: "Table",
    group: "Components",
    blurb: "column 을 data 로 받는다. numeric 열은 sans 그대로 tabular·우측정렬(등폭 아님).",
    controls: [],
    render: () => <TableDemo />,
    code: () =>
      `const columns = [\n  { key: "k", header: "키", render: (r) => r.k },\n  { key: "s", header: "상태", render: (r) => <Badge status={r.s}>{r.s}</Badge> },\n  { key: "n", header: "값", numeric: true, render: (r) => r.n.toLocaleString() },\n];\n<Table columns={columns} rows={rows} rowKey={(r) => r.id} />`,
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
];

// ── 상태가 필요한 미리보기(내부 컴포넌트) ────────────────────────────────────
const TabsDemo = () => {
  const [tab, setTab] = useState("one");
  return (
    <Tabs
      value={tab}
      onChange={setTab}
      items={[
        { value: "one", label: "하나" },
        { value: "two", label: "둘" },
        { value: "three", label: "셋" },
      ]}
    />
  );
};

type Row = { id: string; k: string; st: StatusName; n: number };
const TableDemo = () => {
  const columns: Column<Row>[] = [
    { key: "k", header: "키", render: (r) => <Text variant="body" as="span">{r.k}</Text> },
    { key: "st", header: "상태", render: (r) => <Badge status={r.st}>{r.st}</Badge> },
    { key: "n", header: "값", numeric: true, render: (r) => <Text variant="body" as="span">{r.n.toLocaleString()}</Text> },
  ];
  const rows: Row[] = [
    { id: "1", k: "PG-1", st: "info", n: 1240 },
    { id: "2", k: "PG-2", st: "success", n: 88 },
    { id: "3", k: "PG-3", st: "danger", n: 5 },
  ];
  return (
    <Box paper="subtle" radius="md" style={{ overflow: "hidden", width: "28rem", maxWidth: "100%" }}>
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
