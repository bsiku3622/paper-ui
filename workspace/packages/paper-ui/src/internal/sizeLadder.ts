// sizeLadder — 인터랙티브 크기 사다리 (studio-ui 구조 이식).
//
// height × paddingInline × fontSize 를 5 단(xs~xl)으로 묶은 공통 규칙. Button ·
// Field · Select 가 *같은 사다리* 를 공유하기 때문에 크기 축이 어긋날 수 없다 —
// 한 컴포넌트의 md 와 다른 컴포넌트의 md 가 항상 같은 height 에 앉는다.
//
// calc 식 없음: 모든 값은 사다리의 *그 단계* 토큰(shape.height/padding/fontSize)이다.

import type { StyleRule } from "@vanilla-extract/css";

import { tokens, SPACE_KEYS, type Space } from "../tokens";

export const sizeLadderRules = Object.fromEntries(
  SPACE_KEYS.map((s) => [
    s,
    {
      height: tokens.shape.height[s].interaction,
      paddingInline: tokens.shape.padding[s].interaction,
      fontSize: tokens.shape.fontSize[s],
    } satisfies StyleRule,
  ]),
) as Record<Space, StyleRule>;
