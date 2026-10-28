// Accent profile — accent × variant가 다섯 semantic tone을 어떻게 조합하는지 정의한다.

import { COLOR, type Accent } from "./colors";

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

export type ColorSpec = {
  background: string;
  color: string;
  borderColor: string;
  hoverBackground?: string;
  hoverOverlay?: string;
  hoverColor?: string;
  hoverBorderColor?: string;
};

// Paperdown-style outlined surface shared by hairline and form controls.
export const outlinedControlProfile = {
  background: COLOR.bg.raised,
  color: COLOR.ink.primary,
  borderColor: COLOR.border.base,
};
export const outlinedControlHover = { borderColor: COLOR.border.hover };

type AccentTones = typeof COLOR.accent.primary;

const variantProfile = (t: AccentTones, primary: boolean): Record<Variant, ColorSpec> => ({
  solid: {
    background: t.solid,
    color: t.wash,
    borderColor: "transparent",
    // primary의 검정 면은 가벼워져야 hover가 읽힌다. semantic solid는 진한 pigment 위를
    // 살짝 어둡게 해 같은 방식으로 한 단계 반응한다.
    hoverOverlay: primary
      ? COLOR.interaction.bgHover.onPrimarySolid
      : COLOR.interaction.bgHover.onAccentSolid,
  },
  soft: {
    background: t.soft,
    color: t.ink,
    borderColor: "transparent",
    hoverOverlay: COLOR.interaction.bgHover.onSurface,
  },
  hairline: {
    ...outlinedControlProfile,
    color: primary ? outlinedControlProfile.color : t.ink,
    hoverBorderColor: outlinedControlHover.borderColor,
  },
  ghost: {
    background: "transparent",
    color: t.ink,
    borderColor: "transparent",
    hoverOverlay: COLOR.interaction.bgHover.onSurface,
  },
  muted: {
    background: "transparent",
    color: t.subtle,
    borderColor: "transparent",
    hoverOverlay: COLOR.interaction.bgHover.onSurface,
  },
});

export const accentProfile = (accent: Accent, variant: Variant): ColorSpec =>
  variantProfile(COLOR.accent[accent], accent === "primary")[variant];
