// The Shape tables and notes: the source numbers, the radius, the control geometry and the sizing. Only this file
// and the Shape inspector read the Shape source.
import { CONTROL_ICON, SHAPE_SOURCE, resolveRole } from "@paper-ui/inspect/shape";
import { tokens } from "@studio-baeks/paper-ui/tokens";

import type { GeneratedBlock } from "./markers";
import { table } from "./table";

const S = SHAPE_SOURCE;
const SIZES = ["sm", "md", "lg"] as const;
const entries = (record: Record<string, number | string>) => Object.entries(record).map(([key, value]) => `${key}${value}`).join(" · ");

// The insets are roles built on the control text line, so they are resolved from what the stylesheet emits.
const inset = (kind: "input" | "button", size: (typeof SIZES)[number]) => String(resolveRole(tokens.shape.control.inset[kind][size]));

const radiusRows = (): string[][] => [
  ["`radius.control`", String(S.radius.control), "Button · Field · Select · Textarea · Badge, 포커스 링"],
  ["`radius.selection`", String(S.radius.selection), "Checkbox"],
  ["`radius.surface.sm / md / lg`", `${S.radius.surface.sm} / ${S.radius.surface.md} / ${S.radius.surface.lg}`, "Surface의 `radius` prop"],
  ["`radius.full`", `${S.radius.full}px`, "알약, 원(Radio · Switch · Spinner)"],
];

const controlRows = (): string[][] => [
  ["`control.height`", ...SIZES.map((size) => String(S.control.height[size])), "원본"],
  ["`control.inset.input`", ...SIZES.map((size) => inset("input", size)), "(높이 − preset 글자 줄) / 2 — 입력값은 글자 줄 사방에 같은 여백"],
  ["`control.inset.button`", ...SIZES.map((size) => inset("button", size)), `(높이 − 버튼 글자 줄) / 2 × \`buttonInsetRatio\` ${S.control.buttonInsetRatio}, 1px로 반올림 — 라벨이 상자를 정의하므로 더 넓게`],
  ["`selection.size`", ...SIZES.map((size) => String(S.control.height[size] / 2)), "높이 / 2"],
  ["`control.icon`", ...SIZES.map((size) => String(S.icon[CONTROL_ICON[size]])), `높이를 따르는 icon 크기 (${Object.values(CONTROL_ICON).join(" · ")})`],
  ["`control.gap`", ...SIZES.map(() => String(S.space.sm)), "아이콘과 라벨 사이, inset sm"],
];

const sizingRows = (): string[][] => {
  const steps = (values: Record<string, number>) => Object.values(values).join(" · ");
  return [
    ["`icon.size`", Object.keys(S.icon).join(" · "), steps(S.icon)],
    ["`dimension.width`", "xs ~ xl", steps(S.dimension.width)],
    ["`dimension.height`", "xs ~ xl", steps(S.dimension.height)],
    ["`measure`", "xs ~ xl", `${steps(S.measure)} (${S.measure.xs / 16} ~ ${S.measure.xl / 16}rem)`],
  ];
};

const controlLine = () => {
  const { height, buttonInsetRatio } = S.control;
  const anatomy = S.anatomy.inline;
  return `높이 사다리(\`control.height\`: sm ${height.sm} · md ${height.md} · lg ${height.lg})와 button inset 배율(\`control.buttonInsetRatio\`: ${buttonInsetRatio})이고, \`anatomy\`는 Badge 높이·inset(\`anatomy.badge\`)과 inline 점 · spinner 크기(\`anatomy.inline\`: ${anatomy.dot}em · ${anatomy.spinner}em)입니다.`;
};

export const SHAPE_BLOCKS: GeneratedBlock[] = [
  { id: "shape-radius", files: ["docs/foundations/shape.md"], render: () => table(["역할", "값", "쓰는 곳"], radiusRows()) },
  { id: "shape-control", files: ["docs/foundations/shape.md"], render: () => table(["역할", "sm", "md", "lg", "식"], controlRows()) },
  { id: "shape-sizing", files: ["docs/foundations/shape.md"], render: () => table(["역할", "단계", "dp"], sizingRows()) },
  { id: "shape-source", files: ["AGENTS.md", "docs/foundations/shape.md"], inline: true, render: controlLine },
  { id: "agents-scale", files: ["AGENTS.md"], inline: true, render: () => `\`${entries(S.space)}\`` },
];
