import { buildVarTree, pathToCssVar } from "./helpers";
import { COLOR, OPACITY_VALUES } from "./colors";
import { CONTROL } from "./control-recipes";
import { SHAPE } from "./shape";
import { TYPOGRAPHY } from "./typography";
import { MOTION } from "./motion-recipes";
import { LAYOUT } from "./layout";

export const tokens = {
  color: { ...COLOR, opacity: buildVarTree(OPACITY_VALUES, ["color", "opacity"]) },
  typography: { role: TYPOGRAPHY.role, preset: TYPOGRAPHY.preset },
  shape: { ...SHAPE, control: { height: SHAPE.control.height, inset: CONTROL.inset, gap: SHAPE.control.gap, icon: SHAPE.control.icon } },
  layout: LAYOUT,
  motion: { role: MOTION },
} as const;

export * from "./vocabulary";

export { THEME_ATTRIBUTE, THEME_SWAP_ATTRIBUTE, COLOR_MODE_QUERY } from "./color-modes";
export { SOURCE_VARIABLES } from "./variables";
export { overridesRule, unknownSourceVariables } from "./overrides";
export type { ThemeOverrides } from "./overrides";

export { ELEVATION_NEST_LIMIT } from "./layout";
export { ELEVATION, elevationStack, elevationCast, elevationStyle, insetCast, restingCast } from "./elevation-recipes";

export { SYSTEM_COLORS } from "./colors";
export { accentProfile, itemProfile, markProfile, markForcedProfile, outlinedControlProfile, VARIANT_LINE } from "./color-recipes";
export type { AccentProfile } from "./color-recipes";

export { CONTROL_ICON } from "./shape";
export { controlSizes } from "./control-sizes";
export { SHAPE_RECIPES, CONTROL_LINE, CONTROL_LINE_PROPERTY, CONTROL_LINE_ROOM, insideLine, markParts, nestedRadius, strokeRing, targetReach } from "./shape-recipes";

export { CONTROL, CONTROL_ANATOMY_PRESET } from "./control-recipes";
export { lineFrame, lineRule, controlLineWidth } from "./line-recipes";
export type { LineOptions } from "./line-recipes";

export { TEXT_INK } from "./typography";
export { typographyRule, monoRule, codeRule, presetRule, emphasisRule } from "./typography-recipes";
export type { CodeKind } from "./typography-recipes";

export { STATE_ATTRIBUTE, VALUE_ATTRIBUTE, MARKER_ATTRIBUTE, SELECTED_SELECTOR, ENABLED_SELECTOR, PREVIEW_ATTRIBUTE, stateSelector, stateAttributes, previewSelector, previewAttributes, type PreviewState } from "./state";
export type { StateAttributes } from "./state";
export { focusRing, stateStyle, linkStyle, STATE_TINT, STATE_TINT_PROPERTY } from "./state-recipes";

export { MOTION_CONSUMERS, MOTION_LOOPS, MOTION_REDUCED, transition } from "./motion";
export { MOTION, REVEAL_AFTER } from "./motion-recipes";

export const isStylesheetLoaded = (root: Element): boolean =>
  getComputedStyle(root).getPropertyValue(pathToCssVar(["shape", "stroke", "border"])).trim() !== "";
