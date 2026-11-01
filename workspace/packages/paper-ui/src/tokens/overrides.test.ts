import { describe, expect, it } from "vitest";

import { sourceVars, unknownSourceVariables, type SourceOverrides } from "./overrides";
import { SOURCE_VARIABLES, themeVariables } from "./variables";

describe("source overrides", () => {
  it("[foundations.override.source-paths-only] answers with the variable each source path is emitted under", () => {
    const vars = sourceVars({
      shape: { control: { height: { md: "40px" } }, radius: { control: "9px" }, space: { lg: "24px" } },
      layout: { container: { content: "60rem" }, elevation: { nudge: "2" } },
      typography: { palette: { fontSize: { "14": "1rem" }, monoSizeScale: "0.9" } },
    });
    expect(vars).toEqual({
      "--pui-shape-control-height-md": "40px",
      "--pui-shape-radius-control": "9px",
      "--pui-shape-space-lg": "24px",
      "--pui-layout-container-content": "60rem",
      "--pui-layout-elevation-nudge": "2",
      "--pui-typography-palette-font-size-14": "1rem",
      "--pui-typography-palette-mono-size-scale": "0.9",
    });
    for (const name of Object.keys(vars)) expect(SOURCE_VARIABLES, name).toContain(name);
    expect(sourceVars({})).toEqual({});
  });

  it("[foundations.override.source-paths-only] refuses a role path at typecheck, and an unknown path or a non-string value at run time", () => {
    // @ts-expect-error shape.inset is a role (an alias of shape.space); only the source can be overridden.
    const role: SourceOverrides = { shape: { inset: { lg: "24px" } } };
    expect(() => sourceVars(role)).toThrow("shape.inset.lg");
    // @ts-expect-error color is not a source tree; a mode owns it.
    const color: SourceOverrides = { color: { ink: { primary: "#000" } } };
    expect(() => sourceVars(color)).toThrow("color.ink.primary");
    expect(() => sourceVars({ shape: { control: { height: { huge: "1px" } } } } as SourceOverrides)).toThrow("shape.control.height.huge");
    expect(() => sourceVars({ shape: { control: { height: { md: 40 } } } } as unknown as SourceOverrides)).toThrow("shape.control.height.md");
  });
});

describe("the names a stylesheet can mean", () => {
  it("[foundations.override.unknown-warning] knows every variable the stylesheet emits: a mode's shadow geometry as well as the sources", () => {
    const { source, invariant, modes, contrastMore } = themeVariables();
    const names = [source, invariant, modes.light.own, modes.light.ground, modes.dark.own, modes.dark.ground, contrastMore.light, contrastMore.dark].flatMap((declarations) => Object.keys(declarations));
    expect(names).toContain("--pui-layout-shadow-floating-0");
    expect(unknownSourceVariables(names)).toEqual([]);
  });

  it("[foundations.override.unknown-warning] picks out the names of Shape, Layout and Typography the stylesheet does not emit, once each and in order", () => {
    expect(unknownSourceVariables(["--pui-typography-role-body-size", "--pui-shape-control-height-xl", "--pui-layout-gutter", "--pui-shape-control-height-xl", "--pui-color-nope", "--pui-state-tint", "--mine"])).toEqual([
      "--pui-layout-gutter", "--pui-shape-control-height-xl", "--pui-typography-role-body-size",
    ]);
  });
});
