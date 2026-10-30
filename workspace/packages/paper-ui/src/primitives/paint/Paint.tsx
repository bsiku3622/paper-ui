// Paint — accent × variant 를 입히는 2차 primitive. Button · Badge 의 색이 여기서 온다.
//
// accent(의미) × variant(시각 무게)는 styles/color.css.ts 의 지도 하나가 정한다. Paint 는 그 이름을 class 로 옮길 뿐이다.
// accent 를 안 주면 칠하지 않는다. hoverable 은 눌리는 자리에만 — 포인터가 올라갈 수 있고(hover: hover) 막히지
// 않았을 때 hover 색이 뜬다. 표시용에는 주지 않는다.

import { forwardRef, type ElementType } from "react";

import { joinClass } from "../../internal/joinClass";
import { accentVariantClass, hoverGate } from "../../styles/color.css";
import type { Accent, Variant } from "../../tokens";
import { Box, type BoxOwnProps } from "../Box";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";

export type PaintOwnProps = BoxOwnProps & {
  accent?: Accent;
  variant?: Variant;
  // 포인터가 올라가면 hover 색이 뜨게 한다. 터치에는 hover 가 없고, 막힌 대상(disabled · aria-disabled · data-disabled)에는 뜨지 않는다.
  hoverable?: boolean;
};

export type PaintProps<As extends ElementType = "div"> = PolymorphicProps<PaintOwnProps, As>;

// Atom 이 accent class 에 닿는 유일한 길. variant 를 안 주면 solid 다.
export const paintClass = ({ accent, variant = "solid", hoverable }: Pick<PaintOwnProps, "accent" | "variant" | "hoverable">): string =>
  joinClass(accent && accentVariantClass[accent][variant], hoverable && hoverGate);

const PaintImpl = forwardRef<HTMLElement, Omit<PaintProps, "as" | "ref"> & { as?: ElementType }>(function Paint({
  accent,
  variant,
  hoverable,
  className,
  ...rest
}, ref) {
  return <Box ref={ref} className={joinClass(paintClass({ accent, variant, hoverable }), className)} {...rest} />;
});

export const Paint = PaintImpl as PolymorphicComponent<PaintOwnProps, "div">;
