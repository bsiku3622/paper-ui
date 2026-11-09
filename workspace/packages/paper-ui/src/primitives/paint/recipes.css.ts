import { createVar } from "@vanilla-extract/css";

import { CONTROL_LINE_ROOM, ENABLED_SELECTOR, SELECTED_SELECTOR, SHAPE_RECIPES, SYSTEM_COLORS, VALUE_ATTRIBUTE, markForcedProfile, markProfile, outlinedControlProfile, previewSelector, stateSelector, stateStyle, strokeRing, tokens, type DividerLevel } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const pointedAt = `:is(:hover, ${previewSelector("hover")})`;

const { style, styleVariants } = layered("components");

const CONTRAST = "(prefers-contrast: more)";
const FORCED = "(forced-colors: active)";

export const scrimPaint = style({ background: tokens.color.overlay.scrim });

export const sidebarFace = createVar();
export const sidebarPaint = style({ vars: { [sidebarFace]: tokens.color.bg.canvas } });

export const fieldPaint = style([stateStyle.field, { color: outlinedControlProfile.ink, borderColor: outlinedControlProfile.border, vars: CONTROL_LINE_ROOM.line }]);

// The hover border's selector is long, so the rule that holds against it needs one as long.
const noStatus = `&&:not([${VALUE_ATTRIBUTE.status}])`;
export const fieldLinelessPaint = style({
  selectors: { [noStatus]: { borderColor: "transparent", vars: CONTROL_LINE_ROOM.none } },
  "@media": {
    "(hover: hover) and (prefers-contrast: no-preference) and (forced-colors: none)": { selectors: { [`${noStatus}${pointedAt}${ENABLED_SELECTOR}`]: { borderColor: "transparent" } } },
    [CONTRAST]: { selectors: { [noStatus]: { borderColor: tokens.color.border.base, vars: CONTROL_LINE_ROOM.line } } },
    [FORCED]: { selectors: { [noStatus]: { vars: CONTROL_LINE_ROOM.line } } },
  },
});

export const fieldFace = style({ backgroundColor: tokens.color.control.field });

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

const pressing = `&:is(:active, ${previewSelector("active")})${ENABLED_SELECTOR}:not(${stateSelector("focusVisible")})`;
export const markPressPaint = style({
  selectors: { [pressing]: { outline: `calc(${tokens.shape.focus.width} + ${tokens.shape.focus.offset}) solid ${tokens.color.interaction.active}`, outlineOffset: "0px" } },
  "@media": { "(forced-colors: active)": { selectors: { [pressing]: { outlineColor: SYSTEM_COLORS.highlight } } } },
});

const errored = `[${VALUE_ATTRIBUTE.status}="error"]`;
const disabled = stateSelector("disabled");
const checkedOrMixed = "&:is(:checked, :indeterminate)";
// A Checkbox is unchecked when it is neither checked nor mixed. A Radio is never mixed: its :indeterminate means its group has no choice yet.
const unchecked = "&:where(:not(:checked, :indeterminate))";
// Zero specificity, so a disabled mark still wins over an error one.
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

const pigment = tokens.color.marker.fill;
export const markerPaint = style({
  backgroundColor: "transparent",
  backgroundImage: `linear-gradient(${pigment}, ${pigment})`,
  color: tokens.color.marker.ink,
  "@media": { [FORCED]: { forcedColorAdjust: "none", backgroundColor: SYSTEM_COLORS.mark, backgroundImage: "none", color: SYSTEM_COLORS.markText } },
});

// A background is painted away under forced colours, so the dot keeps the OS's text colour there.
export const dotPaint = style({
  background: "currentColor",
  "@media": { [FORCED]: { forcedColorAdjust: "none", background: SYSTEM_COLORS.canvasText } },
});

export const linkPaint = style({ color: tokens.color.interaction.link });

// A border, which is why the line stays drawn under forced colours.
export const linePaint = styleVariants({
  base: { borderColor: tokens.color.border.base },
  strong: { borderColor: tokens.color.border.strong },
} satisfies Record<DividerLevel, object>);

// Under forced colours the author's colours stay, or the tail would turn into one flat disc.
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
  item: style({
    color: tokens.color.ink.secondary,
    selectors: { [`&${SELECTED_SELECTOR}`]: { color: tokens.color.ink.primary } },
    "@media": {
      "(hover: hover)": { selectors: { [`&${pointedAt}${ENABLED_SELECTOR}`]: { color: tokens.color.ink.primary } } },
      [FORCED]: { forcedColorAdjust: "none", color: SYSTEM_COLORS.buttonText, selectors: { [`&${SELECTED_SELECTOR}`]: { color: SYSTEM_COLORS.highlightText } } },
    },
  }),
  outline: style({
    backgroundColor: tokens.color.control.field,
    borderColor: tokens.color.border.base,
    "@media": { [FORCED]: { forcedColorAdjust: "none", backgroundColor: SYSTEM_COLORS.buttonFace, borderColor: SYSTEM_COLORS.buttonText } },
  }),
  underline: style({
    borderColor: tokens.color.border.base,
    "@media": { [FORCED]: { forcedColorAdjust: "none", borderColor: SYSTEM_COLORS.buttonText } },
  }),
  underlineThumb: style({
    backgroundColor: tokens.color.ink.primary,
    "@media": { [FORCED]: { forcedColorAdjust: "none", backgroundColor: SYSTEM_COLORS.highlight } },
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

export const sliderVars = { share: createVar(), thumb: createVar(), origin: createVar() };
// createVar returns the var() reference, and the inline style that sets it is keyed by the property inside it.
export const sliderShareProperty = sliderVars.share.slice("var(".length, -")".length);
export const sliderOriginProperty = sliderVars.origin.slice("var(".length, -")".length);
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

// With an origin the fill spans from the origin to the thumb, on whichever side the thumb stands.
const sliderAt = (share: string) => `calc(${sliderVars.thumb} / 2 + (100% - ${sliderVars.thumb}) * ${share})`;
const sliderFrom = sliderAt(`min(${sliderVars.share}, ${sliderVars.origin})`);
const sliderTo = sliderAt(`max(${sliderVars.share}, ${sliderVars.origin})`);
const sliderSpan = (fill: string, track: string, side: string) =>
  `linear-gradient(to ${side}, ${track} ${sliderFrom}, ${fill} ${sliderFrom}, ${fill} ${sliderTo}, ${track} ${sliderTo})`;
export const sliderOriginPaint = style({
  backgroundImage: sliderSpan(tokens.color.accent.primary.solid, tokens.color.control.track, "right"),
  selectors: { "&:dir(rtl)": { backgroundImage: sliderSpan(tokens.color.accent.primary.solid, tokens.color.control.track, "left") } },
  "@media": {
    [FORCED]: {
      backgroundImage: sliderSpan(SYSTEM_COLORS.highlight, SYSTEM_COLORS.buttonFace, "right"),
      selectors: { "&:dir(rtl)": { backgroundImage: sliderSpan(SYSTEM_COLORS.highlight, SYSTEM_COLORS.buttonFace, "left") } },
    },
  },
});

export const datePickerEmptyPaint = style({ color: tokens.color.ink.tertiary });
export const datePickerIconPaint = style({ color: tokens.color.ink.secondary });
