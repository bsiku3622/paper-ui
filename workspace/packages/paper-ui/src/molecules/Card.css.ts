import { globalStyle, style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// 색·면·선은 shared color profile이 전부 결정한다. Card가 소유하는 건 컨테이너의
// border geometry뿐이며, 정적 면이라 interactive gate와 shadow는 붙이지 않는다.
export const cardRoot = style({
  minWidth: 0,
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
});
export const cardSolid = style({});

export const cardHeader = style({
  borderBottom: `${tokens.shape.constants.borderWidth} solid currentColor`,
  borderBottomColor: "color-mix(in srgb, currentColor 18%, transparent)",
});

export const cardBody = style({ minWidth: 0 });

export const cardFooter = style({
  borderTop: `${tokens.shape.constants.borderWidth} solid currentColor`,
  borderTopColor: "color-mix(in srgb, currentColor 18%, transparent)",
});

// Text variant의 기본 ink만 solid Card의 on-solid 잉크로 돌린다. 명시적인 ink prop은
// 보존해 Badge·상태 문구처럼 의도적으로 색을 준 자리가 사라지지 않게 한다.
globalStyle(`${cardSolid} [class*="pui-text-"]:not([class*="pui-ink-"])`, {
  color: "inherit",
});
