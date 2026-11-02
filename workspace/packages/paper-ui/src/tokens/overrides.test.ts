import { describe, expect, it } from "vitest";

import { overridesRule, sourceVars, unknownSourceVariables, type SourceOverrides } from "./overrides";
import { SOURCE_VARIABLES, themeVariables } from "./variables";

describe("source overrides", () => {
  it("[foundations.override.source-paths-only] answers with the variable each source path is emitted under", () => {
    const vars = sourceVars({
      shape: { control: { height: { md: "40px" } }, radius: { control: { md: "9px" } }, space: { lg: "24px" } },
      layout: { container: { content: "60rem" }, elevation: { nudge: "2" } },
      typography: { palette: { fontSize: { "14": "1rem" }, monoSizeScale: "0.9" } },
    });
    expect(vars).toEqual({
      "--pui-shape-control-height-md": "40px",
      "--pui-shape-radius-control-md": "9px",
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

describe("the rule a Provider writes", () => {
  it("[install.provider.source-overrides] is empty when nothing is given, and puts sources and opacity on the root", () => {
    expect(overridesRule({})).toBe("");
    expect(overridesRule({ shape: undefined })).toBe("");
    expect(overridesRule({ shape: { radius: { control: { md: "10px" } } }, opacity: { disabled: "0.4" } })).toBe(":root{--pui-shape-radius-control-md:10px;--pui-color-opacity-disabled:0.4}");
  });

  it("[install.provider.color-overrides] writes a mode's roles where the stylesheet declares them: own on the scope, ground from its children", () => {
    expect(overridesRule({ color: { dark: { bg: { canvas: "red" }, interaction: { focus: "blue" }, shadow: { resting: "green" } } } })).toBe(
      ':root[data-pui-theme="dark"],[data-pui-theme="dark"]{--pui-color-bg-canvas:red}:root[data-pui-theme="dark"],[data-pui-theme="dark"] > *{--pui-color-interaction-focus:blue;--pui-color-shadow-resting:green}',
    );
  });

  it("[install.provider.color-overrides] changes every role that picks a palette step, an alpha role at its own strength, and lets a named role win", () => {
    const rule = overridesRule({ palette: { neutral: { "950": "#ff6347" }, blue: { "700": "#000080" }, marker: "#ffd700" }, color: { light: { accent: { info: { ink: "teal" } } } } });
    const light = rule.slice(0, rule.indexOf('[data-pui-theme="dark"]'));
    expect(light).toContain("--pui-color-accent-primary-solid:#ff6347");
    expect(light).toContain("--pui-color-accent-info-ink:teal");
    expect(light).toContain("--pui-color-interaction-link:#000080");
    expect(light).toContain("--pui-color-marker-fill:#ffd700");
    expect(light).toContain("--pui-color-shadow-floating:#ff63471a");
    expect(rule).toContain("--pui-color-bg-canvas:#ff6347");
  });

  it("[install.provider.color-overrides] writes the shadow geometry of a mode on the scope's children", () => {
    expect(overridesRule({ shadow: { light: { resting: { "0": "0px 1px 2px 0px" } } } })).toBe(':root[data-pui-theme="light"],[data-pui-theme="light"] > *{--pui-layout-shadow-resting-0:0px 1px 2px 0px}');
  });

  it("[install.provider.color-overrides] throws on a path the stylesheet does not emit", () => {
    // @ts-expect-error not a colour role
    expect(() => overridesRule({ color: { light: { bg: { nope: "red" } } } })).toThrow("[paper-ui] color.bg.nope is not a colour role.");
    // @ts-expect-error not a shadow layer
    expect(() => overridesRule({ shadow: { dark: { nope: { "0": "1px" } } } })).toThrow("[paper-ui] layout.shadow.nope.0 is not a shadow layer.");
    // @ts-expect-error not a palette step
    expect(() => overridesRule({ palette: { neutral: { "999": "#000000" } } })).toThrow("[paper-ui] palette.neutral.999 is not a palette step.");
    expect(() => overridesRule({ palette: { blue: { "600": "royalblue" } } })).toThrow("[paper-ui] palette.blue.600 must be a six-digit hex colour; received royalblue.");
    // @ts-expect-error not an opacity role
    expect(() => overridesRule({ opacity: { nope: "1" } })).toThrow("[paper-ui] color.opacity.nope is not an opacity role.");
  });
});
