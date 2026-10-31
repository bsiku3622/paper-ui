// State recipes — how an element looks in each state, as plain style fragments. A stylesheet spreads the ones it
// needs into its own rule, and every selector is built from tokens/state.ts, so a rule and the attribute a hook
// writes cannot drift apart. Fragments never set a transition: the element joins the parts it uses with
// transition(). A fragment that paints colour is spread by the paint tier and by callers outside the package.
// Hover is CSS and only where a pointer can hover; a target that cannot take input never reacts.

import { COLOR, OPACITY_VALUES, STATUSES, SYSTEM_COLORS } from "./colors";
import { itemProfile, outlinedControlProfile } from "./color-recipes";
import { buildVarTree } from "./helpers";
import { MOTION } from "./motion";
import { SHAPE } from "./shape";
import { strokeRing } from "./shape-recipes";
import { ENABLED_SELECTOR, SELECTED_SELECTOR, VALUE_ATTRIBUTE, stateSelector } from "./state";
import { TYPOGRAPHY } from "./typography";

// The tint a state lays over an element's own face. A registered property (styles/states.css.ts), so it
// transitions, and a rule moves the tint without touching the face underneath.
export const STATE_TINT_PROPERTY = "--pui-state-tint";
export const STATE_TINT = `var(${STATE_TINT_PROPERTY})`;

const opacity = buildVarTree(OPACITY_VALUES, ["color", "opacity"]);

const FORCED = "(forced-colors: active)";
const HOVER = "(hover: hover)";
const withTint = (tint: string) => ({ vars: { [STATE_TINT_PROPERTY]: tint } });

const focusVisible = `&${stateSelector("focusVisible")}`;
const disabled = `&${stateSelector("disabled")}`;
const selected = `&${SELECTED_SELECTOR}`;
const dropTarget = `&${stateSelector("dropTarget")}`;
// The press of a pointer and of the keyboard: :active is the pointer, data-active the press machinery.
const pressing = `&:is(:active, ${stateSelector("active")})${ENABLED_SELECTOR}`;
// Hover is the weakest state, so its selector adds no specificity and every other state outranks it.
const hovering = `&:where(:hover${ENABLED_SELECTOR})`;
const hovered = `&:hover${ENABLED_SELECTOR}`;
const hoveredNeutral = `${hovered}:not([${VALUE_ATTRIBUTE.status}])`;

// The keyboard focus ring: Shape owns its width and offset, Color its ink.
export const focusRing = {
  outline: `${SHAPE.focus.width} solid ${COLOR.interaction.focus}`,
  outlineOffset: SHAPE.focus.offset,
} as const;

// The tint layer: a gradient of one colour over whatever the element paints, moved by the tint property.
const tinted = { backgroundImage: `linear-gradient(${STATE_TINT}, ${STATE_TINT})` } as const;

export const stateStyle = {
  // The ring owner draws the ring when the keyboard asks for it and keeps the native outline off, so a click
  // on a text field never shows one.
  focusVisible: {
    outline: "none",
    selectors: { [focusVisible]: focusRing },
    "@media": { [FORCED]: { selectors: { [focusVisible]: { outlineColor: SYSTEM_COLORS.highlight } } } },
  },
  disabled: {
    selectors: { [disabled]: { opacity: opacity.disabled, cursor: "not-allowed" } },
    "@media": { [FORCED]: { selectors: { [disabled]: { opacity: 1, color: SYSTEM_COLORS.grayText, borderColor: SYSTEM_COLORS.grayText } } } },
  },
  // For a part whose look is drawn elsewhere and only the cursor is left to say it cannot be used.
  disabledCursor: {
    selectors: { [disabled]: { cursor: "not-allowed" } },
  },
  // The 1px press. The colour of a press belongs to the profile that paints the element.
  press: {
    selectors: { [pressing]: { transform: `translateY(${MOTION.press.offset})` } },
  },
  tinted,
  // A neutral item. Pressed outranks selected, selected outranks hover. A disabled item answers to neither the pointer nor the press, and it keeps the selected tint.
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
      // A quiet selected face gains an ink hairline, so selection does not rest on colour alone.
      "(prefers-contrast: more)": { selectors: { [selected]: { boxShadow: strokeRing(COLOR.ink.primary) } } },
    },
  },
  // An outlined control's border: a status draws its own, and without one the border rises on hover.
  field: {
    selectors: Object.fromEntries(
      STATUSES.map((status) => [`&[${VALUE_ATTRIBUTE.status}="${status}"]`, { borderColor: outlinedControlProfile.status[status] }]),
    ),
    "@media": {
      [HOVER]: { selectors: { [hoveredNeutral]: { borderColor: outlinedControlProfile.hoverBorder } } },
      // Both selectors: a forced palette reverts the rule above, so it must lose to this one on a frame with no status too.
      [`${HOVER} and ${FORCED}`]: { selectors: { [hovered]: { borderColor: SYSTEM_COLORS.highlight }, [hoveredNeutral]: { borderColor: SYSTEM_COLORS.highlight } } },
    },
  },
  // An underline that shows only under a pointer that can hover, for a link that asks for it. Touch has no hover, so it never shows there.
  hoverUnderline: {
    textDecorationLine: "none",
    "@media": { [HOVER]: { selectors: { [hovered]: { textDecorationLine: "underline" } } } },
  },
  // Where a drag may land: the border turns to where the input is going.
  dropTarget: {
    selectors: { [dropTarget]: { borderColor: COLOR.interaction.focus } },
    "@media": { [FORCED]: { selectors: { [dropTarget]: { borderColor: SYSTEM_COLORS.highlight } } } },
  },
} as const;

// A link drawn where the Link Atom cannot be rendered, such as an anchor a stylesheet reaches. Flat, so a global rule can spread it.
export const linkStyle = {
  color: COLOR.interaction.link,
  textDecorationLine: "underline",
  textUnderlineOffset: TYPOGRAPHY.palette.decoration.underlineOffset,
} as const;
