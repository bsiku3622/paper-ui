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
  hoverBorderColor?: string;
};

type AccentTones = typeof tokens.color.accent.primary;

// `Muted`는 별도 pigment가 아니라 같은 solid의 가벼운 쓰임이다. softMuted는 wash 면으로,
// 투명 variant는 같은 foreground/border를 유지한 채 hover overlay만 받는다.
const mutedVariants = (t: AccentTones): Pick<Record<Variant, ColorSpec>, "softMuted" | "outlineMuted" | "hairlineMuted" | "ghostMuted"> => ({
  softMuted: {
    background: t.wash,
    color: t.solid,
    borderColor: "transparent",
    hoverOverlay: tokens.color.interaction.hover,
  },
  outlineMuted: {
    background: "transparent",
    color: t.solid,
    borderColor: t.edgeStrong,
    hoverOverlay: tokens.color.interaction.hover,
  },
  hairlineMuted: {
    background: "transparent",
    color: t.solid,
    borderColor: t.edge,
    hoverOverlay: tokens.color.interaction.hover,
    hoverBorderColor: t.edgeStrong,
  },
  ghostMuted: {
    background: "transparent",
    color: t.solid,
    borderColor: "transparent",
    hoverOverlay: tokens.color.interaction.hover,
  },
});

const variantProfile = (t: AccentTones, primary: boolean): Record<Variant, ColorSpec> => ({
  solid: {
    background: t.solid,
    color: t.wash,
    borderColor: "transparent",
    // primary의 검정 면은 가벼워져야 hover가 읽힌다. semantic solid는 진한 pigment 위를
    // 살짝 어둡게 해 같은 방식으로 한 단계 반응한다.
    ...(primary
      ? { hoverOverlay: "rgba(255, 255, 255, 0.12)" }
      : { hoverOverlay: "rgba(0, 0, 0, 0.14)" }),
  },
  soft: {
    background: t.soft,
    color: t.solid,
    borderColor: "transparent",
    hoverOverlay: tokens.color.interaction.hover,
  },
  outline: {
    background: "transparent",
    color: t.solid,
    borderColor: t.edgeStrong,
    hoverOverlay: tokens.color.interaction.hover,
  },
  hairline: {
    background: "transparent",
    color: t.solid,
    borderColor: t.edge,
    hoverOverlay: tokens.color.interaction.hover,
    hoverBorderColor: t.edgeStrong,
  },
  ghost: {
    background: "transparent",
    color: t.solid,
    borderColor: "transparent",
    hoverOverlay: tokens.color.interaction.hover,
  },
  ...mutedVariants(t),
});

export const accentProfile = (accent: Accent, variant: Variant): ColorSpec =>
  variantProfile(tokens.color.accent[accent], accent === "primary")[variant];
