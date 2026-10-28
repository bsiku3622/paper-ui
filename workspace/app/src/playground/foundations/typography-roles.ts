// The Typography inspector's data, read from the specs that choose from the palette: the leading each
// font size is shown on, and the preset rows with what each one is for.

import { PRESET_SPEC, ROLE_SPEC, TYPOGRAPHY_SOURCE } from "../../../../packages/paper-ui/src/tokens/typography";
import { valueAt } from "./paths";

type FontSize = keyof typeof TYPOGRAPHY_SOURCE.fontSize;
type Leading = keyof typeof TYPOGRAPHY_SOURCE.leading;

// Each font size is shown on the leading its role pairs it with.
export const SIZE_LEADING = Object.fromEntries(Object.values(ROLE_SPEC).map((spec) => [spec.size, spec.leading])) as Record<FontSize, Leading>;

type PresetPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends { sm: unknown } | { size: unknown } ? `${Prefix}${K}` : PresetPaths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];
export type PresetPath = PresetPaths<typeof PRESET_SPEC>;

// A preset is a size ladder or a single style; a group of ladders (Button's weights) walks one level deeper.
const walk = (tree: object, prefix: string): string[] =>
  Object.entries(tree).flatMap(([key, value]) => ("sm" in value || "size" in value ? [`${prefix}${key}`] : walk(value, `${prefix}${key}.`)));

export const PRESET_PATHS = walk(PRESET_SPEC, "") as PresetPath[];
export const isLadder = (path: PresetPath): boolean => "sm" in (valueAt(PRESET_SPEC, path) as object);

export const PRESET_NOTES: Record<PresetPath, { role: string; sample: string }> = {
  "button.regular": { role: "Button · regular", sample: "Continue" },
  "button.strong": { role: "Button · strong", sample: "Save changes" },
  field: { role: "Field · Input / Select", sample: "Search projects" },
  textarea: { role: "Textarea", sample: "Add a description" },
  badge: { role: "크기와 무관한 고정 표식", sample: "In progress" },
};
