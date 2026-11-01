import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { contrast, luminance, over } from "../../../../tests/support/contrast";
import { OKLCH_PALETTE, PALETTE_TOKENS } from "./palette";
import { SURFACE_THEMES, COLOR_MODES, THEME_PREFERENCES, type ColorMode } from "./color-modes";
import { markProfile } from "./color-recipes";
import {
  ACCENTS, ACCENT_PALETTE, ACCENT_TONES, ACCENT_TONE_STEPS, BORDER_LEVELS, COLOR_CONTRAST_MORE, COLOR_SELECTION, COLOR_VALUES, COLOR_VALUES_BY_MODE,
  COLOR_VALUES_DARK, DEPTHS, GROUND_ROLES, OPACITY_ROLES, OPACITY_VALUES, PRIMARY_TONE_STEPS, STATUSES, STATUS_EXCEPTIONS, STATUS_PALETTE, SURFACE_FILLS,
  SURFACE_ORDER, SYSTEM_COLORS, COLOR, isGroundRole, paletteValue,
} from "./colors";
import { ACCENT_IDENTITIES, ACCENT_PALETTES, ACCENT_STEPS, ALPHA_OPACITY, ALPHA_STEPS, NEUTRAL_BASE_STEPS, NEUTRAL_BETWEEN, PALETTE_STEPS } from "./palette";
import { themeVariables } from "./variables";

const leaves = (value: unknown): string[] =>
  typeof value === "string"
    ? [value]
    : Object.values(value as Record<string, unknown>).flatMap(leaves);

// The leaves of a tree as dotted paths, in source order.
const pathsOf = (tree: unknown, prefix = ""): string[] =>
  typeof tree === "string" ? [prefix.slice(0, -1)] : Object.entries(tree as object).flatMap(([key, value]) => pathsOf(value, `${prefix}${key}.`));
const valueAt = (tree: unknown, path: readonly string[]) => path.reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], tree);

describe("color systems", () => {
  it("[foundations.color.palette-source] orders the single neutral palette from light to dark", () => {
    const ramp = PALETTE_STEPS.map((step) => OKLCH_PALETTE.neutral[step][0]);
    expect(ramp[0]).toBeGreaterThan(ramp[ramp.length - 1]!);
    expect(ramp.every((lightness, index) => index === 0 || ramp[index - 1]! >= lightness)).toBe(true);
  });

  it("[foundations.color.palette-source] keeps accent ramps darkening without isolated chroma dips", () => {
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

  it("[foundations.color.palette-source] [foundations.color.palette-table] aligns accent lightness and preserves the base chroma envelope", () => {
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

  it("[foundations.color.between-steps] never lets the amber hue increase from the pale end to the dark end", () => {
    const amber = OKLCH_PALETTE.accent.amber;
    for (let index = 1; index < ACCENT_STEPS.length; index += 1) {
      expect(amber[ACCENT_STEPS[index]!]![2]).toBeLessThanOrEqual(amber[ACCENT_STEPS[index - 1]!]![2]);
    }
  });

  it("[foundations.color.palette-source] [foundations.color.palette-table] generates one complete HEX palette and percentage alpha scale", () => {
    expect(Object.keys(PALETTE_TOKENS.neutral)).toEqual(PALETTE_STEPS);
    expect(Object.keys(PALETTE_TOKENS.accent)).toEqual(ACCENT_PALETTES);
    for (const step of ALPHA_STEPS) expect(PALETTE_TOKENS[`alpha${step}`]).toBeDefined();
    expect(leaves(PALETTE_TOKENS).every((value) => /^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(value))).toBe(true);
  });

  it("[foundations.color.palette-source] keeps every HEX a faithful encoding of its OKLCH step: lightness kept, and hue kept wherever there is chroma to carry one", () => {
    const toOklch = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [number, number, number];
      const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
      const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
      const n = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
      const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * n;
      const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * n;
      const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * n;
      return [lightness, Math.hypot(a, bb), ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360] as const;
    };
    const rows: [string, readonly [number, number, number], string][] = [
      ...PALETTE_STEPS.map((step) => [`neutral ${step}`, OKLCH_PALETTE.neutral[step], PALETTE_TOKENS.neutral[step]] as [string, readonly [number, number, number], string]),
      ...ACCENT_PALETTES.flatMap((name) => ACCENT_STEPS.map((step) => [`${name} ${step}`, OKLCH_PALETTE.accent[name][step], PALETTE_TOKENS.accent[name][step]] as [string, readonly [number, number, number], string])),
    ];
    for (const [name, [lightness, chroma, hue], hex] of rows) {
      expect(hex, name).toMatch(/^#[\da-f]{6}$/);
      const [encodedLightness, encodedChroma, encodedHue] = toOklch(hex);
      expect(Math.abs(encodedLightness - lightness), `${name} lightness`).toBeLessThan(0.012);
      // Gamut mapping only ever lowers chroma, and 8-bit rounding does the rest.
      expect(encodedChroma, `${name} chroma`).toBeLessThanOrEqual(chroma + 0.012);
      if (Math.min(chroma, encodedChroma) > 0.04) expect(Math.abs(((encodedHue - hue + 540) % 360) - 180), `${name} hue`).toBeLessThan(4);
    }
  });

  it("[foundations.color.between-steps] places each in-between neutral step exactly where the anchors do not reach", () => {
    expect(Object.keys(NEUTRAL_BETWEEN).sort()).toEqual(PALETTE_STEPS.filter((step) => !(NEUTRAL_BASE_STEPS as readonly string[]).includes(step)).sort());
  });

  it("[foundations.color.one-selection] derives every semantic value from the selection table", () => {
    const resolve = (tree: unknown): unknown =>
      typeof tree === "string" ? paletteValue(tree as Parameters<typeof paletteValue>[0]) : Object.fromEntries(Object.entries(tree as object).map(([key, value]) => [key, resolve(value)]));
    expect(COLOR_VALUES).toEqual(resolve(COLOR_SELECTION.light));
    expect(COLOR_VALUES_DARK).toEqual(resolve(COLOR_SELECTION.dark));
    expect(Object.keys(COLOR_SELECTION.light)).toEqual(["bg", "control", "ink", "border", "accent", "interaction", "overlay", "shadow", "marker"]);
    expect(Object.keys(COLOR_SELECTION.light.interaction).at(-1)).toBe("link");
  });

  it("[foundations.color.palette-theme-free] [foundations.color.one-selection] selects in both themes the same roles, and every selection resolves to a generated token", () => {
    const paths = (tree: unknown, prefix = ""): string[] =>
      typeof tree === "string" ? [prefix.slice(0, -1)] : Object.entries(tree as object).flatMap(([key, value]) => paths(value, `${prefix}${key}.`));
    expect(paths(COLOR_SELECTION.dark)).toEqual(paths(COLOR_SELECTION.light));
    const generated = new Set(leaves(PALETTE_TOKENS));
    const selections = (tree: unknown): string[] => (typeof tree === "string" ? [tree] : Object.values(tree as object).flatMap(selections));
    for (const path of [...selections(COLOR_SELECTION.light), ...selections(COLOR_SELECTION.dark)]) {
      expect(generated.has(paletteValue(path as Parameters<typeof paletteValue>[0])), path).toBe(true);
    }
  });

  it("[foundations.color.accent-tones] names the ramp every accent draws from", () => {
    expect(Object.keys(ACCENT_PALETTE)).toEqual([...ACCENTS]);
    expect(ACCENT_PALETTE.primary).toBe("neutral");
    for (const status of STATUSES) expect(ACCENT_PALETTE[status]).toBe(STATUS_PALETTE[status]);
  });

  it("[foundations.color.one-selection] maps every semantic leaf directly to a generated palette token", () => {
    for (const semantics of [COLOR_VALUES, COLOR_VALUES_DARK]) {
      const generatedTokens = new Set(leaves(PALETTE_TOKENS));
      expect(leaves(semantics).every((value) => generatedTokens.has(value))).toBe(true);
    }
  });

  it("[foundations.color.accent-tones] [foundations.color.tone-steps] maps the five accent roles from the tone tables and the status exceptions", () => {
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

  // One readability rule for both themes: small text on every surface, the accent inks on them, and the wash on the solid it sits on.
  const readability = (values: typeof COLOR_VALUES, mode: ColorMode) => {
    for (const [surfaceName, surface] of Object.entries(values.bg)) {
      for (const [level, ink] of Object.entries(values.ink)) expect(contrast(ink, surface), `${mode} ink.${level} on ${surfaceName}`).toBeGreaterThanOrEqual(4.5);
      for (const [name, accent] of Object.entries(values.accent)) {
        expect(contrast(accent.ink, surface), `${mode} ${name}.ink on ${surfaceName}`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(accent.subtle, surface), `${mode} ${name}.subtle on ${surfaceName}`).toBeGreaterThanOrEqual(4.5);
      }
    }
    for (const [name, accent] of Object.entries(values.accent)) {
      expect(contrast(accent.ink, accent.soft), `${mode} ${name}.ink on its soft face`).toBeGreaterThanOrEqual(4.5);
      // A status the exception table lists (the white-on-amber light solid) is the one documented place the wash falls short.
      const exception = mode in ((STATUS_EXCEPTIONS as Record<string, Record<string, object>>)[name] ?? {});
      if (exception) expect(contrast(accent.wash, accent.solid), `${mode} ${name} wash on solid, the documented exception`).toBeLessThan(4.5);
      else expect(contrast(accent.wash, accent.solid), `${mode} ${name} wash on solid`).toBeGreaterThanOrEqual(4.5);
      expect(accent.soft, `${mode} ${name} soft face differs from the wash`).not.toBe(accent.wash);
    }
  };

  it("[foundations.color.contrast-contract] keeps ink, accent ink and accent subtle readable on every surface, and the wash on its solid, in both themes", () => {
    for (const mode of COLOR_MODES) readability(COLOR_VALUES_BY_MODE[mode], mode);
  });

  it("[foundations.color.role-paths] gives light and dark the same tree of roles", () => {
    expect(pathsOf(COLOR_VALUES_DARK)).toEqual(pathsOf(COLOR_VALUES));
    expect(pathsOf(COLOR_SELECTION.dark)).toEqual(pathsOf(COLOR_SELECTION.light));
    expect(pathsOf(COLOR_VALUES)).toEqual(pathsOf(COLOR_SELECTION.light));
  });

  it("[foundations.color.interaction-states] keeps focus color and translucent interaction states inside the interaction system", () => {
    for (const values of [COLOR_VALUES, COLOR_VALUES_DARK]) {
      expect(values.interaction.focus).toMatch(/^#[\da-f]{6}$/i);
      expect(values.interaction.bgHover.onSurface).toMatch(/^#[\da-f]{8}$/i);
      expect(values.interaction.bgHover.onPrimarySolid).toMatch(/^#[\da-f]{8}$/i);
      expect(values.interaction.bgHover.onAccentSolid).toMatch(/^#[\da-f]{8}$/i);
      expect(values.overlay.scrim).toMatch(/^#[\da-f]{8}$/i);
      for (const depth of DEPTHS) expect(values.shadow[depth]).toMatch(/^#[\da-f]{8}$/i);
    }
  });

  it("[foundations.color.shadow-depths] names the shadow colours by depth", () => {
    expect(DEPTHS).toEqual(["floating", "lifted"]);
  });

  it("[foundations.color.link] gives links their own role, and keeps it readable everywhere", () => {
    for (const values of [COLOR_VALUES, COLOR_VALUES_DARK]) {
      for (const surface of Object.values(values.bg)) expect(contrast(values.interaction.link, surface)).toBeGreaterThanOrEqual(4.5);
    }
  });

  // Why Link's underline defaults to "always": the ink alone does not set a link apart from the sentence around it.
  it("[atoms.link.underline] keeps the link ink below 3:1 against body ink in both themes", () => {
    for (const values of [COLOR_VALUES, COLOR_VALUES_DARK]) expect(contrast(values.interaction.link, values.ink.primary)).toBeLessThan(3);
  });
});

// What a control or a mark must show against the surface behind it so that it is found (WCAG 1.4.11): 3:1.
// Two things are documented exceptions and sit in docs/foundations/color.md: the outlined control's boundary (border.base) and the quiet selected faces.
const NON_TEXT = 3;
const EXCEPTIONS = ["border.base as the outlined-control boundary", "accent soft and interaction.selected as quiet selected faces"] as const;

describe("non-text contrast", () => {
  const surfaces = (mode: ColorMode) => Object.entries(COLOR_VALUES_BY_MODE[mode].bg);

  it("[foundations.color.non-text-contrast] holds the selection marks' ring and every fill and ring they take to 3:1 on every surface, in both themes", () => {
    for (const mode of COLOR_MODES) {
      const values = COLOR_VALUES_BY_MODE[mode];
      for (const [surface, background] of surfaces(mode)) {
        const at = `${mode} on ${surface}`;
        expect(contrast(values.ink.tertiary, background), `${at}: the rest ring (ink.tertiary)`).toBeGreaterThanOrEqual(NON_TEXT);
        expect(contrast(values.accent.primary.solid, background), `${at}: the checked fill (accent.primary.solid)`).toBeGreaterThanOrEqual(NON_TEXT);
        expect(contrast(values.interaction.focus, background), `${at}: the focus ring`).toBeGreaterThanOrEqual(NON_TEXT);
        expect(contrast(values.accent.error.ink, background), `${at}: the error ring (accent.error.ink)`).toBeGreaterThanOrEqual(NON_TEXT);
      }
    }
  });

  it("[foundations.color.non-text-contrast] tells an off Switch's track from a checked one, and shows what sits on a checked mark", () => {
    for (const mode of COLOR_MODES) {
      const values = COLOR_VALUES_BY_MODE[mode];
      expect(contrast(values.control.track, values.accent.primary.solid), `${mode}: off track against checked track`).toBeGreaterThanOrEqual(NON_TEXT);
      expect(contrast(values.bg.raised, values.accent.primary.solid), `${mode}: the knob on a checked track`).toBeGreaterThanOrEqual(NON_TEXT);
      expect(contrast(values.accent.primary.wash, values.accent.primary.solid), `${mode}: the check on its fill`).toBeGreaterThanOrEqual(NON_TEXT);
    }
  });

  it("[foundations.color.non-text-contrast] keeps the dark accent ink readable as text, as the light one is", () => {
    for (const [surface, background] of surfaces("dark")) {
      for (const [name, accent] of Object.entries(COLOR_VALUES_DARK.accent)) expect(contrast(accent.ink, background), `dark ${name}.ink on ${surface}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("[foundations.color.non-text-contrast] keeps ink.primary readable over the tints a state lays on a surface, in both themes", () => {
    for (const mode of COLOR_MODES) {
      const values = COLOR_VALUES_BY_MODE[mode];
      for (const [surface, background] of surfaces(mode)) {
        for (const [state, tint] of [["hover", values.interaction.bgHover.onSurface], ["selected", values.interaction.selected], ["active", values.interaction.active]] as const) {
          expect(contrast(values.ink.primary, over(tint, background)), `${mode} ${state} over ${surface}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("[foundations.color.non-text-contrast] [foundations.color.non-text-exceptions] keeps the documented exceptions below 3:1, so the list is honest", () => {
    expect(EXCEPTIONS).toHaveLength(2);
    for (const mode of COLOR_MODES) {
      const values = COLOR_VALUES_BY_MODE[mode];
      for (const [surface, background] of surfaces(mode)) {
        expect(contrast(values.border.base, background), `${mode} border.base on ${surface}`).toBeLessThan(NON_TEXT);
        expect(contrast(values.accent.primary.soft, background), `${mode} accent soft on ${surface}`).toBeLessThan(NON_TEXT);
        expect(contrast(over(values.interaction.selected, background), background), `${mode} selected over ${surface}`).toBeLessThan(NON_TEXT);
      }
    }
  });

  it("[foundations.color.non-text-contrast] [foundations.color.contrast-contract] names the ring of a mark as the quietest ink that holds the contrast: ink.tertiary", () => {
    expect(markProfile.rest.ring).toBe(COLOR.ink.tertiary);
    expect(markProfile.invalid.ring).toBe(COLOR.accent.error.ink);
    expect(markProfile.checked.face).toBe(COLOR.accent.primary.solid);
    expect(markProfile.rest.knob).toBe(COLOR.bg.raised);
  });
});

describe("what the Color page says", () => {
  const colorDoc = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../../../../docs/foundations/color.md"), "utf8");
  // The range of a colour over the surfaces of a mode, to two places.
  const range = (color: string, mode: ColorMode) => {
    const ratios = Object.values(COLOR_VALUES_BY_MODE[mode].bg).map((surface) => contrast(color, surface));
    return `${Math.min(...ratios).toFixed(2)}~${Math.max(...ratios).toFixed(2)}`;
  };

  it("[foundations.color.contrast-contract] rings a mark in the quietest ink that holds 3:1, in the numbers the page gives", () => {
    const quiet = (step: string) => paletteValue(`neutral.${step}` as Parameters<typeof paletteValue>[0]);
    for (const [mode, step] of [["light", "650"], ["dark", "500"]] as const) {
      expect(paletteValue(COLOR_SELECTION[mode].ink.tertiary as Parameters<typeof paletteValue>[0]), mode).toBe(quiet(step));
      expect(new RegExp(`neutral\\.${step}\`이 (?:면 위에서 )?([\\d.]+~[\\d.]+)`).exec(colorDoc)?.[1], `${mode} ring`).toBe(range(COLOR_VALUES_BY_MODE[mode].ink.tertiary, mode));
    }
    // No border role passes the ratio the page names on a light surface, to the one place it writes, so none can stand for the ring.
    const said = Number(/경계 역할은 라이트에서 ([\d.]+)을 넘지 못해/.exec(colorDoc)![1]);
    for (const level of BORDER_LEVELS) for (const surface of Object.values(COLOR_VALUES.bg)) expect(Number(contrast(COLOR_VALUES.border[level], surface).toFixed(1)), level).toBeLessThanOrEqual(said);
    // A checked Switch says so by its face, against the track and the surface around it.
    const face = Number(/켜짐은 면\(최소 ([\d.]+):1\)이 알립니다/.exec(colorDoc)![1]);
    for (const mode of COLOR_MODES) {
      const values = COLOR_VALUES_BY_MODE[mode];
      for (const surface of Object.values(values.bg)) expect(contrast(values.accent.primary.solid, surface), mode).toBeGreaterThanOrEqual(face);
    }
  });

  it("[foundations.color.palette-table] [foundations.color.between-steps] draws the steps of the ramp table and the in-between steps of its sentence from the palette", () => {
    const row = (first: string) => colorDoc.split("\n").find((line) => line.startsWith(`| ${first} |`))!.split("|")[2]!.trim();
    expect(row("neutral").split(" · ")).toEqual(PALETTE_STEPS);
    expect(row("blue · green · amber · red")).toBe(`${ACCENT_STEPS[0]} ~ ${ACCENT_STEPS.at(-1)} (${ACCENT_STEPS.length}단계)`);
    expect(row("alpha")).toBe(`${ALPHA_STEPS[0]} ~ ${ALPHA_STEPS.at(-1)}`);
    expect(/^(`\d+`(?:·`\d+`)*) 같은 중간 단계는/m.exec(colorDoc.split("[contract:foundations.color.between-steps]: #\n")[1]!)?.[1]?.replace(/`/g, "").split("·")).toEqual(Object.keys(NEUTRAL_BETWEEN).sort((a, b) => Number(a) - Number(b)));
  });

  it("[foundations.color.role-paths] groups the roles under the paths the table names", () => {
    const groups = Object.fromEntries(Object.entries(COLOR_VALUES).map(([group, tree]) => [group, Object.keys(tree as object)]));
    expect(Object.keys(groups).sort()).toEqual(["accent", "bg", "border", "control", "ink", "interaction", "marker", "overlay", "shadow"]);
    expect(groups.bg).toEqual([...SURFACE_FILLS]);
    expect(groups.control).toEqual(["track"]);
    expect(groups.ink).toEqual(["primary", "secondary", "tertiary"]);
    expect(groups.border).toEqual([...BORDER_LEVELS]);
    expect(groups.accent).toEqual([...ACCENTS]);
    for (const accent of ACCENTS) expect(Object.keys(COLOR_VALUES.accent[accent]), accent).toEqual([...ACCENT_TONES]);
    expect(groups.interaction).toEqual(["bgHover", "selected", "active", "focus", "link"]);
    expect(Object.keys(COLOR_VALUES.interaction.bgHover)).toEqual(["onSurface", "onPrimarySolid", "onAccentSolid"]);
    expect(groups.overlay).toEqual(["scrim"]);
    expect(groups.shadow).toEqual(["floating", "lifted"]);
    expect(groups.marker).toEqual(["fill", "ink"]);
    expect(Object.keys(OPACITY_ROLES)).toEqual(["disabled", "subdued"]);
  });

  it("[foundations.color.control-track] keeps the track of a control apart from the page's surfaces", () => {
    expect(Object.keys(COLOR_VALUES.bg)).not.toContain("track");
    expect(SURFACE_FILLS).not.toContain("track");
    for (const mode of COLOR_MODES) expect(COLOR_SELECTION[mode].control.track, mode).toBeDefined();
  });

  it("[atoms.states.hover-border] has a neutral input's hover border darker than the base and strong borders, and quieter than any ink", () => {
    for (const mode of COLOR_MODES) {
      const values = COLOR_VALUES_BY_MODE[mode];
      for (const surface of Object.values(values.bg)) {
        const hover = contrast(values.border.hover, surface);
        expect(hover, `${mode} over base`).toBeGreaterThan(contrast(values.border.base, surface));
        expect(hover, `${mode} over strong`).toBeGreaterThan(contrast(values.border.strong, surface));
        for (const [level, ink] of Object.entries(values.ink)) expect(hover, `${mode} under ${level}`).toBeLessThan(contrast(ink, surface));
      }
    }
  });
});

describe("color modes", () => {
  it("[foundations.theme.modes] names the modes once; every per-mode table has exactly those", () => {
    expect([...COLOR_MODES]).toEqual(["light", "dark"]);
    expect(Object.keys(COLOR_SELECTION)).toEqual([...COLOR_MODES]);
    expect(Object.keys(COLOR_VALUES_BY_MODE)).toEqual([...COLOR_MODES]);
    expect(Object.keys(COLOR_CONTRAST_MORE)).toEqual([...COLOR_MODES]);
    expect(COLOR_VALUES_BY_MODE.light).toBe(COLOR_VALUES);
    expect(COLOR_VALUES_BY_MODE.dark).toBe(COLOR_VALUES_DARK);
    expect([...THEME_PREFERENCES]).toEqual([...COLOR_MODES, "system"]);
    expect([...SURFACE_THEMES]).toEqual([...COLOR_MODES, "inverse"]);
  });

  it("[foundations.theme.scope-roles] [foundations.theme.ground-roles] keeps ground roles to the focus ring and the shadow colours, all of them in the Color tree", () => {
    for (const role of GROUND_ROLES) expect(valueAt(COLOR_VALUES, role), role.join(".")).toBeDefined();
    const ground = pathsOf(COLOR_VALUES).filter((path) => isGroundRole(path.split(".")));
    expect(ground).toEqual(["interaction.focus", "shadow.floating", "shadow.lifted"]);
    expect(isGroundRole(["ink", "primary"])).toBe(false);
    expect(isGroundRole(["interaction", "link"])).toBe(false);
  });
});

describe("surface ladder", () => {
  it("[foundations.color.surface-ladder] recedes front to back in both modes: raised above canvas above sunken, strictly in light", () => {
    expect([...SURFACE_ORDER].sort()).toEqual([...SURFACE_FILLS].sort());
    for (const mode of COLOR_MODES) {
      const { bg, ink } = COLOR_VALUES_BY_MODE[mode];
      const steps = SURFACE_ORDER.map((surface) => luminance(bg[surface]));
      steps.forEach((step, index) => {
        if (index > 0) expect(step, `${mode} ${SURFACE_ORDER[index]}`).toBeLessThanOrEqual(steps[index - 1]!);
      });
      for (const surface of SURFACE_FILLS) {
        for (const level of Object.values(ink)) expect(contrast(level, bg[surface]), `${mode} ${surface}`).toBeGreaterThanOrEqual(4.5);
      }
    }
    const { bg } = COLOR_VALUES;
    expect(luminance(bg.raised)).toBeGreaterThan(luminance(bg.canvas));
    expect(luminance(bg.canvas)).toBeGreaterThan(luminance(bg.sunken));
    expect(luminance(COLOR_VALUES_DARK.bg.raised)).toBeGreaterThan(luminance(COLOR_VALUES_DARK.bg.canvas));
  });
});

describe("roles beyond the selection table", () => {
  it("[foundations.color.opacity] takes opacity from the alpha scale, outside COLOR_VALUES", () => {
    expect(Object.keys(OPACITY_VALUES)).toEqual(Object.keys(OPACITY_ROLES));
    for (const [role, step] of Object.entries(OPACITY_ROLES)) expect(OPACITY_VALUES[role as keyof typeof OPACITY_VALUES], role).toBe(String(ALPHA_OPACITY[step]));
    // One value in every mode: the stylesheet declares it once, apart from the modes.
    const { invariant, modes } = themeVariables();
    const opacity = Object.keys(invariant).filter((name) => name.startsWith("--pui-color-opacity-"));
    expect(opacity).toHaveLength(Object.keys(OPACITY_ROLES).length);
    for (const mode of COLOR_MODES) for (const name of opacity) expect(modes[mode].own, `${mode} ${name}`).not.toHaveProperty([name]);
    expect(pathsOf(COLOR_VALUES).some((path) => path.startsWith("opacity"))).toBe(false);
  });

  it("[foundations.color.forced-colors] names forced-colors roles with CSS system colors only", () => {
    const systemColors = [
      "AccentColor", "AccentColorText", "ActiveText", "ButtonBorder", "ButtonFace", "ButtonText", "Canvas", "CanvasText", "Field", "FieldText",
      "GrayText", "Highlight", "HighlightText", "LinkText", "Mark", "MarkText", "SelectedItem", "SelectedItemText", "VisitedText",
    ];
    for (const value of Object.values(SYSTEM_COLORS)) expect(systemColors, value).toContain(value);
  });

  it("[foundations.color.contrast-more] [foundations.color.contrast-more-roles] lifts borders to 3:1 and tertiary ink to 4.5:1 on every surface of the mode", () => {
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
