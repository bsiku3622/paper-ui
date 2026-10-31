// The paints other primitives and Atoms borrow. Colour lives in the paint tier and nowhere else, so a
// part that needs a colour takes the class from here instead of reading tokens.color itself.

import { ENABLED_SELECTOR, SYSTEM_COLORS, VALUE_ATTRIBUTE, markForcedProfile, markProfile, outlinedControlProfile, stateSelector, stateStyle, strokeRing, tokens, type DividerLevel } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style, styleVariants } = layered("components");

// The modal backdrop of a Floating panel.
export const scrimPaint = style({ background: tokens.color.overlay.scrim });

// The colour of an input frame: the outlined control's ink and border, a status drawing its own border, and the
// border rising under a pointer. The face is the frame's Surface fill, so it is not set here.
export const fieldPaint = style([stateStyle.field, { color: outlinedControlProfile.ink, borderColor: outlinedControlProfile.border }]);

// What stands inside an input frame: the placeholder is quiet, an adornment is secondary, and an action rests tertiary and
// rises to primary under a pointer that can hover. A Select shows its empty choice as a placeholder, and its arrow follows.
export const fieldPlaceholderPaint = style({ selectors: { "&::placeholder": { color: tokens.color.ink.tertiary } } });
export const fieldAdornmentPaint = style({ color: tokens.color.ink.secondary });
export const fieldActionPaint = style({
  color: tokens.color.ink.tertiary,
  "@media": { "(hover: hover)": { selectors: { [`&:hover${ENABLED_SELECTOR}`]: { color: tokens.color.ink.primary } } } },
});
const EMPTY_CHOICE = ':has(option[value=""]:checked)';
export const selectEmptyPaint = style({ selectors: { [`&${EMPTY_CHOICE}`]: { color: tokens.color.ink.tertiary } } });
export const selectArrowPaint = style({
  color: tokens.color.ink.secondary,
  selectors: { [`${selectEmptyPaint}${EMPTY_CHOICE} &`]: { color: tokens.color.ink.tertiary } },
});

// The colours of a selection mark. At rest a mark is the raised face inside an ink.tertiary ring, the quietest ink that holds
// 3:1 on every surface; an error draws that ring in the error ink, and what is checked is the primary accent's solid with
// its wash on top. A Checkbox draws the check or the dash, a Radio the dot, and a Switch a track with a ring inside its own
// box and a knob. Under forced colours the OS owns the palette: the marks keep their own colours only to draw the checked
// state, from system colours alone, and a disabled one turns GrayText.
const FORCED = "(forced-colors: active)";
const errored = `[${VALUE_ATTRIBUTE.status}="error"]`;
const disabled = stateSelector("disabled");
const checkedOrMixed = "&:is(:checked, :indeterminate)";
// A Checkbox is unchecked when it is neither checked nor mixed. A Radio is never mixed: its :indeterminate means its group has no choice yet.
const unchecked = "&:where(:not(:checked, :indeterminate))";
const forcedMark = markForcedProfile.checked;

export const markPaint = styleVariants({
  checkbox: {
    backgroundColor: outlinedControlProfile.face,
    borderColor: markProfile.rest.ring,
    selectors: {
      [checkedOrMixed]: { backgroundColor: markProfile.checked.face, borderColor: markProfile.checked.face },
      "&:checked::after": { borderColor: markProfile.checked.mark },
      "&:indeterminate::after": { backgroundColor: markProfile.checked.mark },
      [`${unchecked}${errored}`]: { borderColor: markProfile.invalid.ring },
    },
    "@media": {
      [FORCED]: {
        forcedColorAdjust: "none",
        backgroundColor: markForcedProfile.rest.face,
        borderColor: markForcedProfile.rest.ring,
        selectors: {
          [checkedOrMixed]: { backgroundColor: forcedMark.face, borderColor: forcedMark.ring },
          "&:checked::after": { borderColor: forcedMark.mark },
          "&:indeterminate::after": { backgroundColor: forcedMark.mark },
          [`${unchecked}${errored}`]: { borderColor: markForcedProfile.rest.ring },
          [`&${disabled}`]: { borderColor: markForcedProfile.disabled.ring },
          [`${checkedOrMixed}${disabled}`]: { backgroundColor: markForcedProfile.disabled.face },
        },
      },
    },
  },
  radio: {
    backgroundColor: outlinedControlProfile.face,
    borderColor: markProfile.rest.ring,
    selectors: {
      "&:checked": { borderColor: markProfile.checked.face },
      "&:checked::after": { backgroundColor: markProfile.checked.face },
      [`&:not(:checked)${errored}`]: { borderColor: markProfile.invalid.ring },
    },
    "@media": {
      [FORCED]: {
        forcedColorAdjust: "none",
        backgroundColor: markForcedProfile.rest.face,
        borderColor: markForcedProfile.rest.ring,
        selectors: {
          "&:checked": { borderColor: forcedMark.ring },
          "&:checked::after": { backgroundColor: forcedMark.ring },
          [`&:not(:checked)${errored}`]: { borderColor: markForcedProfile.rest.ring },
          [`&${disabled}`]: { borderColor: markForcedProfile.disabled.ring },
          [`&:checked${disabled}::after`]: { backgroundColor: markForcedProfile.disabled.ring },
        },
      },
    },
  },
  switch: {
    backgroundColor: markProfile.rest.track,
    boxShadow: strokeRing(markProfile.rest.ring),
    selectors: {
      "&::after": { backgroundColor: markProfile.rest.knob },
      // The ring fades out rather than leaving: a transparent shadow has something to fade to and paints nothing on the track's rim.
      "&:checked": { backgroundColor: markProfile.checked.face, boxShadow: strokeRing(markProfile.checked.ring) },
      "&:checked::after": { backgroundColor: markProfile.checked.knob },
      [`&:not(:checked)${errored}`]: { boxShadow: strokeRing(markProfile.invalid.ring) },
    },
    "@media": {
      [FORCED]: {
        forcedColorAdjust: "none",
        backgroundColor: markForcedProfile.rest.track,
        boxShadow: strokeRing(markForcedProfile.rest.ring),
        selectors: {
          "&::after": { backgroundColor: markForcedProfile.rest.knob },
          "&:checked": { backgroundColor: forcedMark.face, boxShadow: strokeRing(forcedMark.ring) },
          "&:checked::after": { backgroundColor: forcedMark.knob },
          [`&:not(:checked)${errored}`]: { boxShadow: strokeRing(markForcedProfile.rest.ring) },
          [`&${disabled}`]: { boxShadow: strokeRing(markForcedProfile.disabled.ring) },
          [`&:checked${disabled}`]: { backgroundColor: markForcedProfile.disabled.face, boxShadow: strokeRing(markForcedProfile.disabled.ring) },
        },
      },
    },
  },
});

// A link's ink. Where it is underlined is the Link's own anatomy.
export const linkPaint = style({ color: tokens.color.interaction.link });

// The line of a Divider: a border, which is why it stays drawn under forced colours.
export const linePaint = styleVariants({
  base: { borderColor: tokens.color.border.base },
  strong: { borderColor: tokens.color.border.strong },
} satisfies Record<DividerLevel, object>);

// The ring a Spinner turns: a quiet track with an ink arc, or (ink "inherit") the ink of the text it sits in, an arc on
// nothing. Under forced colours the author's colours stay, or the four sides of the ring would turn into one.
export const spinnerPaint = styleVariants({
  ink: {
    borderColor: tokens.color.border.base,
    borderTopColor: tokens.color.ink.primary,
    "@media": { "(forced-colors: active)": { forcedColorAdjust: "none", borderColor: SYSTEM_COLORS.grayText, borderTopColor: SYSTEM_COLORS.canvasText } },
  },
  inherit: {
    borderColor: "currentColor",
    borderTopColor: "transparent",
    "@media": { "(forced-colors: active)": { forcedColorAdjust: "none" } },
  },
});
