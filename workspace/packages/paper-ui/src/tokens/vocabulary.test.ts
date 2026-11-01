import { describe, expect, expectTypeOf, it } from "vitest";

import { accentProfile } from "./color-recipes";
import { COLOR_SELECTION, COLOR_VALUES, COLOR_VALUES_DARK, STATUS_PALETTE } from "./colors";
import { LAYOUT_SOURCE } from "./layout";
import { MOTION } from "./motion";
import * as publicEntry from "./public";
import { SHAPE_SOURCE } from "./shape";
import { STATE_ATTRIBUTE } from "./state";
import { TYPOGRAPHY, TYPOGRAPHY_SOURCE } from "./typography";
import * as vocabulary from "./vocabulary";

const constants = Object.entries(vocabulary) as [string, readonly string[]][];
const keysOf = (tree: object): string[] => Object.keys(tree);

describe("vocabulary", () => {
  it("[foundations.vocabulary.one-pair-per-axis] exports every constant once and nothing else", () => {
    expect(constants.map(([name]) => name).sort()).toEqual([
      "ACCENTS", "ACCENT_TONES", "ALIGNS", "BORDER_LEVELS", "BREAKPOINTS", "CHOICE_STATUSES", "COLOR_MODES", "CONTAINERS", "CONTROL_FONT_SIZES", "CONTROL_PRESETS", "CONTROL_SHAPES",
      "CONTROL_SIZES", "DEPTHS", "DIMENSIONS", "DIVIDER_LEVELS", "ELEVATIONS", "EMPHASES", "ICON_SIZES", "INKS", "INK_LEVELS", "JUSTIFIES", "JUSTIFY_ITEMS", "LINK_UNDERLINES", "MEASURES", "MOTION_ROLES", "ORIENTATIONS",
      "SELECTABLE_VARIANTS", "SPACES", "STATE_NAMES", "STATUSES", "SURFACE_FILLS", "SURFACE_RADII", "SURFACE_THEMES", "TEXT_FAMILIES", "TEXT_VARIANTS", "THEME_PREFERENCES", "VARIANTS",
    ]);
  });

  it("[foundations.vocabulary.one-pair-per-axis] keeps every constant non-empty and free of duplicates", () => {
    for (const [name, values] of constants) {
      expect(values.length, name).toBeGreaterThan(0);
      expect(new Set(values).size, name).toBe(values.length);
    }
  });

  it("[foundations.vocabulary.one-pair-per-axis] reaches the /tokens entry unchanged", () => {
    for (const [name, values] of constants) expect((publicEntry as Record<string, unknown>)[name], name).toBe(values);
  });

  it("[foundations.vocabulary.one-pair-per-axis] derives the Color axes from the trees that author them", () => {
    expect(vocabulary.SURFACE_FILLS).toEqual(keysOf(COLOR_VALUES.bg));
    expect(vocabulary.INK_LEVELS).toEqual(keysOf(COLOR_VALUES.ink));
    expect(vocabulary.INKS).toEqual([...keysOf(COLOR_VALUES.ink), ...keysOf(STATUS_PALETTE), "inherit"]);
    expect(vocabulary.BORDER_LEVELS).toEqual(keysOf(COLOR_VALUES.border));
    expect(vocabulary.ACCENTS).toEqual(keysOf(COLOR_VALUES.accent));
    expect(vocabulary.STATUSES).toEqual(keysOf(STATUS_PALETTE));
    expect(vocabulary.CHOICE_STATUSES).toEqual(["error"]);
    for (const status of vocabulary.CHOICE_STATUSES) expect(vocabulary.STATUSES).toContain(status);
    expect(vocabulary.DEPTHS).toEqual(keysOf(COLOR_VALUES.shadow));
    for (const values of [COLOR_VALUES, COLOR_VALUES_DARK]) {
      for (const accent of vocabulary.ACCENTS) expect(vocabulary.ACCENT_TONES, accent).toEqual(keysOf(values.accent[accent]));
    }
  });

  it("[foundations.vocabulary.one-pair-per-axis] derives the mode axes from the modes the selection table has", () => {
    expect(vocabulary.COLOR_MODES).toEqual(keysOf(COLOR_SELECTION));
    expect(vocabulary.THEME_PREFERENCES).toEqual([...vocabulary.COLOR_MODES, "system"]);
    expect(vocabulary.SURFACE_THEMES).toEqual([...vocabulary.COLOR_MODES, "inverse"]);
  });

  it("[foundations.vocabulary.one-pair-per-axis] orders the surfaces as the Color docs do", () => {
    expect(vocabulary.SURFACE_FILLS).toEqual(["canvas", "raised", "sunken"]);
  });

  it("[foundations.vocabulary.one-pair-per-axis] keeps the divider levels inside the border levels", () => {
    for (const level of vocabulary.DIVIDER_LEVELS) expect(vocabulary.BORDER_LEVELS).toContain(level);
  });

  it("[foundations.vocabulary.one-pair-per-axis] keeps the selectable variants inside the variants", () => {
    for (const variant of vocabulary.SELECTABLE_VARIANTS) expect(vocabulary.VARIANTS).toContain(variant);
  });

  it("[foundations.vocabulary.one-pair-per-axis] gives every accent × variant a profile", () => {
    for (const accent of vocabulary.ACCENTS) {
      for (const variant of vocabulary.VARIANTS) expect(accentProfile(accent, variant), `${accent} ${variant}`).toBeDefined();
    }
  });

  it("[foundations.vocabulary.one-pair-per-axis] derives the Typography axes from the trees that author them", () => {
    expect(vocabulary.TEXT_VARIANTS).toEqual(keysOf(TYPOGRAPHY.role));
    expect(vocabulary.TEXT_FAMILIES).toEqual(keysOf(TYPOGRAPHY_SOURCE.family));
    expect(vocabulary.CONTROL_PRESETS).toEqual(keysOf(TYPOGRAPHY.preset));
    expect(vocabulary.CONTROL_SIZES).toEqual(keysOf(TYPOGRAPHY.preset.field));
    expect(vocabulary.EMPHASES).toEqual(["regular", "medium", "semibold", "bold"]);
    expect(vocabulary.LINK_UNDERLINES).toEqual(["always", "hover"]);
    for (const emphasis of vocabulary.EMPHASES) expect(keysOf(TYPOGRAPHY_SOURCE.weight), emphasis).toContain(emphasis);
    for (const fontSize of vocabulary.CONTROL_FONT_SIZES) expect(vocabulary.TEXT_VARIANTS, fontSize).toContain(fontSize);
  });

  it("[foundations.vocabulary.one-pair-per-axis] derives the Shape axes from the trees that author them", () => {
    expect(vocabulary.SPACES).toEqual(keysOf(SHAPE_SOURCE.space));
    expect(vocabulary.DIMENSIONS).toEqual(keysOf(SHAPE_SOURCE.dimension.width));
    expect(vocabulary.DIMENSIONS).toEqual(keysOf(SHAPE_SOURCE.dimension.height));
    expect(vocabulary.MEASURES).toEqual(keysOf(SHAPE_SOURCE.measure));
    expect(vocabulary.ICON_SIZES).toEqual(keysOf(SHAPE_SOURCE.icon));
    expect(vocabulary.SURFACE_RADII).toEqual([...keysOf(SHAPE_SOURCE.radius.surface), "full"]);
    expect(vocabulary.CONTROL_SIZES).toEqual(keysOf(SHAPE_SOURCE.control.height));
    for (const size of vocabulary.ICON_SIZES) expect(vocabulary.TEXT_VARIANTS, size).toContain(size);
  });

  it("[foundations.vocabulary.one-pair-per-axis] [foundations.layout.elevation-vocabulary] derives the Layout axes from the trees that author them", () => {
    expect(vocabulary.ELEVATIONS).toEqual(keysOf(LAYOUT_SOURCE.elevation.tier));
    expect(vocabulary.BREAKPOINTS).toEqual(keysOf(LAYOUT_SOURCE.breakpoint));
    expect(vocabulary.CONTAINERS).toEqual(keysOf(LAYOUT_SOURCE.container));
  });

  it("[foundations.vocabulary.one-pair-per-axis] derives the Motion axis from the tree that authors it", () => {
    expect(vocabulary.MOTION_ROLES).toEqual(keysOf(MOTION));
  });

  it("[foundations.vocabulary.one-pair-per-axis] derives the State axis from the tree that authors it", () => {
    expect(vocabulary.STATE_NAMES).toEqual(keysOf(STATE_ATTRIBUTE));
    expectTypeOf<vocabulary.StateName>().toEqualTypeOf<(typeof vocabulary.STATE_NAMES)[number]>();
  });

  it("[foundations.vocabulary.one-pair-per-axis] types each constant and its type as one pair", () => {
    expectTypeOf<vocabulary.Status>().toEqualTypeOf<(typeof vocabulary.STATUSES)[number]>();
    expectTypeOf<vocabulary.ChoiceStatus>().toEqualTypeOf<(typeof vocabulary.CHOICE_STATUSES)[number]>();
    expectTypeOf<vocabulary.Accent>().toEqualTypeOf<(typeof vocabulary.ACCENTS)[number]>();
    expectTypeOf<vocabulary.AccentTone>().toEqualTypeOf<(typeof vocabulary.ACCENT_TONES)[number]>();
    expectTypeOf<vocabulary.Variant>().toEqualTypeOf<(typeof vocabulary.VARIANTS)[number]>();
    expectTypeOf<vocabulary.SelectableVariant>().toEqualTypeOf<(typeof vocabulary.SELECTABLE_VARIANTS)[number]>();
    expectTypeOf<vocabulary.Depth>().toEqualTypeOf<(typeof vocabulary.DEPTHS)[number]>();
    expectTypeOf<vocabulary.ColorMode>().toEqualTypeOf<(typeof vocabulary.COLOR_MODES)[number]>();
    expectTypeOf<vocabulary.ThemePreference>().toEqualTypeOf<(typeof vocabulary.THEME_PREFERENCES)[number]>();
    expectTypeOf<vocabulary.SurfaceTheme>().toEqualTypeOf<(typeof vocabulary.SURFACE_THEMES)[number]>();
    expectTypeOf<vocabulary.SurfaceFill>().toEqualTypeOf<(typeof vocabulary.SURFACE_FILLS)[number]>();
    expectTypeOf<vocabulary.InkLevel>().toEqualTypeOf<(typeof vocabulary.INK_LEVELS)[number]>();
    expectTypeOf<vocabulary.Ink>().toEqualTypeOf<(typeof vocabulary.INKS)[number]>();
    expectTypeOf<vocabulary.BorderLevel>().toEqualTypeOf<(typeof vocabulary.BORDER_LEVELS)[number]>();
    expectTypeOf<vocabulary.DividerLevel>().toEqualTypeOf<(typeof vocabulary.DIVIDER_LEVELS)[number]>();
    expectTypeOf<vocabulary.TextVariant>().toEqualTypeOf<(typeof vocabulary.TEXT_VARIANTS)[number]>();
    expectTypeOf<vocabulary.TextFamily>().toEqualTypeOf<(typeof vocabulary.TEXT_FAMILIES)[number]>();
    expectTypeOf<vocabulary.ControlSize>().toEqualTypeOf<(typeof vocabulary.CONTROL_SIZES)[number]>();
    expectTypeOf<vocabulary.ControlFontSize>().toEqualTypeOf<(typeof vocabulary.CONTROL_FONT_SIZES)[number]>();
    expectTypeOf<vocabulary.ControlPreset>().toEqualTypeOf<(typeof vocabulary.CONTROL_PRESETS)[number]>();
    expectTypeOf<vocabulary.Emphasis>().toEqualTypeOf<(typeof vocabulary.EMPHASES)[number]>();
    expectTypeOf<vocabulary.LinkUnderline>().toEqualTypeOf<(typeof vocabulary.LINK_UNDERLINES)[number]>();
    expectTypeOf<vocabulary.Space>().toEqualTypeOf<(typeof vocabulary.SPACES)[number]>();
    expectTypeOf<vocabulary.Dimension>().toEqualTypeOf<(typeof vocabulary.DIMENSIONS)[number]>();
    expectTypeOf<vocabulary.Measure>().toEqualTypeOf<(typeof vocabulary.MEASURES)[number]>();
    expectTypeOf<vocabulary.IconSize>().toEqualTypeOf<(typeof vocabulary.ICON_SIZES)[number]>();
    expectTypeOf<vocabulary.ControlShape>().toEqualTypeOf<(typeof vocabulary.CONTROL_SHAPES)[number]>();
    expectTypeOf<vocabulary.SurfaceRadius>().toEqualTypeOf<(typeof vocabulary.SURFACE_RADII)[number]>();
    expectTypeOf<vocabulary.Elevation>().toEqualTypeOf<(typeof vocabulary.ELEVATIONS)[number]>();
    expectTypeOf<vocabulary.Breakpoint>().toEqualTypeOf<(typeof vocabulary.BREAKPOINTS)[number]>();
    expectTypeOf<vocabulary.Container>().toEqualTypeOf<(typeof vocabulary.CONTAINERS)[number]>();
    expectTypeOf<vocabulary.Align>().toEqualTypeOf<(typeof vocabulary.ALIGNS)[number]>();
    expectTypeOf<vocabulary.Justify>().toEqualTypeOf<(typeof vocabulary.JUSTIFIES)[number]>();
    expectTypeOf<vocabulary.JustifyItem>().toEqualTypeOf<(typeof vocabulary.JUSTIFY_ITEMS)[number]>();
    expectTypeOf<vocabulary.Orientation>().toEqualTypeOf<(typeof vocabulary.ORIENTATIONS)[number]>();
    expectTypeOf<vocabulary.MotionRole>().toEqualTypeOf<(typeof vocabulary.MOTION_ROLES)[number]>();
  });

  it("[foundations.vocabulary.one-pair-per-axis] closes the axes at the values the components rely on", () => {
    expectTypeOf<vocabulary.Status>().toEqualTypeOf<"info" | "success" | "warning" | "error">();
    expectTypeOf<vocabulary.Accent>().toEqualTypeOf<"primary" | "info" | "success" | "warning" | "error">();
    expectTypeOf<vocabulary.SurfaceFill>().toEqualTypeOf<"canvas" | "raised" | "sunken">();
    expectTypeOf<vocabulary.Ink>().toEqualTypeOf<"primary" | "secondary" | "tertiary" | "info" | "success" | "warning" | "error" | "inherit">();
    expectTypeOf<vocabulary.ControlSize>().toEqualTypeOf<"sm" | "md" | "lg">();
    expectTypeOf<vocabulary.ControlFontSize>().toEqualTypeOf<"label" | "caption" | "body">();
    expectTypeOf<vocabulary.Emphasis>().toEqualTypeOf<"regular" | "medium" | "semibold" | "bold">();
    expectTypeOf<vocabulary.TextVariant>().toEqualTypeOf<"hero" | "display" | "title" | "heading" | "subheading" | "body" | "caption" | "label">();
    expectTypeOf<vocabulary.Space>().toEqualTypeOf<"xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl">();
    expectTypeOf<vocabulary.DividerLevel>().toEqualTypeOf<"base" | "strong">();
    expectTypeOf<vocabulary.SurfaceRadius>().toEqualTypeOf<"sm" | "md" | "lg" | "full">();
    expectTypeOf<vocabulary.Align>().toEqualTypeOf<"start" | "center" | "end" | "stretch" | "baseline">();
    expectTypeOf<vocabulary.Justify>().toEqualTypeOf<"start" | "center" | "end" | "between">();
    expectTypeOf<vocabulary.JustifyItem>().toEqualTypeOf<"start" | "center" | "end" | "stretch">();
    expectTypeOf<vocabulary.Orientation>().toEqualTypeOf<"horizontal" | "vertical">();
    expectTypeOf<vocabulary.ColorMode>().toEqualTypeOf<"light" | "dark">();
    expectTypeOf<vocabulary.ThemePreference>().toEqualTypeOf<"light" | "dark" | "system">();
    expectTypeOf<vocabulary.SurfaceTheme>().toEqualTypeOf<"light" | "dark" | "inverse">();
  });
});
