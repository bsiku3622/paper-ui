// Accent profile — accent × variant가 다섯 semantic tone을 어떻게 조합하는지 정의한다.

import { tokens } from "../tokens";
import { type Accent, type Variant } from "../resolvers/color";

export type ColorSpec = {
  background: string;
  color: string;
  borderColor: string;
  hoverBackground?: string;
  hoverOverlay?: string;
  hoverColor?: string;
};

type AccentTones = typeof tokens.color.accent.primary;

const variantProfile = (t: AccentTones, primary: boolean): Record<Variant, ColorSpec> => ({
  solid: {
    background: t.solid,
    color: t.wash,
    borderColor: "transparent",
    // primary의 검정 면은 가벼워져야 hover가 읽힌다. semantic solid는 진한 pigment 위를
    // 살짝 어둡게 해 같은 방식으로 한 단계 반응한다.
    hoverOverlay: primary
      ? tokens.color.interaction.bgHover.onPrimarySolid
      : tokens.color.interaction.bgHover.onAccentSolid,
  },
  soft: {
    background: t.soft,
    color: t.solid,
    borderColor: "transparent",
    hoverOverlay: tokens.color.interaction.bgHover.onSurface,
  },
  hairline: {
    background: "transparent",
    color: t.solid,
    borderColor: t.soft,
    hoverOverlay: tokens.color.interaction.bgHover.onSurface,
  },
  hairlineMuted: {
    background: "transparent",
    color: t.subtle,
    borderColor: t.soft,
    hoverOverlay: tokens.color.interaction.bgHover.onSurface,
  },
  ghost: {
    background: "transparent",
    color: t.solid,
    borderColor: "transparent",
    hoverOverlay: tokens.color.interaction.bgHover.onSurface,
  },
  muted: {
    background: "transparent",
    color: t.subtle,
    borderColor: "transparent",
    hoverOverlay: tokens.color.interaction.bgHover.onSurface,
  },
});

export const accentProfile = (accent: Accent, variant: Variant): ColorSpec =>
  variantProfile(tokens.color.accent[accent], accent === "primary")[variant];
