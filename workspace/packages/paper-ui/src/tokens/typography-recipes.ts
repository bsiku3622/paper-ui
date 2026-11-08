import {
  CODE_SPEC,
  TYPOGRAPHY,
  TYPOGRAPHY_SOURCE,
  type ControlPreset,
  type Emphasis,
  type TextFamily,
  type TextVariant,
} from "./typography";
import type { ControlSize } from "./control-sizes";

const { palette, role, preset } = TYPOGRAPHY;
const { breaking } = TYPOGRAPHY_SOURCE;

type Refs = { size: string; weight: string; leading: string; tracking: string };
type FontRule = { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string; letterSpacing: string };
type BreakingRule = (typeof breaking)[TextFamily];
type MonoRule = { fontFamily: string; fontSize: string; letterSpacing: string } & BreakingRule;
type CodeRule = { fontFamily: string; fontSize: string; fontWeight?: string; lineHeight?: string } & Partial<BreakingRule>;
type PresetRule = FontRule & { whiteSpace?: "nowrap" };

export const PRESET_SINGLE_LINE = { button: true, field: false, textarea: false, badge: true } as const satisfies Record<ControlPreset, boolean>;

export const typographyRule = (variant: TextVariant, { family = "sans" }: { family?: TextFamily } = {}): FontRule & BreakingRule => {
  const spec = role[variant];
  return family === "mono"
    ? {
        fontFamily: palette.family.mono,
        fontSize: `calc(${spec.size} * ${palette.monoSizeScale})`,
        fontWeight: spec.weight,
        lineHeight: spec.leading,
        letterSpacing: palette.tracking.mono,
        ...breaking.mono,
      }
    : {
        fontFamily: palette.family.sans,
        fontSize: spec.size,
        fontWeight: spec.weight,
        lineHeight: spec.leading,
        letterSpacing: spec.tracking,
        ...breaking.sans,
      };
};

export const monoRule = (): MonoRule => ({
  fontFamily: palette.family.mono,
  fontSize: `calc(100% * ${palette.monoSizeScale})`,
  letterSpacing: palette.tracking.mono,
  ...breaking.mono,
});

export type CodeKind = "inline" | "compact" | "block";

export const codeRule = (kind: CodeKind): CodeRule => {
  const base = { fontFamily: palette.family.mono };
  if (kind !== "block") return { ...base, fontSize: `calc(100% * ${palette.codeScale[kind]})` };
  const { size, weight, leading } = CODE_SPEC.block;
  return { ...base, ...breaking.mono, fontSize: palette.fontSize[size], fontWeight: palette.weight[weight], lineHeight: palette.leading[leading] };
};

const presetOf = (name: ControlPreset, refs: Refs): PresetRule => ({
  fontFamily: palette.family.sans,
  fontSize: refs.size,
  fontWeight: refs.weight,
  lineHeight: refs.leading,
  letterSpacing: refs.tracking,
  ...(PRESET_SINGLE_LINE[name] ? { whiteSpace: "nowrap" as const } : {}),
});

export function presetRule(name: "button" | "field" | "textarea", size: ControlSize): PresetRule;
export function presetRule(name: "badge"): PresetRule;
export function presetRule(name: ControlPreset, size?: ControlSize): PresetRule {
  if (name === "badge") return presetOf(name, preset.badge);
  return presetOf(name, preset[name][size!]);
}

export const emphasisRule = (emphasis: Emphasis): { fontWeight: string } => ({ fontWeight: palette.weight[emphasis] });
