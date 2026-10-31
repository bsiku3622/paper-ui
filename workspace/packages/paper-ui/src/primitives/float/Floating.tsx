import { createContext, forwardRef, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useReducer, useRef, useState, version, type ElementType, type HTMLAttributes, type MouseEvent, type ReactNode, type Ref, type RefObject } from "react";

import { useScopeFocus } from "../../internal/aria/focus";
import { useAnchoredPosition, useAriaDismiss, useAriaEnter, useAriaExit, useAriaModal } from "../../internal/aria/overlay";
import { paperError } from "../../internal/errors";
import { joinClass } from "../../internal/joinClass";
import { useMeasuredSpace } from "../../internal/measure";
import { useMergedRef } from "../../internal/refs";
import { registerPart, targetProps } from "../../internal/render-target";
import { useControllableState } from "../../internal/useControllableState";
import { presence } from "../../styles/motion.css";
import { VALUE_ATTRIBUTE, type Space } from "../../tokens";
import { FocusScope } from "../a11y/focus";
import { Portal } from "../a11y/Portal";
import { bareButton } from "../bare-button.css";
import { composeEventHandlers, mergeProps } from "../composition";
import { scrimPaint } from "../paint/recipes.css";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";
import type { Placement, PlacementSide } from "../types";
import * as styles from "./Floating.css";
import { nestElevation, type FloatingElevation, type FloatingPresentation } from "./nestElevation";

export type { FloatingPresentation };

const useIsomorphicLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

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
type FloatingContext = { state: FloatingResult; triggerRef: RefObject<HTMLButtonElement | null>; contentId: string };
const Context = createContext<FloatingContext | null>(null);
// The panel a Floating inside it stands on: where that one's elevation starts.
const ElevationContext = createContext<FloatingElevation | undefined>(undefined);
function useContextValue() {
  const context = useContext(Context);
  if (!context) throw paperError("Floating parts must be used inside <Floating>.");
  return context;
}
/** The state of the Floating a part stands in: for a custom button that opens or closes it. */
export function useFloatingContext(): FloatingResult {
  return useContextValue().state;
}
export type FloatingProps = FloatingOptions & { children: ReactNode };
function Root({ children, ...options }: FloatingProps) {
  const state = useFloating(options);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentId = useId();
  return <Context.Provider value={{ state, triggerRef, contentId }}>{children}</Context.Provider>;
}
// What a Floating part may read of the panel it stands in. `elevation` is where it stands in the stack.
export type FloatingContentState = {
  isOpen: boolean;
  presentation: FloatingPresentation;
  /** The side of the anchor the panel settled on, start and end by the anchor's direction; undefined for a modal. */
  placement: PlacementSide | undefined;
  elevation: FloatingElevation;
};

type FloatingButtonOwnProps = { disabled?: boolean };
export type FloatingTriggerProps<As extends ElementType = "button"> = PolymorphicProps<FloatingButtonOwnProps, As>;
const TriggerImpl = forwardRef<HTMLElement, Omit<FloatingTriggerProps, "as" | "ref"> & { as?: ElementType }>(function FloatingTrigger({ as, disabled = false, onClick, onKeyDown, ...props }, forwardedRef) {
  const { state, triggerRef, contentId } = useContextValue();
  const ref = useMergedRef(triggerRef, forwardedRef);
  const Tag = as ?? "button";
  const { type, href } = props as { type?: string; href?: string };
  // The Trigger is the opener focus returns to, and Safari leaves a clicked button unfocused.
  const toggle = (event: MouseEvent<HTMLElement>) => {
    event.currentTarget.focus({ preventScroll: true });
    state.toggle();
  };
  const bare = Tag === "button" ? { className: bareButton } : undefined;
  const target = targetProps(Tag, { disabled, type, href, activateOnKey: true, kind: "control" });
  return <Tag {...mergeProps(bare, target, props)} ref={ref} aria-haspopup="dialog" aria-expanded={state.isOpen}
    aria-controls={state.isOpen ? contentId : undefined} onClick={composeEventHandlers(onClick, toggle)} onKeyDown={composeEventHandlers(onKeyDown, target.onKeyDown)} />;
});
const Trigger = registerPart(TriggerImpl) as PolymorphicComponent<FloatingButtonOwnProps, "button">;

type FloatingCommonProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "autoFocus" | "role" | "id"> & {
  children: ReactNode | ((state: FloatingContentState) => ReactNode);
  role?: "dialog" | "alertdialog";
  dismissable?: boolean;
  keyboardDismissDisabled?: boolean;
  closeOnBlur?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  closeOnInteractOutside?: (element: Element) => boolean;
  portalContainer?: Element;
};
/** A panel beside its anchor: the `anchorRef`, or the Floating.Trigger when it is not given. */
export type FloatingPopoverProps = FloatingCommonProps & {
  presentation?: "popover";
  anchorRef?: RefObject<Element | null>;
  placement?: Placement;
  /** The gap between the anchor and the panel, as a step of the gap scale. */
  offset?: Space | "none";
  crossOffset?: Space | "none";
  flip?: boolean;
  underlayClassName?: never;
};
/** A dialog over a scrim: centred, with the page behind it inert and its scroll locked. */
export type FloatingModalProps = FloatingCommonProps & {
  presentation: "modal";
  underlayClassName?: string;
  anchorRef?: never;
  placement?: never;
  offset?: never;
  crossOffset?: never;
  flip?: never;
};
export type FloatingContentProps = FloatingPopoverProps | FloatingModalProps;

// React 19 reads `inert` as a boolean attribute; React 18 passes an unknown attribute through as a string, and an empty one is on.
const INERT = Number.parseInt(version, 10) >= 19 ? true : "";
const leaving = (isExiting: boolean) => (isExiting ? ({ inert: INERT, "aria-hidden": true } as HTMLAttributes<HTMLElement>) : undefined);

type BehaviorProps = {
  dismissable: boolean;
  keyboardDismissDisabled: boolean;
  closeOnBlur: boolean;
  closeOnInteractOutside: (element: Element) => boolean;
};
type PanelProps = {
  state: FloatingResult;
  elevation: FloatingElevation;
  rootRef: RefObject<HTMLDivElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
  forwardedRef: Ref<HTMLDivElement>;
  behavior: BehaviorProps;
  initialFocusRef?: RefObject<HTMLElement | null>;
  takeFocus: boolean;
  underlayClassName?: string;
  isExiting: boolean;
  data: { [VALUE_ATTRIBUTE.presence]: "entering" | "exiting" | undefined };
  domProps: HTMLAttributes<HTMLDivElement>;
};
function useInitialFocus(ref: RefObject<HTMLDivElement | null>, initial: RefObject<HTMLElement | null> | undefined, takeFocus: boolean) {
  const scope = useScopeFocus();
  const didFocus = useRef(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || didFocus.current || !takeFocus) return;
    didFocus.current = true;
    if (initial?.current && element.contains(initial.current)) initial.current.focus();
    if (!element.contains(element.ownerDocument.activeElement)) {
      if (!scope?.focusFirst({ tabbable: true })) element.focus();
    }
  }, [ref, initial, takeFocus, scope]);
}
function ModalPanel({ state, elevation, rootRef, panelRef: ref, forwardedRef, behavior, initialFocusRef, takeFocus, underlayClassName, isExiting, data, domProps }: PanelProps) {
  const { panelProps, backdropProps } = useAriaModal(behavior, state, ref);
  const mergedRef = useMergedRef(ref, forwardedRef);
  useInitialFocus(ref, initialFocusRef, takeFocus);
  return <div {...backdropProps} {...leaving(isExiting)} {...data} ref={rootRef} className={joinClass(styles.backdrop, styles.stack[elevation.tier], scrimPaint, presence.scrim, underlayClassName)}
    style={{ [styles.rankProperty]: String(elevation.rank) }}>
    <div {...mergeProps(domProps, panelProps)} {...data} ref={mergedRef} aria-modal="true" />
  </div>;
}
function PopoverPanel({ state, rootRef, panelRef: ref, forwardedRef, behavior, initialFocusRef, takeFocus, isExiting, data, domProps }: PanelProps) {
  const { panelProps } = useAriaDismiss({ ...behavior, isOpen: state.isOpen, onClose: state.close }, ref);
  const mergedRef = useMergedRef(ref, forwardedRef, rootRef);
  useInitialFocus(ref, initialFocusRef, takeFocus);
  return <div {...mergeProps(domProps, panelProps)} {...leaving(isExiting)} {...data} ref={mergedRef} />;
}

type ShownProps = FloatingContentProps & { rootRef: RefObject<HTMLDivElement | null>; isExiting: boolean; forwardedRef: Ref<HTMLDivElement> };
// A Content while it is on the page: opening and closing animate through it, and it is gone when the exit has played.
function Shown({ rootRef, isExiting, forwardedRef, ...props }: ShownProps) {
  const { state, triggerRef, contentId } = useContextValue();
  const { presentation = "popover", role = "dialog", dismissable = true, keyboardDismissDisabled = false, closeOnBlur = false, autoFocus = true, restoreFocus = true,
    initialFocusRef, closeOnInteractOutside, portalContainer, anchorRef, placement = "bottom start", offset = "sm", crossOffset = "none", flip = true,
    underlayClassName, className, style, children, ...attributes } = props;
  const modal = presentation === "modal";
  const anchor = anchorRef ?? triggerRef;
  const panelRef = useRef<HTMLDivElement>(null);
  const elevation = nestElevation(useContext(ElevationContext), presentation);

  const [unanchored, setUnanchored] = useState(false);
  const [, place] = useReducer((count: number) => count + 1, 0);
  const reported = useRef(false);

  const placed = !modal && state.isOpen && !unanchored;
  const element = useCallback(() => panelRef.current, []);
  const offsetPx = useMeasuredSpace(offset, element, placed);
  const crossOffsetPx = useMeasuredSpace(crossOffset, element, placed);
  const containerPaddingPx = useMeasuredSpace("gutter", element, placed);
  const position = useAnchoredPosition({ anchor, overlay: panelRef, open: placed, placement, offsetPx, crossOffsetPx, flip, containerPaddingPx });
  // A popover starts entering once it has been placed.
  const isEntering = useAriaEnter(rootRef, modal || position.placement !== null);

  // A popover stands beside something. The anchor is a ref filled once the page is committed, so what is missing is found then.
  // An anchor mounted with the opening and written below the panel arrives after this panel's own layout, so the panel is placed again for it.
  const anchoredAtLayout = useRef(false);
  useIsomorphicLayoutEffect(() => {
    anchoredAtLayout.current = anchor.current !== null;
  });
  useEffect(() => {
    if (modal) return;
    if (!anchor.current) {
      if (process.env.NODE_ENV !== "production" && !reported.current) {
        reported.current = true;
        console.error(paperError("Floating.Content (popover) needs Floating.Trigger or anchorRef.").message);
      }
      setUnanchored(true);
    } else if (!anchoredAtLayout.current) place();
  }, [modal, anchor]);
  if (unanchored) return null;

  const snapshot: FloatingContentState = { isOpen: state.isOpen, presentation, placement: modal ? undefined : position.placement ?? undefined, elevation };
  const behavior: BehaviorProps = {
    dismissable,
    keyboardDismissDisabled,
    closeOnBlur,
    closeOnInteractOutside: (target) => !triggerRef.current?.contains(target) && !anchor.current?.contains(target) && (closeOnInteractOutside?.(target) ?? true),
  };
  const values = { [VALUE_ATTRIBUTE.presentation]: presentation, [VALUE_ATTRIBUTE.placement]: snapshot.placement };
  const domProps: HTMLAttributes<HTMLDivElement> = {
    ...attributes,
    id: contentId,
    role,
    tabIndex: -1,
    className: joinClass(styles.surface, presence.surface, !modal && styles.stack[elevation.tier], styles.cast[elevation.tier], className),
    style: { [styles.rankProperty]: String(elevation.rank), ...(modal ? undefined : position.style), ...style },
    ...values,
    children: typeof children === "function" ? children(snapshot) : children,
  };
  const Panel = modal ? ModalPanel : PopoverPanel;
  // The opener is where the portal's source overrides come from: the Trigger if it is on the page, else the anchor, else what was pressed.
  const opener = () => (triggerRef.current?.isConnected ? triggerRef.current : anchorRef?.current ?? document.activeElement);
  return <ElevationContext.Provider value={elevation}>
    <Portal container={portalContainer} opener={opener}>
      <FocusScope contain={modal && state.isOpen} restoreFocus={restoreFocus}>
        <Panel state={state} elevation={elevation} rootRef={rootRef} panelRef={panelRef} forwardedRef={forwardedRef} behavior={behavior} initialFocusRef={initialFocusRef}
          takeFocus={autoFocus} underlayClassName={underlayClassName} isExiting={isExiting}
          data={{ [VALUE_ATTRIBUTE.presence]: isExiting ? "exiting" : isEntering ? "entering" : undefined }} domProps={domProps} />
      </FocusScope>
    </Portal>
  </ElevationContext.Provider>;
}
const Content = forwardRef<HTMLDivElement, FloatingContentProps>(function FloatingContent(props, ref) {
  const { state } = useContextValue();
  const rootRef = useRef<HTMLDivElement>(null);
  const isExiting = useAriaExit(rootRef, state.isOpen);
  // Refs are filled when the page commits, so a panel open from the first render stands one commit later, before the
  // browser paints: its Trigger and anchor are there to read by then, wherever they are written.
  const [awaitingCommit, setAwaitingCommit] = useState(state.isOpen);
  useIsomorphicLayoutEffect(() => setAwaitingCommit(false), []);
  // Each opening is a new panel: one reopened while the last is still leaving is placed, focused and carried afresh.
  const [opening, setOpening] = useState({ count: 0, open: state.isOpen });
  if (opening.open !== state.isOpen) setOpening({ count: opening.count + (state.isOpen ? 1 : 0), open: state.isOpen });
  if (awaitingCommit || (!state.isOpen && !isExiting)) return null;
  return <Shown key={opening.count} {...props} rootRef={rootRef} isExiting={isExiting} forwardedRef={ref} />;
});
export type FloatingCloseProps<As extends ElementType = "button"> = PolymorphicProps<FloatingButtonOwnProps, As>;
const CloseImpl = forwardRef<HTMLElement, Omit<FloatingCloseProps, "as" | "ref"> & { as?: ElementType }>(function FloatingClose({ as, disabled = false, onClick, onKeyDown, ...props }, ref) {
  const { state } = useContextValue();
  const Tag = as ?? "button";
  const { type, href } = props as { type?: string; href?: string };
  const bare = Tag === "button" ? { className: bareButton } : undefined;
  const target = targetProps(Tag, { disabled, type, href, activateOnKey: true, kind: "control" });
  return <Tag {...mergeProps(bare, target, props)} ref={ref} onClick={composeEventHandlers(onClick, state.close)} onKeyDown={composeEventHandlers(onKeyDown, target.onKeyDown)} />;
});
const Close = registerPart(CloseImpl) as PolymorphicComponent<FloatingButtonOwnProps, "button">;

export const Floating = Object.assign(Root, { Trigger, Content, Close });
