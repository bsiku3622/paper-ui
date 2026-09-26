import { describe, expect, it } from "vitest";

import { PALETTE_TOKENS } from "./color-ladder";
import { COLOR_VALUES, COLOR_VALUES_DARK, STATUS, STATUS_PALETTE } from "./colors";
import { ACCENT_PALETTES, ALPHA_STEPS, OKLCH_PALETTE, PALETTE_STEPS } from "./palette";

const leaves = (value: unknown): string[] =>
  typeof value === "string"
    ? [value]
    : Object.values(value as Record<string, unknown>).flatMap(leaves);

describe("color systems", () => {
  it("orders the single neutral palette from light to dark", () => {
    const ramp = PALETTE_STEPS.map((step) => OKLCH_PALETTE.neutral[step][0]);
    expect(ramp[0]).toBeGreaterThan(ramp[ramp.length - 1]!);
    expect(ramp.every((lightness, index) => index === 0 || ramp[index - 1]! >= lightness)).toBe(true);
  });

  it("generates one complete HEX palette and percentage alpha scale", () => {
    expect(Object.keys(PALETTE_TOKENS.neutral)).toEqual(PALETTE_STEPS);
    expect(Object.keys(PALETTE_TOKENS.accent)).toEqual(ACCENT_PALETTES);
    for (const step of ALPHA_STEPS) expect(PALETTE_TOKENS[`alpha${step}`]).toBeDefined();
    expect(leaves(PALETTE_TOKENS).every((value) => /^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(value))).toBe(true);
  });

  it("maps every semantic leaf directly to a generated palette token", () => {
    for (const semantics of [COLOR_VALUES, COLOR_VALUES_DARK]) {
      const generatedTokens = new Set(leaves(PALETTE_TOKENS));
      expect(leaves(semantics).every((value) => generatedTokens.has(value))).toBe(true);
    }
  });

  it("selects palette steps per semantic theme", () => {
    for (const mode of ["light", "dark"] as const) {
      const semantic = mode === "light" ? COLOR_VALUES : COLOR_VALUES_DARK;
      const palette = PALETTE_TOKENS;
      const dark = mode === "dark";

      expect(semantic.bg).toEqual({
        raised: palette.neutral[dark ? "950" : "0"],
        canvas: palette.neutral[dark ? "925" : "50"],
        sunken: palette.neutral[dark ? "800" : "200"],
        well: palette.neutral[dark ? "700" : "300"],
      });
      expect(semantic.border).toEqual({
        base: palette.neutral[dark ? "800" : "200"],
        strong: palette.neutral[dark ? "700" : "300"],
        hover: palette.neutral[dark ? "600" : "400"],
      });
      expect(semantic.ink).toEqual({
        primary: palette.neutral[dark ? "0" : "950"],
        secondary: palette.neutral[dark ? "400" : "700"],
        tertiary: palette.neutral["500"],
      });
      expect(semantic.accent.primary).toEqual({
        solid: palette.neutral[dark ? "100" : "950"],
        wash: palette.neutral[dark ? "950" : "0"],
        soft: palette.neutral[dark ? "800" : "300"],
        subtle: palette.neutral[dark ? "300" : "400"],
      });
    }
  });

  it("maps the four accent roles from their named palette", () => {
    for (const status of STATUS) {
      const palette = STATUS_PALETTE[status];
      for (const mode of ["light", "dark"] as const) {
        const dark = mode === "dark";
        const generated = PALETTE_TOKENS.accent[palette];
        const accent = mode === "light" ? COLOR_VALUES.accent[status] : COLOR_VALUES_DARK.accent[status];
        expect(accent).toEqual({
          solid: generated[dark ? "400" : "600"],
          wash: generated[dark ? "950" : "50"],
          soft: generated[dark ? "925" : "150"],
          subtle: generated[dark ? "500" : "300"],
        });
      }
    }
  });

  it("keeps focus color and translucent interaction states inside the interaction system", () => {
    expect(COLOR_VALUES.interaction.focus).toBe(PALETTE_TOKENS.accent.blue["600"]);
    expect(COLOR_VALUES_DARK.interaction.focus).toBe(PALETTE_TOKENS.accent.blue["400"]);
    expect(COLOR_VALUES.interaction.bgHover.onSurface).toMatch(/^#[\da-f]{8}$/i);
    expect(COLOR_VALUES.interaction.bgHover.onPrimarySolid).toMatch(/^#[\da-f]{8}$/i);
    expect(COLOR_VALUES.interaction.bgHover.onAccentSolid).toMatch(/^#[\da-f]{8}$/i);
    expect(COLOR_VALUES_DARK.overlay.scrim).toMatch(/^#[\da-f]{8}$/i);
    expect(COLOR_VALUES.shadow.overlay).toMatch(/^#[\da-f]{8}$/i);
  });
});
