import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// wash 면의 괘선(edge)이 보이도록 border-width/style 만 얹는다. 색(bg·ink·border)
// 은 Box 의 status+tone="wash" 가 resolver 로 붙인다.
export const alertRoot = style({
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
});
