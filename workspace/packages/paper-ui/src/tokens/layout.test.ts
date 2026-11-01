import { describe, expect, it } from "vitest";

import { COLOR_MODES } from "./color-modes";
import { ELEVATION, ELEVATION_NEST_LIMIT, elevationCast, elevationStack, elevationStyle, tokens } from "./index";
import { BREAKPOINTS, ELEVATIONS, LAYOUT_MODE_VALUES, LAYOUT_SOURCE, castShadow } from "./layout";
import { themeVariables } from "./variables";

// The design values of Layout, written down. The tests below hold for any design; this file says which design this
// is. A change to it is deliberate: review the diff, then `vitest -u` rewrites the file.
describe("the golden Layout file", () => {
  it("[foundations.layout.role-table] [foundations.layout.elevation-table] records the source, the breakpoints and sections it resolves to, the shadow strings of each mode, and the nesting limit", async () => {
    const { breakpoint, section } = tokens.layout;
    const shadow = Object.fromEntries(COLOR_MODES.map((mode) => [mode, LAYOUT_MODE_VALUES[mode].shadow]));
    await expect(`${JSON.stringify({ source: LAYOUT_SOURCE, breakpoint, section, shadow, nestLimit: ELEVATION_NEST_LIMIT }, null, 2)}\n`).toMatchFileSnapshot("./__golden__/layout-resolved.json");
  });
});

describe("Layout builds on Shape", () => {
  it("[foundations.shape.inset-scale] shares one length scale between inset and gap", () => {
    expect(tokens.shape.inset).toEqual(tokens.layout.gap);
    expect(tokens.layout.gutter).toBe(tokens.shape.inset.lg);
  });
});

describe("Layout distances that are not a fixed gap", () => {
  it("[foundations.layout.breakpoint-em] writes every breakpoint as the em of its dp", () => {
    for (const name of BREAKPOINTS) expect(tokens.layout.breakpoint[name], name).toBe(`${LAYOUT_SOURCE.breakpoint[name] / 16}em`);
  });

  it("[foundations.layout.breakpoint-em] ascends from one breakpoint to the next", () => {
    const widths = BREAKPOINTS.map((name) => LAYOUT_SOURCE.breakpoint[name]);
    expect(widths.every((width, index) => index === 0 || width > widths[index - 1]!)).toBe(true);
    const ems = BREAKPOINTS.map((name) => parseFloat(tokens.layout.breakpoint[name]));
    expect(ems).toEqual([...ems].sort((a, b) => a - b));
  });

  it("[foundations.layout.section-fluid] grows a section's start and end with the viewport height between space steps", () => {
    const { gap } = tokens.layout;
    expect(tokens.layout.section.start).toBe(`clamp(${gap["3xl"]}, 8vh, calc(${gap["3xl"]} * 2))`);
    expect(tokens.layout.section.end).toBe(`clamp(${gap["2xl"]}, 5vh, ${gap["3xl"]})`);
  });
});

const tiers = ELEVATIONS.map((tier) => ({ tier, ...LAYOUT_SOURCE.elevation.tier[tier] }));
const { nudge } = LAYOUT_SOURCE.elevation;

describe("An elevation is applied as one unit", () => {
  it("[foundations.layout.elevation-unit] [foundations.layout.elevation-table] gives every tier its position, its z and its shadow together", () => {
    for (const { tier, depth, position } of tiers) {
      const style = elevationStyle(tier);
      expect(Object.keys(style).sort(), tier).toEqual(["boxShadow", "position", "zIndex"]);
      expect(style.position, tier).toBe(position);
      expect(style.zIndex, tier).toBe(`var(--pui-layout-elevation-${tier}-z)`);
      expect(style.boxShadow, tier).toBe(depth ? castShadow(depth) : "none");
      expect(style, tier).toEqual({ ...elevationStack(tier), ...elevationCast(tier), position });
    }
    expect(tiers.map(({ tier, position }) => `${tier} ${position}`)).toEqual(["lifted relative", "sticky sticky", "overlay relative", "modal relative", "toast relative"]);
  });

  it("[foundations.layout.elevation-unit] casts a shadow exactly where a tier floats, in the depth its source names", () => {
    for (const { tier, depth } of tiers) {
      expect(ELEVATION.depth[tier], tier).toBe(depth);
      expect(depth === null, tier).toBe(ELEVATION.shadow[tier] === "none");
    }
    expect(ELEVATION.shadow.lifted).toBe(castShadow("lifted"));
    for (const tier of ["overlay", "modal", "toast"] as const) expect(ELEVATION.shadow[tier], tier).toBe(castShadow("floating"));
    expect(ELEVATION.shadow.sticky).toBe("none");
  });

  it("[foundations.layout.elevation-unit] keeps the unit out of the public roles", () => {
    // @ts-expect-error an elevation is applied through the unit, so tokens.layout has no elevation
    expect(tokens.layout.elevation).toBeUndefined();
    expect(Object.keys(tokens.layout).sort()).toEqual(["breakpoint", "container", "gap", "gutter", "section"]);
  });

  it("[foundations.layout.emission] emits each tier's z and the nudge as source variables, and no variable for a shadow", () => {
    const { source, modes } = themeVariables();
    for (const { tier, z } of tiers) expect(source[`--pui-layout-elevation-${tier}-z`], tier).toBe(String(z));
    expect(source["--pui-layout-elevation-nudge"]).toBe(String(nudge));
    for (const name of Object.keys(source)) if (name.startsWith("--pui-layout-elevation-")) expect(name).toMatch(/-(z|nudge)$/);
    for (const mode of COLOR_MODES) expect(Object.keys(modes[mode].ground).some((name) => name.startsWith("--pui-layout-elevation-")), mode).toBe(false);
  });

  it("[foundations.layout.elevation-nesting] raises the z of a ranked element by nudges and leaves an unranked one at its tier", () => {
    expect(elevationStack("overlay").zIndex).toBe(ELEVATION.z.overlay);
    expect(elevationStack("overlay", "var(--rank)").zIndex).toBe(`calc(${ELEVATION.z.overlay} + var(--rank) * ${ELEVATION.nudge})`);
  });
});

describe("Elevation nesting never reaches the next tier", () => {
  const zs = tiers.map(({ z }) => z);
  const spans = zs.slice(1).map((z, index) => z - zs[index]!);

  it("[foundations.layout.elevation-nesting] orders the tiers strictly ascending with equal spans", () => {
    expect(spans.every((span) => span > 0)).toBe(true);
    expect(new Set(spans).size).toBe(1);
  });

  it("[foundations.layout.elevation-nesting] holds span / nudge − 1 nudges in a tier", () => {
    expect(ELEVATION_NEST_LIMIT).toBe(spans[0]! / nudge - 1);
    expect(Number.isInteger(ELEVATION_NEST_LIMIT) && ELEVATION_NEST_LIMIT > 0).toBe(true);
  });

  it("[foundations.layout.elevation-nesting] keeps the deepest nest of a tier below the next tier, and the toast above the deepest modal", () => {
    zs.slice(0, -1).forEach((z, index) => expect(z + ELEVATION_NEST_LIMIT * nudge, tiers[index]!.tier).toBeLessThan(zs[index + 1]!));
    const z = (tier: (typeof ELEVATIONS)[number]) => LAYOUT_SOURCE.elevation.tier[tier].z;
    expect(z("toast")).toBeGreaterThan(z("modal") + ELEVATION_NEST_LIMIT * nudge);
  });
});
