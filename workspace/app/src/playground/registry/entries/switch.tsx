import { Inline, Switch, Text, type SwitchProps, type TextProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, textControl, vocab, words } from "../schema";

export default defineSpec({
  name: "Switch",
  blurb: { ko: "켬·끔 토글입니다. 즉시 적용되는 설정 자리에 씁니다. 켜진 트랙은 primary의 solid 면이고, 꺼진 트랙은 control.track 면에 inset 그림자가 진 홈입니다. 손잡이는 트랙 높이에 맞춘 원입니다.", en: "An on/off toggle. Use it for settings that apply at once. The on track is a primary solid face, and the off track is a groove on the control.track face with an inset shadow. The thumb is a circle that fits the track height." },
  controls: [
    boolControl<SwitchProps, "checked">("checked", true),
    enumControl<SwitchProps, "status">("status", vocab("CHOICE_STATUSES")),
    enumControl<SwitchProps, "size">("size", vocab("CONTROL_SIZES")),
    boolControl<SwitchProps, "disabled">("disabled"),
    textControl<TextProps, "children">("children", { ko: "알림 받기", en: "Notifications" }, { key: "label", target: "Text" }),
  ],
  defaults: { size: "md" },
  sheet: { matrix: { rows: "status", columns: "checked" }, strips: [{ key: "size" }] },
  subject: (state) => (
    <Inline as="label" gap="sm" align="center">
      <Switch checked={flag(state, "checked")} status={pick<NonNullable<SwitchProps["status"]>>(state, "status")} size={pick<NonNullable<SwitchProps["size"]>>(state, "size")} disabled={flag(state, "disabled")} readOnly />
      <Text variant="body" as="span">{words(state, "label")}</Text>
    </Inline>
  ),
});
