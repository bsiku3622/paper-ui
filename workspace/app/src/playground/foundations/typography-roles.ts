// The Typography inspector's data, read from the specs that choose from the palette: the leading each
// font size is shown on, and the preset rows with what each one is for.

import { CODE_SPEC, PRESET_SPEC, ROLE_SPEC, TYPOGRAPHY_SOURCE, type TextVariant } from "../../../../packages/paper-ui/src/tokens/typography";
import { valueAt } from "./paths";

type FontSize = keyof typeof TYPOGRAPHY_SOURCE.fontSize | keyof typeof TYPOGRAPHY_SOURCE.fluid;
type Leading = keyof typeof TYPOGRAPHY_SOURCE.leading | keyof typeof TYPOGRAPHY_SOURCE.fluid;

// Each font size is shown on the leading its role pairs it with.
export const SIZE_LEADING = Object.fromEntries(Object.values(ROLE_SPEC).map((spec) => [spec.size, spec.leading])) as Record<FontSize, Leading>;

// A fluid step is shown by the span it grows over and its unitless leading, not by the length it
// resolves to at this viewport — and by a specimen short enough to stand on one line at its largest.
type FluidStep = keyof typeof TYPOGRAPHY_SOURCE.fluid;
const FLUID_SPECIMENS: Record<FluidStep, { palette: string }> = { hero: { palette: "Aa 가나" } };
export const FLUID_STEPS = Object.fromEntries(
  Object.entries(TYPOGRAPHY_SOURCE.fluid).map(([name, step]) => [name, { span: `${step.min}–${step.max}px`, leading: String(step.leading), ...FLUID_SPECIMENS[name as FluidStep] }]),
) as Record<FluidStep, { span: string; leading: string; palette: string }>;
export const fluidStepOf = (size: string) => (size in FLUID_STEPS ? FLUID_STEPS[size as FluidStep] : undefined);
// The fluid step a role is set in, if it is set in one.
export const fluidRole = (variant: TextVariant) => fluidStepOf(ROLE_SPEC[variant].size);

type PresetPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends { sm: unknown } | { size: unknown } ? `${Prefix}${K}` : PresetPaths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];
export type PresetPath = PresetPaths<typeof PRESET_SPEC>;

// A preset is a size ladder or a single style; a group of ladders (Button's weights) walks one level deeper.
const walk = (tree: object, prefix: string): string[] =>
  Object.entries(tree).flatMap(([key, value]) => ("sm" in value || "size" in value ? [`${prefix}${key}`] : walk(value, `${prefix}${key}.`)));

export const PRESET_PATHS = walk(PRESET_SPEC, "") as PresetPath[];
export const isLadder = (path: PresetPath): boolean => "sm" in (valueAt(PRESET_SPEC, path) as object);

export const CODE_SCALE_NOTES: Record<keyof typeof TYPOGRAPHY_SOURCE.codeScale, string> = {
  inline: "문단 속 코드가 둘러싼 글자에서 줄어드는 비율",
  compact: "표 칸 속 코드가 둘러싼 글자에서 줄어드는 비율",
};

// The code block is a pick from Palette, not a Palette value of its own: it is shown next to the scales.
export const CODE_BLOCK = { spec: CODE_SPEC.block, note: "코드 블록의 글자와 줄 — 문단 속 코드와 달리 자기 크기를 갖는 mono" };

export const PRESET_NOTES: Record<PresetPath, { role: string; sample: string }> = {
  "button.medium": { role: "Button · medium", sample: "Continue" },
  "button.strong": { role: "Button · strong", sample: "Save changes" },
  field: { role: "Field · Input / Select", sample: "Search projects" },
  textarea: { role: "Textarea", sample: "Add a description" },
  badge: { role: "크기와 무관한 고정 표식", sample: "In progress" },
};
