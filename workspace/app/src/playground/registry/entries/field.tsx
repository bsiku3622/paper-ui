import { Field, Text, type FieldProps } from "@studio-baeks/paper-ui";

import { glyph } from "../demo";
import { boolControl, defineSpec, enumControl, flag, local, pending, pick, sample, subset, textControl, vocab, words } from "../schema";
import { wide } from "./examples.css";

export default defineSpec({
  name: "Field",
  blurb: "input group입니다. raised·sunken 면과 leading·trailing 어도먼트(아이콘·$·단위), clear(×), 비밀번호 보기를 조합합니다. 래퍼가 테두리·키보드 focus ring·상태를 맡고 내부 input은 입력과 caret 렌더링을 맡습니다. 높이와 입력 여백은 size 사다리가 정합니다.",
  controls: [
    textControl<FieldProps, "placeholder">("placeholder", "검색…"),
    enumControl<FieldProps, "type">("type", sample(["text", "password"] as const, "the two input types the page shows; Field takes any input type")),
    boolControl<FieldProps, "leading">("leading", false, { label: "leading(검색 아이콘)" }),
    boolControl<FieldProps, "trailing">("trailing", false, { label: "trailing(단위 kg)" }),
    boolControl<FieldProps, "clearable">("clearable"),
    boolControl<FieldProps, "showPasswordToggle">("showPasswordToggle", false, { behaviorOnly: "the toggle shows only for a password type" }),
    enumControl<FieldProps, "align">("align", local<FieldProps, "align">()(["start", "center", "end"], "the text alignments an input has")),
    enumControl<FieldProps, "status">("status", vocab("STATUSES")),
    enumControl<FieldProps, "size">("size", vocab("CONTROL_SIZES")),
    enumControl<FieldProps, "fontSize">("fontSize", pending(["label", "caption", "body"] as const, "S12", "CONTROL_FONT_SIZES")),
    enumControl<FieldProps, "shape">("shape", vocab("CONTROL_SHAPES")),
    enumControl<FieldProps, "surface">("surface", subset("SURFACES", ["raised", "sunken"], "canvas is the page ground, not a face a field can have")),
    boolControl<FieldProps, "disabled">("disabled"),
    boolControl<FieldProps, "numeric">("numeric"),
  ],
  defaults: { type: "text", size: "md", shape: "rounded", surface: "raised" },
  subject: (state) => (
    <Field
      placeholder={words(state, "placeholder") || undefined}
      type={pick(state, "type")}
      leading={flag(state, "leading") ? glyph.search : undefined}
      trailing={flag(state, "trailing") ? <Text variant="caption" as="span" ink="faint">kg</Text> : undefined}
      clearable={flag(state, "clearable")}
      showPasswordToggle={flag(state, "showPasswordToggle")}
      defaultValue={flag(state, "clearable") ? "지울 값" : undefined}
      align={pick<NonNullable<FieldProps["align"]>>(state, "align")}
      status={pick<NonNullable<FieldProps["status"]>>(state, "status")}
      size={pick<NonNullable<FieldProps["size"]>>(state, "size")}
      fontSize={pick<NonNullable<FieldProps["fontSize"]>>(state, "fontSize")}
      shape={pick<NonNullable<FieldProps["shape"]>>(state, "shape")}
      surface={pick<NonNullable<FieldProps["surface"]>>(state, "surface")}
      disabled={flag(state, "disabled")}
      numeric={flag(state, "numeric")}
    />
  ),
  Stage: ({ subject }) => <div className={wide}>{subject}</div>,
});
