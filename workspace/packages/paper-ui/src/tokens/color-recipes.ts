import { COLOR, STATUSES, SYSTEM_COLORS, type Accent, type AccentTone, type Status } from "./colors";

export const VARIANTS = [
  "solid",
  "soft",
  "hairline",
  "dashed",
  "ghost",
  "muted",
] as const;
export type Variant = (typeof VARIANTS)[number];

export const SELECTABLE_VARIANTS = ["hairline", "ghost", "muted"] as const satisfies readonly Variant[];
export type SelectableVariant = (typeof SELECTABLE_VARIANTS)[number];

export const FILLABLE_VARIANTS = ["hairline", "dashed", "ghost", "muted"] as const satisfies readonly Variant[];
export type FillableVariant = (typeof FILLABLE_VARIANTS)[number];

export const INPUT_VARIANTS = ["hairline", "ghost"] as const satisfies readonly FillableVariant[];
export type InputVariant = (typeof INPUT_VARIANTS)[number];

export const SEGMENT_VARIANTS = ["track", "outline"] as const;
export type SegmentVariant = (typeof SEGMENT_VARIANTS)[number];

type VariantRecipe = {
  face: AccentTone | "none";
  ink: AccentTone;
  border: "none" | "solid" | "dashed";
  hover: "tint" | "border";
  selected?: AccentTone;
};

export const VARIANT_RECIPE = {
  solid: { face: "solid", ink: "wash", border: "none", hover: "tint" },
  soft: { face: "soft", ink: "ink", border: "none", hover: "tint" },
  hairline: { face: "none", ink: "ink", border: "solid", hover: "border", selected: "soft" },
  dashed: { face: "none", ink: "subtle", border: "dashed", hover: "border" },
  ghost: { face: "none", ink: "ink", border: "none", hover: "tint", selected: "soft" },
  muted: { face: "none", ink: "subtle", border: "none", hover: "tint", selected: "soft" },
} as const satisfies Record<Variant, VariantRecipe>;

export const VARIANT_LINE = Object.fromEntries(VARIANTS.map((variant) => [variant, VARIANT_RECIPE[variant].border === "none" ? "none" : "line"])) as Record<Variant, "line" | "none">;

export type AccentProfile = {
  face: string;
  ink: string;
  border: string;
  borderStyle: "solid" | "dashed";
  hover: { tint: string } | { border: string };
  selected?: { face: string; ink: string; border: string };
};

export const outlinedControlProfile = {
  face: COLOR.bg.raised,
  ink: COLOR.ink.primary,
  border: COLOR.border.base,
  hoverBorder: COLOR.border.hover,
  status: Object.fromEntries(STATUSES.map((status) => [status, COLOR.accent[status].ink])) as Record<Status, string>,
};

export const itemProfile = {
  hoverTint: COLOR.interaction.bgHover.onSurface,
  activeTint: COLOR.interaction.active,
  selectedTint: COLOR.interaction.selected,
  selectedInk: COLOR.ink.primary,
};

export const markProfile = {
  rest: { ring: COLOR.border.base, contrastRing: COLOR.border.strong, knob: COLOR.control.knob, track: COLOR.control.track },
  checked: { face: COLOR.accent.primary.solid, ring: "transparent", mark: COLOR.accent.primary.wash, knob: COLOR.accent.primary.wash },
  invalid: { ring: COLOR.accent.error.ink },
};

export const markForcedProfile = {
  rest: { face: SYSTEM_COLORS.canvas, ring: SYSTEM_COLORS.buttonText, track: SYSTEM_COLORS.buttonFace, knob: SYSTEM_COLORS.buttonText },
  checked: { face: SYSTEM_COLORS.highlight, ring: SYSTEM_COLORS.highlight, mark: SYSTEM_COLORS.highlightText, knob: SYSTEM_COLORS.highlightText },
  disabled: { ring: SYSTEM_COLORS.grayText, face: SYSTEM_COLORS.grayText },
};

const hoverTint = (accent: Accent, face: VariantRecipe["face"]): string =>
  face !== "solid"
    ? COLOR.interaction.bgHover.onSurface
    : accent === "primary"
      ? COLOR.interaction.bgHover.onPrimarySolid
      : COLOR.interaction.bgHover.onAccentSolid;

export const accentProfile = (accent: Accent, variant: Variant): AccentProfile => {
  const tones = COLOR.accent[accent];
  const recipe: VariantRecipe = VARIANT_RECIPE[variant];
  return {
    face: recipe.face === "none" ? "transparent" : tones[recipe.face],
    ink: tones[recipe.ink],
    border: recipe.border === "none" ? "transparent" : outlinedControlProfile.border,
    borderStyle: recipe.border === "dashed" ? "dashed" : "solid",
    hover: recipe.hover === "tint" ? { tint: hoverTint(accent, recipe.face) } : { border: outlinedControlProfile.hoverBorder },
    ...(recipe.selected ? { selected: { face: tones[recipe.selected], ink: tones.ink, border: "transparent" } } : {}),
  };
};
