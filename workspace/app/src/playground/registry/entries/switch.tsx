import { Inline, Switch, Text, type SwitchProps, type TextProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, textControl, vocab, words } from "../schema";

export default defineSpec({
  name: "Switch",
  blurb: "켬·끔 토글입니다. 즉시 적용되는 설정 자리에 씁니다. 켜지면 검정 트랙이 됩니다. 색이 아니라 primary입니다.",
  controls: [
    boolControl<SwitchProps, "checked">("checked", true),
    enumControl<SwitchProps, "size">("size", vocab("CONTROL_SIZES")),
    boolControl<SwitchProps, "disabled">("disabled"),
    textControl<TextProps, "children">("children", "알림 받기", { key: "label", target: "Text" }),
  ],
  defaults: { size: "md" },
  subject: (state) => (
    <Inline as="label" gap="sm" align="center">
      <Switch checked={flag(state, "checked")} size={pick<NonNullable<SwitchProps["size"]>>(state, "size")} disabled={flag(state, "disabled")} readOnly />
      <Text variant="body" as="span">{words(state, "label")}</Text>
    </Inline>
  ),
});
