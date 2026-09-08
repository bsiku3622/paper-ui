import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// 테두리의 굵기·종류만 얹는다 — 색(bg · 글자 · border)은 resolveColor 가 붙이는
// pui-c-{color}-{variant} 클래스가 정한다. soft·solid 는 borderColor 가 transparent 라
// 이 규칙이 있어도 선이 안 보이고, outline 일 때만 테두리가 드러난다. 그래서 variant 마다
// 규칙을 가르지 않고 하나로 둔다.
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
