import { useModalOverlay, useOverlay, useOverlayPosition, usePreventScroll, type AriaOverlayProps } from "@react-aria/overlays";
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

type OpenState = { isOpen: boolean; setOpen: (open: boolean) => void; open: () => void; close: () => void; toggle: () => void };

// The panel's z belongs to its elevation, so the z that React Aria computes is dropped.
export function useAnchoredPosition({ anchor, overlay, open, placement, offsetPx, crossOffsetPx, flip, containerPaddingPx, fitAnchor = false }: {
  anchor: RefObject<Element | null>;
  overlay: RefObject<Element | null>;
  open: boolean;
  placement: Placement;
  offsetPx: number;
  crossOffsetPx: number;
  flip: boolean;
  containerPaddingPx: number;
  fitAnchor?: boolean;
}): { style: CSSProperties; placement: PlacementSide | null } {
  const [direction, setDirection] = useState<Direction>("ltr");
  useIsomorphicLayoutEffect(() => {
    if (open && anchor.current) setDirection(directionOf(anchor.current));
  }, [open, anchor]);
  const [anchorWidth, setAnchorWidth] = useState<number | null>(null);
  useIsomorphicLayoutEffect(() => {
    const element = anchor.current;
    if (!open || !fitAnchor || !element) return;
    const measure = () => setAnchorWidth(element.getBoundingClientRect().width);
    measure();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    observer?.observe(element);
    return () => observer?.disconnect();
  }, [open, fitAnchor, anchor]);
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
  if (fitAnchor && anchorWidth !== null && typeof document !== "undefined") style.minWidth = Math.max(0, Math.min(anchorWidth, document.documentElement.clientWidth - containerPaddingPx - containerPaddingPx));
  return { style, placement: resolved && logical(resolved, direction) };
}

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

export function useAriaModal({ dismissable, keyboardDismissDisabled, closeOnBlur, closeOnInteractOutside }: Dismissal, state: OpenState, ref: RefObject<HTMLElement | null>): {
  panelProps: HTMLAttributes<HTMLElement>;
  backdropProps: HTMLAttributes<HTMLElement>;
} {
  const options: AriaOverlayProps = {
    isDismissable: dismissable,
    isKeyboardDismissDisabled: keyboardDismissDisabled,
    shouldCloseOnBlur: closeOnBlur,
    shouldCloseOnInteractOutside: closeOnInteractOutside,
  };
  const { modalProps, underlayProps } = useModalOverlay(options, { ...state, point: null, setPoint: () => {} } as Parameters<typeof useModalOverlay>[1], ref);
  return { panelProps: modalProps, backdropProps: underlayProps };
}

export function useAriaEnter(ref: RefObject<HTMLElement | null>, ready: boolean): boolean {
  return useEnterAnimation(ref, ready);
}

export function useAriaExit(ref: RefObject<HTMLElement | null>, open: boolean): boolean {
  return useExitAnimation(ref, open);
}

export function usePageScrollLock(locked: boolean): void {
  usePreventScroll({ isDisabled: !locked });
}
