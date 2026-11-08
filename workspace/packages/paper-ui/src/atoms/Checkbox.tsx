import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";

import { joinClass } from "../internal/joinClass";
import { useMergedRef } from "../internal/refs";
import { controlClass } from "../primitives/control/Control";
import { markPaint, markPressPaint } from "../primitives/paint/recipes.css";
import { useInputControl, type MarkProps } from "./input-control";
import { checkboxMark, checkboxRoot } from "./Checkbox.css";
import { markBox } from "./recipes/mark.css";

const useIsomorphicLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

export type CheckboxProps = MarkProps & {
  indeterminate?: boolean;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ status, size, indeterminate, className, ...rest }, ref) {
  const { inputProps, frameProps } = useInputControl(rest, { status });
  const input = useRef<HTMLInputElement>(null);
  const setRef = useMergedRef(ref, input);
  useIsomorphicLayoutEffect(() => {
    if (input.current) input.current.indeterminate = indeterminate ?? false;
  }, [indeterminate]);

  return (
    <input
      type="checkbox"
      ref={setRef}
      className={joinClass(controlClass({ size, anatomy: "mark" }), markBox, markPaint.checkbox, markPressPaint, checkboxRoot, checkboxMark, className)}
      {...frameProps}
      {...inputProps}
    />
  );
});
