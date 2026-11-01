// resolver는 공유 축의 이름을 typed class map에서 고른다; 렌더 값은 tests/*.spec.ts가 본다.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

import { accentVariantClass, fillClass, hoverGate, inkClass } from "../styles/color.css";
import { spaceClass } from "../styles/space.css";
import { controlFontSizeClass, presetClass, textMonoClass, textNumericClass, textRoleClass } from "../styles/typography.css";
import { ACCENTS, CONTROL_FONT_SIZES, CONTROL_PRESETS, CONTROL_SIZES, INKS, SPACES, SURFACE_FILLS, TEXT_VARIANTS, VARIANTS } from "../tokens";
import { TEXT_INK } from "../tokens/typography";
import { BOX_STYLE, BOX_STYLE_KEYS, resolveBoxClass, resolveControlFontSize, resolveFill, resolveGap, resolveInk, resolvePreset, resolveSpace, resolveText } from "./index";

const distinct = (classes: readonly string[]) => new Set(classes).size === classes.length && classes.every(Boolean);

describe("the class maps", () => {
  it("[foundations.class-maps.one-way] stay below the resolvers: nothing in styles/ imports them", () => {
    const styles = join(dirname(fileURLToPath(import.meta.url)), "../styles");
    const importing = readdirSync(styles).filter((file) => /from\s*["'][^"']*resolvers/.test(readFileSync(join(styles, file), "utf8")));
    expect(importing).toEqual([]);
  });

  it("[foundations.class-maps.follow-vocabulary] name every value of the axis they index, once, with a class of their own", () => {
    expect(Object.keys(fillClass)).toEqual([...SURFACE_FILLS]);
    expect(Object.keys(inkClass)).toEqual([...INKS]);
    expect(Object.keys(accentVariantClass)).toEqual([...ACCENTS]);
    for (const accent of ACCENTS) expect(Object.keys(accentVariantClass[accent]), accent).toEqual([...VARIANTS]);
    for (const [axis, map] of Object.entries(spaceClass)) expect(Object.keys(map), axis).toEqual([...SPACES]);
    expect(Object.keys(textRoleClass)).toEqual([...TEXT_VARIANTS]);
    expect(Object.keys(textMonoClass)).toEqual([...TEXT_VARIANTS]);

    expect(distinct(Object.values(fillClass))).toBe(true);
    expect(distinct(Object.values(inkClass))).toBe(true);
    expect(distinct(ACCENTS.flatMap((accent) => Object.values(accentVariantClass[accent])))).toBe(true);
    for (const [axis, map] of Object.entries(spaceClass)) expect(distinct(Object.values(map)), axis).toBe(true);
    expect(distinct([...Object.values(textRoleClass), ...Object.values(textMonoClass)])).toBe(true);
  });

  it("[primitives.box.padding-axes] declare the space axes in the order that lets the single axis lose to the pair", () => {
    expect(Object.keys(spaceClass)).toEqual(["padding", "paddingX", "paddingY", "gap", "rowGap", "columnGap"]);
  });

  it("[primitives.paint.classes] give the hover gate a class that is none of the accent classes", () => {
    expect(hoverGate).toBeTruthy();
    expect(ACCENTS.flatMap((accent) => Object.values(accentVariantClass[accent]))).not.toContain(hoverGate);
  });
});

describe("resolveFill / resolveInk", () => {
  it("[foundations.class-maps.follow-vocabulary] pick the class their map holds for every value, and nothing for undefined", () => {
    for (const fill of SURFACE_FILLS) expect(resolveFill(fill), fill).toBe(fillClass[fill]);
    for (const ink of INKS) expect(resolveInk(ink), ink).toBe(inkClass[ink]);
    expect(resolveFill(undefined)).toBe("");
    expect(resolveInk(undefined)).toBe("");
  });
});

describe("resolveText", () => {
  it("[primitives.text.ink-beats-variant] joins the role, the mono modifier for family mono, and the ink — the role's own when none is given", () => {
    for (const variant of TEXT_VARIANTS) {
      const ink = inkClass[TEXT_INK[variant]];
      expect(resolveText({ variant }), variant).toBe([textRoleClass[variant], ink].join(" "));
      expect(resolveText({ variant, family: "sans" }), variant).toBe([textRoleClass[variant], ink].join(" "));
      expect(resolveText({ variant, family: "mono", ink: "error" }), variant).toBe([textRoleClass[variant], textMonoClass[variant], inkClass.error].join(" "));
      expect(resolveText({ variant, family: "mono" }), variant).toBe([textRoleClass[variant], textMonoClass[variant], ink].join(" "));
    }
    expect(resolveText({})).toBe([textRoleClass.body, inkClass.primary].join(" "));
  });

  it("[primitives.text.numeric] adds the numeric class last", () => {
    expect(resolveText({ variant: "caption", numeric: true })).toBe([textRoleClass.caption, inkClass.secondary, textNumericClass].join(" "));
    expect(resolveText({ numeric: false })).not.toContain(textNumericClass);
  });
});

describe("resolvePreset", () => {
  it("[foundations.typography.control-preset] picks a class for every preset × size × weight", () => {
    for (const size of CONTROL_SIZES) {
      expect(resolvePreset("button", size, "medium"), `button ${size} medium`).toBe(presetClass.button.medium[size]);
      expect(resolvePreset("button", size, "strong"), `button ${size} strong`).toBe(presetClass.button.strong[size]);
      expect(resolvePreset("field", size), `field ${size}`).toBe(presetClass.field[size]);
      expect(resolvePreset("textarea", size), `textarea ${size}`).toBe(presetClass.textarea[size]);
    }
    expect(resolvePreset("badge")).toBe(presetClass.badge);
    expect(Object.keys(presetClass)).toEqual([...CONTROL_PRESETS]);
    for (const preset of Object.values(presetClass)) expect(preset).toBeTruthy();
  });
});

describe("resolveControlFontSize", () => {
  it("[foundations.typography.font-size-escape] picks the font size class of a control font size, and nothing for undefined", () => {
    for (const fontSize of CONTROL_FONT_SIZES) expect(resolveControlFontSize(fontSize), fontSize).toBe(controlFontSizeClass[fontSize]);
    expect(resolveControlFontSize(undefined)).toBe("");
  });
});

describe("resolveSpace", () => {
  it("[primitives.box.padding-axes] picks the class of the axis and the step, and nothing without a step", () => {
    for (const axis of Object.keys(spaceClass) as (keyof typeof spaceClass)[]) {
      for (const step of SPACES) expect(resolveSpace(axis, step), `${axis} ${step}`).toBe(spaceClass[axis][step]);
      expect(resolveSpace(axis, undefined), axis).toBe("");
    }
  });
});

describe("resolveGap", () => {
  it("[primitives.layout.gap-family] joins the gap family from one map and gives a class only to the names it was given", () => {
    expect(resolveGap({ gap: "md", rowGap: "lg", columnGap: "xs" })).toBe([spaceClass.gap.md, spaceClass.rowGap.lg, spaceClass.columnGap.xs].join(" "));
    expect(resolveGap({ columnGap: "sm" })).toBe(spaceClass.columnGap.sm);
    expect(resolveGap({})).toBe("");
  });
});

describe("resolveBoxClass", () => {
  it("[primitives.box.padding-axes] joins the space classes in BOX_STYLE_KEYS order — Box has no ink and no paint", () => {
    expect(BOX_STYLE_KEYS).toEqual(["padding", "paddingX", "paddingY"]);
    expect(resolveBoxClass({ paddingX: "sm", padding: "md" })).toBe([spaceClass.padding.md, spaceClass.paddingX.sm].join(" "));
    expect(resolveBoxClass({ paddingX: "lg", paddingY: "xs" })).toBe([spaceClass.paddingX.lg, spaceClass.paddingY.xs].join(" "));
  });

  it("[primitives.box.padding-axes] takes every key of BOX_STYLE from its own map", () => {
    for (const key of BOX_STYLE_KEYS) {
      const map: Record<string, string> = BOX_STYLE[key];
      for (const [name, className] of Object.entries(map)) expect(resolveBoxClass({ [key]: name }), `${key} ${name}`).toBe(className);
    }
  });

  it("[primitives.box.padding-axes] is empty for empty input", () => {
    expect(resolveBoxClass({})).toBe("");
  });
});
