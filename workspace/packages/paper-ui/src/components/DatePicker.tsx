import { forwardRef, useEffect, useMemo, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type ForwardedRef } from "react";

import { joinClass } from "../internal/joinClass";
import { useLocale } from "../internal/locale";
import { useMergedRef } from "../internal/refs";
import { useControllableState } from "../internal/useControllableState";
import { inputFrameClass, useInputControl, type InputFrameProps } from "../atoms/input-control";
import { composeEventHandlers } from "../primitives/composition";
import type { ControlForm } from "../primitives/control/Control";
import { useControlShape } from "../primitives/control/shape";
import { Floating, useFloatingContentId } from "../primitives/float/Floating";
import { Icon } from "../primitives/Icon";
import { datePickerEmptyPaint, datePickerIconPaint } from "../primitives/paint/recipes.css";
import { surfaceClass } from "../primitives/paint/Surface";
import { Calendar, type CalendarProps } from "./Calendar";
import * as styles from "./DatePicker.css";

export type DatePickerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children" | "style" | "value" | "defaultValue" | "onChange" | "type"> & InputFrameProps & Pick<ControlForm, "shape"> &
  Pick<CalendarProps, "value" | "defaultValue" | "onValueChange" | "min" | "max" | "isDateUnavailable" | "marked"> & {
    name?: string;
    form?: string;
    required?: boolean;
    placeholder?: string;
    className?: string;
    style?: CSSProperties;
    "data-testid"?: string;
  };

const formatter = (locale: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" });

const display = (format: Intl.DateTimeFormat, iso: string | null): string | null => {
  if (iso === null) return null;
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? Number.NaN, (month ?? Number.NaN) - 1, day ?? Number.NaN));
  return Number.isNaN(date.getTime()) ? null : format.format(date);
};

type BodyProps = DatePickerProps & { isOpen: boolean; setOpen: (open: boolean) => void; forwardedRef: ForwardedRef<HTMLButtonElement> };

function DatePickerBody({
  isOpen, setOpen, forwardedRef, value, defaultValue, onValueChange, min, max, isDateUnavailable, marked, name, form, placeholder,
  status, size = "md", fill, variant, shadow, fontSize, shape, className, style, "data-testid": testid, ...rest
}: BodyProps) {
  const { inputProps, frameProps, isDisabled } = useInputControl(rest, { status });
  const { required, ...buttonProps } = inputProps;
  const triggerProps = buttonProps as ButtonHTMLAttributes<HTMLButtonElement>;
  const frameShape = useControlShape(shape, "rounded");
  const locale = useLocale();
  const format = useMemo(() => formatter(locale), [locale]);

  const [current, setCurrent] = useControllableState<string | null>({ value, defaultValue: defaultValue ?? null, onChange: onValueChange });
  const shown = display(format, current);

  const frameRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const nativeRef = useRef<HTMLInputElement>(null);
  const setTriggerRef = useMergedRef(forwardedRef, triggerRef);
  const [panelLabel, setPanelLabel] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isDisabled) setOpen(false);
  }, [isDisabled, setOpen]);
  useEffect(() => {
    const owner = nativeRef.current?.form;
    if (!owner || value !== undefined) return;
    const reset = () => setCurrent(defaultValue ?? null);
    owner.addEventListener("reset", reset);
    return () => owner.removeEventListener("reset", reset);
  }, [value, defaultValue, setCurrent]);

  const panelId = useFloatingContentId();
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !isOpen) {
      const active = document.activeElement;
      if (active === null || active === document.body || document.getElementById(panelId)?.contains(active)) triggerRef.current?.focus({ preventScroll: true });
    }
    wasOpen.current = isOpen;
  }, [isOpen, panelId]);

  const choose = (next: string | null) => {
    setCurrent(next);
    setOpen(false);
  };

  return (
    <>
      <span
        ref={frameRef}
        style={style}
        data-testid={testid}
        className={joinClass(inputFrameClass({ size, anatomy: "frame", shape: frameShape, fontSize, fill, variant, shadow }), styles.datePickerWrap, className)}
        {...frameProps}
      >
        <Floating.Trigger
          {...triggerProps}
          ref={setTriggerRef}
          disabled={isDisabled}
          aria-required={required ? true : undefined}
          className={styles.datePickerTrigger}
          onClick={composeEventHandlers(triggerProps.onClick, () => setPanelLabel(triggerProps["aria-label"] ?? triggerRef.current?.labels?.[0]?.textContent ?? undefined))}
        >
          <span className={joinClass(styles.datePickerValue, shown === null && datePickerEmptyPaint)}>{shown ?? placeholder ?? "\u00a0"}</span>
        </Floating.Trigger>
        <Icon className={joinClass(styles.datePickerIcon, datePickerIconPaint)}>
          <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
        </Icon>
        <input
          ref={nativeRef}
          aria-hidden
          tabIndex={-1}
          className={styles.datePickerNative}
          name={name}
          form={form}
          required={required}
          disabled={isDisabled}
          value={current ?? ""}
          onChange={() => undefined}
          // Focus sent here by a form pointing at a missing value lands on the button instead.
          onFocus={() => triggerRef.current?.focus()}
        />
      </span>
      <Floating.Content
        role="dialog"
        anchorRef={frameRef}
        offset="xs"
        aria-labelledby={triggerProps["aria-labelledby"]}
        aria-label={triggerProps["aria-labelledby"] ? undefined : panelLabel}
        className={joinClass(surfaceClass({ fill: "raised", radius: "md" }), styles.datePickerPanel)}
      >
        <Calendar focusOnMount shape={frameShape} value={current} min={min} max={max} isDateUnavailable={isDateUnavailable} marked={marked} onValueChange={choose} />
      </Floating.Content>
    </>
  );
}

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(function DatePicker(props, ref) {
  const [isOpen, setOpen] = useState(false);
  return (
    <Floating open={isOpen} onOpenChange={setOpen}>
      <DatePickerBody {...props} isOpen={isOpen} setOpen={setOpen} forwardedRef={ref} />
    </Floating>
  );
});
