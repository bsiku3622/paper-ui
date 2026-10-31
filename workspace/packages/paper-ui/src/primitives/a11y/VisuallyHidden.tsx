import { forwardRef, type ElementType, type HTMLAttributes } from "react";

import { useAriaVisuallyHidden } from "../../internal/aria/visually-hidden";
import { targetProps } from "../../internal/render-target";
import { mergeProps } from "../composition";

export type VisuallyHiddenProps = HTMLAttributes<HTMLElement> & {
  /** The element to render. */
  as?: ElementType;
  /** Show the content while it holds focus; for a skip link. */
  focusable?: boolean;
  /** Disables the element it renders where that element can be disabled; a tag that cannot is left as it is. */
  disabled?: boolean;
};
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(function VisuallyHidden({ as: Tag = "span", focusable, disabled, style, ...rest }, ref) {
  const { visuallyHiddenProps } = useAriaVisuallyHidden({ focusable, style });
  return <Tag {...mergeProps(targetProps(Tag, { disabled, kind: "region" }), rest, visuallyHiddenProps)} ref={ref} />;
});
