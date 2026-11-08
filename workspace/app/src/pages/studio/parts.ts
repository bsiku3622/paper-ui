// What the studio offers to set on a picked part: the props of each Paper part, with the options each one has. The options are the
// system's own vocabulary (/tokens), so nothing can be set that the part cannot do. A page may bring specs of its own parts too (the
// hello message); these are the ones Paper owns.

import {
  ACCENTS, ALIGNS, CHOICE_STATUSES, CONTROL_FONT_SIZES, CONTROL_SHAPES, CONTROL_SIZES, DIMENSIONS, DIVIDER_LEVELS, ELEVATIONS, ICON_SIZES, INKS, INPUT_VARIANTS, JUSTIFIES, LINK_UNDERLINES, ORIENTATIONS,
  SPACES, STATUSES, SURFACE_FILLS, SURFACE_RADII, SURFACE_THEMES, TEXT_FAMILIES, TEXT_VARIANTS, VARIANTS,
} from "@studio-baeks/paper-ui/tokens";

import type { PartSpec, PropDef } from "./protocol";

const choice = (key: string, label: string, options: readonly string[], note?: string): PropDef => ({ key, label, kind: "choice", options, note });
const toggle = (key: string, label: string, note?: string): PropDef => ({ key, label, kind: "switch", note });
const text = (key: string, label: string): PropDef => ({ key, label, kind: "text" });
const number = (key: string, label: string, min: number, max: number): PropDef => ({ key, label, kind: "number", min, max, step: 1 });

const variant = choice("variant", "무게", VARIANTS);
const size = choice("size", "크기", CONTROL_SIZES);
const shape = choice("shape", "모양", CONTROL_SHAPES);
const accent = choice("accent", "의미", ACCENTS);
const fontSize = choice("fontSize", "글자 크기", CONTROL_FONT_SIZES);
const disabled = toggle("disabled", "비활성");
const status = choice("status", "상태", STATUSES);
const inputFrame = [size, shape, choice("variant", "선", INPUT_VARIANTS), choice("fill", "면", SURFACE_FILLS), status, fontSize, disabled];
const box = [choice("padding", "안쪽 여백", SPACES), choice("paddingX", "좌우 여백", SPACES), choice("paddingY", "위아래 여백", SPACES)];
const flow = [choice("gap", "사이 간격", SPACES), ...box, choice("justify", "배치", JUSTIFIES)];

export const PAPER_SPECS: Record<string, PartSpec> = {
  Button: { label: "버튼", props: [variant, size, shape, accent, fontSize, toggle("strong", "굵게"), toggle("fullWidth", "전체 폭"), toggle("loading", "불러오는 중"), disabled] },
  IconButton: { label: "아이콘 버튼", props: [variant, size, shape, accent, choice("iconSize", "아이콘 크기", ICON_SIZES), disabled] },
  Text: { label: "글자", props: [choice("variant", "역할", TEXT_VARIANTS), choice("ink", "농도", INKS), choice("family", "서체", TEXT_FAMILIES), toggle("strong", "굵게"), toggle("numeric", "숫자 폭 맞춤"), toggle("truncate", "한 줄로 자르기")] },
  Icon: { label: "아이콘", props: [choice("size", "크기", ICON_SIZES), choice("ink", "농도", INKS)] },
  Surface: {
    label: "면",
    props: [
      choice("fill", "면", SURFACE_FILLS), toggle("border", "테두리"), toggle("shadow", "그림자", "면을 정해야 그림자가 생깁니다."), choice("radius", "모서리", SURFACE_RADII), choice("elevation", "높이", ELEVATIONS),
      choice("theme", "테마", SURFACE_THEMES), ...box, toggle("hoverable", "올렸을 때 반응"), toggle("selected", "선택됨"),
    ],
  },
  Paint: { label: "칠", props: [accent, variant, toggle("hoverable", "올렸을 때 반응"), toggle("selected", "선택됨")] },
  Box: { label: "상자", props: [...box, choice("width", "폭", [...DIMENSIONS, "full", "fit"]), choice("height", "높이", [...DIMENSIONS, "full", "fit"])] },
  Stack: { label: "세로로 쌓기", props: [...flow, choice("align", "맞춤", ALIGNS.filter((align) => align !== "baseline"))] },
  Inline: { label: "가로로 놓기", props: [...flow, choice("align", "맞춤", ALIGNS), toggle("wrap", "줄바꿈")] },
  Grid: { label: "격자", props: [...flow, choice("align", "맞춤", ALIGNS), text("columns", "열")] },
  Badge: { label: "배지", props: [accent, variant, size, shape, fontSize, toggle("dot", "점")] },
  Field: { label: "입력칸", props: [...inputFrame, text("placeholder", "안내 글자"), toggle("numeric", "숫자 폭 맞춤"), toggle("clearable", "지우기 버튼")] },
  Textarea: { label: "긴 입력칸", props: [size, choice("variant", "선", INPUT_VARIANTS), choice("fill", "면", SURFACE_FILLS), status, fontSize, disabled, number("rows", "줄 수", 1, 20), text("placeholder", "안내 글자")] },
  Select: { label: "고르기", props: inputFrame },
  Checkbox: { label: "체크박스", props: [size, choice("status", "상태", CHOICE_STATUSES), disabled] },
  Radio: { label: "라디오", props: [size, choice("status", "상태", CHOICE_STATUSES), disabled] },
  Switch: { label: "스위치", props: [size, choice("status", "상태", CHOICE_STATUSES), disabled] },
  Divider: { label: "구분선", props: [choice("orientation", "방향", ORIENTATIONS), choice("level", "농도", DIVIDER_LEVELS)] },
  Link: { label: "링크", props: [choice("underline", "밑줄", LINK_UNDERLINES)] },
  Label: { label: "라벨", props: [] },
  Marker: { label: "형광펜", props: [] },
  Spinner: { label: "도는 표시", props: [choice("size", "크기", [...CONTROL_SIZES, "inline"])] },
  SegmentControl: { label: "세그먼트", props: [size, toggle("fullWidth", "가로 꽉"), disabled] },
  Slider: { label: "슬라이더", props: [size, choice("status", "상태", CHOICE_STATUSES), disabled] },
};

export const specOf = (component: string, extra: Readonly<Record<string, PartSpec>> = {}): PartSpec | undefined => extra[component] ?? PAPER_SPECS[component];
