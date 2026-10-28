import { describe, expect, it } from "vitest";

import { tokens } from "./index";
import { ELEVATIONS, castShadow } from "./layout";

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
