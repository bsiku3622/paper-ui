// Specimens drawn inside the Foundations boards. Geometry comes from Shape and Layout roles;
// each specimen only arranges the token it shows.
import { globalStyle, style, styleVariants, type ComplexStyleRule } from "@vanilla-extract/css";

import { CONTROL_SIZES, ELEVATIONS, SPACES, codeRule, focusRing, monoRule, presetRule, tokens, type ControlSize } from "@studio-baeks/paper-ui/tokens";

import { bar } from "./kit.css";
import type { PresetPath } from "./typography-roles";

const { shape, layout, color } = tokens;
const line = `${shape.stroke.border} solid ${color.border.base}`;

// One class per key of a vocabulary or a specimen map.
const variantsOf = <K extends string>(keys: readonly K[], rule: (key: K) => ComplexStyleRule): Record<K, string> =>
  styleVariants(Object.fromEntries(keys.map((key) => [key, rule(key)])) as Record<K, ComplexStyleRule>) as Record<K, string>;

// Typography
export const specimen = style({ margin: 0, minWidth: 0 });
export const presetSample = style({ display: "block" });
// A control preset as a sample is the preset's own declaration, one class per size.
const PRESET_RULES: Record<PresetPath, (size: ControlSize) => ComplexStyleRule> = {
  "button.medium": (size) => presetRule("button", size, "medium"),
  "button.strong": (size) => presetRule("button", size, "strong"),
  field: (size) => presetRule("field", size),
  textarea: (size) => presetRule("textarea", size),
  badge: () => presetRule("badge"),
};
// Code pieces at the two scales Palette gives them, sitting in a sentence, and the block that has its own size and line.
export const codeSample = { inline: style(codeRule("inline")), compact: style(codeRule("compact")), block: style(codeRule("block")) };
export const presetFont = Object.fromEntries(
  Object.entries(PRESET_RULES).map(([path, rule]) => [path, variantsOf(CONTROL_SIZES, rule)]),
) as Record<PresetPath, Record<ControlSize, string>>;

// Shape
export const spaceBar = variantsOf(SPACES, (step) => [bar, { width: shape.inset[step] }]);
const radiusBase = style({ width: shape.dimension.width.xs, height: shape.control.height.lg, border: line, background: color.bg.sunken });
export const radiusSample = styleVariants(
  { control: shape.radius.control, selection: shape.radius.selection, "surface.sm": shape.radius.surface.sm, "surface.md": shape.radius.surface.md, "surface.lg": shape.radius.surface.lg, full: shape.radius.full },
  (borderRadius) => [radiusBase, { borderRadius }],
);
const strokeBase = style({ width: shape.dimension.width.sm, background: color.ink.primary });
export const strokeLine = styleVariants({ border: shape.stroke.border, emphasis: shape.stroke.emphasis }, (height) => [strokeBase, { height }]);
export const focusBox = style({ width: shape.control.height.md, height: shape.control.height.sm, borderRadius: shape.radius.control, border: line, ...focusRing });
export const targetBox = style({ width: shape.target.min, height: shape.target.min, borderRadius: shape.radius.control, border: line, background: color.bg.sunken });
const controlBase = style({ width: shape.dimension.width.sm, borderRadius: shape.radius.control, border: line, background: color.bg.sunken });
export const controlBox = variantsOf(CONTROL_SIZES, (size) => [controlBase, { height: shape.control.height[size] }]);
export const rule = style({ fontFamily: monoRule().fontFamily, fontSize: tokens.typography.role.caption.size, color: color.ink.secondary });
export const recipeSample = style({ display: "flex", alignItems: "center", minHeight: shape.control.height.lg, minWidth: 0 });

// Layout
export const zStack = style({ position: "relative", height: shape.control.height.sm, width: shape.dimension.width.sm });
export const zLayer = style({
  position: "absolute",
  insetBlockStart: 0,
  width: shape.control.height.md,
  height: shape.control.height.sm,
  borderRadius: shape.radius.surface.sm,
  border: line,
  background: color.bg.raised,
  selectors: Object.fromEntries(ELEVATIONS.map((_, index) => [`&:nth-child(${index + 1})`, { insetInlineStart: `calc(${shape.inset.md} * ${index})` }])),
});
export const elevationStage = style({ display: "flex", justifyContent: "center", padding: shape.inset.md, borderRadius: shape.radius.surface.sm, background: color.bg.canvas, isolation: "isolate" });
export const elevationCard = style({ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: shape.control.height.lg, borderRadius: shape.radius.surface.md, border: line, background: color.bg.raised });
// Two blocks a gap apart; a frame whose content sits a gutter in.
export const gapSample = style({ display: "flex" });
export const gapOf = variantsOf(SPACES, (step) => ({ gap: layout.gap[step] }));
export const gutterFrame = style({ display: "flex", width: shape.dimension.width.sm, padding: layout.gutter, borderRadius: shape.radius.surface.sm, border: line, background: color.bg.sunken });
globalStyle(`${gapSample} > span, ${gutterFrame} > span`, { display: "block", height: shape.control.height.sm, borderRadius: shape.radius.control, background: color.accent.primary.solid });
globalStyle(`${gapSample} > span`, { width: shape.control.height.md });
globalStyle(`${gutterFrame} > span`, { flex: 1 });

// Motion
const dot = shape.inset.md;
export const easingSpecimen = style({ display: "grid", gridTemplateColumns: `${shape.dimension.width.xs} 1fr`, alignItems: "center", gap: layout.gap.md });
export const pulseDot = style({ display: "inline-block", width: dot, height: dot, borderRadius: shape.radius.full, background: color.accent.info.solid });
export const presence = style({ display: "flex", alignItems: "center", gap: layout.gap.md, isolation: "isolate" });
export const themeSwap = style({ display: "flex", alignItems: "center", gap: layout.gap.md });
export const presenceIdle = style({ visibility: "hidden" });
