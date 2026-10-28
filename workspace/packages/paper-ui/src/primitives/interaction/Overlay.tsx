import { createContext, forwardRef, useContext, useEffect, useId, useRef, type HTMLAttributes, type ReactNode, type Ref, type RefObject } from "react";
import { Overlay as AriaOverlay, useModalOverlay, useOverlay as useAriaOverlay, useOverlayPosition, type PositionProps } from "@react-aria/overlays";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { FocusScope, useFocusManager } from "@react-aria/focus";
import { mergeProps, mergeRefs } from "../composition";
import { joinClass } from "../../internal/joinClass";
import { THEME_ATTRIBUTE } from "../../tokens";
import { Pressable, type PressableProps } from "./Pressable";
import { useResolvedTheme } from "../theme-context";
import * as styles from "./Overlay.css";

export type OverlayOptions = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};
export type OverlayState = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};
export function useOverlay(options: OverlayOptions = {}): OverlayState {
  return useOverlayTriggerState({ isOpen: options.open, defaultOpen: options.defaultOpen, onOpenChange: options.onOpenChange });
}
type OverlayContext = { state: OverlayState; modal: boolean; triggerRef: RefObject<HTMLButtonElement | null>; contentId: string; depth: number };
const Context = createContext<OverlayContext | null>(null);
function useContextValue() {
  const context = useContext(Context);
  if (!context) throw new Error("Overlay parts must be used inside Overlay");
  return context;
}
export type OverlayProps = OverlayOptions & { modal?: boolean; children: ReactNode };
function Root({ modal = false, children, ...options }: OverlayProps) {
  const parent = useContext(Context);
  const state = useOverlay(options);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentId = useId();
  return <Context.Provider value={{ state, modal, triggerRef, contentId, depth: (parent?.depth ?? -1) + 1 }}>{children}</Context.Provider>;
}
export type OverlayTriggerProps = PressableProps;
const Trigger = forwardRef<HTMLButtonElement, OverlayTriggerProps>(function OverlayTrigger({ onPress, ...props }, ref) {
  const { state, triggerRef, contentId } = useContextValue();
  return <Pressable {...props} ref={mergeRefs(triggerRef, ref)} aria-haspopup="dialog" aria-expanded={state.isOpen}
    aria-controls={state.isOpen ? contentId : undefined} onPress={(event) => { onPress?.(event); state.toggle(); }} />;
});
export type OverlayContentProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "autoFocus" | "role" | "id"> & {
  children: ReactNode | ((state: OverlayState) => ReactNode);
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
type PanelProps = OverlayContentProps & { forwardedRef: Ref<HTMLDivElement> };
function Panel({ forwardedRef, children, role = "dialog", dismissable = true, keyboardDismissDisabled = false, closeOnBlur = false,
  autoFocus = true, initialFocusRef, anchored, placement = "bottom start", offset = 0, crossOffset = 0, shouldFlip = true,
  shouldCloseOnInteractOutside, underlayClassName, className, style, ...props }: PanelProps) {
  const context = useContextValue();
  const { state, modal, triggerRef, contentId } = context;
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
    domProps: { ...props, id: contentId, role, tabIndex: -1, className: joinClass(styles.surface, !modal && styles.floating, className),
      style: { [styles.layerDepth]: context.depth, ...(isAnchored ? position.overlayProps.style : undefined), ...style }, "data-placement": isAnchored ? position.placement : undefined,
      children: typeof children === "function" ? children(state) : children } };
  return modal ? <ModalPanel {...common} /> : <NonModalPanel {...common} />;
}
type BehaviorProps = {
  isDismissable: boolean;
  isKeyboardDismissDisabled: boolean;
  shouldCloseOnBlur: boolean;
  shouldCloseOnInteractOutside: (element: Element) => boolean;
};
type SurfaceProps = {
  context: OverlayContext;
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
function ModalPanel({ context: { state, depth }, surfaceRef: ref, forwardedRef, behavior, initialFocusRef, autoFocus, underlayClassName, domProps }: SurfaceProps) {
  const theme = useResolvedTheme();
  const { modalProps, underlayProps } = useModalOverlay(behavior, { ...state, point: null, setPoint: () => {} }, ref);
  useInitialFocus(ref, initialFocusRef, autoFocus);
  return <div {...underlayProps} {...{ [THEME_ATTRIBUTE]: theme }} className={joinClass(styles.backdrop, underlayClassName)} style={{ [styles.layerDepth]: depth }}>
    <div {...mergeProps(domProps, modalProps)} ref={mergeRefs(ref, forwardedRef)} aria-modal="true" />
  </div>;
}
function NonModalPanel({ context: { state }, surfaceRef: ref, forwardedRef, behavior, initialFocusRef, autoFocus, domProps }: SurfaceProps) {
  const theme = useResolvedTheme();
  const { overlayProps } = useAriaOverlay({ ...behavior, isOpen: state.isOpen, onClose: state.close }, ref);
  useInitialFocus(ref, initialFocusRef, autoFocus);
  return <div {...mergeProps(domProps, overlayProps)} {...{ [THEME_ATTRIBUTE]: theme }} ref={mergeRefs(ref, forwardedRef)} />;
}
const Content = forwardRef<HTMLDivElement, OverlayContentProps>(function OverlayContent({ portalContainer, restoreFocus = true, autoFocus = true, ...props }, ref) {
  const { state, modal } = useContextValue();
  if (!state.isOpen) return null;
  // Entering an explicitly opened overlay requires intentional focus placement.
  /* eslint-disable jsx-a11y/no-autofocus -- focus enters an overlay the user just opened */
  return <AriaOverlay portalContainer={portalContainer} disableFocusManagement>
    <FocusScope contain={modal} restoreFocus={restoreFocus}>
      <Panel {...props} autoFocus={autoFocus} forwardedRef={ref} />
    </FocusScope>
  </AriaOverlay>;
  /* eslint-enable jsx-a11y/no-autofocus */
});
const Close = forwardRef<HTMLButtonElement, PressableProps>(function OverlayClose({ onPress, ...props }, ref) {
  const { state } = useContextValue();
  return <Pressable {...props} ref={ref} onPress={(event) => { onPress?.(event); state.close(); }} />;
});
export const Overlay = Object.assign(Root, { Trigger, Content, Close });
