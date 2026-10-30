import { useVisuallyHidden } from "@react-aria/visually-hidden";
import type { CSSProperties, HTMLAttributes } from "react";

// The props that hide an element from view and keep it in the accessibility tree. A focusable one shows while it holds focus.
export function useAriaVisuallyHidden({ focusable, style }: { focusable?: boolean; style?: CSSProperties }): { visuallyHiddenProps: HTMLAttributes<HTMLElement> } {
  const { visuallyHiddenProps } = useVisuallyHidden({ isFocusable: focusable, style });
  return { visuallyHiddenProps };
}
