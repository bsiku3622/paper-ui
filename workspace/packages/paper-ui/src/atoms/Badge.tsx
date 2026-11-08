import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { controlClass, type ControlForm } from "../primitives/control/Control";
import { controlLineRoom } from "../primitives/control/Control.css";
import { Paint, type PaintFace } from "../primitives/paint/Paint";
import { dotPaint } from "../primitives/paint/recipes.css";
import { VARIANT_LINE, type Accent } from "../tokens";
import { badgeDot } from "./Badge.css";

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "className"> & PaintFace & Pick<ControlForm, "size" | "fontSize" | "shape" | "gap" | "align" | "justify"> & {
  accent?: Accent;
  dot?: boolean;
  children?: ReactNode;
  className?: string;
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { accent = "primary", variant = "soft", fill, shadow, size, fontSize, shape = "pill", gap, align, justify, dot, children, className, ...rest },
  ref,
) {
  return (
    <Paint
      as="span"
      ref={ref}
      accent={accent}
      {...({ variant, fill, shadow } as PaintFace)}
      className={joinClass(controlClass({ size, anatomy: "badge", shape, fontSize, gap, align, justify }), controlLineRoom[VARIANT_LINE[variant]], className)}
      {...rest}
    >
      {dot ? <span className={joinClass(badgeDot, dotPaint)} aria-hidden /> : null}
      {children}
    </Paint>
  );
});
