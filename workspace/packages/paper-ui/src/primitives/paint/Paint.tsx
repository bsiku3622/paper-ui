// Paint — accent × variant 를 입히는 2차 primitive. Button · Badge 의 색이 여기서 온다.
//
// accent(의미) × variant(시각 무게)는 styles/color.css.ts 의 지도 하나가 정한다. Paint 는 그 이름을 class 로 옮길 뿐이다.
// accent 를 안 주면 칠하지 않는다. hoverable 은 눌리는 자리에만 — 포인터가 올라갈 수 있고(hover: hover) 막히지
// 않았을 때 hover 색이 뜬다. 표시용에는 주지 않는다.
//
// solid · soft 는 자기 면을 칠한다. 나머지 넷은 선과 글자만 정하고, 면은 fill 이 Surface 와 같은 사다리에서 고른다.
// 그림자는 면이 드리우므로 면이 있을 때만 받는다.

import { forwardRef, type ElementType } from "react";

import { joinClass } from "../../internal/joinClass";
import { resolveFill } from "../../resolvers";
import { accentVariantClass, hoverGate } from "../../styles/color.css";
import { FILLABLE_VARIANTS, stateAttributes, type Accent, type FillableVariant, type SurfaceFill, type Variant } from "../../tokens";
import { Box, type BoxOwnProps } from "../Box";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";
import { restingShadow } from "./Surface.css";

// 어떤 variant 가 무엇을 받는가: solid · soft 는 fill 을 받지 않고, 나머지는 fill 이 있어야 그림자를 받는다. 마지막 줄은 어느
// variant 인지 값으로만 아는 자리(variant: Variant)를 위한 것이다. 타입이 막는 조합은 런타임에도 그리지 않는다.
export type PaintFace =
  | { variant?: Exclude<Variant, FillableVariant>; fill?: undefined; shadow?: boolean }
  | { variant: FillableVariant; fill?: SurfaceFill; shadow?: false }
  | { variant: FillableVariant; fill: SurfaceFill; shadow?: boolean }
  | { variant?: Variant; fill?: undefined; shadow?: false };

const isFillable = (variant: Variant): boolean => (FILLABLE_VARIANTS as readonly Variant[]).includes(variant);

export type PaintOwnProps = BoxOwnProps & PaintFace & {
  accent?: Accent;
  // 포인터가 올라가면 hover 색이 뜨게 한다. 터치에는 hover 가 없고, 막힌 대상(disabled · aria-disabled · data-disabled)에는 뜨지 않는다.
  hoverable?: boolean;
  // data-selected 를 단다. 선택된 면은 prop 이 아니라 그 속성을 읽는 CSS 가 입히고, 선택될 수 있는 variant(hairline · ghost · muted)만 면을 바꾼다.
  selected?: boolean;
};

export type PaintProps<As extends ElementType = "div"> = PolymorphicProps<PaintOwnProps, As>;

// Atom 이 accent class 에 닿는 유일한 길. variant 를 안 주면 solid 다.
export const paintClass = ({ accent, variant = "solid", hoverable, fill, shadow }: { accent?: Accent; variant?: Variant; hoverable?: boolean; fill?: SurfaceFill; shadow?: boolean }): string => {
  const neutral = isFillable(variant);
  return joinClass(accent && accentVariantClass[accent][variant], hoverable && hoverGate, neutral && resolveFill(fill), shadow && (!neutral || fill) && restingShadow);
};

const PaintImpl = forwardRef<HTMLElement, Omit<PaintProps, "as" | "ref"> & { as?: ElementType }>(function Paint({
  accent,
  variant,
  fill,
  shadow,
  hoverable,
  selected,
  className,
  ...rest
}, ref) {
  return <Box ref={ref} className={joinClass(paintClass({ accent, variant, fill, shadow, hoverable }), className)} {...stateAttributes({ selected })} {...rest} />;
});

export const Paint = PaintImpl as PolymorphicComponent<PaintOwnProps, "div">;
