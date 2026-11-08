import { tokens, ACCENTS, STATUSES, VARIANTS, ENABLED_SELECTOR, SELECTED_SELECTOR, previewSelector, STATE_TINT_PROPERTY, SYSTEM_COLORS, accentProfile, itemProfile, lineFrame, stateStyle, strokeRing, type Accent, type Ink, type Status, type Variant } from "../tokens";
import { layered } from "../tokens/layers.css";

const utilities = layered("utilities");
const components = layered("components");

export const fillClass = utilities.styleVariants(tokens.color.bg, (background) => ({ backgroundColor: background }));

const STATUS_INK = Object.fromEntries(STATUSES.map((status) => [status, tokens.color.accent[status].ink])) as Record<Status, string>;
const INK_COLOR: Record<Ink, string> = { ...tokens.color.ink, ...STATUS_INK, inherit: "inherit" };

export const inkClass = utilities.styleVariants(INK_COLOR, (color) => ({ color }));

export const hoverGate = components.style({});

const FORCED = "(forced-colors: active)";
const withTint = (tint: string) => ({ vars: { [STATE_TINT_PROPERTY]: tint } });
const gated = `&.${hoverGate}`;
const pointedAt = `:is(:hover, ${previewSelector("hover")})`;
const hovering = `&:where(.${hoverGate}${pointedAt}${ENABLED_SELECTOR})`;
const selected = `&${SELECTED_SELECTOR}`;

const accentClass = (accent: Accent, variant: Variant): string => {
  const spec = accentProfile(accent, variant);
  const hover = "tint" in spec.hover ? withTint(spec.hover.tint) : { borderColor: spec.hover.border };
  const face = spec.selected;
  return components.style({
    // A variant with no face sets none: painting transparent here would override the fill of the utilities layer.
    ...(spec.face === "transparent" ? {} : { backgroundColor: spec.face }),
    color: spec.ink,
    borderColor: spec.border,
    ...lineFrame({ style: spec.borderStyle }),
    selectors: {
      [gated]: stateStyle.tinted,
      ...(face ? { [selected]: { backgroundColor: face.face, color: face.ink, borderColor: face.border } } : {}),
    },
    "@media": {
      "(hover: hover)": {
        selectors: { [hovering]: hover, ...(face ? { [`${selected}:where(.${hoverGate}${pointedAt}${ENABLED_SELECTOR})`]: withTint(itemProfile.hoverTint) } : {}) },
      },
      [`(hover: hover) and ${FORCED}`]: { selectors: { [hovering]: { borderColor: SYSTEM_COLORS.highlight } } },
      ...(face
        ? {
            [FORCED]: { selectors: { [selected]: { forcedColorAdjust: "none", backgroundColor: SYSTEM_COLORS.highlight, backgroundImage: "none", color: SYSTEM_COLORS.highlightText, borderColor: SYSTEM_COLORS.highlight } } },
            "(prefers-contrast: more)": { selectors: { [selected]: { boxShadow: strokeRing(tokens.color.ink.primary) } } },
          }
        : {}),
    },
  });
};

export const accentVariantClass = Object.fromEntries(
  ACCENTS.map((accent) => [accent, Object.fromEntries(VARIANTS.map((variant) => [variant, accentClass(accent, variant)]))]),
) as Record<Accent, Record<Variant, string>>;
