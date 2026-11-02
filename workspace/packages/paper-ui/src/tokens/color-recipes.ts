// Colour profiles — what an accent × variant control, an outlined control, a neutral item and the selection marks paint.

import { COLOR, STATUSES, SYSTEM_COLORS, type Accent, type AccentTone, type Status } from "./colors";

// `solid`은 pigment 자체, `soft`는 가벼운 면, wash 는 solid 면 위 글자다. `muted`는 Ghost형 투명 면에
// 선택된 accent의 subtle tone을 전경으로 쓰는 보조 variant다.
export const VARIANTS = [
  "solid",
  "soft",
  "hairline",
  "dashed",
  "ghost",
  "muted",
] as const;
export type Variant = (typeof VARIANTS)[number];

// 선택될 수 있는 variant — 면이 없거나 옅어서 선택된 상태를 soft 면으로 알릴 수 있는 것들.
export const SELECTABLE_VARIANTS = ["hairline", "ghost", "muted"] as const satisfies readonly Variant[];
export type SelectableVariant = (typeof SELECTABLE_VARIANTS)[number];

// 면을 스스로 칠하지 않는 variant — 선과 글자만 정하고 면은 fill 이 고른다. 안 주면 놓인 곳이 비친다.
export const FILLABLE_VARIANTS = ["hairline", "dashed", "ghost", "muted"] as const satisfies readonly Variant[];
export type FillableVariant = (typeof FILLABLE_VARIANTS)[number];

// 입력 틀의 가장자리 — 실선이거나 없거나. 점선은 넣을 자리를 말하는 표시라 입력에는 없다.
export const INPUT_VARIANTS = ["hairline", "ghost"] as const satisfies readonly FillableVariant[];
export type InputVariant = (typeof INPUT_VARIANTS)[number];

type VariantRecipe = {
  // 면: accent tone, 또는 없음. 없으면 fill 이 고르고, 안 주면 놓인 곳이 비친다.
  face: AccentTone | "none";
  // 글자: accent tone.
  ink: AccentTone;
  // 경계: 없음(투명), 또는 base 색의 실선 · 점선.
  border: "none" | "solid" | "dashed";
  // hover: 면 위에 tint를 얹거나 경계가 한 단계 진해진다.
  hover: "tint" | "border";
  // 선택된 variant가 바꿔 입는 면.
  selected?: AccentTone;
};

// variant 하나가 tone을 어떻게 고르는지의 유일한 표. accentProfile과 Color 페이지의 설명이 모두 이 표에서 나온다.
export const VARIANT_RECIPE = {
  solid: { face: "solid", ink: "wash", border: "none", hover: "tint" },
  soft: { face: "soft", ink: "ink", border: "none", hover: "tint" },
  hairline: { face: "none", ink: "ink", border: "solid", hover: "border", selected: "soft" },
  dashed: { face: "none", ink: "subtle", border: "dashed", hover: "border" },
  ghost: { face: "none", ink: "ink", border: "none", hover: "tint", selected: "soft" },
  muted: { face: "none", ink: "subtle", border: "none", hover: "tint", selected: "soft" },
} as const satisfies Record<Variant, VariantRecipe>;

// What an accent × variant control paints: a face, an ink and a border, how it answers a hover, and for the
// selectable variants the face it wears when selected.
export type AccentProfile = {
  face: string;
  ink: string;
  border: string;
  borderStyle: "solid" | "dashed";
  hover: { tint: string } | { border: string };
  selected?: { face: string; ink: string; border: string };
};

// The line a hairline and a form control share, and the face and ink of a form control. A status draws its border in its
// own ink, and that border is also what the control keeps on hover.
export const outlinedControlProfile = {
  face: COLOR.bg.raised,
  ink: COLOR.ink.primary,
  border: COLOR.border.base,
  hoverBorder: COLOR.border.hover,
  status: Object.fromEntries(STATUSES.map((status) => [status, COLOR.accent[status].ink])) as Record<Status, string>,
};

// A neutral item — a row, a menu entry, a segment — shows its state as a tint over its own face: five percent
// under the pointer, the selected and the pressed tints from the interaction roles. Its ink stays the primary ink.
export const itemProfile = {
  hoverTint: COLOR.interaction.bgHover.onSurface,
  activeTint: COLOR.interaction.active,
  selectedTint: COLOR.interaction.selected,
  selectedInk: COLOR.ink.primary,
};

// The marks of Checkbox, Radio and Switch. An off mark wears the line an input wears, on no face of its own; a Switch keeps
// its track, because a knob has to stand on something. That line is under 3:1, so it is a documented exception, and
// prefers-contrast: more lifts it with border.base. The checked face and the mark on it are the primary accent's solid and
// wash. A checked Switch's ring is transparent: painted in the face's colour it would thicken the track's anti-aliased edge.
export const markProfile = {
  rest: { ring: COLOR.border.base, face: "transparent", knob: COLOR.bg.raised, track: COLOR.control.track },
  checked: { face: COLOR.accent.primary.solid, ring: "transparent", mark: COLOR.accent.primary.wash, knob: COLOR.bg.raised },
  invalid: { ring: COLOR.accent.error.ink },
};

// The same marks when the OS owns the colours. The names are SYSTEM_COLORS and nothing else: the checked face
// is Highlight and what is drawn on it HighlightText, a disabled mark is GrayText.
export const markForcedProfile = {
  rest: { face: SYSTEM_COLORS.canvas, ring: SYSTEM_COLORS.buttonText, track: SYSTEM_COLORS.buttonFace, knob: SYSTEM_COLORS.buttonText },
  checked: { face: SYSTEM_COLORS.highlight, ring: SYSTEM_COLORS.highlight, mark: SYSTEM_COLORS.highlightText, knob: SYSTEM_COLORS.highlightText },
  disabled: { ring: SYSTEM_COLORS.grayText, face: SYSTEM_COLORS.grayText },
};

// primary의 검정 면은 가벼워져야 hover가 읽힌다. semantic solid는 진한 pigment 위를
// 살짝 어둡게 해 같은 방식으로 한 단계 반응한다. 그 밖의 면은 지면 위 tint를 쓴다.
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
