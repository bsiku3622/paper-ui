import { createVar } from "@vanilla-extract/css";

import { BREAKPOINTS, tokens, type Align, type Breakpoint, type Justify, type JustifyItem } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style, styleVariants, globalStyle } = layered("components");

// columns 의 기본값 하나는 root 가 갖는다. 아래의 어느 규칙보다 앞에 있어 그것들에 지고, 호출자의 track 은 inline 이라 이긴다.
export const gridRoot = style({ display: "grid", gridTemplateColumns: "minmax(0, 1fr)" });
globalStyle(`:where(.${gridRoot})`, { minWidth: 0 });

const ALIGN_ITEMS = { start: "start", center: "center", end: "end", stretch: "stretch", baseline: "baseline" } as const satisfies Record<Align, string>;
const JUSTIFY_CONTENT = { start: "start", center: "center", end: "end", between: "space-between" } as const satisfies Record<Justify, string>;
const JUSTIFY_ITEMS = { start: "start", center: "center", end: "end", stretch: "stretch" } as const satisfies Record<JustifyItem, string>;

export const gridAlign = styleVariants(ALIGN_ITEMS, (alignItems) => ({ alignItems }));
export const gridJustify = styleVariants(JUSTIFY_CONTENT, (justifyContent) => ({ justifyContent }));
export const gridJustifyItems = styleVariants(JUSTIFY_ITEMS, (justifyItems) => ({ justifyItems }));

// 폭을 따라 바뀌는 track. 값은 실행 중에 정해지지만 inline 의 track 은 미디어 쿼리를 이기므로, Grid.tsx 는 변수에 값을 쓰고 규칙은
// 여기서 그 변수를 읽는다. 변수는 상속되어도 호출자가 준 단의 class 만 붙으니 바깥 Grid 의 값을 주워 읽지 않는다. 좁은 단부터 쓰여
// 넓은 단이 순서로 이긴다.
const stepsOf = (property: "gridTemplateColumns" | "gridTemplateRows") => {
  const base = createVar();
  const steps = Object.fromEntries(BREAKPOINTS.map((step) => [step, createVar()])) as Record<Breakpoint, string>;
  const nameOf = (reference: string) => reference.slice("var(".length, -")".length);
  return {
    base: { property: nameOf(base), className: style({ [property]: base }) },
    at: Object.fromEntries(BREAKPOINTS.map((step) => [step, {
      property: nameOf(steps[step]),
      className: style({ "@media": { [`(min-width: ${tokens.layout.breakpoint[step]})`]: { [property]: steps[step] } } }),
    }])) as Record<Breakpoint, { property: string; className: string }>,
  };
};
export const gridColumnSteps = stepsOf("gridTemplateColumns");
export const gridRowSteps = stepsOf("gridTemplateRows");
