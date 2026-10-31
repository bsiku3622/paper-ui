import { useModalOverlay, useOverlay, useOverlayPosition, type AriaOverlayProps } from "@react-aria/overlays";
import type { CSSProperties, HTMLAttributes, RefObject } from "react";

import type { Placement } from "../../primitives/types";

type Dismissal = {
  dismissable: boolean;
  keyboardDismissDisabled: boolean;
  closeOnBlur: boolean;
  closeOnInteractOutside: (element: Element) => boolean;
};

// The state a modal overlay reads: whether it is open and how to close it.
type OpenState = { isOpen: boolean; setOpen: (open: boolean) => void; open: () => void; close: () => void; toggle: () => void };

// Where the panel stands against its anchor, as the style to put on it. The panel's z belongs to its elevation,
// so the z that React Aria computes is dropped.
export function useAriaPosition({ anchorRef, panelRef, isOpen, placement, offset, crossOffset, flip }: {
  anchorRef: RefObject<Element | null>;
  panelRef: RefObject<Element | null>;
  isOpen: boolean;
  placement: Placement;
  offset: number;
  crossOffset: number;
  flip: boolean;
}): { style: CSSProperties; placement: "top" | "bottom" | "left" | "right" | "center" | null } {
  const { overlayProps, placement: resolved } = useOverlayPosition({ targetRef: anchorRef, overlayRef: panelRef, isOpen, placement, offset, crossOffset, shouldFlip: flip });
  const style: CSSProperties = { ...overlayProps.style };
  delete style.zIndex;
  return { style, placement: resolved };
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
