import { useCallback, useRef, type HTMLAttributes, type RefCallback } from "react";

import { useAriaPress } from "../../internal/aria/press";
import { stateAttributes, type StateAttributes } from "../../tokens";
import type { PressEvent, PressableOptions } from "../types";

export type PressableResult = {
  /** Spread on the element that is pressed. Carries its own ref, `data-active` while pressed and `data-disabled` while disabled. */
  pressProps: HTMLAttributes<HTMLElement> & { ref: RefCallback<HTMLElement> } & StateAttributes<"active" | "disabled">;
  /** The transient press. `pressed` is reserved for aria-pressed, which a selection sets. */
  isActive: boolean;
};

// A pressed element takes focus unless the caller keeps it from doing so. A browser that leaves a clicked button
// unfocused (Safari) would otherwise hand a Paper press less than the others do: no Space on it afterwards, and no
// opener to return focus to. It happens when the press ends, since Safari clears focus again when the button goes
// down. A keyboard or assistive press has the focus already.
const pressEnd = ({ preventFocusOnPress, onPressEnd }: PressableOptions) => (event: PressEvent) => {
  if (!preventFocusOnPress && event.pointerType !== "keyboard" && event.pointerType !== "virtual") (event.target as HTMLElement).focus?.({ preventScroll: true });
  onPressEnd?.(event);
};

export function usePressable(options: PressableOptions = {}): PressableResult {
  const target = useRef<HTMLElement | null>(null);
  const ref = useCallback((node: HTMLElement | null) => { target.current = node; }, []);
  const { pressProps, isActive } = useAriaPress({ ...options, onPressEnd: pressEnd(options) }, target);
  return { pressProps: { ...pressProps, ref, ...stateAttributes({ active: isActive, disabled: options.disabled }) }, isActive };
}
