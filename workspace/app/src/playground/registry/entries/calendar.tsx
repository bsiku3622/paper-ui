import { Calendar, type CalendarProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, sample, vocab } from "../schema";

const MARKED = ["2026-11-04", "2026-11-12", "2026-11-21"] as const;

export default defineSpec({
  name: "Calendar",
  blurb: { ko: "한 달 격자를 그대로 놓는 날짜 고르기입니다. 날짜는 ISO 문자열이고, 방향키 · PageUp · PageDown · Home · End와 주 시작, 달과 요일 이름은 locale을 따릅니다. 고른 날은 primary의 solid 면, 오늘은 면 없이 선 하나이며, 막은 날은 비활성 상태를 쓰고 표시한 날에는 점이 붙습니다. 달 밖의 칸은 비워 둡니다.", en: "An inline month grid for choosing a date. A date is an ISO string, and the arrow keys, PageUp, PageDown, Home and End, the first day of the week and the month and weekday names follow the locale. The chosen day takes a primary solid face, today takes one line and no face, blocked days use the disabled state and marked days carry a dot. Cells outside the month stay empty." },
  controls: [
    enumControl<CalendarProps, "defaultValue">("defaultValue", sample(["2026-11-20", "2026-12-05"] as const, "two fixed days, so the month shown does not follow the clock"), { initial: "2026-11-20" }),
    boolControl<CalendarProps, "marked">("marked", false, { example: { ko: "2026-11-04 · 12 · 21", en: "2026-11-04 · 12 · 21" }, type: "readonly string[]" }),
    boolControl<CalendarProps, "min">("min", false, { example: { ko: "2026-11-08", en: "2026-11-08" }, type: "string" }),
    boolControl<CalendarProps, "max">("max", false, { example: { ko: "2026-11-26", en: "2026-11-26" }, type: "string" }),
    enumControl<CalendarProps, "size">("size", vocab("CONTROL_SIZES")),
    enumControl<CalendarProps, "shape">("shape", vocab("CONTROL_SHAPES")),
    boolControl<CalendarProps, "disabled">("disabled"),
  ],
  defaults: { size: "xs", shape: "rounded" },
  sheet: { strips: [{ key: "shape" }, { key: "size" }] },
  subject: (state) => {
    const value = pick<string>(state, "defaultValue");
    return (
      <Calendar
        key={value}
        aria-label="Date"
        defaultValue={value}
        marked={flag(state, "marked") ? MARKED : undefined}
        min={flag(state, "min") ? "2026-11-08" : undefined}
        max={flag(state, "max") ? "2026-11-26" : undefined}
        size={pick<NonNullable<CalendarProps["size"]>>(state, "size")}
        shape={pick<NonNullable<CalendarProps["shape"]>>(state, "shape")}
        disabled={flag(state, "disabled")}
      />
    );
  },
});
