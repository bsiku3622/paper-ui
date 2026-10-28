// Specimens drawn inside the Foundations boards. Geometry comes from Shape and Layout roles;
// each specimen only arranges the token it shows.
import { globalStyle, keyframes, style, styleVariants, type ComplexStyleRule } from "@vanilla-extract/css";

import { CONTROL_SIZES, SPACES, tokens } from "@studio-baeks/paper-ui/tokens";

import { bar } from "./kit.css";

const { shape, layout, color, motion } = tokens;
const line = `${shape.stroke.border} solid ${color.border.base}`;

// One class per key of a vocabulary or a specimen map.
const variantsOf = <K extends string>(keys: readonly K[], rule: (key: K) => ComplexStyleRule): Record<K, string> =>
  styleVariants(Object.fromEntries(keys.map((key) => [key, rule(key)])) as Record<K, ComplexStyleRule>) as Record<K, string>;

// Typography
export const specimen = style({ margin: 0, minWidth: 0, overflowWrap: "anywhere" });
export const presetSample = style({ display: "block", overflowWrap: "anywhere" });

// Shape
export const spaceBar = variantsOf(SPACES, (step) => [bar, { width: shape.inset[step] }]);
const radiusBase = style({ width: shape.dimension.width.xs, height: shape.control.height.lg, border: line, background: color.bg.sunken });
export const radiusSample = styleVariants(
  { control: shape.radius.control, selection: shape.radius.selection, "surface.sm": shape.radius.surface.sm, "surface.md": shape.radius.surface.md, "surface.lg": shape.radius.surface.lg, full: shape.radius.full },
  (borderRadius) => [radiusBase, { borderRadius }],
);
const strokeBase = style({ width: shape.dimension.width.sm, background: color.ink.primary });
export const strokeLine = styleVariants({ border: shape.stroke.border, emphasis: shape.stroke.emphasis }, (height) => [strokeBase, { height }]);
export const focusBox = style({ width: shape.control.height.md, height: shape.control.height.sm, borderRadius: shape.radius.control, border: line, outline: `${shape.focus.width} solid ${color.interaction.focus}`, outlineOffset: shape.focus.offset });
export const targetBox = style({ width: shape.target.min, height: shape.target.min, borderRadius: shape.radius.control, border: line, background: color.bg.sunken });
const controlBase = style({ width: shape.dimension.width.sm, borderRadius: shape.radius.control, border: line, background: color.bg.sunken });
export const controlBox = variantsOf(CONTROL_SIZES, (size) => [controlBase, { height: shape.control.height[size] }]);
export const rule = style({ fontFamily: tokens.typography.palette.family.mono, fontSize: tokens.typography.role.caption.size, color: color.ink.secondary, wordBreak: "keep-all" });
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
  selectors: Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [`&:nth-child(${n})`, { insetInlineStart: `calc(${shape.inset.md} * ${n - 1})` }])),
});
export const elevationStage = style({ display: "flex", justifyContent: "center", padding: shape.inset.md, borderRadius: shape.radius.surface.sm, background: color.bg.canvas });
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
export const motionTrack = style({ position: "relative", width: "100%", height: dot, borderRadius: shape.radius.full, background: color.control.track });
export const motionDot = style({
  position: "absolute",
  insetBlockStart: 0,
  insetInlineStart: 0,
  width: dot,
  height: dot,
  borderRadius: shape.radius.full,
  background: color.accent.primary.solid,
  transitionProperty: "inset-inline-start",
  selectors: { [`${motionTrack}:hover &`]: { insetInlineStart: `calc(100% - ${dot})` } },
});
export const easingSpecimen = style({ display: "grid", gridTemplateColumns: `${shape.dimension.width.xs} 1fr`, alignItems: "center", gap: layout.gap.md });
export const curve = style({ width: shape.dimension.width.xs, fill: "none", stroke: color.ink.primary, strokeWidth: shape.stroke.emphasis, overflow: "visible" });
const turn = keyframes({ to: { transform: "rotate(360deg)" } });
const fade = keyframes({ "50%": { opacity: 0.25 } });
export const spin = style({ display: "inline-block", width: shape.control.icon.md, height: shape.control.icon.md, borderRadius: shape.radius.full, border: `${shape.stroke.emphasis} solid ${color.border.base}`, borderTopColor: color.ink.primary, animationName: turn, animationTimingFunction: motion.easing.linear, animationIterationCount: "infinite" });
export const pulse = style({ display: "inline-block", width: dot, height: dot, borderRadius: shape.radius.full, background: color.accent.info.solid, animationName: fade, animationTimingFunction: motion.easing.standard, animationIterationCount: "infinite" });
export const hoverSample = style({ padding: `${shape.inset.sm} ${shape.inset.md}`, borderRadius: shape.radius.control, border: line, background: color.bg.raised, selectors: { "&:hover": { backgroundColor: color.bg.sunken } } });
export const presence = style({ display: "flex", alignItems: "center", gap: layout.gap.md });
export const presenceCard = style({ padding: `${shape.inset.sm} ${shape.inset.md}`, borderRadius: shape.radius.surface.md, border: line, background: color.bg.raised, boxShadow: layout.elevation.overlay.shadow });
