// 컴포넌트 상세 registry — prop 토글로 살아 있는 미리보기와 코드가 함께 움직인다.
//
// 한 컴포넌트를 데이터로 기술한다: 어떤 prop 을 만질 수 있고(controls), 지금 상태로
// 무엇을 그리며(render), 그 상태의 코드가 무엇인지(code). Detail 페이지는 이 셋을
// 읽어 preview·controls·code 세 판을 세운다. render 와 code 가 같은 상태를 보므로
// 화면과 코드가 어긋날 수 없다.

import type { ReactNode } from "react";
import { GridExample, PressExample, HoverExample, ToggleExample, DragExample, DropExample, FocusExample, HiddenExample, RovingExample, ToggleGroupExample, OverlayExample, FormFieldExample, CompositionExample } from "./primitive-examples";

import {
  Badge, Box, Button, Checkbox, Divider, Field, Icon, IconButton, Inline, Label,
  Link, Select, Stack, Text, Textarea, Switch, Radio, Spinner,
  type BoxDimension, type Surface, type Accent, type Variant, type Ink,
  type StatusName, type TextVariant,
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
  group: "Layout" | "Content" | "Interaction" | "A11y" | "Atoms";
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
  {
    slug: "roving-focus", name: "RovingFocus", group: "A11y", change: "new", blurb: "그룹의 Tab 진입점을 하나로 유지합니다. 방향키·Home·End, RTL, 비활성 항목, 제거 후 focus 이동을 관리합니다.",
    controls: [{ kind: "enum", prop: "orientation", label: "orientation", options: ["horizontal", "vertical", "both"], def: "horizontal" }, { kind: "enum", prop: "dir", label: "dir", options: ["ltr", "rtl"], def: "ltr" }, { kind: "bool", prop: "loop", label: "loop", def: true }],
    render: (st) => <RovingExample orientation={s(st.orientation) as "horizontal" | "vertical" | "both"} dir={s(st.dir) as "ltr" | "rtl"} loop={b(st.loop)} />,
    code: (st) => `<RovingFocus role="toolbar" aria-label="텍스트 도구"${AE("orientation", s(st.orientation), "horizontal")}${AE("dir", s(st.dir), "ltr")}${A("loop", st.loop)}>\n  <RovingFocus.Item value="bold">굵게</RovingFocus.Item>\n  <RovingFocus.Item value="underline">밑줄</RovingFocus.Item>\n</RovingFocus>`,
  },
  {
    slug: "toggle-group", name: "ToggleGroup", group: "Interaction", change: "new", blurb: "Toggle 버튼의 단일·복수 선택과 그룹 focus 탐색을 연결합니다. 선택과 focus는 별도 상태입니다.",
    controls: [{ kind: "enum", prop: "selectionMode", label: "selectionMode", options: ["single", "multiple"], def: "single" }, { kind: "bool", prop: "selectionRequired", label: "selectionRequired", def: false }, { kind: "bool", prop: "disabled", label: "disabled", def: false }],
    render: (st) => <ToggleGroupExample selectionMode={s(st.selectionMode) as "single" | "multiple"} selectionRequired={b(st.selectionRequired)} disabled={b(st.disabled)} />,
    code: (st) => `<ToggleGroup aria-label="정렬 선택" selectionMode="${s(st.selectionMode)}"${A("selectionRequired", st.selectionRequired)}${A("disabled", st.disabled)}>\n  <ToggleGroup.Item value="left">왼쪽</ToggleGroup.Item>\n  <ToggleGroup.Item value="center">가운데</ToggleGroup.Item>\n</ToggleGroup>`,
  },
  {
    slug: "overlay", name: "Overlay", group: "Interaction", change: "new", blurb: "Trigger·Content·Close로 열린 상태, Portal, 배치, 중첩 닫기와 focus 복원을 연결합니다. modal은 배경 조작과 스크롤을 차단합니다.",
    controls: [{ kind: "bool", prop: "modal", label: "modal", def: false }, { kind: "bool", prop: "dismissable", label: "dismissable", def: true }],
    render: (st) => <OverlayExample modal={b(st.modal)} dismissable={b(st.dismissable)} />,
    code: (st) => `<Overlay${A("modal", st.modal)}>\n  <Overlay.Trigger>설정 열기</Overlay.Trigger>\n  <Overlay.Content aria-label="설정" dismissable={${b(st.dismissable)}}>\n    <Overlay.Close>닫기</Overlay.Close>\n  </Overlay.Content>\n</Overlay>`,
  },
  {
    slug: "form-field", name: "FormField", group: "A11y", change: "new", blurb: "Label·입력·설명·오류의 ID 관계를 연결합니다. 입력 종류와 시각적 상태는 기존 Atom이 소유합니다.",
    controls: [{ kind: "bool", prop: "disabled", label: "disabled", def: false }, { kind: "bool", prop: "required", label: "required", def: true }],
    render: (st) => <FormFieldExample disabled={b(st.disabled)} required={b(st.required)} />,
    code: (st) => `<FormField label="이메일" description="연락받을 이메일"${A("required", st.required)}${A("disabled", st.disabled)}>\n  {({ controlProps }) => <Field {...controlProps} type="email" />}\n</FormField>`,
  },
  {
    slug: "composition", name: "Composition", group: "Interaction", change: "new", blurb: "mergeProps는 이벤트를 병합하고 mergeRefs는 같은 요소를 연결합니다. composeEventHandlers는 preventDefault로 내부 동작을 취소하는 경로입니다.", controls: [],
    render: () => <CompositionExample />,
    code: () => `<Box as="button" {...mergeProps(pressProps, hoverProps, focusProps)} ref={mergeRefs(ref, forwardedRef)} type="button">실행</Box>`,
  },
  {
    slug: "grid", name: "Grid", group: "Layout", change: "new", blurb: "Box의 면·간격·ref 계약에 grid 배치를 더합니다. columns는 양의 정수 또는 CSS track 선언입니다.",
    controls: [{ kind: "enum", prop: "columns", label: "columns", options: ["1", "2", "3"], def: "3" }],
    render: (st) => <GridExample columns={Number(st.columns)} />,
    code: (st) => `<Grid columns={${Number(st.columns)}} gap="sm">…</Grid>`,
  },
  {
    slug: "pressable", name: "Pressable", group: "Interaction", change: "new", blurb: "Native button의 입력을 press 이벤트로 통합합니다. Paper의 색·크기를 선택하지 않고 pressed·hovered·focus-visible 상태를 제공합니다.",
    controls: [{ kind: "bool", prop: "disabled", label: "disabled", def: false }],
    render: (st) => <PressExample disabled={b(st.disabled)} />,
    code: (st) => `<Pressable${A("disabled", st.disabled)} onPress={handlePress}>실행</Pressable>`,
  },
  {
    slug: "hoverable", name: "Hoverable", group: "Interaction", change: "new", blurb: "포인터 hover 상태와 이벤트를 제공합니다. 자체 button 역할이나 tab stop을 만들지 않습니다. as로 기존 요소에 합성합니다.",
    controls: [{ kind: "bool", prop: "disabled", label: "disabled", def: false }],
    render: (st) => <HoverExample disabled={b(st.disabled)} />,
    code: (st) => `<Hoverable${A("disabled", st.disabled)}>{({ isHovered }) => isHovered ? "Hover 중" : "포인터를 올려보세요"}</Hoverable>`,
  },
  {
    slug: "toggleable", name: "Toggleable", group: "Interaction", change: "new", blurb: "유지되는 boolean 선택 상태를 가진 native toggle button입니다. selected/defaultSelected/onSelectedChange와 aria-pressed를 연결합니다.",
    controls: [{ kind: "bool", prop: "disabled", label: "disabled", def: false }, { kind: "bool", prop: "defaultSelected", label: "defaultSelected", def: false }],
    render: (st) => <ToggleExample disabled={b(st.disabled)} defaultSelected={b(st.defaultSelected)} />,
    code: (st) => `<Toggleable${A("disabled", st.disabled)}${A("defaultSelected", st.defaultSelected)}>선택</Toggleable>`,
  },
  {
    slug: "draggable", name: "Draggable", group: "Interaction", change: "new", preview: "flush", blurb: "move 모드의 자유 이동과 transfer 모드의 데이터 전달을 구분합니다. Handle은 입력 대상이고 전체 박스가 drag 대상입니다.",
    controls: [{ kind: "bool", prop: "disabled", label: "disabled", def: false }, { kind: "enum", prop: "activation", label: "activation", options: ["handle", "surface"], def: "handle" }, { kind: "enum", prop: "axis", label: "axis", options: ["both", "x", "y"], def: "both" }],
    render: (st) => <DragExample disabled={b(st.disabled)} activation={s(st.activation) as "handle" | "surface"} axis={s(st.axis) as "both" | "x" | "y"} />,
    code: (st) => `<Draggable activation="${s(st.activation)}" axis="${s(st.axis)}"${A("disabled", st.disabled)}>
  <Draggable.Handle aria-label="패널 이동">⠿</Draggable.Handle>
  <Text>이동할 박스</Text>
</Draggable>`,
  },
  {
    slug: "droppable", name: "Droppable", group: "Interaction", change: "new", blurb: "transfer drag 데이터를 받는 대상입니다. 수용 가능한 데이터 형식과 copy/move 작업을 결정하고 native 또는 키보드 drop을 처리합니다.",
    controls: [{ kind: "bool", prop: "disabled", label: "disabled", def: false }],
    render: (st) => <DropExample disabled={b(st.disabled)} />,
    code: (st) => `<Draggable mode="transfer" activation="handle" getItems={() => [{ "text/plain": "Paper item" }]}${A("disabled", st.disabled)}>
  <Draggable.Handle aria-label="항목 전달">⠿</Draggable.Handle>
</Draggable>
<Droppable aria-label="항목 받기" onDrop={handleDrop}${A("disabled", st.disabled)}>여기에 놓으세요</Droppable>`,
  },
  {
    slug: "focus-scope", name: "FocusScope", group: "A11y", change: "new", blurb: "자식의 초기 포커스, 범위 내 포커스 유지, 해제 후 원래 요소로의 복귀를 독립적으로 선택합니다.", controls: [], render: () => <FocusExample />,
    code: () => `<FocusScope contain restoreFocus autoFocus>
  <Field aria-label="첫 입력" />
  <Button onClick={close}>닫기</Button>
</FocusScope>`,
  },
  {
    slug: "visually-hidden", name: "VisuallyHidden", group: "A11y", change: "new", blurb: "콘텐츠를 화면에서 숨기고 접근성 트리에 유지합니다. isFocusable은 skip link처럼 포커스될 때 보이는 콘텐츠를 만듭니다.", controls: [], render: () => <HiddenExample />,
    code: () => `<Pressable>
  <Icon>…</Icon>
  <VisuallyHidden>새 항목 추가</VisuallyHidden>
</Pressable>`,
  },

  // ─ Primitives ─
  {
    slug: "text",
    name: "Text",
    group: "Content",
    blurb: "일곱 variant 로 제목 위계와 텍스트 역할을 정한다. variant 가 크기·굵기·잉크를, family 가 서체(sans·mono)를 정한다.",
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
    group: "Layout",
    blurb: "구조 패널. radius sm/md/lg는 4/6/8px. surface·border·radius·shadow와 padding을 얹고, width·height·min/max·overflow로 box model을 정한다. sm~xl 크기는 layout token, 실제 CSS 길이는 화면 고유 layout의 escape hatch다. 색과 flex/position 책임은 열지 않는다.",
    controls: [
      { kind: "enum", prop: "surface", label: "surface", options: ["none", "raised", "canvas", "sunken"], def: "raised" },
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
    group: "Layout",
    blurb: "세로로 쌓는다. gap 으로 사이 간격을, align 으로 가로 정렬을 정한다.",
    controls: [
      { kind: "enum", prop: "gap", label: "gap", options: ["xs", "sm", "md", "lg", "xl"], def: "md" },
      { kind: "enum", prop: "align", label: "align", options: ["stretch", "start", "center", "end"], def: "stretch" },
    ],
    render: (st) => (
      <Stack gap={s(st.gap) as "xs" | "sm" | "md" | "lg" | "xl"} align={s(st.align) as "start" | "center" | "end" | "stretch"} style={{ width: "12rem" }}>
        {["하나", "둘", "셋"].map((t) => (
          <Box key={t} surface="sunken" radius="sm" padding="sm">
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
    group: "Layout",
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
          <Box key={t} surface="sunken" radius="sm" padding="sm">
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
    blurb: "accent × variant가 독립된 시각 무게 축이다. primary도 neutral accent family라 모든 accent가 같은 five-slot contract를 공유한다. fontSize는 버튼 실루엣과 별도로 조절한다. 기본 height는 30/32/36, radius는 4, inline padding은 10/11/14입니다.",
    controls: [
      { kind: "enum", prop: "accent", label: "accent", options: ["primary", "info", "success", "warning", "error"], def: "primary" },
      { kind: "enum", prop: "variant", label: "variant", options: ["solid", "soft", "hairline", "ghost", "muted"], def: "solid" },
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
      { kind: "enum", prop: "fontSize", label: "fontSize", options: ["default", "label", "caption", "body"], def: "default" },
      { kind: "bool", prop: "loading", label: "loading", def: false },
      { kind: "bool", prop: "fullWidth", label: "fullWidth", def: false },
      { kind: "enum", prop: "shape", label: "shape", options: ["rounded", "pill"], def: "rounded" },
      { kind: "bool", prop: "disabled", label: "disabled", def: false },
      { kind: "text", prop: "children", label: "children", def: "버튼" },
    ],
    render: (st) => {
      const common = {
        accent: s(st.accent) as Accent,
        variant: s(st.variant) as Variant,
        size: s(st.size) as "sm" | "md" | "lg",
        fontSize: st.fontSize === "default" ? undefined : (s(st.fontSize) as TextVariant),
        loading: b(st.loading),
        fullWidth: b(st.fullWidth),
        shape: s(st.shape) as "rounded" | "pill",
        disabled: b(st.disabled),
      };
      return <Button {...common}>{s(st.children)}</Button>;
    },
    code: (st) => {
      return `<Button${AE("accent", s(st.accent), "primary")}${AE("variant", s(st.variant), "solid")}${AE("size", s(st.size), "md")}${AE("fontSize", s(st.fontSize), "default")}${A("loading", b(st.loading))}${A("fullWidth", b(st.fullWidth))}${AE("shape", s(st.shape), "rounded")}${A("disabled", b(st.disabled))}>${s(st.children)}</Button>`;
    },
  },
  {
    slug: "iconbutton",
    change: "new",
    name: "IconButton",
    group: "Atoms",
    blurb: "아이콘만 담는 정사각 버튼. Button과 분리해 iconSize와 접근성 이름을 명시한다.",
    controls: [
      { kind: "enum", prop: "accent", label: "accent", options: ["primary", "info", "success", "warning", "error"], def: "primary" },
      { kind: "enum", prop: "variant", label: "variant", options: ["solid", "soft", "hairline", "ghost", "muted"], def: "solid" },
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
      { kind: "enum", prop: "iconSize", label: "iconSize", options: ["label", "caption", "body", "heading3"], def: "body" },
      { kind: "bool", prop: "disabled", label: "disabled", def: false },
    ],
    render: (st) => (
      <IconButton accent={s(st.accent) as Accent} variant={s(st.variant) as Variant} size={s(st.size) as "sm" | "md" | "lg"} iconSize={s(st.iconSize) as "label" | "caption" | "body" | "heading3"} disabled={b(st.disabled)} aria-label="추가">
        <Icon><path d="M12 5v14M5 12h14" /></Icon>
      </IconButton>
    ),
    code: (st) => `<IconButton${AE("accent", s(st.accent), "primary")}${AE("variant", s(st.variant), "solid")}${AE("size", s(st.size), "md")}${AE("iconSize", s(st.iconSize), "body")}${A("disabled", b(st.disabled))} aria-label="추가"><Icon>…</Icon></IconButton>`,
  },
  {
    slug: "badge",
    change: "mod",
    name: "Badge",
    group: "Atoms",
    blurb: "상태 한 낱말. accent × variant(solid·soft·hairline·ghost) + 중립 보조 텍스트 muted. dot 으로 앞에 상태 점. 표시용이라 hover 없음.",
    controls: [
      { kind: "enum", prop: "accent", label: "accent", options: ["primary", "info", "success", "warning", "error"], def: "primary" },
      { kind: "enum", prop: "variant", label: "variant", options: ["soft", "solid", "hairline", "ghost", "muted"], def: "soft" },
      { kind: "bool", prop: "dot", label: "dot", def: false },
      { kind: "enum", prop: "size", label: "size", options: ["sm", "md", "lg"], def: "md" },
      { kind: "enum", prop: "fontSize", label: "fontSize", options: ["default", "label", "caption", "body"], def: "default" },
      { kind: "enum", prop: "shape", label: "shape", options: ["rounded", "pill"], def: "rounded" },
      { kind: "text", prop: "children", label: "children", def: "진행" },
    ],
    render: (st) => (
      <Badge accent={s(st.accent) as Accent} variant={s(st.variant) as Variant} dot={b(st.dot)} size={s(st.size) as "sm" | "md" | "lg"} fontSize={st.fontSize === "default" ? undefined : (s(st.fontSize) as TextVariant)} shape={s(st.shape) as "rounded" | "pill"}>{s(st.children)}</Badge>
    ),
    code: (st) => `<Badge${AE("accent", s(st.accent), "primary")}${AE("variant", s(st.variant), "soft")}${A("dot", b(st.dot))}${AE("size", s(st.size), "md")}${AE("fontSize", s(st.fontSize), "default")}${AE("shape", s(st.shape), "rounded")}>${s(st.children)}</Badge>`,
  },
  {
    slug: "field",
    name: "Field",
    group: "Atoms",
    blurb: "input group — raised/sunken surface와 leading/trailing 어도먼트(아이콘·$·단위), clear(×), 비밀번호 보기를 조합한다. 래퍼가 테두리·키보드 focus ring·상태를 맡고 내부 input은 입력과 caret 렌더링을 맡는다. 공통 height 30/32/36 · radius 4 · 입력 padding 7/8/10.",
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
      { kind: "enum", prop: "fontSize", label: "fontSize", options: ["default", "label", "caption", "body"], def: "default" },
      { kind: "enum", prop: "shape", label: "shape", options: ["rounded", "pill"], def: "rounded" },
      { kind: "enum", prop: "surface", label: "surface", options: ["raised", "sunken"], def: "raised" },
      { kind: "bool", prop: "disabled", label: "disabled", def: false },
      { kind: "bool", prop: "numeric", label: "numeric", def: false },
    ],
    render: (st) => (
      <Box style={{ width: "18rem" }}>
        <Field
          placeholder={s(st.placeholder)}
          type={s(st.type)}
          leading={b(st.leading) ? <Icon size="caption"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon> : undefined}
          trailing={b(st.trailing) ? <Text variant="caption" as="span" ink="faint">kg</Text> : undefined}
          clearable={b(st.clearable)}
          showPasswordToggle={b(st.showPasswordToggle)}
          defaultValue={b(st.clearable) ? "지울 값" : undefined}
          align={s(st.align) as "start" | "center" | "end"}
          status={s(st.status) as "default" | StatusName}
          size={s(st.size) === "default" ? undefined : s(st.size) as "sm" | "md" | "lg"}
          fontSize={st.fontSize === "default" ? undefined : (s(st.fontSize) as TextVariant)}
          shape={s(st.shape) === "default" ? undefined : s(st.shape) as "rounded" | "pill"}
          surface={s(st.surface) as "raised" | "sunken"}
          disabled={b(st.disabled)}
          numeric={b(st.numeric)}
        />
      </Box>
    ),
    code: (st) =>
      `<Field${A("placeholder", s(st.placeholder))}${AE("type", s(st.type), "text")}${b(st.leading) ? " leading={<Icon>…</Icon>}" : ""}${b(st.trailing) ? ' trailing={<Text ink="faint">kg</Text>}' : ""}${A("clearable", b(st.clearable))}${A("showPasswordToggle", b(st.showPasswordToggle))}${AE("align", s(st.align), "start")}${AE("status", s(st.status), "default")}${AE("size", s(st.size), "md")}${AE("fontSize", s(st.fontSize), "default")}${AE("shape", s(st.shape), "rounded")}${AE("surface", s(st.surface), "raised")}${A("disabled", b(st.disabled))}${A("numeric", b(st.numeric))} />`,
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
      { kind: "enum", prop: "fontSize", label: "fontSize", options: ["default", "label", "caption", "body"], def: "default" },
      { kind: "enum", prop: "shape", label: "shape", options: ["rounded", "pill"], def: "rounded" },
      { kind: "bool", prop: "disabled", label: "disabled", def: false },
    ],
    render: (st) => (
      <Box style={{ width: "12rem" }}>
        <Select
          size={s(st.size) === "default" ? undefined : s(st.size) as "sm" | "md" | "lg"}
          fontSize={st.fontSize === "default" ? undefined : (s(st.fontSize) as TextVariant)}
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
      `<Select${st.size === "default" ? "" : AE("size", s(st.size), "md")}${AE("fontSize", s(st.fontSize), "default")}${st.shape === "default" ? "" : AE("shape", s(st.shape), "rounded")}${A("disabled", b(st.disabled))}>\n  <Select.Option value="a">옵션 A</Select.Option>\n  <Select.Group label="추가 옵션">\n    <Select.Option value="b">옵션 B</Select.Option>\n  </Select.Group>\n</Select>`,
  },
  {
    slug: "icon",
    name: "Icon",
    group: "Content",
    blurb: "Primitive 아이콘. typography ladder 이름(label·caption·body·heading3)으로 아트보드 크기를 고르고 currentColor 또는 ink로 그린다.",
    controls: [
      { kind: "enum", prop: "ink", label: "ink", options: ["default", "base", "soft", "faint", "info", "success", "warning", "error"], def: "default" },
      { kind: "enum", prop: "size", label: "size", options: ["label", "caption", "body", "heading3"], def: "body" },
    ],
    render: (st) => (
      <Icon aria-label="정보" ink={st.ink === "default" ? undefined : (s(st.ink) as Ink)} size={s(st.size) as "label" | "caption" | "body" | "heading3"}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </Icon>
    ),
    code: (st) => `<Icon aria-label="정보"${AE("ink", s(st.ink), "default")}${AE("size", s(st.size), "body")}>\n  <circle cx="12" cy="12" r="9" />\n  <path d="M12 11v5M12 8h.01" />\n</Icon>`,
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
      { kind: "enum", prop: "fontSize", label: "fontSize", options: ["default", "label", "caption", "body"], def: "default" },
      { kind: "bool", prop: "disabled", label: "disabled", def: false },
    ],
    render: (st) => (
      <Box style={{ width: "18rem" }}>
        <Textarea placeholder={s(st.placeholder)} status={s(st.status) as "default" | StatusName} size={s(st.size) as "sm" | "md" | "lg"} fontSize={st.fontSize === "default" ? undefined : (s(st.fontSize) as TextVariant)} disabled={b(st.disabled)} rows={3} />
      </Box>
    ),
    code: (st) =>
      `<Textarea${A("placeholder", s(st.placeholder))}${AE("status", s(st.status), "default")}${AE("size", s(st.size), "md")}${AE("fontSize", s(st.fontSize), "default")}${A("disabled", b(st.disabled))} />`,
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
    blurb: "여럿 중 하나를 고르는 개별 입력입니다. 관련 선택지는 화면에서 묶습니다.",
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

];

export const bySlug = (slug: string): CompSpec | undefined => COMPONENTS.find((c) => c.slug === slug);

export const GROUPS: CompSpec["group"][] = ["Layout", "Content", "Interaction", "A11y", "Atoms"];

export const defaultState = (spec: CompSpec): State => {
  const st: State = {};
  for (const c of spec.controls) st[c.prop] = c.def;
  return st;
};
