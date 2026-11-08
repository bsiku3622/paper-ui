import { forwardRef, type HTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import { useMessages } from "../internal/locale";
import { Box } from "../primitives/Box";
import { controlClass } from "../primitives/control/Control";
import { spinnerPaint } from "../primitives/paint/recipes.css";
import type { ControlSize } from "../tokens";
import { spinnerInline, spinnerRoot } from "./Spinner.css";

export type SpinnerProps = Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children"> & {
  size?: ControlSize | "inline";
  ink?: "inherit";
  label?: string;
  decorative?: boolean;
  className?: string;
};

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "md", ink, label, decorative, className, ...rest },
  ref,
) {
  const messages = useMessages();
  return (
    <Box
      as="span"
      ref={ref}
      {...(decorative ? { "aria-hidden": true } : { role: "progressbar", "aria-label": label ?? messages.loading })}
      className={joinClass(spinnerRoot, size === "inline" ? spinnerInline : controlClass({ size, anatomy: "spinner" }), spinnerPaint[ink ?? "ink"], className)}
      {...rest}
    />
  );
});
