import { Inline, Switch, Text, type SwitchProps, type TextProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, textControl, vocab, words } from "../schema";

export default defineSpec({
  name: "Switch",
  blurb: "켬·끔 토글입니다. 즉시 적용되는 설정 자리에 씁니다. 켜지면 검정 트랙이 되고, 꺼진 트랙은 옅은 테를 두릅니다. 색이 아니라 primary입니다.",
  controls: [
    boolControl<SwitchProps, "checked">("checked", true),
    enumControl<SwitchProps, "status">("status", vocab("CHOICE_STATUSES")),
    enumControl<SwitchProps, "size">("size", vocab("CONTROL_SIZES")),
    boolControl<SwitchProps, "disabled">("disabled"),
    textControl<TextProps, "children">("children", "알림 받기", { key: "label", target: "Text" }),
  ],
  defaults: { size: "md" },
  subject: (state) => (
    <Inline as="label" gap="sm" align="center">
      <Switch checked={flag(state, "checked")} status={pick<NonNullable<SwitchProps["status"]>>(state, "status")} size={pick<NonNullable<SwitchProps["size"]>>(state, "size")} disabled={flag(state, "disabled")} readOnly />
      <Text variant="body" as="span">{words(state, "label")}</Text>
    </Inline>
  ),
});
