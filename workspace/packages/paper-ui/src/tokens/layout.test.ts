import { describe, expect, it } from "vitest";

import { tokens } from "./index";
import { BREAKPOINTS, ELEVATIONS, LAYOUT_SOURCE, castShadow } from "./layout";

describe("Layout builds on Shape", () => {
  it("shares one length scale between inset and gap", () => {
    expect(tokens.shape.inset).toEqual(tokens.layout.gap);
    expect(tokens.layout.gutter).toBe(tokens.shape.inset.lg);
  });

  it("lets one elevation decide both stacking and shadow", () => {
    for (const level of ELEVATIONS) expect(tokens.layout.elevation[level].z).toMatch(/^var\(--pui-layout-elevation-/);
    for (const level of ["base", "sticky"] as const) expect(tokens.layout.elevation[level].shadow, level).toBe("none");
    expect(tokens.layout.elevation.raised.shadow).toBe(castShadow("lifted"));
    for (const level of ["overlay", "modal", "toast"] as const) expect(tokens.layout.elevation[level].shadow, level).toBe(castShadow("floating"));
  });
});

describe("Layout distances that are not a fixed gap", () => {
  it("[foundations.layout.breakpoint-em] writes every breakpoint as the em of its dp", () => {
    for (const name of BREAKPOINTS) expect(tokens.layout.breakpoint[name], name).toBe(`${LAYOUT_SOURCE.breakpoint[name] / 16}em`);
    expect(Object.values(tokens.layout.breakpoint)).toEqual(["30em", "48em", "64em", "80em"]);
  });

  it("[foundations.layout.section-fluid] grows a section's start and end with the viewport height between space steps", () => {
    const { gap } = tokens.layout;
    expect(tokens.layout.section.start).toBe(`clamp(${gap["3xl"]}, 8vh, calc(${gap["3xl"]} * 2))`);
    expect(tokens.layout.section.end).toBe(`clamp(${gap["2xl"]}, 5vh, ${gap["3xl"]})`);
  });
});
