import { forwardRef, type ElementType } from "react";

import { joinClass } from "../../internal/joinClass";
import { resolveFill } from "../../resolvers";
import { accentVariantClass, hoverGate } from "../../styles/color.css";
import { FILLABLE_VARIANTS, stateAttributes, type Accent, type FillableVariant, type SurfaceFill, type Variant } from "../../tokens";
import { Box, type BoxOwnProps } from "../Box";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";
import { restingShadow } from "./Surface.css";

export type PaintFace =
  | { variant?: Exclude<Variant, FillableVariant>; fill?: undefined; shadow?: boolean }
  | { variant: FillableVariant; fill?: SurfaceFill; shadow?: false }
  | { variant: FillableVariant; fill: SurfaceFill; shadow?: boolean }
  | { variant?: Variant; fill?: undefined; shadow?: false };

const isFillable = (variant: Variant): boolean => (FILLABLE_VARIANTS as readonly Variant[]).includes(variant);

export type PaintOwnProps = BoxOwnProps & PaintFace & {
  accent?: Accent;
  hoverable?: boolean;
  selected?: boolean;
};

export type PaintProps<As extends ElementType = "div"> = PolymorphicProps<PaintOwnProps, As>;

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
