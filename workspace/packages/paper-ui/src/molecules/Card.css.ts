import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// Card 는 그림자로 뜨지 않는다. 괘선으로 정의된다 — 종이에 그은 네모.
export const cardRoot = style({
  borderWidth: tokens.shape.ruleWidth.base,
  borderStyle: "solid",
  borderColor: tokens.color.rule.base,
});
