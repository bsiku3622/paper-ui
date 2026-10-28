import type { StyleRule } from "@vanilla-extract/css";

import { tokens, CONTROL_SIZES, TEXT_VARIANTS, type ControlSize, type TextVariant } from "../tokens";
import { TEXT_INK } from "../tokens/typography";
import { layered } from "../tokens/layers.css";

const { styleVariants } = layered("utilities");
const roles = layered("base");

type Preset = { size: string; weight: string; leading: string; tracking: string };
const rule = (preset: Preset): StyleRule => ({
  fontFamily: tokens.typography.palette.family.sans,
  fontSize: preset.size,
  fontWeight: preset.weight,
  lineHeight: preset.leading,
  letterSpacing: preset.tracking,
});

// Text 역할의 순수 타이포그래피만 빌려 쓴다. Text primitive와 달리 ink·margin은 건드리지 않는다.
const textRules = Object.fromEntries(TEXT_VARIANTS.map((variant) => [variant, rule(tokens.typography.role[variant])])) as Record<TextVariant, StyleRule>;
export const textTypography = styleVariants(textRules);

// ───── Text 역할 class ───────────────────────────────────────────────────────
//
// 역할의 글자와 기본 잉크. pui.base 에 있어서, 같은 요소에 붙는 ink class(pui.utilities)가
// 출력 순서와 무관하게 역할의 기본 잉크를 이긴다.
export const textRoleClass = roles.styleVariants(tokens.typography.role, (spec, variant) => ({
  // size · leading · tracking 은 :root var 를 참조 — 값은 tokens/variables.css.ts 한 곳에서만.
  fontFamily: tokens.typography.palette.family.sans,
  fontSize: spec.size,
  fontWeight: spec.weight,
  lineHeight: spec.leading,
  letterSpacing: spec.tracking,
  color: tokens.color.ink[TEXT_INK[variant]],
  margin: 0,
}));

// family=mono — 역할 위에 교차하는 모디파이어. 서체를 등폭으로 바꾸고 mono 전용
// 자간을 준다. sans 의 per-variant tracking(display -0.03em 등)을 그대로 얹으면 큰
// 크기 mono 가 짓눌리므로 버리고, 대신 단일 값 -0.04em — SF Mono·D2Coding 은 advance 가
// 넓어 UI 에서 벌어져 보여 조인다 (균일 적용이라 tabular 정렬은 유지). letter-spacing 은
// 요소당 하나라 영어·한글을 한 런에서 따로 못 준다 — 코드·토큰(영어) 기준 단일값.
// 크기는 variant 의 px 를 monoSizeScale 로 줄인다. textRoleClass 뒤에 와서 같은 특정도의 역할 class 를 순서로 이긴다.
export const textMonoClass = roles.styleVariants(tokens.typography.role, (spec) => ({
  fontFamily: tokens.typography.palette.family.mono,
  fontSize: `calc(${spec.size} * ${tokens.typography.palette.monoSizeScale})`,
  letterSpacing: tokens.typography.palette.tracking.mono,
}));

const uniqueRules: Record<string, StyleRule> = {};
const aliases: Record<string, string> = {};
const canonicalBySignature = new Map<string, string>();
const cap = (value: string) => `${value[0]?.toUpperCase() ?? ""}${value.slice(1)}`;
const addPreset = (name: string, preset: Preset) => {
  const signature = JSON.stringify(preset);
  let canonical = canonicalBySignature.get(signature);
  if (!canonical) {
    canonical = name;
    uniqueRules[canonical] = rule(preset);
    canonicalBySignature.set(signature, canonical);
  }
  aliases[name] = canonical;
};
const addSizeLadder = (key: string, presets: Record<ControlSize, Preset>) => {
  for (const size of CONTROL_SIZES) addPreset(`${key}${cap(size)}`, presets[size]);
};
addSizeLadder("buttonRegular", tokens.typography.preset.button.regular);
addSizeLadder("buttonStrong", tokens.typography.preset.button.strong);
addSizeLadder("field", tokens.typography.preset.field);
addSizeLadder("textarea", tokens.typography.preset.textarea);
addPreset("badge", tokens.typography.preset.badge);

const classes = styleVariants(uniqueRules);
const classFor = (name: string) => (classes as Record<string, string>)[aliases[name] ?? name] ?? "";
const sizeClasses = (key: string) => Object.fromEntries(
  CONTROL_SIZES.map((size) => [size, classFor(`${key}${cap(size)}`)]),
) as Record<ControlSize, string>;

export const controlTypography = {
  button: { regular: sizeClasses("buttonRegular"), strong: sizeClasses("buttonStrong") },
  field: sizeClasses("field"),
  textarea: sizeClasses("textarea"),
  badge: classFor("badge"),
} as const;
