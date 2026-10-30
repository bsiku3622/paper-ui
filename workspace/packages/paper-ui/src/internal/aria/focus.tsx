import { FocusScope as AriaFocusScope, useFocusManager, useFocusRing } from "@react-aria/focus";
import { useFocusWithin } from "@react-aria/interactions";
import { useMemo, type HTMLAttributes } from "react";

import type { FocusRingOptions, FocusScopeProps, FocusWithinOptions } from "../../primitives/types";

export function useAriaFocusRing({ textInput, ...options }: FocusRingOptions = {}): { focusProps: HTMLAttributes<HTMLElement>; isFocused: boolean; isFocusVisible: boolean } {
  const { focusProps, isFocused, isFocusVisible } = useFocusRing({ ...options, isTextInput: textInput });
  return { focusProps, isFocused, isFocusVisible };
}

export function useAriaFocusWithin({ disabled, ...options }: FocusWithinOptions): { focusWithinProps: HTMLAttributes<HTMLElement> } {
  const { focusWithinProps } = useFocusWithin({ ...options, isDisabled: disabled });
  return { focusWithinProps };
}

// Contains, restores and places focus for its subtree; Floating reaches the same scope through useScopeFocus.
export function FocusScope({ contain, restoreFocus, autoFocus, children }: FocusScopeProps) {
  // eslint-disable-next-line jsx-a11y/no-autofocus -- the scope's option of that name, not an input's attribute
  return <AriaFocusScope contain={contain} restoreFocus={restoreFocus} autoFocus={autoFocus}>{children}</AriaFocusScope>;
}

// The nearest FocusScope's way to move focus inside it.
export function useScopeFocus(): { focusFirst: (options?: { tabbable?: boolean }) => HTMLElement | null } | undefined {
  const manager = useFocusManager();
  return useMemo(() => manager && { focusFirst: (options?: { tabbable?: boolean }) => manager.focusFirst(options) as HTMLElement | null }, [manager]);
}
