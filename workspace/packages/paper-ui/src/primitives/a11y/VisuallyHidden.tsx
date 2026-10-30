import { forwardRef, type ElementType, type HTMLAttributes } from "react";

import { useAriaVisuallyHidden } from "../../internal/aria/visually-hidden";
import { mergeProps } from "../composition";

export type VisuallyHiddenProps = HTMLAttributes<HTMLElement> & {
  /** The element to render. */
  as?: ElementType;
  /** Show the content while it holds focus; for a skip link. */
  focusable?: boolean;
};
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(function VisuallyHidden({ as: Tag = "span", focusable, style, ...rest }, ref) {
  const { visuallyHiddenProps } = useAriaVisuallyHidden({ focusable, style });
  return <Tag {...mergeProps(rest, visuallyHiddenProps)} ref={ref} />;
});
