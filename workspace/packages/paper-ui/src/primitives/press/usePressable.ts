import { useCallback, useRef, type HTMLAttributes, type RefCallback } from "react";

import { useAriaPress } from "../../internal/aria/press";
import { stateAttributes, type StateAttributes } from "../../tokens";
import type { PressEvent, PressableOptions } from "../types";
import { pressMotion } from "./press.css";

export type PressableResult = {
  pressProps: HTMLAttributes<HTMLElement> & { ref: RefCallback<HTMLElement> } & StateAttributes<"active" | "disabled">;
  isActive: boolean;
};

// Safari leaves a clicked button unfocused, which would hand a press less than the others get: no Space on it afterwards,
// no opener to return focus to. So the press takes focus when it ends, since Safari clears focus again as the button goes down.
const pressEnd = ({ preventFocusOnPress, onPressEnd }: PressableOptions) => (event: PressEvent) => {
  if (!preventFocusOnPress && event.pointerType !== "keyboard" && event.pointerType !== "virtual") (event.target as HTMLElement).focus?.({ preventScroll: true });
  onPressEnd?.(event);
};

export function usePressable({ motion = "none", ...options }: PressableOptions = {}): PressableResult {
  const target = useRef<HTMLElement | null>(null);
  const ref = useCallback((node: HTMLElement | null) => { target.current = node; }, []);
  const { pressProps, isActive } = useAriaPress({ ...options, onPressEnd: pressEnd(options) }, target);
  return { pressProps: { ...pressProps, ref, ...(motion === "press" ? { className: pressMotion } : null), ...stateAttributes({ active: isActive, disabled: options.disabled }) }, isActive };
}
