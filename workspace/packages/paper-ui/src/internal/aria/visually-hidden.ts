import { useVisuallyHidden } from "@react-aria/visually-hidden";
import type { CSSProperties, HTMLAttributes } from "react";

export function useAriaVisuallyHidden({ focusable, style }: { focusable?: boolean; style?: CSSProperties }): { visuallyHiddenProps: HTMLAttributes<HTMLElement> } {
  const { visuallyHiddenProps } = useVisuallyHidden({ isFocusable: focusable, style });
  return { visuallyHiddenProps };
}
