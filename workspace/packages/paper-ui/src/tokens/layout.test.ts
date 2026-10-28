import { describe, expect, it } from "vitest";

import { tokens } from "./index";
import { ELEVATIONS, elevationShadow } from "./layout";

describe("Layout builds on Shape", () => {
  it("shares one length scale between inset and gap", () => {
    expect(tokens.shape.inset).toEqual(tokens.layout.gap);
    expect(tokens.layout.gutter).toBe(tokens.shape.inset.lg);
  });

  it("lets one elevation decide both stacking and shadow", () => {
    for (const level of ELEVATIONS) {
      expect(tokens.layout.elevation[level].z).toMatch(/^var\(--pui-layout-elevation-/);
      expect(tokens.layout.elevation[level].shadow).toMatch(/^var\(--pui-layout-elevation-/);
    }
    const tint = (name: string) => `tint(${name})`;
    for (const theme of ["light", "dark"] as const) {
      expect(elevationShadow("base", theme, tint)).toBe("none");
      expect(elevationShadow("sticky", theme, tint)).toBe("none");
      expect(elevationShadow("raised", theme, tint)).toContain("tint(overlayMinimal)");
      expect(elevationShadow("modal", theme, tint)).toBe(elevationShadow("overlay", theme, tint));
    }
  });
});
