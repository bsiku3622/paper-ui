import { DateRangePicker, type DateRangePickerProps } from "@studio-baeks/paper-ui";

import { named } from "../jsx";
import { boolControl, defineSpec, enumControl, flag, pick, textControl, vocab, words } from "../schema";
import { narrow } from "./examples.css";

const MARKED = ["2026-11-04", "2026-11-12", "2026-11-21"] as const;
const STAY = named('{ start: "2026-11-05", end: "2026-11-12" }', { start: "2026-11-05", end: "2026-11-12" });

export default defineSpec({
  name: "DateRangePicker",
  blurb: { ko: "입력 틀 모습의 단추가 기간을 한 줄로 보여 주고, 누르면 RangeCalendar가 든 팝업이 열립니다. 시작과 끝을 고르면 값이 정해지고 팝업이 닫히며 포커스가 단추로 돌아옵니다. Field · Select와 같은 사다리와 status · variant · fill 축을 쓰고, startName · endName을 주면 숨은 입력 둘이 두 날을 폼에 실어 보냅니다.", en: "A button in the shape of an input frame shows a period on one line, and pressing it opens a popup holding a RangeCalendar. Choosing the start and the end sets the value, closes the popup and returns focus to the button. It uses the same ladder and the status, variant and fill axes as Field and Select, and with startName and endName two hidden inputs carry the two days into a form." },
  controls: [
    boolControl<DateRangePickerProps, "defaultValue">("defaultValue", true, { example: { ko: "2026-11-05 ~ 2026-11-12", en: "2026-11-05 to 2026-11-12" }, type: "{ start: string; end: string }" }),
    textControl<DateRangePickerProps, "placeholder">("placeholder", { ko: "기간 선택", en: "Pick dates" }),
    boolControl<DateRangePickerProps, "marked">("marked", false, { example: { ko: "2026-11-04 · 12 · 21", en: "2026-11-04 · 12 · 21" }, type: "readonly string[]", behaviorOnly: "it shows only once the popup is open" }),
    boolControl<DateRangePickerProps, "min">("min", false, { example: { ko: "2026-11-02", en: "2026-11-02" }, type: "string", behaviorOnly: "it shows only once the popup is open" }),
    boolControl<DateRangePickerProps, "max">("max", false, { example: { ko: "2026-11-26", en: "2026-11-26" }, type: "string", behaviorOnly: "it shows only once the popup is open" }),
    enumControl<DateRangePickerProps, "status">("status", vocab("STATUSES")),
    enumControl<DateRangePickerProps, "size">("size", vocab("CONTROL_SIZES")),
    enumControl<DateRangePickerProps, "fontSize">("fontSize", vocab("CONTROL_FONT_SIZES")),
    enumControl<DateRangePickerProps, "shape">("shape", vocab("CONTROL_SHAPES")),
    enumControl<DateRangePickerProps, "variant">("variant", vocab("INPUT_VARIANTS")),
    enumControl<DateRangePickerProps, "fill">("fill", vocab("SURFACE_FILLS")),
    boolControl<DateRangePickerProps, "shadow">("shadow"),
    boolControl<DateRangePickerProps, "disabled">("disabled"),
  ],
  defaults: { size: "md", shape: "rounded", variant: "hairline" },
  sheet: { matrix: { rows: "fill", columns: "variant" }, strips: [{ key: "shape" }, { key: "size" }, { key: "status" }] },
  subject: (state) => {
    const value = flag(state, "defaultValue");
    return (
      <DateRangePicker
        key={String(value)}
        aria-label="Dates"
        defaultValue={value ? STAY : undefined}
        placeholder={words(state, "placeholder") || undefined}
        marked={flag(state, "marked") ? MARKED : undefined}
        min={flag(state, "min") ? "2026-11-02" : undefined}
        max={flag(state, "max") ? "2026-11-26" : undefined}
        status={pick<NonNullable<DateRangePickerProps["status"]>>(state, "status")}
        size={pick<NonNullable<DateRangePickerProps["size"]>>(state, "size")}
        fontSize={pick<NonNullable<DateRangePickerProps["fontSize"]>>(state, "fontSize")}
        shape={pick<NonNullable<DateRangePickerProps["shape"]>>(state, "shape")}
        variant={pick<NonNullable<DateRangePickerProps["variant"]>>(state, "variant")}
        fill={pick<NonNullable<DateRangePickerProps["fill"]>>(state, "fill")}
        shadow={flag(state, "shadow")}
        disabled={flag(state, "disabled")}
      />
    );
  },
  Stage: ({ subject }) => <div className={narrow}>{subject}</div>,
});
