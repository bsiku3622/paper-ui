import { useModalOverlay, useOverlay, useOverlayPosition, type AriaOverlayProps } from "@react-aria/overlays";
import { useEnterAnimation, useExitAnimation } from "@react-aria/utils";
import { useEffect, useLayoutEffect, useState, type CSSProperties, type HTMLAttributes, type RefObject } from "react";

import type { Placement, PlacementSide } from "../../primitives/types";
import { directionOf, type Direction } from "../direction";

const useIsomorphicLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

// React Aria reads start and end from the locale; the anchor's own direction is the truer one, so they are spelled out here.
type AriaPlacement = NonNullable<Parameters<typeof useOverlayPosition>[0]["placement"]>;
const physical = (placement: Placement, direction: Direction): AriaPlacement => {
  const start = direction === "rtl" ? "right" : "left";
  const end = direction === "rtl" ? "left" : "right";
  return placement.replace(/\bstart\b/, start).replace(/\bend\b/, end) as AriaPlacement;
};

// React Aria's axis also has `center`, which no Placement asks for.
const logical = (side: "top" | "bottom" | "left" | "right" | "center", direction: Direction): PlacementSide | null => {
  if (side === "center") return null;
  if (side === "left") return direction === "rtl" ? "end" : "start";
  if (side === "right") return direction === "rtl" ? "start" : "end";
  return side;
};

type Dismissal = {
  dismissable: boolean;
  keyboardDismissDisabled: boolean;
  closeOnBlur: boolean;
  closeOnInteractOutside: (element: Element) => boolean;
};

// The state a modal overlay reads: whether it is open and how to close it.
type OpenState = { isOpen: boolean; setOpen: (open: boolean) => void; open: () => void; close: () => void; toggle: () => void };

// Where the panel stands against its anchor, as the style to put on it. Placement is logical: start and end are
// turned into left and right by the direction the anchor reads, and the side React Aria settles on is turned back.
// The panel's z belongs to its elevation, so the z that React Aria computes is dropped. Distances arrive as pixels,
// measured by the caller from the role that names them.
export function useAnchoredPosition({ anchor, overlay, open, placement, offsetPx, crossOffsetPx, flip, containerPaddingPx }: {
  anchor: RefObject<Element | null>;
  overlay: RefObject<Element | null>;
  open: boolean;
  placement: Placement;
  offsetPx: number;
  crossOffsetPx: number;
  flip: boolean;
  containerPaddingPx: number;
}): { style: CSSProperties; placement: PlacementSide | null } {
  const [direction, setDirection] = useState<Direction>("ltr");
  useIsomorphicLayoutEffect(() => {
    if (open && anchor.current) setDirection(directionOf(anchor.current));
  }, [open, anchor]);
  const { overlayProps, placement: resolved } = useOverlayPosition({
    targetRef: anchor,
    overlayRef: overlay,
    isOpen: open,
    placement: physical(placement, direction),
    offset: offsetPx,
    crossOffset: crossOffsetPx,
    containerPadding: containerPaddingPx,
    shouldFlip: flip,
  });
  const style: CSSProperties = { ...overlayProps.style };
  delete style.zIndex;
  return { style, placement: resolved && logical(resolved, direction) };
}

// A popover's dismissal: Escape, a press outside, and optionally focus leaving.
export function useAriaDismiss({ isOpen, onClose, closeOnBlur, dismissable, keyboardDismissDisabled, closeOnInteractOutside }: Dismissal & {
  isOpen: boolean;
  onClose: () => void;
}, ref: RefObject<HTMLElement | null>): { panelProps: HTMLAttributes<HTMLElement> } {
  const { overlayProps } = useOverlay({
    isOpen,
    onClose,
    isDismissable: dismissable,
    isKeyboardDismissDisabled: keyboardDismissDisabled,
    shouldCloseOnBlur: closeOnBlur,
    shouldCloseOnInteractOutside: closeOnInteractOutside,
  }, ref);
  return { panelProps: overlayProps };
}

// A modal's dismissal, and what keeps the page behind it still: inert background, locked scroll.
export function useAriaModal({ dismissable, keyboardDismissDisabled, closeOnBlur, closeOnInteractOutside }: Dismissal, state: OpenState, ref: RefObject<HTMLElement | null>): {
  panelProps: HTMLAttributes<HTMLElement>;
  backdropProps: HTMLAttributes<HTMLElement>;
} {
  // useModalOverlay hands these on to useOverlay whole; its own type just leaves shouldCloseOnBlur out.
  const options: AriaOverlayProps = {
    isDismissable: dismissable,
    isKeyboardDismissDisabled: keyboardDismissDisabled,
    shouldCloseOnBlur: closeOnBlur,
    shouldCloseOnInteractOutside: closeOnInteractOutside,
  };
  const { modalProps, underlayProps } = useModalOverlay(options, { ...state, point: null, setPoint: () => {} } as Parameters<typeof useModalOverlay>[1], ref);
  return { panelProps: modalProps, backdropProps: underlayProps };
}

// Whether the panel is still playing its enter animation. `ready` holds the start until the panel can be seen where it
// will stand (a popover, until it has been placed).
export function useAriaEnter(ref: RefObject<HTMLElement | null>, ready: boolean): boolean {
  return useEnterAnimation(ref, ready);
}

// Whether the panel is playing its exit animation. It stays mounted for as long as this is true, and the animation's
// end is what turns it off.
export function useAriaExit(ref: RefObject<HTMLElement | null>, open: boolean): boolean {
  return useExitAnimation(ref, open);
}
