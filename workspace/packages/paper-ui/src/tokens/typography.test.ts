import { describe, expect, it } from "vitest";

import { walkValues, pathToCssVar, rem } from "./helpers";
import { tokens } from "./index";
import { CODE_SPEC, CONTROL_PRESETS, CONTROL_SIZES, FONT_STYLESHEETS, PRESET_SPEC, ROLE_SPEC, TEXT_INK, TEXT_VARIANTS, TYPOGRAPHY, TYPOGRAPHY_SOURCE, TYPOGRAPHY_VALUES } from "./typography";
import { PRESET_SINGLE_LINE, codeRule, emphasisRule, monoRule, presetRule, typographyRule } from "./typography-recipes";

const emitted = new Map<string, string>();
walkValues(TYPOGRAPHY_VALUES, ["typography"], (path, value) => emitted.set(pathToCssVar(path), value));

const value = (ref: string) => {
  const name = ref.slice("var(".length, -1);
  return [...emitted].find(([key]) => key === name)?.[1];
};

type Spec = { size: string; weight: string; leading: string; tracking: string };
// A role or preset as the stylesheet declares it, with each var() replaced by the value it names.
const declared = (refs: Record<string, string>) => Object.fromEntries(Object.entries(refs).map(([key, ref]) => [key, value(ref)]));

describe("Typography source is data", () => {
  it("[foundations.naming.one-tree] names every palette variable under the typography prefix, and the same tree gives the TS path that refers to it", () => {
    const leaves: string[] = [];
    walkValues(TYPOGRAPHY_VALUES.palette, [], (path) => leaves.push(path.join(".")));
    expect(emitted.size).toBe(leaves.length);
    for (const name of emitted.keys()) expect(name).toMatch(/^--pui-typography-palette-/);
    walkValues(TYPOGRAPHY_VALUES, ["typography"], (path) => {
      const reference = path.slice(1).reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], TYPOGRAPHY);
      expect(reference, path.join(".")).toBe(`var(${pathToCssVar(path)})`);
    });
  });

  it("[foundations.typography.palette-only] leaves the palette out of the public tree: tokens.typography is the roles and the presets", () => {
    expect(Object.keys(tokens.typography).sort()).toEqual(["preset", "role"]);
    expect(tokens.typography.role).toBe(TYPOGRAPHY.role);
    expect(tokens.typography.preset).toBe(TYPOGRAPHY.preset);
    // The variables stay: an override names them, and the roles and presets are built on them.
    expect(emitted.has("--pui-typography-palette-font-size-14")).toBe(true);
  });

  it("[foundations.typography.palette-only] builds each role and preset from palette variables", () => {
    const leaves: string[] = [];
    walkValues(TYPOGRAPHY.role, [], (_path, value) => leaves.push(value));
    walkValues(TYPOGRAPHY.preset, [], (_path, value) => leaves.push(value));
    // Four values for each of the roles, the two button weights and the field, textarea and badge at every size, and the field's input line.
    const perSize = CONTROL_SIZES.length * (2 + 1 + 1);
    expect(leaves).toHaveLength(TEXT_VARIANTS.length * 4 + perSize * 4 + CONTROL_SIZES.length + 4);
    for (const leaf of leaves) expect(emitted.has(leaf.slice("var(".length, -1)), leaf).toBe(true);
    // Every leaf is the variable of a palette value the spec names, and no value stands in for one.
    for (const leaf of leaves) expect(leaf, leaf).toMatch(/^var\(--pui-typography-palette-/);
  });

  it("[foundations.typography.palette-only] selects only steps the palette has: every size, weight, leading and tracking a role or preset names is authored", () => {
    const steps = (spec: Spec & { inputLeading?: string }) => {
      expect(Object.keys(TYPOGRAPHY_SOURCE.fontSize).concat(Object.keys(TYPOGRAPHY_SOURCE.fluid)), "size").toContain(spec.size);
      expect(Object.keys(TYPOGRAPHY_SOURCE.weight), "weight").toContain(spec.weight);
      expect(Object.keys(TYPOGRAPHY_SOURCE.leading).concat(Object.keys(TYPOGRAPHY_SOURCE.fluid)), "leading").toContain(spec.leading);
      expect(Object.keys(TYPOGRAPHY_SOURCE.tracking), "tracking").toContain(spec.tracking);
      if (spec.inputLeading) expect(Object.keys(TYPOGRAPHY_SOURCE.leading), "inputLeading").toContain(spec.inputLeading);
    };
    for (const role of Object.values(ROLE_SPEC)) steps(role);
    for (const ladder of Object.values(PRESET_SPEC.button)) for (const spec of Object.values(ladder)) steps(spec);
    for (const spec of [...Object.values(PRESET_SPEC.field), ...Object.values(PRESET_SPEC.textarea), PRESET_SPEC.badge]) steps(spec);
    const block = CODE_SPEC.block;
    expect(Object.keys(TYPOGRAPHY_SOURCE.fontSize)).toContain(block.size);
    expect(Object.keys(TYPOGRAPHY_SOURCE.weight)).toContain(block.weight);
    expect(Object.keys(TYPOGRAPHY_SOURCE.leading)).toContain(block.leading);
  });

  it("never sets a line shorter than the letters: leading is at least the size, and the fluid step's unitless leading is at least 1", () => {
    const px = (key: string) => (key in TYPOGRAPHY_SOURCE.fontSize ? TYPOGRAPHY_SOURCE.fontSize[key as keyof typeof TYPOGRAPHY_SOURCE.fontSize] : undefined);
    const line = (key: string) => (key in TYPOGRAPHY_SOURCE.leading ? TYPOGRAPHY_SOURCE.leading[key as keyof typeof TYPOGRAPHY_SOURCE.leading] : undefined);
    const specs: Spec[] = [
      ...Object.values(ROLE_SPEC),
      ...Object.values(PRESET_SPEC.button).flatMap((ladder) => Object.values(ladder)),
      ...Object.values(PRESET_SPEC.field),
      ...Object.values(PRESET_SPEC.textarea),
      PRESET_SPEC.badge,
    ];
    for (const spec of specs) {
      if (spec.size in TYPOGRAPHY_SOURCE.fluid) {
        const fluid = TYPOGRAPHY_SOURCE.fluid[spec.size as keyof typeof TYPOGRAPHY_SOURCE.fluid];
        expect(fluid.leading, `${spec.size} unitless leading`).toBeGreaterThanOrEqual(1);
      } else expect(line(spec.leading)!, `${spec.size} on a ${spec.leading} line`).toBeGreaterThanOrEqual(px(spec.size)!);
    }
    const block = CODE_SPEC.block;
    expect(line(block.leading)!).toBeGreaterThanOrEqual(px(block.size)!);
  });

  it("[foundations.typography.control-line] holds the line the Shape input inset subtracts to the field's glyph line, not to the taller line its value sits in", () => {
    for (const size of CONTROL_SIZES) {
      const inset = tokens.shape.control.inset.input[size];
      expect(inset, size).toContain(TYPOGRAPHY.preset.field[size].leading);
      expect(inset, size).not.toContain(TYPOGRAPHY.preset.field[size].inputLeading);
      expect(TYPOGRAPHY_SOURCE.leading[PRESET_SPEC.field[size].inputLeading], size).toBeGreaterThan(TYPOGRAPHY_SOURCE.leading[PRESET_SPEC.field[size].leading]);
    }
  });

  it("[foundations.typography.palette-table] [foundations.typography.role-table] [foundations.typography.preset-table] records the resolved palette, role and preset values in typography-resolved.json", async () => {
    const roles = Object.fromEntries(TEXT_VARIANTS.map((variant) => [variant, { ink: TEXT_INK[variant], ...declared(TYPOGRAPHY.role[variant]) }]));
    const presets = {
      button: Object.fromEntries(Object.entries(TYPOGRAPHY.preset.button).map(([weight, ladder]) => [weight, Object.fromEntries(CONTROL_SIZES.map((size) => [size, declared(ladder[size])]))])),
      field: Object.fromEntries(CONTROL_SIZES.map((size) => [size, declared(TYPOGRAPHY.preset.field[size])])),
      textarea: Object.fromEntries(CONTROL_SIZES.map((size) => [size, declared(TYPOGRAPHY.preset.textarea[size])])),
      badge: declared(TYPOGRAPHY.preset.badge),
    };
    const code = { block: { size: value(TYPOGRAPHY.palette.fontSize[CODE_SPEC.block.size]), weight: value(TYPOGRAPHY.palette.weight[CODE_SPEC.block.weight]), leading: value(TYPOGRAPHY.palette.leading[CODE_SPEC.block.leading]) } };
    const palette: Record<string, string> = {};
    walkValues(TYPOGRAPHY_VALUES.palette, [], (path, leaf) => {
      palette[path.join(".")] = leaf;
    });
    await expect(`${JSON.stringify({ palette, roles, presets, code }, null, 2)}\n`).toMatchFileSnapshot("./__golden__/typography-resolved.json");
  });
});

describe("what the palette says", () => {
  it("[foundations.typography.palette-names] names each size and line by the px it is, and keeps the underline offset in em of the letters", () => {
    for (const [name, step] of Object.entries(TYPOGRAPHY_SOURCE.fontSize)) expect(String(step), name).toBe(name);
    for (const [name, step] of Object.entries(TYPOGRAPHY_SOURCE.leading)) expect(String(step), name).toBe(name);
    expect(value(TYPOGRAPHY.palette.decoration.underlineOffset)).toBe(`${TYPOGRAPHY_SOURCE.decoration.underlineOffset}em`);
    expect(value(TYPOGRAPHY.palette.codeScale.inline)).toBe(String(TYPOGRAPHY_SOURCE.codeScale.inline));
  });

  it("[foundations.typography.families] sets sans in Pretendard ahead of the system, and mono in the system's fixed-width fonts ahead of D2Coding", () => {
    const stack = (family: string) => family.split(",").map((name) => name.trim().replace(/['"]/g, ""));
    const sans = stack(TYPOGRAPHY_SOURCE.family.sans);
    expect(sans[0]).toBe("Pretendard Variable");
    expect(sans.indexOf("-apple-system")).toBeGreaterThan(sans.indexOf("Pretendard"));
    expect(sans.at(-1)).toBe("sans-serif");
    const mono = stack(TYPOGRAPHY_SOURCE.family.mono);
    expect(mono[0]).toBe("ui-monospace");
    for (const font of ["SFMono-Regular", "Menlo", "Consolas"]) expect(mono.indexOf(font), font).toBeLessThan(mono.indexOf("D2Coding"));
    expect(mono.at(-1)).toBe("monospace");
  });

  it("[foundations.typography.control-line] gives a Badge one preset whatever its control size, where the others ladder", () => {
    expect(Object.keys(PRESET_SPEC.badge).sort()).toEqual(["leading", "size", "tracking", "weight"]);
    expect(presetRule("badge")).toEqual(presetRule("badge"));
    for (const size of CONTROL_SIZES) expect(PRESET_SPEC.field[size], size).toBeDefined();
  });
});

describe("hero is the one fluid step", () => {
  it("[foundations.typography.hero-fluid] grows with the viewport between two lengths and keeps a unitless leading", () => {
    const { min, vw, max, leading } = TYPOGRAPHY_SOURCE.fluid.hero;
    expect(value(TYPOGRAPHY.role.hero.size)).toBe(`clamp(${rem(min)}, ${vw}vw, ${rem(max)})`);
    expect(value(TYPOGRAPHY.role.hero.leading)).toBe(String(leading));
    expect(min).toBeLessThan(max);
    // Every other role is a fixed step: only hero names the fluid one.
    for (const [variant, spec] of Object.entries(ROLE_SPEC) as [string, Spec][]) expect(spec.size === "hero" || spec.leading === "hero", variant).toBe(variant === "hero");
  });
});

describe("typographyRule", () => {
  it("[foundations.typography.code-rule] spells a role from its palette variables and breaks sans between words", () => {
    expect(typographyRule("body")).toEqual({
      fontFamily: TYPOGRAPHY.palette.family.sans,
      fontSize: TYPOGRAPHY.role.body.size,
      fontWeight: TYPOGRAPHY.role.body.weight,
      lineHeight: TYPOGRAPHY.role.body.leading,
      letterSpacing: TYPOGRAPHY.role.body.tracking,
      wordBreak: "keep-all",
      overflowWrap: "break-word",
    });
  });

  it("[foundations.typography.mono-axis] scales mono by monoSizeScale, swaps the tracking for tracking.mono, and breaks anywhere", () => {
    expect(typographyRule("heading", { family: "mono" })).toEqual({
      fontFamily: TYPOGRAPHY.palette.family.mono,
      fontSize: `calc(${TYPOGRAPHY.role.heading.size} * ${TYPOGRAPHY.palette.monoSizeScale})`,
      fontWeight: TYPOGRAPHY.role.heading.weight,
      lineHeight: TYPOGRAPHY.role.heading.leading,
      letterSpacing: TYPOGRAPHY.palette.tracking.mono,
      wordBreak: "normal",
      overflowWrap: "anywhere",
    });
  });

  it("[foundations.typography.mono-axis] scales mono by monoSizeScale in every variant, and only the size", () => {
    for (const variant of TEXT_VARIANTS) {
      const sans = typographyRule(variant);
      const mono = typographyRule(variant, { family: "mono" });
      expect(mono.fontSize, variant).toBe(`calc(${TYPOGRAPHY.role[variant].size} * ${TYPOGRAPHY.palette.monoSizeScale})`);
      expect(mono.fontFamily, variant).toBe(TYPOGRAPHY.palette.family.mono);
      expect(mono.lineHeight, variant).toBe(sans.lineHeight);
      expect(mono.fontWeight, variant).toBe(sans.fontWeight);
    }
  });

  it("[foundations.typography.line-breaking] owns the breaking policy per family", () => {
    expect(TYPOGRAPHY_SOURCE.breaking).toEqual({
      sans: { wordBreak: "keep-all", overflowWrap: "break-word" },
      mono: { wordBreak: "normal", overflowWrap: "anywhere" },
    });
  });
});

describe("monoRule and codeRule", () => {
  it("[foundations.typography.code-rule] shrinks inline mono relative to the surrounding text", () => {
    expect(monoRule()).toEqual({
      fontFamily: TYPOGRAPHY.palette.family.mono,
      fontSize: `calc(100% * ${TYPOGRAPHY.palette.monoSizeScale})`,
      letterSpacing: TYPOGRAPHY.palette.tracking.mono,
      wordBreak: "normal",
      overflowWrap: "anywhere",
    });
  });

  it("[foundations.typography.code-rule] [foundations.typography.code-breaking] scales inline and compact code from the surrounding text and sets no letter-spacing or line breaking", () => {
    for (const kind of ["inline", "compact"] as const) {
      const rule = codeRule(kind);
      expect(rule.fontFamily, kind).toBe(TYPOGRAPHY.palette.family.mono);
      expect(rule.fontSize, kind).toBe(`calc(100% * ${TYPOGRAPHY.palette.codeScale[kind]})`);
      expect(rule, kind).not.toHaveProperty("letterSpacing");
      expect(rule, kind).not.toHaveProperty("lineHeight");
      // A fragment breaks the way the text around it does, so a code cell never narrows its column.
      expect(rule, kind).not.toHaveProperty("wordBreak");
      expect(rule, kind).not.toHaveProperty("overflowWrap");
    }
    for (const kind of ["inline", "compact"] as const) expect(value(TYPOGRAPHY.palette.codeScale[kind])).toBe(String(TYPOGRAPHY_SOURCE.codeScale[kind]));
  });

  it("[foundations.typography.code-rule] draws a code block as mono at the size, weight and line CODE_SPEC names", () => {
    expect(codeRule("block")).toEqual({
      fontFamily: TYPOGRAPHY.palette.family.mono,
      fontSize: TYPOGRAPHY.palette.fontSize[CODE_SPEC.block.size],
      fontWeight: TYPOGRAPHY.palette.weight[CODE_SPEC.block.weight],
      lineHeight: TYPOGRAPHY.palette.leading[CODE_SPEC.block.leading],
      wordBreak: "normal",
      overflowWrap: "anywhere",
    });
  });
});

describe("presetRule", () => {
  it("[foundations.typography.control-preset] names the button weights after the palette", () => {
    expect(Object.keys(PRESET_SPEC.button)).toEqual(["medium", "strong"]);
    expect(presetRule("button", "md", "medium").fontWeight).toBe(TYPOGRAPHY.palette.weight.medium);
    expect(presetRule("button", "md", "strong").fontWeight).toBe(TYPOGRAPHY.palette.weight.strong);
  });

  it("[foundations.typography.single-line] keeps the label of a button or badge on one line and lets an input choose its own", () => {
    expect(PRESET_SINGLE_LINE).toEqual({ button: true, field: false, textarea: false, badge: true });
    expect(Object.keys(PRESET_SINGLE_LINE)).toEqual([...CONTROL_PRESETS]);
    expect(presetRule("button", "sm", "medium").whiteSpace).toBe("nowrap");
    expect(presetRule("badge").whiteSpace).toBe("nowrap");
    expect(presetRule("field", "md")).not.toHaveProperty("whiteSpace");
    expect(presetRule("textarea", "md")).not.toHaveProperty("whiteSpace");
  });

  it("[foundations.typography.input-line] gives a field its glyph line and a taller input line box, and a textarea its own line", () => {
    expect(presetRule("field", "md").lineHeight).toBe(TYPOGRAPHY.preset.field.md.leading);
    for (const size of CONTROL_SIZES) expect(TYPOGRAPHY.preset.field[size].inputLeading, size).toBe(TYPOGRAPHY.palette.leading[PRESET_SPEC.field[size].inputLeading]);
    expect(presetRule("textarea", "md").lineHeight).toBe(TYPOGRAPHY.preset.textarea.md.leading);
  });

  it("[foundations.typography.control-preset] builds every preset leaf, and the declaration carries no input line", () => {
    for (const size of ["sm", "md", "lg"] as const) {
      for (const rule of [presetRule("button", size, "medium"), presetRule("button", size, "strong"), presetRule("field", size), presetRule("textarea", size)]) {
        expect(Object.keys(rule).sort()).toEqual(expect.arrayContaining(["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing"]));
        expect(rule).not.toHaveProperty("inputLeading");
      }
    }
  });
});

describe("emphasisRule", () => {
  it("[foundations.typography.code-rule] is the palette weight of the same name", () => {
    expect(emphasisRule("regular")).toEqual({ fontWeight: TYPOGRAPHY.palette.weight.regular });
    expect(emphasisRule("bold")).toEqual({ fontWeight: TYPOGRAPHY.palette.weight.bold });
  });
});

describe("FONT_STYLESHEETS", () => {
  it("[install.fonts.snippet-matches-app] pins both stylesheets to a version", () => {
    expect(FONT_STYLESHEETS).toEqual({
      sans: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css",
      mono: "https://cdn.jsdelivr.net/gh/fonts-archive/D2Coding@5ac6fc6fada70f1d8a8561cec826722574c51a6e/D2Coding.css",
    });
  });
});
