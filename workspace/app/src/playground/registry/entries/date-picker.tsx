import { DatePicker, type DatePickerProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, sample, textControl, vocab, words } from "../schema";
import { narrow } from "./examples.css";

const MARKED = ["2026-11-04", "2026-11-12", "2026-11-21"] as const;

export default defineSpec({
  name: "DatePicker",
  blurb: { ko: "입력 틀 모습의 단추가 날짜 하나를 보여 주고, 누르면 Calendar가 든 팝업이 열립니다. 날을 고르면 값이 정해지고 팝업이 닫히며 포커스가 단추로 돌아옵니다. Field · Select와 같은 사다리와 status · variant · fill 축을 쓰고, name을 주면 숨은 입력이 ISO 값을 폼에 실어 보냅니다. 날짜를 직접 치는 입력과 범위 선택은 아직 없습니다.", en: "A button in the shape of an input frame shows one date, and pressing it opens a popup holding a Calendar. Choosing a day sets the value, closes the popup and returns focus to the button. It uses the same ladder and the status, variant and fill axes as Field and Select, and with a name a hidden input carries the ISO value into a form. Typing a date and choosing a range are not there yet." },
  controls: [
    enumControl<DatePickerProps, "defaultValue">("defaultValue", sample(["2026-11-20", "2026-12-05"] as const, "two fixed days, so the month shown does not follow the clock"), { initial: "2026-11-20" }),
    textControl<DatePickerProps, "placeholder">("placeholder", { ko: "날짜 선택", en: "Pick a date" }),
    boolControl<DatePickerProps, "marked">("marked", false, { example: { ko: "2026-11-04 · 12 · 21", en: "2026-11-04 · 12 · 21" }, type: "readonly string[]", behaviorOnly: "it shows only once the popup is open" }),
    boolControl<DatePickerProps, "min">("min", false, { example: { ko: "2026-11-08", en: "2026-11-08" }, type: "string", behaviorOnly: "it shows only once the popup is open" }),
    boolControl<DatePickerProps, "max">("max", false, { example: { ko: "2026-11-26", en: "2026-11-26" }, type: "string", behaviorOnly: "it shows only once the popup is open" }),
    enumControl<DatePickerProps, "status">("status", vocab("STATUSES")),
    enumControl<DatePickerProps, "size">("size", vocab("CONTROL_SIZES")),
    enumControl<DatePickerProps, "fontSize">("fontSize", vocab("CONTROL_FONT_SIZES")),
    enumControl<DatePickerProps, "shape">("shape", vocab("CONTROL_SHAPES")),
    enumControl<DatePickerProps, "variant">("variant", vocab("INPUT_VARIANTS")),
    enumControl<DatePickerProps, "fill">("fill", vocab("SURFACE_FILLS")),
    boolControl<DatePickerProps, "shadow">("shadow"),
    boolControl<DatePickerProps, "disabled">("disabled"),
  ],
  defaults: { size: "md", shape: "rounded", variant: "hairline" },
  sheet: { matrix: { rows: "fill", columns: "variant" }, strips: [{ key: "shape" }, { key: "size" }, { key: "status" }] },
  subject: (state) => {
    const value = pick<string>(state, "defaultValue");
    return (
      <DatePicker
        key={value}
        aria-label="Date"
        defaultValue={value}
        placeholder={words(state, "placeholder") || undefined}
        marked={flag(state, "marked") ? MARKED : undefined}
        min={flag(state, "min") ? "2026-11-08" : undefined}
        max={flag(state, "max") ? "2026-11-26" : undefined}
        status={pick<NonNullable<DatePickerProps["status"]>>(state, "status")}
        size={pick<NonNullable<DatePickerProps["size"]>>(state, "size")}
        fontSize={pick<NonNullable<DatePickerProps["fontSize"]>>(state, "fontSize")}
        shape={pick<NonNullable<DatePickerProps["shape"]>>(state, "shape")}
        variant={pick<NonNullable<DatePickerProps["variant"]>>(state, "variant")}
        fill={pick<NonNullable<DatePickerProps["fill"]>>(state, "fill")}
        shadow={flag(state, "shadow")}
        disabled={flag(state, "disabled")}
      />
    );
  },
  Stage: ({ subject }) => <div className={narrow}>{subject}</div>,
});
