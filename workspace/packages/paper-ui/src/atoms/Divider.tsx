import { forwardRef, type HTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import { Box } from "../primitives/Box";
import { linePaint } from "../primitives/paint/recipes.css";
import type { DividerLevel, Orientation } from "../tokens";
import { dividerRoot, dividerOrientation } from "./Divider.css";

export type DividerProps = Omit<HTMLAttributes<HTMLHRElement>, "className" | "children"> & {
  orientation?: Orientation;
  level?: DividerLevel;
  className?: string;
};

export const Divider = forwardRef<HTMLHRElement, DividerProps>(function Divider({ orientation = "horizontal", level = "base", className, ...rest }, ref) {
  return (
    <Box
      as="hr"
      ref={ref}
      aria-orientation={orientation}
      className={joinClass(dividerRoot, linePaint[level], dividerOrientation[orientation], className)}
      {...rest}
    />
  );
});
