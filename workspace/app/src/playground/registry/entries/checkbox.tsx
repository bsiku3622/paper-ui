import { Checkbox, Inline, Text, type CheckboxProps, type TextProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, textControl, vocab, words } from "../schema";

export default defineSpec({
  name: "Checkbox",
  blurb: "켜고 끄는 네모입니다. 라벨과 나란히 두면 통째로 누를 수 있습니다.",
  controls: [
    boolControl<CheckboxProps, "checked">("checked", true),
    boolControl<CheckboxProps, "indeterminate">("indeterminate", false, { behaviorOnly: "indeterminate is a DOM property, so it never reaches the markup" }),
    enumControl<CheckboxProps, "size">("size", vocab("CONTROL_SIZES")),
    boolControl<CheckboxProps, "disabled">("disabled"),
    textControl<TextProps, "children">("children", "동의합니다", { key: "label", target: "Text" }),
  ],
  defaults: { size: "md" },
  subject: (state) => (
    <Inline as="label" gap="sm" align="center">
      <Checkbox checked={flag(state, "checked")} indeterminate={flag(state, "indeterminate")} size={pick<NonNullable<CheckboxProps["size"]>>(state, "size")} disabled={flag(state, "disabled")} readOnly />
      <Text variant="body" as="span">{words(state, "label")}</Text>
    </Inline>
  ),
});
