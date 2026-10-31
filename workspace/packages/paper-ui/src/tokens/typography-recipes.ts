// Typography recipes — 역할 · preset · 코드 · 강조를 CSS 선언으로 조합한다. 숫자는 쓰지 않는다:
// 모든 값은 TYPOGRAPHY 의 var() 참조이고, 줄바꿈은 서체가 정한다. 스타일시트와 앱이 같은 선언을
// 가져다 쓰므로 글자를 적용하는 자리는 이 파일 하나다.

import {
  CODE_SPEC,
  PRESET_SPEC,
  TYPOGRAPHY,
  TYPOGRAPHY_SOURCE,
  type ControlPreset,
  type ControlSize,
  type Emphasis,
  type TextFamily,
  type TextVariant,
} from "./typography";

const { palette, role, preset } = TYPOGRAPHY;
const { breaking } = TYPOGRAPHY_SOURCE;

type Refs = { size: string; weight: string; leading: string; tracking: string };
type FontRule = { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string; letterSpacing: string };
type BreakingRule = (typeof breaking)[TextFamily];
type MonoRule = { fontFamily: string; fontSize: string; letterSpacing: string } & BreakingRule;
type CodeRule = { fontFamily: string; fontSize: string; fontWeight?: string; lineHeight?: string } & Partial<BreakingRule>;
type PresetRule = FontRule & { whiteSpace?: "nowrap" };

// 한 줄에 서는 preset — 라벨이 줄을 바꾸지 않는다. 입력은 값이 줄을 정한다.
export const PRESET_SINGLE_LINE = { button: true, field: false, textarea: false, badge: true } as const satisfies Record<ControlPreset, boolean>;

// 역할의 선언. mono 는 크기를 monoSizeScale 로 줄이고 자간을 tracking.mono 하나로 바꾼다.
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

// 어느 역할 안에서든 문장 속 mono 조각의 선언. 크기는 둘러싼 글자의 비율이라 길이를 쓰지 않는다.
export const monoRule = (): MonoRule => ({
  fontFamily: palette.family.mono,
  fontSize: `calc(100% * ${palette.monoSizeScale})`,
  letterSpacing: palette.tracking.mono,
  ...breaking.mono,
});

export type CodeKind = "inline" | "compact" | "block";

// 코드. inline 은 문단 속, compact 는 표 칸 속 조각이고 둘러싼 글자의 비율로 줄어들며, 줄바꿈도 둘러싼 글자를
// 따른다 — 칸 안의 식별자가 어디서든 끊겨 칸의 최소 폭을 줄이지 않는다. block 은 자기 크기와 줄을 갖고 mono 로
// 끊는다. 자간은 정하지 않는다.
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

export type ButtonWeight = keyof typeof PRESET_SPEC.button;

// 컨트롤 preset 의 선언. Button 은 크기와 굵기, Field · Textarea 는 크기, Badge 는 크기와 무관하다.
export function presetRule(name: "button", size: ControlSize, weight: ButtonWeight): PresetRule;
export function presetRule(name: "field" | "textarea", size: ControlSize): PresetRule;
export function presetRule(name: "badge"): PresetRule;
export function presetRule(name: ControlPreset, size?: ControlSize, weight?: ButtonWeight): PresetRule {
  if (name === "badge") return presetOf(name, preset.badge);
  if (name === "button") return presetOf(name, preset.button[weight!][size!]);
  return presetOf(name, preset[name][size!]);
}

// 문장 속 강조의 굵기. Palette 의 이름 그대로 — regular 는 언제나 400 이다.
export const emphasisRule = (emphasis: Emphasis): { fontWeight: string } => ({ fontWeight: palette.weight[emphasis] });
