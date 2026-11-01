import { describe, expect, it } from "vitest";

import { COLOR_SELECTION, COLOR_VALUES, COLOR_VALUES_DARK, OPACITY_ROLES, OPACITY_VALUES, paletteValue, type PalettePath } from "./colors";
import { ACCENT_IDENTITIES, OKLCH_PALETTE, PALETTE_TOKENS } from "./palette";

// The design values of Color, written down: which palette step each role selects in each theme, the OKLCH source of
// the palette and the HEX it generates. The invariants live in color.test.ts and hold for any design; these files say
// which design this is. A change to one is deliberate: review the diff, then `vitest -u` rewrites the files.

const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

// Every role as a dotted path, with the palette step it selects and the HEX that step generates.
const roles = (mode: "light" | "dark") => {
  const found: Record<string, string> = {};
  const walk = (tree: object, prefix: string[]) => {
    for (const [key, value] of Object.entries(tree)) {
      if (typeof value === "string") found[[...prefix, key].join(".")] = `${value} ${paletteValue(value as PalettePath)}`;
      else walk(value, [...prefix, key]);
    }
  };
  walk(COLOR_SELECTION[mode], []);
  return found;
};

describe("the golden Color files", () => {
  it("[foundations.color.role-table] [foundations.color.tone-table] [foundations.color.opacity] records the palette step every role selects in each theme, with its HEX, and the alpha step and value of the opacity roles", async () => {
    await expect(json({ light: roles("light"), dark: roles("dark"), opacity: { alpha: OPACITY_ROLES, value: OPACITY_VALUES } })).toMatchFileSnapshot("./__golden__/color-roles.json");
  });

  it("[foundations.color.palette-table] records the OKLCH source of the palette and every HEX it generates", async () => {
    await expect(json({ oklch: OKLCH_PALETTE, hex: PALETTE_TOKENS })).toMatchFileSnapshot("./__golden__/palette-oklch.json");
  });
});

describe("the relations the design relies on", () => {
  const palette = PALETTE_TOKENS;

  it("[foundations.color.one-selection] selects palette steps per semantic theme", () => {
    for (const mode of ["light", "dark"] as const) {
      const semantic = mode === "light" ? COLOR_VALUES : COLOR_VALUES_DARK;
      const dark = mode === "dark";

      expect(semantic.bg).toEqual({
        raised: palette.neutral[dark ? "925" : "0"],
        canvas: palette.neutral[dark ? "950" : "50"],
        sunken: palette.neutral[dark ? "950" : "100"],
      });
      expect(semantic.control.track).toBe(palette.neutral[dark ? "800" : "200"]);
      expect(semantic.border).toEqual({
        base: palette.neutral[dark ? "800" : "200"],
        strong: palette.neutral[dark ? "700" : "300"],
        hover: palette.neutral[dark ? "600" : "400"],
      });
      expect(semantic.ink).toEqual({
        primary: palette.neutral[dark ? "100" : "900"],
        secondary: palette.neutral[dark ? "400" : "700"],
        tertiary: palette.neutral[dark ? "500" : "650"],
      });
      expect(semantic.accent.primary).toEqual({
        solid: palette.neutral[dark ? "50" : "950"],
        wash: palette.neutral[dark ? "950" : "0"],
        ink: palette.neutral[dark ? "100" : "900"],
        soft: palette.neutral[dark ? "875" : "200"],
        subtle: palette.neutral[dark ? "500" : "700"],
      });
    }
  });

  it("[foundations.color.between-steps] anchors the amber ramp at hue 90 for its palest step and 65 for the rest", () => {
    const amber = OKLCH_PALETTE.accent.amber;
    const { hue, paleHue } = ACCENT_IDENTITIES.amber;
    expect([paleHue!.hue, hue]).toEqual([90, 65]);
    expect(amber["150"][2]).toBe(paleHue!.hue);
    expect(amber[paleHue!.to][2]).toBe(hue);
  });

  it("[foundations.color.surface-ladder] folds sunken into canvas in the dark theme and turns the light canvas into the dark primary solid", () => {
    expect(COLOR_VALUES_DARK.accent.primary.solid).toBe(COLOR_VALUES.bg.canvas);
    expect(COLOR_VALUES_DARK.bg.canvas).toBe(COLOR_VALUES_DARK.bg.sunken);
  });

  it("[foundations.color.link] [foundations.color.interaction-states] draws the focus ring in blue 600 and 400, and links in blue 700 and 300", () => {
    expect(COLOR_VALUES.interaction.focus).toBe(palette.accent.blue["600"]);
    expect(COLOR_VALUES_DARK.interaction.focus).toBe(palette.accent.blue["400"]);
    expect(COLOR_VALUES.interaction.link).toBe(palette.accent.blue["700"]);
    expect(COLOR_VALUES_DARK.interaction.link).toBe(palette.accent.blue["300"]);
  });

  it("[foundations.color.shadow-depths] gives the two shadow depths one colour in light and two in dark", () => {
    expect(COLOR_VALUES.shadow.floating).toBe(COLOR_VALUES.shadow.lifted);
    expect(COLOR_VALUES_DARK.shadow.floating).not.toBe(COLOR_VALUES_DARK.shadow.lifted);
  });
});
