import type { TextVariant } from "@studio-baeks/paper-ui/tokens";
import { CODE_SPEC, PRESET_SPEC, ROLE_SPEC, TYPOGRAPHY_SOURCE } from "@paper-ui/inspect/typography";

import type { Bilingual } from "../../site/locale";
import { valueAt } from "./paths";

type FontSize = keyof typeof TYPOGRAPHY_SOURCE.fontSize | keyof typeof TYPOGRAPHY_SOURCE.fluid;
type Leading = keyof typeof TYPOGRAPHY_SOURCE.leading | keyof typeof TYPOGRAPHY_SOURCE.fluid;

export const SIZE_LEADING = Object.fromEntries([...Object.values(PRESET_SPEC.button), ...Object.values(ROLE_SPEC)].map((spec) => [spec.size, spec.leading])) as Record<FontSize, Leading>;

type FluidStep = keyof typeof TYPOGRAPHY_SOURCE.fluid;
const FLUID_SPECIMENS: Record<FluidStep, { palette: string }> = { hero: { palette: "Aa 가나" } };
export const FLUID_STEPS = Object.fromEntries(
  Object.entries(TYPOGRAPHY_SOURCE.fluid).map(([name, step]) => [name, { span: `${step.min}–${step.max}px`, leading: String(step.leading), ...FLUID_SPECIMENS[name as FluidStep] }]),
) as Record<FluidStep, { span: string; leading: string; palette: string }>;
export const fluidStepOf = (size: string) => (size in FLUID_STEPS ? FLUID_STEPS[size as FluidStep] : undefined);
export const fluidRole = (variant: TextVariant) => fluidStepOf(ROLE_SPEC[variant].size);

type PresetPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends { sm: unknown } | { size: unknown } ? `${Prefix}${K}` : PresetPaths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];
export type PresetPath = PresetPaths<typeof PRESET_SPEC>;

const walk = (tree: object, prefix: string): string[] =>
  Object.entries(tree).flatMap(([key, value]) => ("sm" in value || "size" in value ? [`${prefix}${key}`] : walk(value, `${prefix}${key}.`)));

export const PRESET_PATHS = walk(PRESET_SPEC, "") as PresetPath[];
export const isLadder = (path: PresetPath): boolean => "sm" in (valueAt(PRESET_SPEC, path) as object);

export const CODE_SCALE_NOTES: Record<keyof typeof TYPOGRAPHY_SOURCE.codeScale, Bilingual> = {
  inline: { ko: "문단 속 코드가 둘러싼 글자에서 줄어드는 비율", en: "How much code in a paragraph shrinks from the text around it" },
  compact: { ko: "표 칸 속 코드가 둘러싼 글자에서 줄어드는 비율", en: "How much code in a table cell shrinks from the text around it" },
};

export const CODE_BLOCK = { spec: CODE_SPEC.block, note: { ko: "코드 블록의 글자와 줄 — 문단 속 코드와 달리 자기 크기를 갖는 mono", en: "The text and line of a code block: mono with a size of its own, unlike code in a paragraph" } };

export const PRESET_NOTES: Record<PresetPath, { role: Bilingual; sample: string }> = {
  button: { role: { ko: "Button · IconButton", en: "Button · IconButton" }, sample: "Continue" },
  field: { role: { ko: "Field · Input / Select", en: "Field · Input / Select" }, sample: "Search projects" },
  textarea: { role: { ko: "Textarea", en: "Textarea" }, sample: "Add a description" },
  badge: { role: { ko: "크기와 무관한 고정 표식", en: "A fixed mark, independent of size" }, sample: "In progress" },
};
