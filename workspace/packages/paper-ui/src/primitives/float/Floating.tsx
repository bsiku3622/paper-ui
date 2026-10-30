import { createContext, forwardRef, useContext, useEffect, useId, useRef, type CSSProperties, type HTMLAttributes, type ReactNode, type Ref, type RefObject } from "react";
import { useModalOverlay, useOverlay as useAriaOverlay, useOverlayPosition, type PositionProps } from "@react-aria/overlays";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { FocusScope, useFocusManager } from "@react-aria/focus";
import { mergeProps, mergeRefs } from "../composition";
import { joinClass } from "../../internal/joinClass";
import { Portal } from "../a11y/Portal";
import { scrimPaint } from "../paint/recipes.css";
import { Pressable, type PressableProps } from "../press/Pressable";
import * as styles from "./Floating.css";
import { nestElevation, type FloatingElevation } from "./nestElevation";

export type FloatingOptions = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};
export type FloatingState = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};
export function useFloating(options: FloatingOptions = {}): FloatingState {
  return useOverlayTriggerState({ isOpen: options.open, defaultOpen: options.defaultOpen, onOpenChange: options.onOpenChange });
}
type FloatingContext = { state: FloatingState; modal: boolean; triggerRef: RefObject<HTMLButtonElement | null>; contentId: string; elevation: FloatingElevation };
const Context = createContext<FloatingContext | null>(null);
function useContextValue() {
  const context = useContext(Context);
  if (!context) throw new Error("Floating parts must be used inside Floating");
  return context;
}
export type FloatingProps = FloatingOptions & { modal?: boolean; children: ReactNode };
function Root({ modal = false, children, ...options }: FloatingProps) {
  const parent = useContext(Context);
  const state = useFloating(options);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentId = useId();
  return <Context.Provider value={{ state, modal, triggerRef, contentId, elevation: nestElevation(parent?.elevation, modal ? "modal" : "overlay") }}>{children}</Context.Provider>;
}
export type FloatingTriggerProps = PressableProps;
const Trigger = forwardRef<HTMLButtonElement, FloatingTriggerProps>(function FloatingTrigger({ onPress, ...props }, ref) {
  const { state, triggerRef, contentId } = useContextValue();
  return <Pressable {...props} ref={mergeRefs(triggerRef, ref)} aria-haspopup="dialog" aria-expanded={state.isOpen}
    aria-controls={state.isOpen ? contentId : undefined} onPress={(event) => { onPress?.(event); state.toggle(); }} />;
});
export type FloatingContentProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "autoFocus" | "role" | "id"> & {
  children: ReactNode | ((state: FloatingState) => ReactNode);
  role?: "dialog" | "alertdialog";
  dismissable?: boolean;
  keyboardDismissDisabled?: boolean;
  closeOnBlur?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  anchored?: boolean;
  placement?: PositionProps["placement"];
  offset?: number;
  crossOffset?: number;
  shouldFlip?: boolean;
  shouldCloseOnInteractOutside?: (element: Element) => boolean;
  portalContainer?: Element;
  underlayClassName?: string;
};
type PanelProps = FloatingContentProps & { forwardedRef: Ref<HTMLDivElement> };
// React Aria stacks an anchored panel at its own z; the tier decides that here.
const withoutZ = (style: CSSProperties | undefined): CSSProperties => Object.fromEntries(Object.entries(style ?? {}).filter(([property]) => property !== "zIndex"));
function Panel({ forwardedRef, children, role = "dialog", dismissable = true, keyboardDismissDisabled = false, closeOnBlur = false,
  autoFocus = true, initialFocusRef, anchored, placement = "bottom start", offset = 0, crossOffset = 0, shouldFlip = true,
  shouldCloseOnInteractOutside, underlayClassName, className, style, ...props }: PanelProps) {
  const context = useContextValue();
  const { state, modal, triggerRef, contentId, elevation } = context;
  const ref = useRef<HTMLDivElement>(null);
  const isAnchored = anchored ?? !modal;
  const position = useOverlayPosition({ targetRef: triggerRef, overlayRef: ref, isOpen: state.isOpen && isAnchored, placement, offset, crossOffset, shouldFlip });
  const behavior = {
    isDismissable: dismissable,
    isKeyboardDismissDisabled: keyboardDismissDisabled,
    shouldCloseOnBlur: closeOnBlur,
    shouldCloseOnInteractOutside: (element: Element) => !triggerRef.current?.contains(element) && (shouldCloseOnInteractOutside?.(element) ?? true),
  };
  const common = { context, surfaceRef: ref, forwardedRef, behavior, initialFocusRef, autoFocus, role, underlayClassName,
    domProps: { ...props, id: contentId, role, tabIndex: -1, className: joinClass(styles.surface, !modal && styles.stack[elevation.tier], styles.cast[elevation.tier], className),
      style: { [styles.rankProperty]: String(elevation.rank), ...withoutZ(isAnchored ? position.overlayProps.style : undefined), ...style }, "data-placement": isAnchored ? position.placement : undefined,
      children: typeof children === "function" ? children(state) : children } };
  return modal ? <ModalPanel {...common} /> : <NonModalPanel {...common} />;
}
type BehaviorProps = {
  isDismissable: boolean;
  isKeyboardDismissDisabled: boolean;
  shouldCloseOnBlur: boolean;
  shouldCloseOnInteractOutside: (element: Element) => boolean;
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
  const manager = useFocusManager();
  const didFocus = useRef(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || didFocus.current || !autoFocus) return;
    didFocus.current = true;
    if (initial?.current && element.contains(initial.current)) initial.current.focus();
    if (!element.contains(element.ownerDocument.activeElement)) {
      if (!manager?.focusFirst({ tabbable: true })) element.focus();
    }
  }, [ref, initial, autoFocus, manager]);
}
function ModalPanel({ context: { state, elevation }, surfaceRef: ref, forwardedRef, behavior, initialFocusRef, autoFocus, underlayClassName, domProps }: PanelSurfaceProps) {
  const { modalProps, underlayProps } = useModalOverlay(behavior, { ...state, point: null, setPoint: () => {} }, ref);
  useInitialFocus(ref, initialFocusRef, autoFocus);
  return <div {...underlayProps} className={joinClass(styles.backdrop, styles.stack[elevation.tier], scrimPaint, underlayClassName)} style={{ [styles.rankProperty]: String(elevation.rank) }}>
    <div {...mergeProps(domProps, modalProps)} ref={mergeRefs(ref, forwardedRef)} aria-modal="true" />
  </div>;
}
function NonModalPanel({ context: { state }, surfaceRef: ref, forwardedRef, behavior, initialFocusRef, autoFocus, domProps }: PanelSurfaceProps) {
  const { overlayProps } = useAriaOverlay({ ...behavior, isOpen: state.isOpen, onClose: state.close }, ref);
  useInitialFocus(ref, initialFocusRef, autoFocus);
  return <div {...mergeProps(domProps, overlayProps)} ref={mergeRefs(ref, forwardedRef)} />;
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
const Close = forwardRef<HTMLButtonElement, PressableProps>(function FloatingClose({ onPress, ...props }, ref) {
  const { state } = useContextValue();
  return <Pressable {...props} ref={ref} onPress={(event) => { onPress?.(event); state.close(); }} />;
});
export const Floating = Object.assign(Root, { Trigger, Content, Close });
