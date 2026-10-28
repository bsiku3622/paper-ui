// Accent profile — accent × variant가 다섯 semantic tone을 어떻게 조합하는지 정의한다.

import { COLOR, type Accent, type AccentTone } from "./colors";

// `solid`은 pigment 자체, wash·soft는 각각 가벼운 면이다. `muted`는 Ghost형 투명 면에
// 선택된 accent의 subtle tone을 전경으로 쓰는 보조 variant다.
export const VARIANTS = [
  "solid",
  "soft",
  "hairline",
  "ghost",
  "muted",
] as const;
export type Variant = (typeof VARIANTS)[number];

// 선택될 수 있는 variant — 면이 없거나 옅어서 선택된 상태를 soft 면으로 알릴 수 있는 것들.
export const SELECTABLE_VARIANTS = ["hairline", "ghost", "muted"] as const satisfies readonly Variant[];
export type SelectableVariant = (typeof SELECTABLE_VARIANTS)[number];

type VariantRecipe = {
  // 면: accent tone, 컨트롤과 같은 raised 면, 또는 없음(투명).
  face: AccentTone | "raised" | "none";
  // 글자: accent tone.
  ink: AccentTone;
  // 경계: 없음(투명) 또는 base 경계.
  border: "none" | "base";
  // hover: 면 위에 tint를 얹거나 경계가 한 단계 진해진다.
  hover: "tint" | "border";
  // 선택된 variant가 바꿔 입는 면.
  selected?: AccentTone;
};

// variant 하나가 tone을 어떻게 고르는지의 유일한 표. accentProfile과 Color 페이지의 설명이 모두 이 표에서 나온다.
export const VARIANT_RECIPE = {
  solid: { face: "solid", ink: "wash", border: "none", hover: "tint" },
  soft: { face: "soft", ink: "ink", border: "none", hover: "tint" },
  hairline: { face: "raised", ink: "ink", border: "base", hover: "border", selected: "soft" },
  ghost: { face: "none", ink: "ink", border: "none", hover: "tint", selected: "soft" },
  muted: { face: "none", ink: "subtle", border: "none", hover: "tint", selected: "soft" },
} as const satisfies Record<Variant, VariantRecipe>;

export type ColorSpec = {
  background: string;
  color: string;
  borderColor: string;
  hoverTint?: string;
  hoverBorderColor?: string;
};

// Paperdown-style outlined surface shared by hairline and form controls.
export const outlinedControlProfile = {
  background: COLOR.bg.raised,
  color: COLOR.ink.primary,
  borderColor: COLOR.border.base,
};
export const outlinedControlHover = { borderColor: COLOR.border.hover };

// primary의 검정 면은 가벼워져야 hover가 읽힌다. semantic solid는 진한 pigment 위를
// 살짝 어둡게 해 같은 방식으로 한 단계 반응한다. 그 밖의 면은 지면 위 tint를 쓴다.
const hoverTint = (accent: Accent, face: VariantRecipe["face"]): string =>
  face !== "solid"
    ? COLOR.interaction.bgHover.onSurface
    : accent === "primary"
      ? COLOR.interaction.bgHover.onPrimarySolid
      : COLOR.interaction.bgHover.onAccentSolid;

// primary의 raised 면 글자는 폼 컨트롤과 같은 outlinedControlProfile의 색을 따른다. 상태색은 자기 ink tone이다.
const inkColor = (accent: Accent, recipe: VariantRecipe): string =>
  recipe.face === "raised" && accent === "primary" ? outlinedControlProfile.color : COLOR.accent[accent][recipe.ink];

export const accentProfile = (accent: Accent, variant: Variant): ColorSpec => {
  const tones = COLOR.accent[accent];
  const recipe: VariantRecipe = VARIANT_RECIPE[variant];
  return {
    background: recipe.face === "none" ? "transparent" : recipe.face === "raised" ? outlinedControlProfile.background : tones[recipe.face],
    color: inkColor(accent, recipe),
    borderColor: recipe.border === "none" ? "transparent" : outlinedControlProfile.borderColor,
    ...(recipe.hover === "tint"
      ? { hoverTint: hoverTint(accent, recipe.face) }
      : { hoverBorderColor: outlinedControlHover.borderColor }),
  };
};
