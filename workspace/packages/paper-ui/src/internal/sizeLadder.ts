// sizeLadder — 컨트롤 크기 사다리 (3 단 sm·md·lg).
//
// height × paddingInline × fontSize 를 묶되, **뒤의 둘은 밀도와 분리**한다:
//   fontSize — height 가 움직여도 14 를 지킨다(가독성 하한). 컨트롤이 작아진다고
//     글자가 12 로 떨어지면 안 된다 — Ant(14/14/16)·Atlassian(14 고정)·Carbon
//     (테이블 24→64px 인데 폰트 14 고정)의 결론.
//   paddingInline — Box 여백 사다리가 아니라 CONTROL_PADDING_X 를 쓴다. 라벨이 14 로
//     고정이라 세로 여백은 height 가 정해 버리므로, 가로는 그 세로에 대한 *비*로
//     잡아야 한다(1.5~1.7). Box 여백을 빌려 쓰면 그 비가 1.2 로 눌려 컨트롤이
//     전부 답답해진다. 자세한 근거는 tokens/shape.ts 의 CONTROL_PADDING_X.
//
// Button·Field·Select·Tabs 가 이 사다리를 공유해 같은 size 는 같은 height 에 앉는다.

import type { StyleRule } from "@vanilla-extract/css";

import { tokens, CONTROL_SIZES, type ControlSize } from "../tokens";

export const sizeLadderRules = Object.fromEntries(
  CONTROL_SIZES.map((s) => [
    s,
    {
      height: tokens.shape.height[s].interaction,
      paddingInline: tokens.shape.controlPaddingX[s], // ← Box 여백과 분리 (가로:세로 비)
      fontSize: tokens.shape.controlFontSize[s], // ← height/padding 과 분리해 14 고정
    } satisfies StyleRule,
  ]),
) as Record<ControlSize, StyleRule>;
