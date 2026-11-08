import { forwardRef, type ElementType, type HTMLAttributes } from "react";

import { useAriaVisuallyHidden } from "../../internal/aria/visually-hidden";
import { targetProps } from "../../internal/render-target";
import { mergeProps } from "../composition";

export type VisuallyHiddenProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  focusable?: boolean;
  disabled?: boolean;
};
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(function VisuallyHidden({ as: Tag = "span", focusable, disabled, style, ...rest }, ref) {
  const { visuallyHiddenProps } = useAriaVisuallyHidden({ focusable, style });
  return <Tag {...mergeProps(targetProps(Tag, { disabled, kind: "region" }), rest, visuallyHiddenProps)} ref={ref} />;
});
