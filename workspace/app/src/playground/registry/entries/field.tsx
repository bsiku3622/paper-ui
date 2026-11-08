import { Field, Text, type FieldProps } from "@studio-baeks/paper-ui";

import { glyph } from "../demo";
import { boolControl, defineSpec, enumControl, flag, local, pick, sample, textControl, vocab, words } from "../schema";
import { wide } from "./examples.css";

export default defineSpec({
  name: "Field",
  blurb: "input group입니다. 면을 고르지 않으면 어디에 놓이든 control.field 흰 면에 회색 선 한 줄로 서고 그림자는 없습니다. 회색 면은 화면이 고릅니다 — ghost에 sunken을 주면 선 없는 회색 면입니다. raised·canvas·sunken 면도 고를 수 있고, leading·trailing 어도먼트(아이콘·$·단위), clear(×), 비밀번호 보기를 조합합니다. 래퍼가 테두리·키보드 focus ring·상태를 맡고 내부 input은 입력과 caret 렌더링을 맡습니다. 높이와 입력 여백은 size 사다리가 정합니다.",
  controls: [
    textControl<FieldProps, "placeholder">("placeholder", "검색…"),
    enumControl<FieldProps, "type">("type", sample(["text", "password"] as const, "the two input types the page shows; Field takes any input type")),
    boolControl<FieldProps, "leading">("leading", false, { label: "leading(검색 아이콘)", type: "ReactNode" }),
    boolControl<FieldProps, "trailing">("trailing", false, { label: "trailing(단위 kg)", type: "ReactNode" }),
    enumControl<FieldProps, "gap">("gap", vocab("SPACES"), { rootDefault: "sm", behaviorOnly: "it shows once the field holds an adornment or an action beside its input" }),
    boolControl<FieldProps, "clearable">("clearable"),
    textControl<FieldProps, "clearLabel">("clearLabel", ""),
    boolControl<FieldProps, "showPasswordToggle">("showPasswordToggle", false, { behaviorOnly: "the toggle shows only for a password type" }),
    textControl<FieldProps, "showPasswordLabel">("showPasswordLabel", ""),
    enumControl<FieldProps, "textAlign">("textAlign", local<FieldProps, "textAlign">()(["start", "center", "end"], "the text alignments an input has")),
    enumControl<FieldProps, "status">("status", vocab("STATUSES")),
    enumControl<FieldProps, "size">("size", vocab("CONTROL_SIZES")),
    enumControl<FieldProps, "fontSize">("fontSize", vocab("CONTROL_FONT_SIZES")),
    enumControl<FieldProps, "shape">("shape", vocab("CONTROL_SHAPES")),
    enumControl<FieldProps, "variant">("variant", vocab("INPUT_VARIANTS")),
    enumControl<FieldProps, "fill">("fill", vocab("SURFACE_FILLS")),
    boolControl<FieldProps, "shadow">("shadow"),
    boolControl<FieldProps, "disabled">("disabled"),
    boolControl<FieldProps, "numeric">("numeric"),
  ],
  defaults: { type: "text", size: "md", shape: "rounded", variant: "hairline" },
  sheet: { matrix: { rows: "fill", columns: "variant" }, strips: [{ key: "shape" }, { key: "size" }, { key: "status" }] },
  subject: (state) => (
    <Field
      placeholder={words(state, "placeholder") || undefined}
      type={pick(state, "type")}
      leading={flag(state, "leading") ? glyph.search : undefined}
      trailing={flag(state, "trailing") ? <Text variant="caption" as="span" ink="tertiary">kg</Text> : undefined}
      gap={pick<NonNullable<FieldProps["gap"]>>(state, "gap")}
      clearable={flag(state, "clearable")}
      clearLabel={words(state, "clearLabel") || undefined}
      showPasswordToggle={flag(state, "showPasswordToggle")}
      showPasswordLabel={words(state, "showPasswordLabel") || undefined}
      defaultValue={flag(state, "clearable") ? "지울 값" : undefined}
      textAlign={pick<NonNullable<FieldProps["textAlign"]>>(state, "textAlign")}
      status={pick<NonNullable<FieldProps["status"]>>(state, "status")}
      size={pick<NonNullable<FieldProps["size"]>>(state, "size")}
      fontSize={pick<NonNullable<FieldProps["fontSize"]>>(state, "fontSize")}
      shape={pick<NonNullable<FieldProps["shape"]>>(state, "shape")}
      variant={pick<NonNullable<FieldProps["variant"]>>(state, "variant")}
      fill={pick<NonNullable<FieldProps["fill"]>>(state, "fill")}
      shadow={flag(state, "shadow")}
      disabled={flag(state, "disabled")}
      numeric={flag(state, "numeric")}
    />
  ),
  Stage: ({ subject }) => <div className={wide}>{subject}</div>,
});
