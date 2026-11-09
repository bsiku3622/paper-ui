import { forwardRef, useRef, type ForwardedRef, type HTMLAttributes } from "react";

import { IconButton } from "../atoms/IconButton";
import { useAriaCalendar, useAriaCalendarCell, type AriaCalendar } from "../internal/aria/calendar";
import { LocaleHost } from "../internal/aria/i18n";
import { joinClass } from "../internal/joinClass";
import { useLocale } from "../internal/locale";
import { useFocusRing } from "../primitives/a11y/focus";
import { mergeProps } from "../primitives/composition";
import { controlClass, type ControlForm } from "../primitives/control/Control";
import { controlLineRoom } from "../primitives/control/Control.css";
import { useControlShape } from "../primitives/control/shape";
import { Icon } from "../primitives/Icon";
import { paintClass } from "../primitives/paint/Paint";
import { dotPaint } from "../primitives/paint/recipes.css";
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

type CellProps = { calendar: AriaCalendar; iso: string; marked: boolean; inRange: boolean; size: ControlSize; shape: ControlShape };

function CalendarCell({ calendar, iso, marked, inRange, size, shape }: CellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const cell = useAriaCalendarCell(calendar, iso, ref);
  const { focusProps, isFocusVisible } = useFocusRing();
  const variant = cell.isSelected ? "solid" : inRange && !cell.isDisabled ? "soft" : cell.isToday ? "hairline" : "ghost";
  return (
    <td {...cell.cellProps} className={styles.calendarCell}>
      <div
        {...mergeProps(cell.buttonProps, focusProps)}
        ref={ref}
        {...stateAttributes({ active: cell.isPressed, disabled: cell.isDisabled, focusVisible: isFocusVisible })}
        className={joinClass(
          controlClass({ size, anatomy: "icon", shape, strong: cell.isToday || cell.isSelected }),
          paintClass({ accent: "primary", variant, hoverable: true }),
          controlLineRoom[VARIANT_LINE[variant]],
          styles.calendarDay,
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

type BodyProps = Omit<CalendarProps, "shape"> & { shape: ControlShape; forwardedRef: ForwardedRef<HTMLDivElement> };

function CalendarBody({ forwardedRef, value, defaultValue, onValueChange, min, max, isDateUnavailable, marked, size = "xs", shape, disabled, focusOnMount, className, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, ...rest }: BodyProps) {
  const locale = useLocale();
  const calendar = useAriaCalendar({ value, defaultValue, onValueChange, min, max, isDateUnavailable, disabled, autoFocus: focusOnMount, locale, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby });
  const dotted = new Set(marked);
  const within = (iso: string) => Boolean(min && max && iso >= min && iso <= max);
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
                : <CalendarCell key={iso} calendar={calendar} iso={iso} marked={dotted.has(iso)} inRange={within(iso)} size={size} shape={shape} />))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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
