// The Typography tables: the Palette as authored, and the roles and presets that choose from it.
import { PRESET_SPEC, ROLE_SPEC, TEXT_INK, TYPOGRAPHY_SOURCE } from "@paper-ui/inspect/typography";

import type { GeneratedBlock } from "./markers";
import { ROLE_TAGS, ROLE_USES, PRESET_USES, type PresetName } from "./notes";
import { table } from "./table";

const S = TYPOGRAPHY_SOURCE;
const FLUID = S.fluid.hero;
const weightOf = (name: keyof typeof S.weight) => S.weight[name];
const em = (value: number) => (value === 0 ? "0" : `${value < 0 ? "−" : ""}${Math.abs(value)}em`);
const names = (record: Record<string, unknown>) => Object.keys(record);

const sizeOf = (size: keyof typeof S.fontSize | "hero") => (size === "hero" ? `${FLUID.min}–${FLUID.max} 유동` : String(S.fontSize[size]));
const leadingOf = (leading: keyof typeof S.leading | "hero") => (leading === "hero" ? String(FLUID.leading) : String(S.leading[leading]));

const byValue = (record: Record<string, number>) => Object.keys(record).sort((a, b) => record[a]! - record[b]!);

const paletteRows = (): string[][] => [
  ["`fontSize`", `${names(S.fontSize).join(" · ")}, 유동 단계 \`hero\``],
  ["`leading`", `${names(S.leading).join(" · ")}, 단위 없는 \`hero\` ${FLUID.leading}`],
  ["`weight`", byValue(S.weight).map((name) => `\`${name}\` ${weightOf(name as keyof typeof S.weight)}`).join(" · ")],
  ["`tracking`", names(S.tracking).map((name) => `\`${name}\` ${em(S.tracking[name as keyof typeof S.tracking])}`).join(" · ")],
  ["`family`", names(S.family).map((name) => `\`${name}\``).join(" · ")],
  ["`decoration`", `\`underlineOffset\` ${em(S.decoration.underlineOffset)}`],
  ["`monoSizeScale`", String(S.monoSizeScale)],
  ["`codeScale`", `\`inline\` ${S.codeScale.inline} · \`compact\` ${S.codeScale.compact}`],
];

const roleRows = (): string[][] =>
  (Object.keys(ROLE_SPEC) as (keyof typeof ROLE_SPEC)[]).map((role) => {
    const spec = ROLE_SPEC[role];
    return [
      `\`${role}\``,
      `${sizeOf(spec.size as keyof typeof S.fontSize)} / ${leadingOf(spec.leading as keyof typeof S.leading)}`,
      String(weightOf(spec.weight)),
      spec.tracking,
      TEXT_INK[role],
      ROLE_TAGS[role],
      ROLE_USES[role],
    ];
  });

type Step = { size: keyof typeof S.fontSize; weight: keyof typeof S.weight; leading: keyof typeof S.leading; inputLeading?: keyof typeof S.leading };
type Ladder = Record<"sm" | "md" | "lg", Step>;

const presetCell = ({ size, weight, leading }: Step, extra = "") => `${S.fontSize[size]} / ${S.leading[leading]} · ${weightOf(weight)}${extra}`;

const presetRows = (): string[][] => {
  const row = (name: PresetName, ladder: Ladder, extra: (step: Step) => string = () => ""): string[] => [
    `\`${name}\``,
    presetCell(ladder.sm, extra(ladder.sm)),
    presetCell(ladder.md, extra(ladder.md)),
    presetCell(ladder.lg, extra(ladder.lg)),
    PRESET_USES[name],
  ];
  const inputLine = ({ inputLeading }: Step) => (inputLeading === undefined ? "" : ` · 입력 줄상자 ${S.leading[inputLeading]}`);
  return [
    row("button.medium", PRESET_SPEC.button.medium),
    row("button.strong", PRESET_SPEC.button.strong),
    row("field", PRESET_SPEC.field, inputLine),
    row("textarea", PRESET_SPEC.textarea),
    ["`badge`", `${presetCell(PRESET_SPEC.badge)} (크기 무관)`, "", "", PRESET_USES.badge],
  ];
};

const controlSizes = () => `${S.fontSize[PRESET_SPEC.button.medium.sm.size]} · ${S.fontSize[PRESET_SPEC.button.medium.md.size]} · ${S.fontSize[PRESET_SPEC.button.medium.lg.size]}`;
const roleSize = (role: keyof typeof ROLE_SPEC) => (ROLE_SPEC[role].size === "hero" ? `${FLUID.min}–${FLUID.max} 유동` : String(S.fontSize[ROLE_SPEC[role].size as keyof typeof S.fontSize]));

export const LADDER_BLOCK: GeneratedBlock = {
  id: "agents-ladder",
  files: ["AGENTS.md"],
  render: () => `\`${(Object.keys(ROLE_SPEC) as (keyof typeof ROLE_SPEC)[]).map((role) => `${role} ${roleSize(role)}`).join(" · ")}\`, 컨트롤 글자는 preset으로 \`${controlSizes()}\`.`,
};

export const TYPOGRAPHY_BLOCKS: GeneratedBlock[] = [
  LADDER_BLOCK,
  { id: "typography-palette", files: ["docs/foundations/typography.md"], render: () => table(["축", "값"], paletteRows()) },
  { id: "typography-roles", files: ["docs/foundations/typography.md"], render: () => table(["역할", "크기 / 행간", "굵기", "자간", "기본 잉크", "기본 태그", "쓰는 곳"], roleRows()) },
  {
    id: "typography-presets",
    files: ["docs/foundations/typography.md"],
    render: () => table(["preset", "sm", "md", "lg", "쓰는 Atom"], presetRows()),
  },
];
