import { forwardRef, type ElementType } from "react";

import { joinClass } from "../../internal/joinClass";
import { resolveControlFontSize, resolveControlStrong, resolvePreset } from "../../resolvers";
import { CONTROL_ANATOMY_PRESET, type Align, type ControlAnatomy, type ControlFontSize, type ControlShape, type ControlSize, type IconSize, type Justify, type Space } from "../../tokens";
import { Box, type BoxOwnProps } from "../Box";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";
import { controlAlign, controlAnatomy, controlGap, controlIconSize, controlJustify, controlPill, controlSize } from "./Control.css";

export type ControlForm = {
  size?: ControlSize;
  anatomy?: ControlAnatomy;
  shape?: ControlShape;
  fontSize?: ControlFontSize;
  strong?: boolean;
  gap?: Space;
  align?: Align;
  justify?: Justify;
  iconSize?: IconSize;
};

export type ControlOwnProps = BoxOwnProps & ControlForm;
export type ControlProps<As extends ElementType = "div"> = PolymorphicProps<ControlOwnProps, As>;

export const controlClass = ({ size = "md", anatomy = "label", shape, fontSize, strong, gap, align, justify, iconSize }: ControlForm = {}): string => {
  const preset = CONTROL_ANATOMY_PRESET[anatomy];
  return joinClass(
    controlSize[size],
    controlAnatomy[anatomy],
    shape === "pill" && controlPill,
    preset === "badge" ? resolvePreset(preset) : preset && resolvePreset(preset, size),
    resolveControlFontSize(fontSize),
    resolveControlStrong(strong),
    gap && controlGap[gap],
    align && controlAlign[align],
    justify && controlJustify[justify],
    iconSize && controlIconSize[iconSize],
  );
};

const ControlImpl = forwardRef<HTMLElement, Omit<ControlProps, "as" | "ref"> & { as?: ElementType }>(function Control({
  size,
  anatomy,
  shape,
  fontSize,
  strong,
  gap,
  align,
  justify,
  iconSize,
  className,
  ...rest
}, ref) {
  return <Box ref={ref} className={joinClass(controlClass({ size, anatomy, shape, fontSize, strong, gap, align, justify, iconSize }), className)} {...rest} />;
});

export const Control = ControlImpl as PolymorphicComponent<ControlOwnProps, "div">;
