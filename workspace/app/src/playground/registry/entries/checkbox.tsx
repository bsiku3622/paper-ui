import { Checkbox, Inline, Text, type CheckboxProps, type TextProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, textControl, vocab, words } from "../schema";

export default defineSpec({
  name: "Checkbox",
  blurb: { ko: "켜고 끄는 네모입니다. 라벨과 나란히 두면 통째로 누를 수 있습니다. 꺼진 상자는 어디에 놓이든 control.mark 흰 면에 회색 선 한 줄이고, 켜지면 primary의 solid 면에 체크가 앉습니다. status로 오류를 알립니다.", en: "A square that turns on and off. Beside a label, the whole pair is pressable. An off box is a control.mark white face with one grey line wherever it sits; on, it becomes a primary solid face with a check. status reports an error." },
  controls: [
    boolControl<CheckboxProps, "checked">("checked", true),
    boolControl<CheckboxProps, "indeterminate">("indeterminate", false, { behaviorOnly: "indeterminate is a DOM property, so it never reaches the markup" }),
    enumControl<CheckboxProps, "status">("status", vocab("CHOICE_STATUSES")),
    enumControl<CheckboxProps, "size">("size", vocab("CONTROL_SIZES")),
    boolControl<CheckboxProps, "disabled">("disabled"),
    textControl<TextProps, "children">("children", { ko: "동의합니다", en: "I agree" }, { key: "label", target: "Text" }),
  ],
  defaults: { size: "md" },
  sheet: { matrix: { rows: "status", columns: "checked" }, strips: [{ key: "size" }] },
  subject: (state) => (
    <Inline as="label" gap="sm" align="center">
      <Checkbox checked={flag(state, "checked")} indeterminate={flag(state, "indeterminate")} status={pick<NonNullable<CheckboxProps["status"]>>(state, "status")} size={pick<NonNullable<CheckboxProps["size"]>>(state, "size")} disabled={flag(state, "disabled")} readOnly />
      <Text variant="body" as="span">{words(state, "label")}</Text>
    </Inline>
  ),
});
