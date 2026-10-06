// sizeLadder — 컨트롤 크기 사다리 (3 단 sm·md·lg) + 거기서 벗어나는 통로.
//
// Shape geometry만 공유한다. Typography preset은 소비 컴포넌트의 semantic role이
// 선택한다(button·input·badge 등). size 하나로 글자 속성까지 공통 적용하면 역할 간
// weight와 leading 차이를 표현할 수 없고, 각 컴포넌트가 따로 덮어쓰게 된다.
//   paddingInline — Box 여백 사다리가 아니라 CONTROL_PADDING_X 를 쓴다. 버튼은
//     라벨이 상자를 정의하고, 입력은 상자 안에 값이 놓여 서로 다른 가로 여백을 가진다.
//     자세한 근거는 tokens/shape.ts 의 CONTROL_PADDING_X · INPUT_PADDING_X.
//
// Button·Field·Select·Textarea·Tabs 가 이 사다리를 공유해 같은 size 는 같은 height 에
// 앉는다. 가로 여백은 역할에 따라 갈린다 —
// 아래 통로로 나간다.

import type { StyleRule } from "@vanilla-extract/css";

import { tokens, CONTROL_SIZES, type ControlSize } from "../tokens";

export const sizeLadderRules = Object.fromEntries(
  CONTROL_SIZES.map((s) => [
    s,
    {
      height: tokens.shape.height[s].interaction,
      paddingInline: tokens.shape.controlPaddingX[s], // ← Box 여백과 분리 (가로:세로 비)
    } satisfies StyleRule,
  ]),
) as Record<ControlSize, StyleRule>;

// ───── 통로 — 베이스에서 축 하나를 갈아 끼운다 ──────────────────────────────
//
// 사다리를 손으로 베끼면 언젠가 갈라진다(Select 가 실제로 그랬다 — 좌우 여백만 Box
// 사다리에서 가져와 Field 보다 1~2px 좁았고, 주석은 공통 사다리를 쓴다고 적혀 있었다).
// 그렇다고 베이스가 전부를 강제하면 역할이 다른 컨트롤이 억지로 같아진다 — 버튼 라벨과
// 입력칸 글자는 가로 여백 요구가 다르다.
//
// 그래서 **베이스는 공유하고, 벗어나는 축만 이름으로 짚는다.**
//
//   ladderRules()                                   베이스 그대로       Button · Tabs
//   ladderRules((s) => ({ paddingInline: X[s] }))   한 축만 교체        Field · Select
//   ladderRules((s) => ({ height: null }))          그 축을 아예 뺀다   Textarea
//
// 이 통로로 나가면 무엇을 왜 바꿨는지가 호출부 한 줄에 남고, 나머지 축은 베이스가
// 바뀔 때 저절로 따라온다. 사다리를 통째로 다시 쓰면 그 둘을 다 잃는다.
//
// css API 가 아니라 *규칙 객체* 를 돌려준다 — styleVariants 는 .css.ts 안에서만 부를 수
// 있어서, 클래스를 굽는 일은 각 컴포넌트의 .css.ts 에 남긴다.
export type LadderPatch = (size: ControlSize) => Record<string, string | null>;

export const ladderRules = (patch?: LadderPatch): Record<ControlSize, StyleRule> =>
  Object.fromEntries(
    CONTROL_SIZES.map((s) => {
      const rule = { ...sizeLadderRules[s], ...patch?.(s) } as Record<string, string | null>;
      // null 은 "이 축은 안 쓴다" — 키를 지운다. undefined 를 남기면 emit 이 깨진다.
      for (const [k, v] of Object.entries(rule)) if (v === null) delete rule[k];
      return [s, rule as StyleRule];
    }),
  ) as Record<ControlSize, StyleRule>;
