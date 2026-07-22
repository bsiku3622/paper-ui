// sizeLadder — 컨트롤 크기 사다리 (3 단 sm·md·lg).
//
// height × paddingInline × fontSize 를 묶되, **fontSize 는 밀도와 분리**한다:
// height·padding 은 사이즈마다 움직여도(밀도) fontSize 는 14 를 지킨다(가독성 하한,
// lg 만 16). 컨트롤이 작아진다고 글자가 12 로 떨어지면 안 된다 — Ant(14/14/16)·
// Atlassian(14 고정)·Carbon(테이블 24→64px 인데 폰트 14 고정)의 결론.
//
// Button·Field·Select·Tabs 가 이 사다리를 공유해 같은 size 는 같은 height 에 앉는다.

import type { StyleRule } from "@vanilla-extract/css";

import { tokens, CONTROL_SIZES, type ControlSize } from "../tokens";

export const sizeLadderRules = Object.fromEntries(
  CONTROL_SIZES.map((s) => [
    s,
    {
      height: tokens.shape.height[s].interaction,
      paddingInline: tokens.shape.padding[s].interaction,
      fontSize: tokens.shape.controlFontSize[s], // ← height/padding 과 분리한 14/14/16
    } satisfies StyleRule,
  ]),
) as Record<ControlSize, StyleRule>;
