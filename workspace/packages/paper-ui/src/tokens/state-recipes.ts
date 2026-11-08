import { COLOR, OPACITY_VALUES, STATUSES, SYSTEM_COLORS } from "./colors";
import { itemProfile, outlinedControlProfile } from "./color-recipes";
import { buildVarTree } from "./helpers";
import { MOTION } from "./motion-recipes";
import { SHAPE } from "./shape";
import { strokeRing } from "./shape-recipes";
import { ENABLED_SELECTOR, SELECTED_SELECTOR, VALUE_ATTRIBUTE, previewSelector, stateSelector } from "./state";
import { TYPOGRAPHY } from "./typography";

export const STATE_TINT_PROPERTY = "--pui-state-tint";
export const STATE_TINT = `var(${STATE_TINT_PROPERTY})`;

const opacity = buildVarTree(OPACITY_VALUES, ["color", "opacity"]);

const FORCED = "(forced-colors: active)";
const HOVER = "(hover: hover)";
const withTint = (tint: string) => ({ vars: { [STATE_TINT_PROPERTY]: tint } });

const focusVisible = `&:is(${stateSelector("focusVisible")}, ${previewSelector("focus")})`;
const disabled = `&${stateSelector("disabled")}`;
const selected = `&${SELECTED_SELECTOR}`;
const dropTarget = `&${stateSelector("dropTarget")}`;
const pressing = `&:is(:active, ${stateSelector("active")}, ${previewSelector("active")})${ENABLED_SELECTOR}`;
// Hover is the weakest state, so its selector adds no specificity and every other state outranks it.
const hovering = `&:where(:hover${ENABLED_SELECTOR}, ${previewSelector("hover")}${ENABLED_SELECTOR})`;
const hovered = `&:is(:hover, ${previewSelector("hover")})${ENABLED_SELECTOR}`;
const hoveredNeutral = `${hovered}:not([${VALUE_ATTRIBUTE.status}])`;

export const focusRing = {
  outline: `${SHAPE.focus.width} solid ${COLOR.interaction.focus}`,
  outlineOffset: SHAPE.focus.offset,
} as const;

const tinted = { backgroundImage: `linear-gradient(${STATE_TINT}, ${STATE_TINT})` } as const;

export const stateStyle = {
  focusVisible: {
    outline: "none",
    selectors: { [focusVisible]: focusRing },
    "@media": { [FORCED]: { selectors: { [focusVisible]: { outlineColor: SYSTEM_COLORS.highlight } } } },
  },
  disabled: {
    selectors: { [disabled]: { opacity: opacity.disabled, cursor: "not-allowed" } },
    "@media": { [FORCED]: { selectors: { [disabled]: { opacity: 1, color: SYSTEM_COLORS.grayText, borderColor: SYSTEM_COLORS.grayText } } } },
  },
  disabledCursor: {
    selectors: { [disabled]: { cursor: "not-allowed" } },
  },
  press: {
    selectors: { [pressing]: { transform: `translateY(${MOTION.press.offset})` } },
  },
  tinted,
  item: {
    ...tinted,
    selectors: {
      [selected]: { ...withTint(itemProfile.selectedTint), color: itemProfile.selectedInk },
      [pressing]: { ...withTint(itemProfile.activeTint), color: itemProfile.selectedInk },
    },
    "@media": {
      [HOVER]: { selectors: { [hovering]: withTint(itemProfile.hoverTint) } },
      [`${HOVER} and ${FORCED}`]: { selectors: { [hovered]: { borderColor: SYSTEM_COLORS.highlight } } },
      [FORCED]: {
        selectors: {
          [selected]: { forcedColorAdjust: "none", backgroundColor: SYSTEM_COLORS.highlight, backgroundImage: "none", color: SYSTEM_COLORS.highlightText },
        },
      },
      "(prefers-contrast: more)": { selectors: { [selected]: { boxShadow: strokeRing(COLOR.ink.primary) } } },
    },
  },
  field: {
    selectors: Object.fromEntries(
      STATUSES.map((status) => [`&[${VALUE_ATTRIBUTE.status}="${status}"]`, { borderColor: outlinedControlProfile.status[status] }]),
    ),
    "@media": {
      [HOVER]: { selectors: { [hoveredNeutral]: { borderColor: outlinedControlProfile.hoverBorder } } },
      // A forced palette reverts the rule above, so this selector has to match its specificity too.
      [`${HOVER} and ${FORCED}`]: { selectors: { [hovered]: { borderColor: SYSTEM_COLORS.highlight }, [hoveredNeutral]: { borderColor: SYSTEM_COLORS.highlight } } },
    },
  },
  hoverUnderline: {
    textDecorationLine: "none",
    "@media": { [HOVER]: { selectors: { [hovered]: { textDecorationLine: "underline" } } } },
  },
  dropTarget: {
    selectors: { [dropTarget]: { borderColor: COLOR.interaction.focus } },
    "@media": { [FORCED]: { selectors: { [dropTarget]: { borderColor: SYSTEM_COLORS.highlight } } } },
  },
} as const;

export const linkStyle = {
  color: COLOR.interaction.link,
  textDecorationLine: "underline",
  textUnderlineOffset: TYPOGRAPHY.palette.decoration.underlineOffset,
} as const;
