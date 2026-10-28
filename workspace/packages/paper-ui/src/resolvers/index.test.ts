// resolver는 공유 축의 이름을 typed class map에서 고른다; 렌더 값은 tests/*.spec.ts가 본다.

import { describe, it, expect } from "vitest";

import { accentVariantClass, inkClass, interactiveClass, surfaceClass } from "../styles/color.css";
import { spaceClass } from "../styles/space.css";
import { textMonoClass, textRoleClass } from "../styles/typography.css";
import { ACCENTS, INKS, SPACES, SURFACES, TEXT_VARIANTS, VARIANTS } from "../tokens";
import { BOX_STYLE, BOX_STYLE_KEYS, resolveAccent, resolveBoxClass, resolveInk, resolveSpace, resolveSurface, resolveText } from "./index";

const distinct = (classes: readonly string[]) => new Set(classes).size === classes.length && classes.every(Boolean);

describe("the class maps", () => {
  it("[foundations.class-maps.follow-vocabulary] name every value of the axis they index, once, with a class of their own", () => {
    expect(Object.keys(surfaceClass)).toEqual([...SURFACES]);
    expect(Object.keys(inkClass)).toEqual([...INKS]);
    expect(Object.keys(accentVariantClass)).toEqual([...ACCENTS]);
    for (const accent of ACCENTS) expect(Object.keys(accentVariantClass[accent]), accent).toEqual([...VARIANTS]);
    for (const [axis, map] of Object.entries(spaceClass)) expect(Object.keys(map), axis).toEqual([...SPACES]);
    expect(Object.keys(textRoleClass)).toEqual([...TEXT_VARIANTS]);
    expect(Object.keys(textMonoClass)).toEqual([...TEXT_VARIANTS]);

    expect(distinct(Object.values(surfaceClass))).toBe(true);
    expect(distinct(Object.values(inkClass))).toBe(true);
    expect(distinct(ACCENTS.flatMap((accent) => Object.values(accentVariantClass[accent])))).toBe(true);
    for (const [axis, map] of Object.entries(spaceClass)) expect(distinct(Object.values(map)), axis).toBe(true);
    expect(distinct([...Object.values(textRoleClass), ...Object.values(textMonoClass)])).toBe(true);
  });

  it("declare the space axes in the order that lets the single axis lose to the pair", () => {
    expect(Object.keys(spaceClass)).toEqual(["padding", "paddingX", "paddingY", "gap", "rowGap", "columnGap"]);
  });

  it("give the hover gate a class that is none of the accent classes", () => {
    expect(interactiveClass).toBeTruthy();
    expect(ACCENTS.flatMap((accent) => Object.values(accentVariantClass[accent]))).not.toContain(interactiveClass);
  });
});

describe("resolveSurface / resolveInk", () => {
  it("pick the class their map holds for every value, and nothing for undefined", () => {
    for (const surface of SURFACES) expect(resolveSurface(surface), surface).toBe(surfaceClass[surface]);
    for (const ink of INKS) expect(resolveInk(ink), ink).toBe(inkClass[ink]);
    expect(resolveSurface(undefined)).toBe("");
    expect(resolveInk(undefined)).toBe("");
  });
});

describe("resolveAccent", () => {
  it("picks the accent × variant class, and solid when the variant is left out", () => {
    for (const accent of ACCENTS) {
      for (const variant of VARIANTS) expect(resolveAccent(accent, variant), `${accent} ${variant}`).toBe(accentVariantClass[accent][variant]);
      expect(resolveAccent(accent), accent).toBe(accentVariantClass[accent].solid);
    }
    expect(resolveAccent(undefined)).toBe("");
    expect(resolveAccent(undefined, "soft")).toBe("");
  });
});

describe("resolveText", () => {
  it("joins the role, the mono modifier for family mono, and the ink", () => {
    for (const variant of TEXT_VARIANTS) {
      expect(resolveText({ variant }), variant).toBe(textRoleClass[variant]);
      expect(resolveText({ variant, family: "sans" }), variant).toBe(textRoleClass[variant]);
      expect(resolveText({ variant, family: "mono", ink: "error" }), variant).toBe([textRoleClass[variant], textMonoClass[variant], inkClass.error].join(" "));
    }
    expect(resolveText({})).toBe(textRoleClass.body);
  });
});

describe("resolveSpace", () => {
  it("picks the class of the axis and the step, and nothing without a step", () => {
    for (const axis of Object.keys(spaceClass) as (keyof typeof spaceClass)[]) {
      for (const step of SPACES) expect(resolveSpace(axis, step), `${axis} ${step}`).toBe(spaceClass[axis][step]);
      expect(resolveSpace(axis, undefined), axis).toBe("");
    }
  });
});

describe("resolveBoxClass", () => {
  it("joins the surface and the space classes in BOX_STYLE_KEYS order — Box has no ink", () => {
    expect(BOX_STYLE_KEYS).toEqual(["surface", "padding", "paddingX", "paddingY", "gap"]);
    expect(resolveBoxClass({ gap: "sm", padding: "md", surface: "sunken" })).toBe(
      [surfaceClass.sunken, spaceClass.padding.md, spaceClass.gap.sm].join(" "),
    );
    expect(resolveBoxClass({ paddingX: "lg", paddingY: "xs" })).toBe([spaceClass.paddingX.lg, spaceClass.paddingY.xs].join(" "));
  });

  it("takes every key of BOX_STYLE from its own map", () => {
    for (const key of BOX_STYLE_KEYS) {
      const map: Record<string, string> = BOX_STYLE[key];
      for (const [name, className] of Object.entries(map)) expect(resolveBoxClass({ [key]: name }), `${key} ${name}`).toBe(className);
    }
  });

  it("is empty for empty input", () => {
    expect(resolveBoxClass({})).toBe("");
  });
});
