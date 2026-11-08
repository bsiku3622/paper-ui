// The paints other primitives and Atoms borrow. Colour lives in the Paint primitives and nowhere else, so a
// part that needs a colour takes the class from here instead of reading tokens.color itself.

import { createVar } from "@vanilla-extract/css";

import { CONTROL_LINE_ROOM, ENABLED_SELECTOR, SELECTED_SELECTOR, SHAPE_RECIPES, SYSTEM_COLORS, VALUE_ATTRIBUTE, markForcedProfile, markProfile, outlinedControlProfile, previewSelector, stateSelector, stateStyle, strokeRing, tokens, type DividerLevel } from "../../tokens";
import { layered } from "../../tokens/layers.css";

// The pointer over a target, or its preview (tokens/state.ts), at the weight :hover has.
const pointedAt = `:is(:hover, ${previewSelector("hover")})`;

const { style, styleVariants } = layered("components");

const CONTRAST = "(prefers-contrast: more)";
const FORCED = "(forced-colors: active)";

// The modal backdrop of a Floating panel.
export const scrimPaint = style({ background: tokens.color.overlay.scrim });

// The colour of an input frame: the outlined control's ink and border, a status drawing its own border, and the
// border rising under a pointer. The face is the frame's Surface fill or the ground's, so it is not set here. A frame with a line
// keeps the room for it.
export const fieldPaint = style([stateStyle.field, { color: outlinedControlProfile.ink, borderColor: outlinedControlProfile.border, vars: CONTROL_LINE_ROOM.line }]);

// A frame with no line, at rest and under a pointer, keeps no room for one, so its face and the ground's shadow reach its edge. A
// status still draws its own, because a colour on the edge is what says it, and takes the room back from the inset. The hover
// border's selector is long, so holding against it takes one as long. Asked for more contrast it draws the line after all, since
// its edge is under 3:1, and the hover border rises from it as it does from any line. Forced colours draw the edge of every frame.
const noStatus = `&&:not([${VALUE_ATTRIBUTE.status}])`;
export const fieldLinelessPaint = style({
  selectors: { [noStatus]: { borderColor: "transparent", vars: CONTROL_LINE_ROOM.none } },
  "@media": {
    "(hover: hover) and (prefers-contrast: no-preference) and (forced-colors: none)": { selectors: { [`${noStatus}${pointedAt}${ENABLED_SELECTOR}`]: { borderColor: "transparent" } } },
    [CONTRAST]: { selectors: { [noStatus]: { borderColor: tokens.color.border.base, vars: CONTROL_LINE_ROOM.line } } },
    [FORCED]: { selectors: { [noStatus]: { vars: CONTROL_LINE_ROOM.line } } },
  },
});

// The face of a frame that chose none: white wherever it stands, a step above a card's face in dark.
export const fieldFace = style({ backgroundColor: tokens.color.control.field });

// What stands inside an input frame: the placeholder is quiet, an adornment is secondary, and an action rests tertiary and
// rises to primary under a pointer that can hover. A Select shows its empty choice as a placeholder, and its arrow follows.
export const fieldPlaceholderPaint = style({ selectors: { "&::placeholder": { color: tokens.color.ink.tertiary } } });
export const fieldAdornmentPaint = style({ color: tokens.color.ink.secondary });
export const fieldActionPaint = style({
  color: tokens.color.ink.tertiary,
  "@media": { "(hover: hover)": { selectors: { [`&${pointedAt}${ENABLED_SELECTOR}`]: { color: tokens.color.ink.primary } } } },
});
const EMPTY_CHOICE = ':has(option[value=""]:checked)';
export const selectEmptyPaint = style({ selectors: { [`&${EMPTY_CHOICE}`]: { color: tokens.color.ink.tertiary } } });
export const selectArrowPaint = style({
  color: tokens.color.ink.secondary,
  selectors: { [`${selectEmptyPaint}${EMPTY_CHOICE} &`]: { color: tokens.color.ink.tertiary } },
});

// A Select's list. The option the keyboard or the pointer stands on wears the hover tint; the chosen one is told by its check and not
// by a face, so pointing and choosing never read as one. Under forced colours the pointed option is Highlight, as a hover is.
const pointed = `&${stateSelector("focused")}`;
export const selectOptionPaint = style({
  color: tokens.color.ink.primary,
  selectors: { [pointed]: { backgroundColor: tokens.color.interaction.bgHover.onSurface } },
  "@media": {
    [FORCED]: { forcedColorAdjust: "none", color: SYSTEM_COLORS.canvasText, selectors: { [pointed]: { backgroundColor: SYSTEM_COLORS.highlight, color: SYSTEM_COLORS.highlightText } } },
  },
});
export const selectCheckPaint = style({
  color: tokens.color.ink.secondary,
  "@media": { [FORCED]: { color: "inherit" } },
});

// A mark under a pressing pointer wears a halo in the pressed tint, as wide as the focus ring and its offset together, so it fills
// the room the ring would take and never reads as one. While the ring shows, it stays and the halo does not: both answer to the same
// attribute, so a press shows exactly one of the two. Forced colours draw the halo in Highlight, as they do a hover.
const pressing = `&:is(:active, ${previewSelector("active")})${ENABLED_SELECTOR}:not(${stateSelector("focusVisible")})`;
export const markPressPaint = style({
  selectors: { [pressing]: { outline: `calc(${tokens.shape.focus.width} + ${tokens.shape.focus.offset}) solid ${tokens.color.interaction.active}`, outlineOffset: "0px" } },
  "@media": { "(forced-colors: active)": { selectors: { [pressing]: { outlineColor: SYSTEM_COLORS.highlight } } } },
});

// The colours of a selection mark. At rest a mark is the white face of an off mark in the one grey line, the edge an input frame
// has; an error draws the ring in the error ink, and what is checked is the primary accent's solid with its wash on top. A Checkbox
// draws the check or the dash, a Radio the dot, and a Switch a track and a knob. Asked for more contrast an off mark's ring turns the
// strong grey. Under forced colours the OS owns the palette: the marks keep their own colours only to draw the checked state, from
// system colours alone, and a disabled one turns GrayText.
const errored = `[${VALUE_ATTRIBUTE.status}="error"]`;
const disabled = stateSelector("disabled");
const checkedOrMixed = "&:is(:checked, :indeterminate)";
// A Checkbox is unchecked when it is neither checked nor mixed. A Radio is never mixed: its :indeterminate means its group has no choice yet.
const unchecked = "&:where(:not(:checked, :indeterminate))";
// A Radio and a Switch have no mixed state. Zero specificity, so a disabled mark still wins over an error one.
const off = "&:where(:not(:checked))";
const forcedMark = markForcedProfile.checked;

export const markPaint = styleVariants({
  checkbox: {
    backgroundColor: tokens.color.control.mark,
    borderColor: markProfile.rest.ring,
    vars: CONTROL_LINE_ROOM.line,
    selectors: {
      [checkedOrMixed]: { backgroundColor: markProfile.checked.face, borderColor: markProfile.checked.face },
      "&:checked::after": { borderColor: markProfile.checked.mark },
      "&:indeterminate::after": { backgroundColor: markProfile.checked.mark },
      [`${unchecked}${errored}`]: { borderColor: markProfile.invalid.ring },
    },
    "@media": {
      [CONTRAST]: { selectors: { [unchecked]: { borderColor: markProfile.rest.contrastRing } } },
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
    backgroundColor: tokens.color.control.mark,
    borderColor: markProfile.rest.ring,
    vars: CONTROL_LINE_ROOM.line,
    selectors: {
      "&:checked": { backgroundColor: markProfile.checked.face, borderColor: markProfile.checked.face },
      "&:checked::after": { backgroundColor: markProfile.checked.mark },
      [`${off}${errored}`]: { borderColor: markProfile.invalid.ring },
    },
    "@media": {
      [CONTRAST]: { selectors: { [off]: { borderColor: markProfile.rest.contrastRing } } },
      [FORCED]: {
        forcedColorAdjust: "none",
        backgroundColor: markForcedProfile.rest.face,
        borderColor: markForcedProfile.rest.ring,
        selectors: {
          "&:checked": { backgroundColor: forcedMark.face, borderColor: forcedMark.ring },
          "&:checked::after": { backgroundColor: forcedMark.mark },
          [`${off}${errored}`]: { borderColor: markForcedProfile.rest.ring },
          [`&${disabled}`]: { borderColor: markForcedProfile.disabled.ring },
          [`&:checked${disabled}`]: { backgroundColor: markForcedProfile.disabled.face },
        },
      },
    },
  },
  switch: {
    backgroundColor: markProfile.rest.track,
    selectors: {
      "&::after": { backgroundColor: markProfile.rest.knob },
      // The ring fades out rather than leaving: a transparent shadow has something to fade to and paints nothing on the track's rim.
      "&:checked": { backgroundColor: markProfile.checked.face, boxShadow: strokeRing(markProfile.checked.ring) },
      "&:checked::after": { backgroundColor: markProfile.checked.knob },
      [`${off}${errored}`]: { boxShadow: strokeRing(markProfile.invalid.ring) },
    },
    "@media": {
      [CONTRAST]: { selectors: { [`&${off}`]: { boxShadow: strokeRing(markProfile.rest.contrastRing) } } },
      [FORCED]: {
        forcedColorAdjust: "none",
        backgroundColor: markForcedProfile.rest.track,
        selectors: {
          "&&": { boxShadow: strokeRing(markForcedProfile.rest.ring) },
          "&::after": { backgroundColor: markForcedProfile.rest.knob },
          "&:checked": { backgroundColor: forcedMark.face, boxShadow: strokeRing(forcedMark.ring) },
          "&:checked::after": { backgroundColor: forcedMark.knob },
          [`${off}${errored}`]: { boxShadow: strokeRing(markForcedProfile.rest.ring) },
          [`&${disabled}`]: { boxShadow: strokeRing(markForcedProfile.disabled.ring) },
          [`&:checked${disabled}`]: { backgroundColor: markForcedProfile.disabled.face, boxShadow: strokeRing(markForcedProfile.disabled.ring) },
        },
      },
    },
  },
});

// The highlighter: its pigment, laid as an image so the band keeps its own height, and the ink on it. It is decoration and
// says no state, so under forced colours the OS's Mark pair stands in for both.
const pigment = tokens.color.marker.fill;
export const markerPaint = style({
  backgroundColor: "transparent",
  backgroundImage: `linear-gradient(${pigment}, ${pigment})`,
  color: tokens.color.marker.ink,
  "@media": { [FORCED]: { forcedColorAdjust: "none", backgroundColor: SYSTEM_COLORS.mark, backgroundImage: "none", color: SYSTEM_COLORS.markText } },
});

// The dot beside a Badge's letters takes their ink. A background is painted away under forced colours, so the dot keeps the OS's text colour there.
export const dotPaint = style({
  background: "currentColor",
  "@media": { [FORCED]: { forcedColorAdjust: "none", background: SYSTEM_COLORS.canvasText } },
});

// A link's ink. Where it is underlined is the Link's own anatomy.
export const linkPaint = style({ color: tokens.color.interaction.link });

// The line of a Divider: a border, which is why it stays drawn under forced colours.
export const linePaint = styleVariants({
  base: { borderColor: tokens.color.border.base },
  strong: { borderColor: tokens.color.border.strong },
} satisfies Record<DividerLevel, object>);

// The tail a Spinner turns: from nothing up to its ink, in the primary ink or (ink "inherit") the ink of the text it sits in. Its
// ring is cut by the Atom's mask. Under forced colours the author's colours stay, or the tail would turn into one flat disc.
const spinnerTail = (ink: string) => `conic-gradient(transparent ${SHAPE_RECIPES.spinner.tail}, ${ink})`;
export const spinnerPaint = styleVariants({
  ink: {
    backgroundImage: spinnerTail(tokens.color.ink.primary),
    "@media": { [FORCED]: { forcedColorAdjust: "none", backgroundImage: spinnerTail(SYSTEM_COLORS.canvasText) } },
  },
  inherit: {
    backgroundImage: spinnerTail("currentColor"),
    "@media": { [FORCED]: { forcedColorAdjust: "none" } },
  },
});

// A SegmentControl: a groove, the chip that slides on it, and the words, quiet until chosen. Under forced colours the chip is the
// OS's Highlight and the groove keeps an edge, because a face alone would say nothing there. Asked for more contrast the chip draws an ink line.
export const segmentPaint = {
  track: style({
    backgroundColor: tokens.color.control.track,
    "@media": { [FORCED]: { forcedColorAdjust: "none", backgroundColor: SYSTEM_COLORS.buttonFace, selectors: { "&&": { boxShadow: strokeRing(SYSTEM_COLORS.buttonText) } } } },
  }),
  thumb: style({
    backgroundColor: tokens.color.control.thumb,
    "@media": {
      [CONTRAST]: { boxShadow: strokeRing(tokens.color.ink.primary) },
      [FORCED]: { forcedColorAdjust: "none", backgroundColor: SYSTEM_COLORS.highlight },
    },
  }),
  // A choice's words are read before it is chosen, so they rest in the secondary ink, not the quiet tertiary.
  item: style({
    color: tokens.color.ink.secondary,
    selectors: { [`&${SELECTED_SELECTOR}`]: { color: tokens.color.ink.primary } },
    "@media": {
      "(hover: hover)": { selectors: { [`&${pointedAt}${ENABLED_SELECTOR}`]: { color: tokens.color.ink.primary } } },
      [FORCED]: { forcedColorAdjust: "none", color: SYSTEM_COLORS.buttonText, selectors: { [`&${SELECTED_SELECTOR}`]: { color: SYSTEM_COLORS.highlightText } } },
    },
  }),
  // The outlined group: an input's face in the one grey line, the same line between the choices, and the chosen face. A choice under
  // the pointer takes the hover tint. Under forced colours the frame is ButtonFace in a ButtonText line and the chosen one is Highlight.
  outline: style({
    backgroundColor: tokens.color.control.field,
    borderColor: tokens.color.border.base,
    "@media": { [FORCED]: { forcedColorAdjust: "none", backgroundColor: SYSTEM_COLORS.buttonFace, borderColor: SYSTEM_COLORS.buttonText } },
  }),
  outlineItem: style({
    color: tokens.color.ink.secondary,
    borderColor: tokens.color.border.base,
    selectors: { [`&${SELECTED_SELECTOR}`]: { backgroundColor: tokens.color.control.chosen, color: tokens.color.ink.primary } },
    "@media": {
      "(hover: hover)": { selectors: { [`&${pointedAt}${ENABLED_SELECTOR}:not(${SELECTED_SELECTOR})`]: { backgroundColor: tokens.color.interaction.bgHover.onSurface } } },
      [FORCED]: {
        forcedColorAdjust: "none",
        color: SYSTEM_COLORS.buttonText,
        borderColor: SYSTEM_COLORS.buttonText,
        selectors: { [`&${SELECTED_SELECTOR}`]: { backgroundColor: SYSTEM_COLORS.highlight, color: SYSTEM_COLORS.highlightText } },
      },
    },
  }),
};

// A Slider: the groove filled with the primary solid up to where the thumb stands, and a wash thumb in a solid rim. The fill's end is
// the one thing that moves: the Atom writes the share and says how wide its thumb is, and a thumb's centre never reaches the track's
// ends. A range fills from the other side in a right-to-left page.
export const sliderVars = { share: createVar(), thumb: createVar() };
// createVar returns the var() reference, and the inline style that sets it is keyed by the property inside it.
export const sliderShareProperty = sliderVars.share.slice("var(".length, -")".length);
const sliderEnd = `calc(${sliderVars.thumb} / 2 + (100% - ${sliderVars.thumb}) * ${sliderVars.share})`;
const sliderFill = (fill: string, track: string, side: string) => `linear-gradient(to ${side}, ${fill} ${sliderEnd}, ${track} ${sliderEnd})`;
const sliderThumbPaint = { backgroundColor: tokens.color.accent.primary.wash, borderColor: tokens.color.accent.primary.solid };
const sliderForcedThumb = { backgroundColor: SYSTEM_COLORS.buttonFace, borderColor: SYSTEM_COLORS.buttonText };
export const sliderPaint = style({
  backgroundImage: sliderFill(tokens.color.accent.primary.solid, tokens.color.control.track, "right"),
  selectors: {
    "&:dir(rtl)": { backgroundImage: sliderFill(tokens.color.accent.primary.solid, tokens.color.control.track, "left") },
    "&::-webkit-slider-thumb": sliderThumbPaint,
    "&::-moz-range-thumb": sliderThumbPaint,
    [`&${errored}`]: { boxShadow: strokeRing(markProfile.invalid.ring) },
  },
  "@media": {
    [FORCED]: {
      forcedColorAdjust: "none",
      backgroundImage: sliderFill(SYSTEM_COLORS.highlight, SYSTEM_COLORS.buttonFace, "right"),
      selectors: {
        "&:dir(rtl)": { backgroundImage: sliderFill(SYSTEM_COLORS.highlight, SYSTEM_COLORS.buttonFace, "left") },
        "&::-webkit-slider-thumb": sliderForcedThumb,
        "&::-moz-range-thumb": sliderForcedThumb,
      },
    },
  },
});
