// ButtonBase — Button 과 IconButton 의 몸 하나. 안 드러나는 내부 모듈이다.
//
// 요소는 늘 Pressable 하나다. `as` 가 행동 부품(Floating.Trigger · Selectable · SelectableGroup.Item …)이든
// 태그든 라우터 Link 든 그냥 대상이고, 눌림 장치는 그 위에 한 벌만 얹힌다. Atom 의 모양을 행동에 입히는 길은
// <Button as={부품}> 이고, 반대(<부품 as={Button}>)는 개발 오류다(internal/render-target).
//
// 눌림의 모습(1px · 커서 · 비활성)은 Pressable 의 motion="press", 색은 paintClass, 선택은 useSelectable 이 정하고
// 이 모듈은 크기와 글자와 로딩만 더한다.

import { forwardRef, useEffect, useRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";

import { paperError } from "../internal/errors";
import { joinClass } from "../internal/joinClass";
import { useMessages } from "../internal/locale";
import { useMergedRef } from "../internal/refs";
import { Draggable, Pressable, Selectable, SelectableGroup, announce, useSelectable } from "../primitives";
import { IconSizeContext } from "../primitives/icon-context";
import { paintClass } from "../primitives/paint/Paint";
import { resolveControlFontSize, resolvePreset } from "../resolvers";
import { CONTROL_ICON, type Accent, type ControlFontSize, type ControlShape, type ControlSize, type IconSize, type Variant } from "../tokens";
import { buttonFull, buttonIconSize, buttonPill, buttonRoot, buttonSize } from "./Button.css";
import { Spinner } from "./Spinner";

export type ButtonBaseProps = {
  anatomy: "label" | "icon";
  as?: ElementType;
  accent?: Accent;
  variant?: Variant;
  size?: ControlSize;
  fontSize?: ControlFontSize;
  shape?: ControlShape;
  loading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
  selected?: boolean;
  disabled?: boolean;
  iconSize?: IconSize;
  children?: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "className" | "children"> & { type?: string; href?: string };

// Draggable.Handle takes a click for a cancel of its keyboard drag, so a Button over it would cancel the drag it started.
let toldHandle = false;

// These targets hold the selection themselves and announce it, so a Button over one gives it the prop and says nothing of its own.
const holdsSelection = (as: ElementType | undefined) => as === Selectable || as === SelectableGroup.Item;

// What the target takes beyond these (a router link's `to`) goes through to it untouched, so the Atoms type it by `as`.
export const ButtonBase = forwardRef<HTMLElement, ButtonBaseProps>(function ButtonBase(
  {
    anatomy, as, accent = "primary", variant = "solid", size = "md", fontSize, shape = "rounded", loading, loadingLabel, fullWidth,
    selected, disabled = false, iconSize, children, className, ...rest
  },
  forwardedRef,
) {
  const messages = useMessages();
  const element = useRef<HTMLElement>(null);
  const ref = useMergedRef(forwardedRef, element);
  // A selection is announced only by a Button that was given one: aria-pressed is a promise that it can be switched.
  const { selectProps } = useSelectable({ selected, disabled, role: rest.role });

  // Busy is a state of a Button that can be focused: it keeps its place in the Tab order, ignores presses and
  // submits, and tells the reader once when it starts while it holds focus.
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
      // `as={Pressable}` is the one Pressable, not a second one inside it.
      as={as === Pressable ? undefined : as}
      ref={ref}
      motion="press"
      disabled={disabled || busy}
      focusable={busy && !disabled}
      aria-busy={busy || undefined}
      className={joinClass(
        buttonRoot,
        anatomy === "icon" ? buttonIconSize[size] : buttonSize[size],
        resolvePreset("button", size, variant === "solid" ? "strong" : "medium"),
        resolveControlFontSize(fontSize),
        paintClass({ accent, variant, hoverable: true }),
        fullWidth && buttonFull,
        shape === "pill" && buttonPill,
        className,
      )}
      {...(holdsSelection(as) ? { selected } : selected !== undefined ? selectProps : null)}
      {...rest}
    >
      {busy ? <Spinner size="inline" ink="inherit" decorative /> : null}
      {/* A control's icons follow the control, not the text beside them; an explicit size on the Icon still wins. */}
      <IconSizeContext.Provider value={iconSize ?? CONTROL_ICON[size]}>{children}</IconSizeContext.Provider>
    </Pressable>
  );
});
