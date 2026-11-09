import { forwardRef, useRef, type ForwardedRef, type HTMLAttributes, type Ref } from "react";

import { IconButton } from "../atoms/IconButton";
import { useAriaCalendar, useAriaCalendarCell, type AriaCalendar, type DateRange } from "../internal/aria/calendar";
import { LocaleHost } from "../internal/aria/i18n";
import { joinClass } from "../internal/joinClass";
import { useLocale } from "../internal/locale";
import { useFocusRing } from "../primitives/a11y/focus";
import { mergeProps } from "../primitives/composition";
import { controlClass, type ControlForm } from "../primitives/control/Control";
import { controlLineRoom, controlShape, controlSize } from "../primitives/control/Control.css";
import { useControlShape } from "../primitives/control/shape";
import { Icon } from "../primitives/Icon";
import { paintClass } from "../primitives/paint/Paint";
import { calendarRangePaint, dotPaint } from "../primitives/paint/recipes.css";
import { Text } from "../primitives/Text";
import { VALUE_ATTRIBUTE, VARIANT_LINE, stateAttributes, type ControlShape, type ControlSize } from "../tokens";
import * as styles from "./Calendar.css";

export type CalendarProps = Omit<HTMLAttributes<HTMLDivElement>, "className" | "defaultValue" | "onChange"> & Pick<ControlForm, "shape"> & {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  min?: string;
  max?: string;
  isDateUnavailable?: (date: string) => boolean;
  marked?: readonly string[];
  size?: ControlSize;
  disabled?: boolean;
  focusOnMount?: boolean;
  className?: string;
  "data-testid"?: string;
};

type RangeEdge = { inside: boolean; start: boolean; end: boolean };

const edgesOf = (range: DateRange | null, iso: string): RangeEdge | null =>
  range === null ? null : { inside: iso >= range.start && iso <= range.end, start: iso === range.start, end: iso === range.end };
type CellProps = { calendar: AriaCalendar; iso: string; marked: boolean; range: RangeEdge | null; size: ControlSize; shape: ControlShape };

function CalendarCell({ calendar, iso, marked, range, size, shape }: CellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const cell = useAriaCalendarCell(calendar, iso, ref);
  const { focusProps, isFocusVisible } = useFocusRing();
  const endpoint = range !== null && (range.start || range.end);
  const chosen = range === null ? cell.isSelected : endpoint;
  const variant = chosen ? "solid" : cell.isToday ? "hairline" : "ghost";
  const inside = range?.inside === true;
  const joined = range !== null && endpoint && !(range.start && range.end);
  return (
    <td {...cell.cellProps} className={joinClass(styles.calendarCell, inside && controlSize[size], inside && shape !== "rounded" && controlShape[shape])}>
      {range !== null && inside ? <span aria-hidden {...{ [VALUE_ATTRIBUTE.part]: "range" }} className={joinClass(styles.calendarRange, range.start && styles.calendarRangeStart, range.end && styles.calendarRangeEnd, calendarRangePaint)} /> : null}
      <div
        {...mergeProps(cell.buttonProps, focusProps)}
        ref={ref}
        {...stateAttributes({ active: cell.isPressed, disabled: cell.isDisabled, focusVisible: isFocusVisible })}
        className={joinClass(
          controlClass({ size, anatomy: "icon", shape, strong: cell.isToday || chosen }),
          paintClass({ accent: "primary", variant, hoverable: true }),
          controlLineRoom[VARIANT_LINE[variant]],
          styles.calendarDay,
          joined && (range.start ? styles.calendarDayStart : styles.calendarDayEnd),
        )}
      >
        {cell.label}
        {marked ? <span aria-hidden {...{ [VALUE_ATTRIBUTE.part]: "mark" }} className={joinClass(styles.calendarMark, dotPaint)} /> : null}
      </div>
    </td>
  );
}

const Chevron = ({ direction }: { direction: "previous" | "next" }) => (
  <Icon>
    <path d={direction === "previous" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
  </Icon>
);

export type CalendarViewProps = {
  calendar: AriaCalendar;
  marked?: readonly string[];
  size: ControlSize;
  shape: ControlShape;
  disabled?: boolean;
  className?: string;
  forwardedRef: Ref<HTMLDivElement>;
  rest: HTMLAttributes<HTMLDivElement>;
};

export function CalendarView({ calendar, marked, size, shape, disabled, className, forwardedRef, rest }: CalendarViewProps) {
  const dotted = new Set(marked);
  return (
    <div
      {...mergeProps(rest, calendar.rootProps)}
      ref={forwardedRef}
      {...stateAttributes({ disabled })}
      className={joinClass(styles.calendar, className)}
    >
      <div className={styles.calendarHeader}>
        <Text as="div" variant="subheading" aria-hidden className={styles.calendarTitle}>{calendar.title}</Text>
        {(["previous", "next"] as const).map((direction) => {
          const page = calendar[direction];
          return (
            <IconButton
              key={direction}
              variant="muted"
              size={size}
              shape={shape}
              aria-label={page.label}
              disabled={page.disabled}
              onClick={page.go}
              onFocus={() => page.onFocusChange(true)}
              onBlur={() => page.onFocusChange(false)}
            >
              <Chevron direction={direction} />
            </IconButton>
          );
        })}
      </div>
      <table {...calendar.gridProps} className={styles.calendarGrid}>
        <thead {...calendar.headerProps}>
          <tr>
            {calendar.weekdays.map((day, index) => (
              <th key={index} scope="col" className={styles.calendarWeekday}>
                <Text variant="label" ink="tertiary">{day}</Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendar.weeks.map((week, row) => (
            <tr key={row}>
              {week.map((iso, column) => (iso === null
                ? <td key={column} role="gridcell" aria-disabled="true" className={styles.calendarCell} />
                : <CalendarCell key={iso} calendar={calendar} iso={iso} marked={dotted.has(iso)} range={edgesOf(calendar.range, iso)} size={size} shape={shape} />))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type BodyProps = Omit<CalendarProps, "shape"> & { shape: ControlShape; forwardedRef: ForwardedRef<HTMLDivElement> };

function CalendarBody({ forwardedRef, value, defaultValue, onValueChange, min, max, isDateUnavailable, marked, size = "xs", shape, disabled, focusOnMount, className, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, ...rest }: BodyProps) {
  const locale = useLocale();
  const calendar = useAriaCalendar({ value, defaultValue, onValueChange, min, max, isDateUnavailable, disabled, autoFocus: focusOnMount, locale, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby });
  return <CalendarView calendar={calendar} marked={marked} size={size} shape={shape} disabled={disabled} className={className} forwardedRef={forwardedRef} rest={rest} />;
}

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar({ shape, ...props }, ref) {
  const locale = useLocale();
  const frameShape = useControlShape(shape, "rounded");
  return (
    <LocaleHost locale={locale}>
      <CalendarBody {...props} shape={frameShape} forwardedRef={ref} />
    </LocaleHost>
  );
});
