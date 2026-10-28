import { describe, expect, it } from "vitest";

import { OKLCH_PALETTE, PALETTE_TOKENS } from "./palette";
import { BOX_THEMES, COLOR_MODES, THEME_PREFERENCES } from "./color-modes";
import {
  ACCENTS, ACCENT_PALETTE, ACCENT_TONES, ACCENT_TONE_STEPS, BORDER_LEVELS, COLOR_CONTRAST_MORE, COLOR_SELECTION, COLOR_VALUES, COLOR_VALUES_BY_MODE,
  COLOR_VALUES_DARK, DEPTHS, GROUND_ROLES, OPACITY_ROLES, OPACITY_VALUES, PRIMARY_TONE_STEPS, STATUSES, STATUS_EXCEPTIONS, STATUS_PALETTE, SURFACES,
  SURFACE_ORDER, SYSTEM_COLORS, isGroundRole, paletteValue,
} from "./colors";
import { ACCENT_IDENTITIES, ACCENT_PALETTES, ACCENT_STEPS, ALPHA_OPACITY, ALPHA_STEPS, NEUTRAL_BASE_STEPS, NEUTRAL_BETWEEN, PALETTE_STEPS } from "./palette";

const leaves = (value: unknown): string[] =>
  typeof value === "string"
    ? [value]
    : Object.values(value as Record<string, unknown>).flatMap(leaves);

// The leaves of a tree as dotted paths, in source order.
const pathsOf = (tree: unknown, prefix = ""): string[] =>
  typeof tree === "string" ? [prefix.slice(0, -1)] : Object.entries(tree as object).flatMap(([key, value]) => pathsOf(value, `${prefix}${key}.`));
const valueAt = (tree: unknown, path: readonly string[]) => path.reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], tree);

const luminance = (hex: string) => {
  const channels = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
};
const contrast = (foreground: string, background: string) => {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0]! + 0.05) / (values[1]! + 0.05);
};

describe("color systems", () => {
  it("keeps every palette token and every semantic value as authored", () => {
    expect({ palette: PALETTE_TOKENS, light: COLOR_VALUES, dark: COLOR_VALUES_DARK }).toMatchSnapshot();
  });

  it("orders the single neutral palette from light to dark", () => {
    const ramp = PALETTE_STEPS.map((step) => OKLCH_PALETTE.neutral[step][0]);
    expect(ramp[0]).toBeGreaterThan(ramp[ramp.length - 1]!);
    expect(ramp.every((lightness, index) => index === 0 || ramp[index - 1]! >= lightness)).toBe(true);
  });

  it("keeps accent ramps darkening without isolated chroma dips", () => {
    for (const name of ACCENT_PALETTES) {
      const ramp = ACCENT_STEPS.map((step) => OKLCH_PALETTE.accent[name][step]);
      for (let index = 1; index < ramp.length; index += 1) {
        expect(ramp[index]![0]).toBeLessThan(ramp[index - 1]![0]);
      }
      for (let index = 1; index < ramp.length - 1; index += 1) {
        expect(ramp[index]![1]).toBeGreaterThanOrEqual(Math.min(ramp[index - 1]![1], ramp[index + 1]![1]) - 1e-8);
      }
    }
  });

  it("aligns accent lightness and preserves the base chroma envelope", () => {
    for (const step of ACCENT_STEPS) {
      const reference = OKLCH_PALETTE.accent.blue;
      for (const name of ACCENT_PALETTES) {
        const ramp = OKLCH_PALETTE.accent[name];
        expect(ramp[step][0]).toBe(reference[step][0]);
        if (!ACCENT_IDENTITIES[name].chromaRatio?.[step]) {
          expect(ramp[step][1] / ramp["600"][1]).toBeCloseTo(reference[step][1] / reference["600"][1], 8);
        }
      }
    }
  });

  it("guides pale amber from yellow into orange without hue reversals", () => {
    const amber = OKLCH_PALETTE.accent.amber;
    const { hue, paleHue } = ACCENT_IDENTITIES.amber;
    expect(amber["150"][2]).toBe(paleHue!.hue);
    expect(amber[paleHue!.to][2]).toBe(hue);
    for (let index = 1; index < ACCENT_STEPS.length; index += 1) {
      expect(amber[ACCENT_STEPS[index]!]![2]).toBeLessThanOrEqual(amber[ACCENT_STEPS[index - 1]!]![2]);
    }
  });

  it("generates one complete HEX palette and percentage alpha scale", () => {
    expect(Object.keys(PALETTE_TOKENS.neutral)).toEqual(PALETTE_STEPS);
    expect(Object.keys(PALETTE_TOKENS.accent)).toEqual(ACCENT_PALETTES);
    for (const step of ALPHA_STEPS) expect(PALETTE_TOKENS[`alpha${step}`]).toBeDefined();
    expect(leaves(PALETTE_TOKENS).every((value) => /^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(value))).toBe(true);
  });

  it("places each in-between neutral step exactly where the anchors do not reach", () => {
    expect(Object.keys(NEUTRAL_BETWEEN).sort()).toEqual(PALETTE_STEPS.filter((step) => !(NEUTRAL_BASE_STEPS as readonly string[]).includes(step)).sort());
  });

  it("derives every semantic value from the selection table", () => {
    const resolve = (tree: unknown): unknown =>
      typeof tree === "string" ? paletteValue(tree as Parameters<typeof paletteValue>[0]) : Object.fromEntries(Object.entries(tree as object).map(([key, value]) => [key, resolve(value)]));
    expect(COLOR_VALUES).toEqual(resolve(COLOR_SELECTION.light));
    expect(COLOR_VALUES_DARK).toEqual(resolve(COLOR_SELECTION.dark));
    expect(Object.keys(COLOR_SELECTION.light)).toEqual(["bg", "control", "ink", "border", "accent", "interaction", "overlay", "shadow"]);
    expect(Object.keys(COLOR_SELECTION.light.interaction).at(-1)).toBe("link");
  });

  it("selects in both themes the same roles, and every selection resolves to a generated token", () => {
    const paths = (tree: unknown, prefix = ""): string[] =>
      typeof tree === "string" ? [prefix.slice(0, -1)] : Object.entries(tree as object).flatMap(([key, value]) => paths(value, `${prefix}${key}.`));
    expect(paths(COLOR_SELECTION.dark)).toEqual(paths(COLOR_SELECTION.light));
    const generated = new Set(leaves(PALETTE_TOKENS));
    const selections = (tree: unknown): string[] => (typeof tree === "string" ? [tree] : Object.values(tree as object).flatMap(selections));
    for (const path of [...selections(COLOR_SELECTION.light), ...selections(COLOR_SELECTION.dark)]) {
      expect(generated.has(paletteValue(path as Parameters<typeof paletteValue>[0])), path).toBe(true);
    }
  });

  it("names the ramp every accent draws from", () => {
    expect(Object.keys(ACCENT_PALETTE)).toEqual([...ACCENTS]);
    expect(ACCENT_PALETTE.primary).toBe("neutral");
    for (const status of STATUSES) expect(ACCENT_PALETTE[status]).toBe(STATUS_PALETTE[status]);
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

  it("maps the five accent roles from the tone tables and the status exceptions", () => {
    expect(Object.keys(STATUS_EXCEPTIONS)).toEqual(["warning"]);
    expect(Object.keys(STATUS_EXCEPTIONS.warning)).toEqual(["light"]);
    expect(Object.keys(STATUS_EXCEPTIONS.warning.light)).toEqual(["solid", "wash"]);
    for (const mode of ["light", "dark"] as const) {
      const index = mode === "light" ? 0 : 1;
      const values = mode === "light" ? COLOR_VALUES : COLOR_VALUES_DARK;
      for (const tone of ACCENT_TONES) {
        expect(values.accent.primary[tone], `primary ${tone}`).toBe(PALETTE_TOKENS.neutral[PRIMARY_TONE_STEPS[tone][index]]);
      }
      for (const status of STATUSES) {
        const generated = PALETTE_TOKENS.accent[STATUS_PALETTE[status]];
        const exceptions: Partial<Record<(typeof ACCENT_TONES)[number], { accent: keyof typeof generated } | { neutral: keyof typeof PALETTE_TOKENS.neutral }>> =
          (STATUS_EXCEPTIONS as Record<string, Record<string, object>>)[status]?.[mode] ?? {};
        for (const tone of ACCENT_TONES) {
          const exception = exceptions[tone];
          const expected = !exception ? generated[ACCENT_TONE_STEPS[tone][index]] : "accent" in exception ? generated[exception.accent] : PALETTE_TOKENS.neutral[exception.neutral];
          expect(values.accent[status][tone], `${status} ${mode} ${tone}`).toBe(expected);
        }
      }
    }
  });

  it("keeps light accents and supporting text readable across surfaces", () => {
    const light = COLOR_VALUES;
    for (const surface of Object.values(light.bg)) {
      for (const ink of Object.values(light.ink)) expect(contrast(ink, surface)).toBeGreaterThanOrEqual(4.5);
      for (const accent of Object.values(light.accent)) {
        expect(contrast(accent.ink, surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(accent.subtle, surface)).toBeGreaterThanOrEqual(4.5);
      }
    }
    for (const [name, accent] of Object.entries(light.accent)) {
      expect(contrast(accent.ink, accent.soft)).toBeGreaterThanOrEqual(4.5);
      // A status listed in STATUS_EXCEPTIONS (the white-on-amber light solid) is a contrast exception.
      if (name in STATUS_EXCEPTIONS) expect(accent.wash).toBe(PALETTE_TOKENS.neutral["0"]);
      else expect(contrast(accent.wash, accent.solid)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps dark surface depth and small foregrounds readable", () => {
    const dark = COLOR_VALUES_DARK;
    expect(dark.accent.primary.solid).toBe(COLOR_VALUES.bg.canvas);
    for (const surface of Object.values(dark.bg)) {
      for (const ink of Object.values(dark.ink)) expect(contrast(ink, surface)).toBeGreaterThanOrEqual(4.5);
      for (const accent of Object.values(dark.accent)) {
        expect(contrast(accent.subtle, surface)).toBeGreaterThanOrEqual(4.5);
      }
    }
    for (const accent of Object.values(dark.accent)) {
      expect(accent.soft).not.toBe(accent.wash);
      expect(contrast(accent.ink, accent.soft)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(accent.wash, accent.solid)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps focus color and translucent interaction states inside the interaction system", () => {
    expect(COLOR_VALUES.interaction.focus).toBe(PALETTE_TOKENS.accent.blue["600"]);
    expect(COLOR_VALUES_DARK.interaction.focus).toBe(PALETTE_TOKENS.accent.blue["400"]);
    expect(COLOR_VALUES.interaction.bgHover.onSurface).toMatch(/^#[\da-f]{8}$/i);
    expect(COLOR_VALUES.interaction.bgHover.onPrimarySolid).toMatch(/^#[\da-f]{8}$/i);
    expect(COLOR_VALUES.interaction.bgHover.onAccentSolid).toMatch(/^#[\da-f]{8}$/i);
    expect(COLOR_VALUES_DARK.overlay.scrim).toMatch(/^#[\da-f]{8}$/i);
    for (const depth of DEPTHS) expect(COLOR_VALUES.shadow[depth]).toMatch(/^#[\da-f]{8}$/i);
  });

  it("names the shadow colours by depth", () => {
    expect(DEPTHS).toEqual(["floating", "lifted"]);
    expect(COLOR_VALUES.shadow.floating).toBe(COLOR_VALUES.shadow.lifted);
    expect(COLOR_VALUES_DARK.shadow.floating).not.toBe(COLOR_VALUES_DARK.shadow.lifted);
  });

  it("gives links their own role, in the colour of the info ink, and keeps it readable everywhere", () => {
    expect(COLOR_VALUES.interaction.link).toBe(PALETTE_TOKENS.accent.blue["700"]);
    expect(COLOR_VALUES_DARK.interaction.link).toBe(PALETTE_TOKENS.accent.blue["300"]);
    for (const values of [COLOR_VALUES, COLOR_VALUES_DARK]) {
      for (const surface of Object.values(values.bg)) expect(contrast(values.interaction.link, surface)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("color modes", () => {
  it("names the modes once; every per-mode table has exactly those", () => {
    expect([...COLOR_MODES]).toEqual(["light", "dark"]);
    expect(Object.keys(COLOR_SELECTION)).toEqual([...COLOR_MODES]);
    expect(Object.keys(COLOR_VALUES_BY_MODE)).toEqual([...COLOR_MODES]);
    expect(Object.keys(COLOR_CONTRAST_MORE)).toEqual([...COLOR_MODES]);
    expect(COLOR_VALUES_BY_MODE.light).toBe(COLOR_VALUES);
    expect(COLOR_VALUES_BY_MODE.dark).toBe(COLOR_VALUES_DARK);
    expect([...THEME_PREFERENCES]).toEqual([...COLOR_MODES, "system"]);
    expect([...BOX_THEMES]).toEqual([...COLOR_MODES, "inverse"]);
  });

  it("[foundations.theme.scope-roles] keeps ground roles to the focus ring and the shadow colours, all of them in the Color tree", () => {
    for (const role of GROUND_ROLES) expect(valueAt(COLOR_VALUES, role), role.join(".")).toBeDefined();
    const ground = pathsOf(COLOR_VALUES).filter((path) => isGroundRole(path.split(".")));
    expect(ground).toEqual(["interaction.focus", "shadow.floating", "shadow.lifted"]);
    expect(isGroundRole(["ink", "primary"])).toBe(false);
    expect(isGroundRole(["interaction", "link"])).toBe(false);
  });
});

describe("surface ladder", () => {
  it("[foundations.color.surface-ladder] recedes front to back in both modes, strictly in light and folded into canvas in dark", () => {
    expect([...SURFACE_ORDER].sort()).toEqual([...SURFACES].sort());
    for (const mode of COLOR_MODES) {
      const { bg, ink } = COLOR_VALUES_BY_MODE[mode];
      const steps = SURFACE_ORDER.map((surface) => luminance(bg[surface]));
      steps.forEach((step, index) => {
        if (index > 0) expect(step, `${mode} ${SURFACE_ORDER[index]}`).toBeLessThanOrEqual(steps[index - 1]!);
      });
      for (const surface of SURFACES) {
        for (const level of Object.values(ink)) expect(contrast(level, bg[surface]), `${mode} ${surface}`).toBeGreaterThanOrEqual(4.5);
      }
    }
    const light = COLOR_VALUES.bg;
    expect(luminance(light.raised)).toBeGreaterThan(luminance(light.canvas));
    expect(luminance(light.canvas)).toBeGreaterThan(luminance(light.sunken));
    expect(COLOR_VALUES_DARK.bg.canvas).toBe(COLOR_VALUES_DARK.bg.sunken);
    expect(luminance(COLOR_VALUES_DARK.bg.raised)).toBeGreaterThan(luminance(COLOR_VALUES_DARK.bg.canvas));
  });
});

describe("roles beyond the selection table", () => {
  it("takes opacity from the alpha scale, outside COLOR_VALUES", () => {
    expect(OPACITY_ROLES).toEqual({ disabled: "50", subdued: "70" });
    expect(OPACITY_VALUES.disabled).toBe(String(ALPHA_OPACITY["50"]));
    expect(OPACITY_VALUES.subdued).toBe(String(ALPHA_OPACITY["70"]));
    expect(OPACITY_VALUES).toEqual({ disabled: "0.5", subdued: "0.7" });
    expect(pathsOf(COLOR_VALUES).some((path) => path.startsWith("opacity"))).toBe(false);
  });

  it("names forced-colors roles with CSS system colors only", () => {
    const systemColors = [
      "AccentColor", "AccentColorText", "ActiveText", "ButtonBorder", "ButtonFace", "ButtonText", "Canvas", "CanvasText", "Field", "FieldText",
      "GrayText", "Highlight", "HighlightText", "LinkText", "Mark", "MarkText", "SelectedItem", "SelectedItemText", "VisitedText",
    ];
    for (const value of Object.values(SYSTEM_COLORS)) expect(systemColors, value).toContain(value);
  });

  it("[foundations.color.contrast-more] lifts borders to 3:1 and tertiary ink to 4.5:1 on every surface of the mode", () => {
    const generated = new Set(leaves(PALETTE_TOKENS));
    for (const mode of COLOR_MODES) {
      const lifted = COLOR_CONTRAST_MORE[mode];
      const base = COLOR_VALUES_BY_MODE[mode];
      expect(pathsOf(lifted), mode).toEqual([...BORDER_LEVELS].map((level) => `border.${level}`).concat("ink.tertiary"));
      for (const path of pathsOf(lifted)) {
        const role = path.split(".");
        expect(generated.has(valueAt(lifted, role) as string), `${mode} ${path}`).toBe(true);
        expect(valueAt(base, role), `${mode} ${path} exists`).toBeDefined();
      }
      for (const surface of Object.values(base.bg)) {
        for (const level of BORDER_LEVELS) {
          expect(contrast(lifted.border[level], surface), `${mode} border.${level}`).toBeGreaterThanOrEqual(3);
          expect(contrast(lifted.border[level], surface), `${mode} border.${level} lifts`).toBeGreaterThan(contrast(base.border[level], surface));
        }
        expect(contrast(lifted.ink.tertiary, surface), `${mode} ink.tertiary`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(lifted.ink.tertiary, surface), `${mode} ink.tertiary lifts`).toBeGreaterThan(contrast(base.ink.tertiary, surface));
      }
    }
  });
});
