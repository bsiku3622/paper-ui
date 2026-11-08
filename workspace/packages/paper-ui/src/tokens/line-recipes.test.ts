import { describe, expect, it } from "vitest";

import { LINE_SIDES, lineFrame, lineRule, tokens } from "./index";

describe("Line assembles one drawn line", () => {
  it("[foundations.line.assembly] takes its thickness from Shape and its colour from Color", () => {
    expect(lineRule()).toEqual({ borderWidth: tokens.shape.stroke.border, borderStyle: "solid", borderColor: tokens.color.border.base });
    expect(lineRule({ level: "strong" }).borderColor).toBe(tokens.color.border.strong);
    expect(lineRule({ weight: "emphasis" }).borderWidth).toBe(tokens.shape.stroke.emphasis);
  });

  it("[foundations.line.assembly] leaves the colour out of the frame, for a place the paint tier colours", () => {
    expect(lineFrame()).toEqual({ borderWidth: tokens.shape.stroke.border, borderStyle: "solid" });
    expect(lineFrame({ style: "dashed" }).borderStyle).toBe("dashed");
  });

  it("[foundations.line.assembly] goes along one side when told, in logical properties, so a right-to-left page follows", () => {
    expect(lineRule({ side: "top" })).toEqual({ borderBlockStartWidth: tokens.shape.stroke.border, borderBlockStartStyle: "solid", borderBlockStartColor: tokens.color.border.base });
    expect(lineFrame({ side: "bottom" })).toEqual({ borderBlockEndWidth: tokens.shape.stroke.border, borderBlockEndStyle: "solid" });
    expect(lineFrame({ side: "start" })).toEqual({ borderInlineStartWidth: tokens.shape.stroke.border, borderInlineStartStyle: "solid" });
    expect(lineFrame({ side: "end" })).toEqual({ borderInlineEndWidth: tokens.shape.stroke.border, borderInlineEndStyle: "solid" });
    expect([...LINE_SIDES]).toEqual(["top", "bottom", "start", "end"]);
  });
});
