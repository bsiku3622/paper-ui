import { useCalendar, useCalendarCell, useCalendarGrid, useRangeCalendar } from "@react-aria/calendar";
import { GregorianCalendar, createCalendar, getLocalTimeZone, parseDate, toCalendar, isSameMonth, today, type CalendarDate } from "@internationalized/date";
import { useCalendarState, useRangeCalendarState, type CalendarState, type RangeCalendarState } from "@react-stately/calendar";
import { useMemo, type HTMLAttributes, type RefObject } from "react";

export type CalendarOptions = {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  min?: string;
  max?: string;
  isDateUnavailable?: (date: string) => boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  locale: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

export type DateRange = { start: string; end: string };

export type RangeCalendarOptions = Omit<CalendarOptions, "value" | "defaultValue" | "onValueChange"> & {
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onValueChange?: (value: DateRange | null) => void;
};

export type CalendarPage = {
  label: string;
  disabled: boolean;
  go: () => void;
  onFocusChange: (focused: boolean) => void;
};

export type AriaCalendar = {
  rootProps: HTMLAttributes<HTMLElement>;
  gridProps: HTMLAttributes<HTMLElement>;
  headerProps: HTMLAttributes<HTMLElement>;
  title: string;
  previous: CalendarPage;
  next: CalendarPage;
  weekdays: string[];
  weeks: (string | null)[][];
  range: DateRange | null;
  state: CalendarState | RangeCalendarState;
};

const gregorian = new GregorianCalendar();

export const toIso = (date: CalendarDate): string => toCalendar(date, gregorian).toString();

const parse = (iso: string | null | undefined): CalendarDate | null => {
  if (!iso) return null;
  try {
    return parseDate(iso);
  } catch {
    return null;
  }
};

export function useAriaCalendar({ value, defaultValue, onValueChange, min, max, isDateUnavailable, disabled, autoFocus, locale, ...labels }: CalendarOptions): AriaCalendar {
  const controlled = value === undefined ? undefined : parse(value);
  const state = useCalendarState({
    locale,
    createCalendar,
    ...(value === undefined ? {} : { value: controlled ?? null }),
    ...(defaultValue === undefined ? {} : { defaultValue: parse(defaultValue) }),
    onChange: (next) => onValueChange?.(next ? toIso(next as CalendarDate) : null),
    minValue: parse(min),
    maxValue: parse(max),
    isDateUnavailable: isDateUnavailable ? (date) => isDateUnavailable(toIso(date as CalendarDate)) : undefined,
    isDisabled: disabled,
    autoFocus,
  });
  const { calendarProps, prevButtonProps, nextButtonProps, title } = useCalendar({ ...labels, isDisabled: disabled }, state);
  return useAssembled(state, calendarProps, prevButtonProps, nextButtonProps, title, null);
}

const parseRange = (range: DateRange | null | undefined) => {
  const start = parse(range?.start);
  const end = parse(range?.end);
  return start && end ? { start, end } : null;
};

export function useAriaRangeCalendar({ value, defaultValue, onValueChange, min, max, isDateUnavailable, disabled, autoFocus, locale, ...labels }: RangeCalendarOptions, ref: RefObject<HTMLElement | null>): AriaCalendar {
  const state = useRangeCalendarState({
    locale,
    createCalendar,
    ...(value === undefined ? {} : { value: parseRange(value) }),
    ...(defaultValue === undefined ? {} : { defaultValue: parseRange(defaultValue) }),
    onChange: (next) => onValueChange?.(next ? { start: toIso(next.start as CalendarDate), end: toIso(next.end as CalendarDate) } : null),
    minValue: parse(min),
    maxValue: parse(max),
    isDateUnavailable: isDateUnavailable ? (date) => isDateUnavailable(toIso(date as CalendarDate)) : undefined,
    isDisabled: disabled,
    autoFocus,
  });
  const { calendarProps, prevButtonProps, nextButtonProps, title } = useRangeCalendar({ ...labels, isDisabled: disabled }, state, ref);
  const shown = state.highlightedRange;
  return useAssembled(state, calendarProps, prevButtonProps, nextButtonProps, title, shown ? { start: toIso(shown.start as CalendarDate), end: toIso(shown.end as CalendarDate) } : null);
}

type ButtonProps = ReturnType<typeof useCalendar>["prevButtonProps"];

function useAssembled(state: CalendarState | RangeCalendarState, calendarProps: object, prevButtonProps: ButtonProps, nextButtonProps: ButtonProps, title: string, range: DateRange | null): AriaCalendar {
  const { gridProps, headerProps, weekDays, weeksInMonth } = useCalendarGrid({ weekdayStyle: "short" }, state);
  const month = state.visibleRange.start;
  const weeks = Array.from({ length: weeksInMonth }, (_, index) =>
    state.getDatesInWeek(index).map((date) => (date && isSameMonth(date, month) ? toIso(date as CalendarDate) : null)),
  );
  const page = (props: ButtonProps): CalendarPage => ({
    label: props["aria-label"] ?? "",
    disabled: props.isDisabled === true,
    go: () => props.onPress?.({} as never),
    onFocusChange: (focused) => props.onFocusChange?.(focused),
  });
  return {
    rootProps: calendarProps as HTMLAttributes<HTMLElement>,
    gridProps: gridProps as HTMLAttributes<HTMLElement>,
    headerProps: headerProps as HTMLAttributes<HTMLElement>,
    title,
    previous: page(prevButtonProps),
    next: page(nextButtonProps),
    weekdays: weekDays,
    weeks,
    range,
    state,
  };
}

export type AriaCalendarCell = {
  cellProps: HTMLAttributes<HTMLElement>;
  buttonProps: HTMLAttributes<HTMLElement>;
  label: string;
  isPressed: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isToday: boolean;
};

export function useAriaCalendarCell({ state }: Pick<AriaCalendar, "state">, iso: string, ref: RefObject<HTMLElement | null>): AriaCalendarCell {
  const date = useMemo(() => toCalendar(parseDate(iso), state.visibleRange.start.calendar), [iso, state.visibleRange.start.calendar]);
  const cell = useCalendarCell({ date }, state, ref);
  const zone = state.timeZone ?? getLocalTimeZone();
  return {
    cellProps: cell.cellProps as HTMLAttributes<HTMLElement>,
    buttonProps: cell.buttonProps as HTMLAttributes<HTMLElement>,
    label: cell.formattedDate,
    isPressed: cell.isPressed,
    isSelected: cell.isSelected,
    isDisabled: cell.isDisabled || cell.isUnavailable,
    isToday: date.compare(today(zone)) === 0,
  };
}
