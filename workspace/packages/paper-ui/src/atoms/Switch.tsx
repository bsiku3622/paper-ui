import { forwardRef } from "react";

import { joinClass } from "../internal/joinClass";
import { controlClass } from "../primitives/control/Control";
import { markPaint, markPressPaint } from "../primitives/paint/recipes.css";
import { trackInset } from "../primitives/paint/Surface.css";
import { useInputControl, type MarkProps } from "./input-control";
import { switchRoot } from "./Switch.css";

export type SwitchProps = MarkProps;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch({ status, size, className, ...rest }, ref) {
  const { inputProps, frameProps } = useInputControl(rest, { status });
  return (
    <input
      type="checkbox"
      role="switch"
      ref={ref}
      className={joinClass(controlClass({ size, anatomy: "track" }), trackInset, markPaint.switch, markPressPaint, switchRoot, className)}
      {...frameProps}
      {...inputProps}
    />
  );
});
