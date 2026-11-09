import { forwardRef, useEffect, useRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";

import { paperError } from "../internal/errors";
import { joinClass } from "../internal/joinClass";
import { useMessages } from "../internal/locale";
import { useMergedRef } from "../internal/refs";
import { Draggable } from "../primitives/drag/Draggable";
import { Pressable } from "../primitives/press/Pressable";
import { Selectable } from "../primitives/select/Selectable";
import { SelectableGroup } from "../primitives/select/SelectableGroup";
import { announce } from "../primitives/a11y/LiveRegion";
import { useSelectable } from "../primitives/select/useSelectable";
import { controlClass, type ControlForm } from "../primitives/control/Control";
import { controlLineRoom } from "../primitives/control/Control.css";
import { useControlShape } from "../primitives/control/shape";
import { paintClass } from "../primitives/paint/Paint";
import { VARIANT_LINE, type Accent, type ControlAnatomy, type SurfaceFill, type Variant } from "../tokens";
import { buttonAnchored, buttonBadge, buttonFull, buttonRoot } from "./Button.css";
import { Spinner } from "./Spinner";

export type ButtonBaseProps = Omit<ControlForm, "anatomy"> & {
  anatomy: Extract<ControlAnatomy, "label" | "icon">;
  as?: ElementType;
  accent?: Accent;
  variant?: Variant;
  fill?: SurfaceFill;
  shadow?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
  selected?: boolean;
  disabled?: boolean;
  badge?: ReactNode;
  children?: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "className" | "children"> & { type?: string; href?: string };

// Draggable.Handle takes a click for a cancel of its keyboard drag, so a Button over it would cancel the drag it started.
let toldHandle = false;

const holdsSelection = (as: ElementType | undefined) => as === Selectable || as === SelectableGroup.Item;

export const ButtonBase = forwardRef<HTMLElement, ButtonBaseProps>(function ButtonBase(
  {
    anatomy, as, accent = "primary", variant = "solid", fill, shadow, size, fontSize, strong, gap, align, justify, shape: givenShape, loading, loadingLabel, fullWidth,
    selected, disabled = false, iconSize, badge, children, className, ...rest
  },
  forwardedRef,
) {
  const messages = useMessages();
  const shape = useControlShape(givenShape, "pill");
  const element = useRef<HTMLElement>(null);
  const ref = useMergedRef(forwardedRef, element);
  const { selectProps } = useSelectable({ selected, disabled, role: rest.role });

  const busy = Boolean(loading);
  const wasBusy = useRef(busy);
  useEffect(() => {
    if (busy && !wasBusy.current && element.current !== null && document.activeElement === element.current) announce(loadingLabel ?? messages.loading);
    wasBusy.current = busy;
  }, [busy, loadingLabel, messages.loading]);

  if (process.env.NODE_ENV !== "production" && as === Draggable.Handle && !toldHandle) {
    toldHandle = true;
    console.error(paperError("A Button cannot be a Draggable.Handle: its click would cancel the keyboard drag the handle starts.").message);
  }

  return (
    <Pressable
      as={as === Pressable ? undefined : as}
      ref={ref}
      motion="press"
      disabled={disabled || busy}
      focusable={busy && !disabled}
      aria-busy={busy || undefined}
      className={joinClass(
        buttonRoot,
        controlClass({ size, anatomy, shape, fontSize, strong, gap, align, justify, iconSize }),
        paintClass({ accent, variant, fill, shadow, hoverable: true }),
        controlLineRoom[VARIANT_LINE[variant]],
        fullWidth && buttonFull,
        badge != null && buttonAnchored,
        className,
      )}
      {...(holdsSelection(as) ? { selected } : selected !== undefined ? selectProps : null)}
      {...rest}
    >
      {busy ? <Spinner size="inline" ink="inherit" decorative /> : null}
      {children}
      {badge != null ? <span className={buttonBadge}>{badge}</span> : null}
    </Pressable>
  );
});
