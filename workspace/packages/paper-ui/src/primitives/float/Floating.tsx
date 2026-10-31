import { createContext, forwardRef, useCallback, useContext, useEffect, useId, useMemo, useRef, type ButtonHTMLAttributes, type HTMLAttributes, type MouseEvent, type ReactNode, type Ref, type RefObject } from "react";

import { useScopeFocus } from "../../internal/aria/focus";
import { useAriaDismiss, useAriaModal, useAriaPosition } from "../../internal/aria/overlay";
import { paperError } from "../../internal/errors";
import { joinClass } from "../../internal/joinClass";
import { useMergedRef } from "../../internal/refs";
import { useControllableState } from "../../internal/useControllableState";
import { VALUE_ATTRIBUTE } from "../../tokens";
import { FocusScope } from "../a11y/focus";
import { Portal } from "../a11y/Portal";
import { bareButton } from "../bare-button.css";
import { composeEventHandlers, mergeProps } from "../composition";
import { scrimPaint } from "../paint/recipes.css";
import type { Placement } from "../types";
import * as styles from "./Floating.css";
import { nestElevation, type FloatingElevation } from "./nestElevation";

export type FloatingOptions = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};
export type FloatingResult = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};
export function useFloating({ open, defaultOpen = false, onOpenChange }: FloatingOptions = {}): FloatingResult {
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const show = useCallback(() => setOpen(true), [setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(() => setOpen(!isOpen), [setOpen, isOpen]);
  return useMemo(() => ({ isOpen, setOpen, open: show, close, toggle }), [isOpen, setOpen, show, close, toggle]);
}
type FloatingContext = { state: FloatingResult; modal: boolean; triggerRef: RefObject<HTMLButtonElement | null>; contentId: string; elevation: FloatingElevation };
const Context = createContext<FloatingContext | null>(null);
function useContextValue() {
  const context = useContext(Context);
  if (!context) throw paperError("Floating parts must be used inside <Floating>.");
  return context;
}
/** The state of the Floating a part stands in: for a custom button that opens or closes it. */
export function useFloatingContext(): FloatingResult {
  return useContextValue().state;
}
export type FloatingProps = FloatingOptions & { modal?: boolean; children: ReactNode };
function Root({ modal = false, children, ...options }: FloatingProps) {
  const parent = useContext(Context);
  const state = useFloating(options);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentId = useId();
  return <Context.Provider value={{ state, modal, triggerRef, contentId, elevation: nestElevation(parent?.elevation, modal ? "modal" : "overlay") }}>{children}</Context.Provider>;
}
export type FloatingTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;
const Trigger = forwardRef<HTMLButtonElement, FloatingTriggerProps>(function FloatingTrigger({ onClick, ...props }, forwardedRef) {
  const { state, triggerRef, contentId } = useContextValue();
  const ref = useMergedRef(triggerRef, forwardedRef);
  // The Trigger is the opener focus returns to, and Safari leaves a clicked button unfocused.
  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.focus({ preventScroll: true });
    state.toggle();
  };
  return <button {...mergeProps({ className: bareButton, type: "button" }, props)} ref={ref} aria-haspopup="dialog" aria-expanded={state.isOpen}
    aria-controls={state.isOpen ? contentId : undefined} onClick={composeEventHandlers(onClick, toggle)} />;
});
export type FloatingContentProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "autoFocus" | "role" | "id"> & {
  children: ReactNode | ((state: FloatingResult) => ReactNode);
  role?: "dialog" | "alertdialog";
  dismissable?: boolean;
  keyboardDismissDisabled?: boolean;
  closeOnBlur?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  anchored?: boolean;
  placement?: Placement;
  offset?: number;
  crossOffset?: number;
  flip?: boolean;
  closeOnInteractOutside?: (element: Element) => boolean;
  portalContainer?: Element;
  underlayClassName?: string;
};
type PanelProps = FloatingContentProps & { forwardedRef: Ref<HTMLDivElement> };
function Panel({ forwardedRef, children, role = "dialog", dismissable = true, keyboardDismissDisabled = false, closeOnBlur = false,
  autoFocus = true, initialFocusRef, anchored, placement = "bottom start", offset = 0, crossOffset = 0, flip = true,
  closeOnInteractOutside, underlayClassName, className, style, ...props }: PanelProps) {
  const context = useContextValue();
  const { state, modal, triggerRef, contentId, elevation } = context;
  const ref = useRef<HTMLDivElement>(null);
  const isAnchored = anchored ?? !modal;
  const position = useAriaPosition({ anchorRef: triggerRef, panelRef: ref, isOpen: state.isOpen && isAnchored, placement, offset, crossOffset, flip });
  const behavior = {
    dismissable,
    keyboardDismissDisabled,
    closeOnBlur,
    closeOnInteractOutside: (element: Element) => !triggerRef.current?.contains(element) && (closeOnInteractOutside?.(element) ?? true),
  };
  const common = { context, surfaceRef: ref, forwardedRef, behavior, initialFocusRef, autoFocus, role, underlayClassName,
    domProps: { ...props, id: contentId, role, tabIndex: -1, className: joinClass(styles.surface, !modal && styles.stack[elevation.tier], styles.cast[elevation.tier], className),
      style: { [styles.rankProperty]: String(elevation.rank), ...(isAnchored ? position.style : undefined), ...style }, [VALUE_ATTRIBUTE.placement]: isAnchored ? position.placement : undefined,
      children: typeof children === "function" ? children(state) : children } };
  return modal ? <ModalPanel {...common} /> : <NonModalPanel {...common} />;
}
type BehaviorProps = {
  dismissable: boolean;
  keyboardDismissDisabled: boolean;
  closeOnBlur: boolean;
  closeOnInteractOutside: (element: Element) => boolean;
};
type PanelSurfaceProps = {
  context: FloatingContext;
  surfaceRef: RefObject<HTMLDivElement | null>;
  forwardedRef: Ref<HTMLDivElement>;
  behavior: BehaviorProps;
  initialFocusRef?: RefObject<HTMLElement | null>;
  autoFocus: boolean;
  role: "dialog" | "alertdialog";
  underlayClassName?: string;
  domProps: HTMLAttributes<HTMLDivElement>;
};
function useInitialFocus(ref: RefObject<HTMLDivElement | null>, initial: RefObject<HTMLElement | null> | undefined, autoFocus: boolean) {
  const scope = useScopeFocus();
  const didFocus = useRef(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || didFocus.current || !autoFocus) return;
    didFocus.current = true;
    if (initial?.current && element.contains(initial.current)) initial.current.focus();
    if (!element.contains(element.ownerDocument.activeElement)) {
      if (!scope?.focusFirst({ tabbable: true })) element.focus();
    }
  }, [ref, initial, autoFocus, scope]);
}
function ModalPanel({ context: { state, elevation }, surfaceRef: ref, forwardedRef, behavior, initialFocusRef, autoFocus, underlayClassName, domProps }: PanelSurfaceProps) {
  const { panelProps, backdropProps } = useAriaModal(behavior, state, ref);
  const mergedRef = useMergedRef(ref, forwardedRef);
  useInitialFocus(ref, initialFocusRef, autoFocus);
  return <div {...backdropProps} className={joinClass(styles.backdrop, styles.stack[elevation.tier], scrimPaint, underlayClassName)} style={{ [styles.rankProperty]: String(elevation.rank) }}>
    <div {...mergeProps(domProps, panelProps)} ref={mergedRef} aria-modal="true" />
  </div>;
}
function NonModalPanel({ context: { state }, surfaceRef: ref, forwardedRef, behavior, initialFocusRef, autoFocus, domProps }: PanelSurfaceProps) {
  const { panelProps } = useAriaDismiss({ ...behavior, isOpen: state.isOpen, onClose: state.close }, ref);
  const mergedRef = useMergedRef(ref, forwardedRef);
  useInitialFocus(ref, initialFocusRef, autoFocus);
  return <div {...mergeProps(domProps, panelProps)} ref={mergedRef} />;
}
const Content = forwardRef<HTMLDivElement, FloatingContentProps>(function FloatingContent({ portalContainer, restoreFocus = true, autoFocus = true, ...props }, ref) {
  const { state, modal } = useContextValue();
  if (!state.isOpen) return null;
  // Entering an explicitly opened floating panel requires intentional focus placement.
  /* eslint-disable jsx-a11y/no-autofocus -- focus enters a floating panel the user just opened */
  return <Portal container={portalContainer}>
    <FocusScope contain={modal} restoreFocus={restoreFocus}>
      <Panel {...props} autoFocus={autoFocus} forwardedRef={ref} />
    </FocusScope>
  </Portal>;
  /* eslint-enable jsx-a11y/no-autofocus */
});
export type FloatingCloseProps = ButtonHTMLAttributes<HTMLButtonElement>;
const Close = forwardRef<HTMLButtonElement, FloatingCloseProps>(function FloatingClose({ onClick, ...props }, ref) {
  const { state } = useContextValue();
  return <button {...mergeProps({ className: bareButton, type: "button" }, props)} ref={ref} onClick={composeEventHandlers(onClick, state.close)} />;
});
export const Floating = Object.assign(Root, { Trigger, Content, Close });
