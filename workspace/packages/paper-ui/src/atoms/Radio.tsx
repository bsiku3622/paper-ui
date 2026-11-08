import { forwardRef } from "react";

import { joinClass } from "../internal/joinClass";
import { controlClass } from "../primitives/control/Control";
import { markPaint, markPressPaint } from "../primitives/paint/recipes.css";
import { useInputControl, type MarkProps } from "./input-control";
import { radioRoot } from "./Radio.css";
import { markBox } from "./recipes/mark.css";

export type RadioProps = MarkProps;

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio({ status, size, className, ...rest }, ref) {
  const { inputProps, frameProps } = useInputControl(rest, { status });
  return (
    <input
      type="radio"
      ref={ref}
      className={joinClass(controlClass({ size, anatomy: "mark" }), markBox, markPaint.radio, markPressPaint, radioRoot, className)}
      {...frameProps}
      {...inputProps}
    />
  );
});
