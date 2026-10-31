// The Color tables: each role's Palette step in light and dark, and the tone steps of the accent.
import { ACCENT_TONE_STEPS, COLOR_SELECTION, PRIMARY_TONE_STEPS } from "@paper-ui/inspect/color";
import { ACCENT_TONES } from "@studio-baeks/paper-ui/tokens";

import type { GeneratedBlock } from "./markers";
import { TONE_USES } from "./notes";
import { table } from "./table";

type Tree = { readonly [key: string]: string | Tree };
const leaves = (tree: Tree, prefix = ""): [string, string][] =>
  Object.entries(tree).flatMap(([key, value]) => (typeof value === "string" ? [[prefix + key, value]] : leaves(value, `${prefix}${key}.`)));

const light = leaves(COLOR_SELECTION.light);
const dark = new Map(leaves(COLOR_SELECTION.dark));

// Sibling roles that share a row of the table, in the order the row names them.
const ROLE_ROWS: readonly (readonly string[])[] = [
  ["ink.primary", "ink.secondary", "ink.tertiary"],
  ["border.base", "border.strong", "border.hover"],
  ["interaction.selected", "interaction.active"],
  ["shadow.floating", "shadow.lifted"],
];

// Steps of one ramp share its name: `neutral.900 · 700 · 650`. Steps of different ramps are written out.
const stepsOf = (steps: string[]): string => {
  const parts = steps.map((step) => /^([a-z]+)\.(\d+)$/.exec(step));
  const [first] = parts;
  if (first && parts.every((part) => part?.[1] === first[1])) return `${first[1]}.${parts.map((part) => part![2]).join(" · ")}`;
  return steps.join(" · ");
};

const roleRows = (): string[][] => {
  const grouped = new Set(ROLE_ROWS.flat());
  const darkOf = (path: string) => dark.get(path) ?? "";
  return light.filter(([path]) => !path.startsWith("accent.")).flatMap(([path, step]): string[][] => {
    const group = ROLE_ROWS.find((row) => row[0] === path);
    if (group) {
      const lightSteps = group.map((member) => light.find(([key]) => key === member)![1]);
      return [[[`\`${path}\``, ...group.slice(1).map((member) => `\`${member.split(".").at(-1)}\``)].join(" · "), stepsOf(lightSteps), stepsOf(group.map(darkOf))]];
    }
    return grouped.has(path) ? [] : [[`\`${path}\``, step, darkOf(path)]];
  });
};

const toneRows = (): string[][] =>
  ACCENT_TONES.map((tone) => {
    const [lightStep, darkStep] = ACCENT_TONE_STEPS[tone];
    const [lightPrimary, darkPrimary] = PRIMARY_TONE_STEPS[tone];
    return [`\`${tone}\``, TONE_USES[tone], `${lightStep} (primary ${lightPrimary})`, `${darkStep} (primary ${darkPrimary})`];
  });

export const COLOR_BLOCKS: GeneratedBlock[] = [
  { id: "color-roles", files: ["docs/foundations/color.md"], render: () => table(["역할", "Light", "Dark"], roleRows()) },
  { id: "color-tones", files: ["docs/foundations/color.md"], render: () => table(["tone", "쓰는 곳", "Light", "Dark"], toneRows()) },
];
