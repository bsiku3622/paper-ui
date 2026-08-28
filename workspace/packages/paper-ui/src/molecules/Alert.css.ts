import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// wash 면의 괘선(edge)이 보이도록 border-width/style 만 얹는다. 색(bg·ink·border)
// 은 Box 의 status+tone="wash" 가 resolver 로 붙인다.
export const alertRoot = style({
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
});

// 시각적으로 숨기되 스크린리더엔 읽히는 접두어("오류:" 등) — 상태 의미가 색으로만
// 전달되지 않게 텍스트로도 심는다.
export const srOnly = style({
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
  border: 0,
});
