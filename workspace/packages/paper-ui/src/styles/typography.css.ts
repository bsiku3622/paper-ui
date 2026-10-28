import type { StyleRule } from "@vanilla-extract/css";

import { tokens, CONTROL_SIZES, TEXT_VARIANTS, type ControlSize, type TextVariant } from "../tokens";
import { layered } from "../tokens/layers.css";

const { styleVariants } = layered("utilities");

type Preset = { size: string; weight: string; leading: string; tracking: string };
const rule = (preset: Preset): StyleRule => ({
  fontFamily: tokens.text.palette.family.sans,
  fontSize: preset.size,
  fontWeight: preset.weight,
  lineHeight: preset.leading,
  letterSpacing: preset.tracking,
});

// Text 역할의 순수 타이포그래피만 빌려 쓴다. Text primitive와 달리 ink·margin은 건드리지 않는다.
const textRules = Object.fromEntries(TEXT_VARIANTS.map((variant) => [variant, rule(tokens.text.style[variant])])) as Record<TextVariant, StyleRule>;
export const textTypography = styleVariants(textRules);

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
addSizeLadder("buttonRegular", tokens.text.control.button.regular);
addSizeLadder("buttonStrong", tokens.text.control.button.strong);
addSizeLadder("field", tokens.text.control.field);
addSizeLadder("textarea", tokens.text.control.textarea);
addPreset("badge", tokens.text.control.badge);

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
