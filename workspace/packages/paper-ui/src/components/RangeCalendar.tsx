import { forwardRef, useRef, type ForwardedRef } from "react";

import { useAriaRangeCalendar, type DateRange } from "../internal/aria/calendar";
import { LocaleHost } from "../internal/aria/i18n";
import { useLocale } from "../internal/locale";
import { useMergedRef } from "../internal/refs";
import { useControlShape } from "../primitives/control/shape";
import type { ControlShape } from "../tokens";
import { CalendarView, type CalendarProps } from "./Calendar";

export type DateRangeValue = DateRange;

export type RangeCalendarProps = Omit<CalendarProps, "value" | "defaultValue" | "onValueChange"> & {
  value?: DateRangeValue | null;
  defaultValue?: DateRangeValue | null;
  onValueChange?: (value: DateRangeValue | null) => void;
};

type BodyProps = Omit<RangeCalendarProps, "shape"> & { shape: ControlShape; forwardedRef: ForwardedRef<HTMLDivElement> };

function RangeCalendarBody({ forwardedRef, value, defaultValue, onValueChange, min, max, isDateUnavailable, marked, size = "xs", shape, disabled, focusOnMount, className, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, ...rest }: BodyProps) {
  const locale = useLocale();
  const root = useRef<HTMLDivElement>(null);
  const setRoot = useMergedRef(forwardedRef, root);
  const calendar = useAriaRangeCalendar({ value, defaultValue, onValueChange, min, max, isDateUnavailable, disabled, autoFocus: focusOnMount, locale, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby }, root);
  return <CalendarView calendar={calendar} marked={marked} size={size} shape={shape} disabled={disabled} className={className} forwardedRef={setRoot} rest={rest} />;
}

export const RangeCalendar = forwardRef<HTMLDivElement, RangeCalendarProps>(function RangeCalendar({ shape, ...props }, ref) {
  const locale = useLocale();
  const frameShape = useControlShape(shape, "rounded");
  return (
    <LocaleHost locale={locale}>
      <RangeCalendarBody {...props} shape={frameShape} forwardedRef={ref} />
    </LocaleHost>
  );
});
