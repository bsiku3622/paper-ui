import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// 흰 면 + 헤어라인 괘선으로 정의되는 카드. 회색으로 채우지 않는다 —
// 회색 채운 카드를 기본 래퍼로 쓰면 화면에 회색 박스가 쌓여 물린다(SwiftUI·
// Atlassian·ChatGPT 공통 회피). 회색(paper.subtle)은 "카드를 감싸는 면"이 아니라
// "카드를 받치는 바닥·well"(페이지 바닥·입력·table head·hover)에만 산다.
// 그림자는 여전히 *떠 있는 것*(overlay)의 표식일 뿐, 카드는 뜨지 않는다.
export const cardRoot = style({
  background: tokens.color.paper.base,
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
  borderColor: tokens.color.border.base,
});
