import { RangeCalendar, type RangeCalendarProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, vocab } from "../schema";
import { named } from "../jsx";

const MARKED = ["2026-11-04", "2026-11-12", "2026-11-21"] as const;
const STAY = named('{ start: "2026-11-05", end: "2026-11-12" }', { start: "2026-11-05", end: "2026-11-12" });

export default defineSpec({
  name: "RangeCalendar",
  blurb: { ko: "한 달 격자에서 기간을 고릅니다. 첫 번째 누름이 시작, 두 번째가 끝이고, 값은 start와 end가 ISO 문자열인 객체입니다. 시작부터 끝까지 soft 띠 하나가 이어지고 두 끝 날은 solid이며, 끝을 기다리는 동안에는 포인터나 포커스가 닿은 날까지 띠가 미리 보입니다. 키보드와 locale은 Calendar와 같습니다.", en: "Chooses a period on a month grid. The first press is the start and the second the end, and the value is an object whose start and end are ISO strings. One soft band runs from the start to the end and the two end days are solid, and while the end is still to come the band previews up to the day the pointer or focus is on. The keyboard and the locale are those of Calendar." },
  controls: [
    boolControl<RangeCalendarProps, "defaultValue">("defaultValue", true, { example: { ko: "2026-11-05 ~ 2026-11-12", en: "2026-11-05 to 2026-11-12" }, type: "{ start: string; end: string }" }),
    boolControl<RangeCalendarProps, "marked">("marked", false, { example: { ko: "2026-11-04 · 12 · 21", en: "2026-11-04 · 12 · 21" }, type: "readonly string[]" }),
    boolControl<RangeCalendarProps, "min">("min", false, { example: { ko: "2026-11-02", en: "2026-11-02" }, type: "string" }),
    boolControl<RangeCalendarProps, "max">("max", false, { example: { ko: "2026-11-26", en: "2026-11-26" }, type: "string" }),
    enumControl<RangeCalendarProps, "size">("size", vocab("CONTROL_SIZES")),
    enumControl<RangeCalendarProps, "shape">("shape", vocab("CONTROL_SHAPES")),
    boolControl<RangeCalendarProps, "disabled">("disabled"),
  ],
  defaults: { size: "xs", shape: "rounded" },
  sheet: { strips: [{ key: "shape" }, { key: "size" }] },
  subject: (state) => (
    <RangeCalendar
      key={String(flag(state, "defaultValue"))}
      aria-label="Dates"
      defaultValue={flag(state, "defaultValue") ? STAY : undefined}
      marked={flag(state, "marked") ? MARKED : undefined}
      min={flag(state, "min") ? "2026-11-02" : undefined}
      max={flag(state, "max") ? "2026-11-26" : undefined}
      size={pick<NonNullable<RangeCalendarProps["size"]>>(state, "size")}
      shape={pick<NonNullable<RangeCalendarProps["shape"]>>(state, "shape")}
      disabled={flag(state, "disabled")}
    />
  ),
});
