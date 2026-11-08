import { forwardRef, type TextareaHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import { fieldPlaceholderPaint } from "../primitives/paint/recipes.css";
import { inputFrameClass, useInputControl, type InputFrameProps } from "./input-control";
import { textareaRoot } from "./Textarea.css";

// There is no shape="pill": it is half the height, which on a multi-line box gives a stadium
// and pushes the first and last lines under the curve.
export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & InputFrameProps & {
  className?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { status, size, fill, variant, shadow, fontSize, rows = 4, className, ...rest },
  ref,
) {
  const { inputProps, frameProps } = useInputControl(rest, { status, textInput: true });
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={joinClass(inputFrameClass({ size, anatomy: "area", fontSize, fill, variant, shadow }), fieldPlaceholderPaint, textareaRoot, className)}
      {...frameProps}
      {...inputProps}
    />
  );
});
