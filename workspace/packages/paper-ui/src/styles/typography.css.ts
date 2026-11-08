import { tokens, CONTROL_FONT_SIZES, CONTROL_SIZES, emphasisRule, presetRule, typographyRule, type ControlFontSize, type ControlSize } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("utilities");

export const textRoleClass = styleVariants(tokens.typography.role, (_, variant) => ({ ...typographyRule(variant), margin: 0 }));

export const textMonoClass = styleVariants(tokens.typography.role, (_, variant) => {
  const { fontFamily, fontSize, letterSpacing, wordBreak, overflowWrap } = typographyRule(variant, { family: "mono" });
  return { fontFamily, fontSize, letterSpacing, wordBreak, overflowWrap };
});

export const textNumericClass = style({ fontVariantNumeric: "tabular-nums" });

type Mirror<T> = { [K in keyof T]: T[K] extends { size: string } ? string : Mirror<T[K]> };

const shared = new Map<string, string>();
const classOf = (rule: Parameters<typeof style>[0]): string => {
  const signature = JSON.stringify(rule);
  const known = shared.get(signature);
  if (known) return known;
  const created = style(rule);
  shared.set(signature, created);
  return created;
};
const bySize = (rule: (size: ControlSize) => Parameters<typeof style>[0]) =>
  Object.fromEntries(CONTROL_SIZES.map((size) => [size, classOf(rule(size))])) as Record<ControlSize, string>;

export const presetClass: Mirror<typeof tokens.typography.preset> = {
  button: bySize((size) => presetRule("button", size)),
  field: bySize((size) => presetRule("field", size)),
  textarea: bySize((size) => presetRule("textarea", size)),
  badge: classOf(presetRule("badge")),
};

const sizes = Object.fromEntries(CONTROL_FONT_SIZES.map((variant) => [variant, tokens.typography.role[variant].size])) as Record<ControlFontSize, string>;
export const controlFontSizeClass = styleVariants(sizes, (fontSize) => ({ fontSize }));

export const textStrongClass = styleVariants(tokens.typography.role, (role) => ({ fontWeight: role.strong }));
export const plainWeightClass = style(emphasisRule("regular"));

export const textTruncateClass = style({ display: "block", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
