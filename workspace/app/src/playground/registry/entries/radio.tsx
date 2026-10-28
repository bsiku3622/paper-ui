import { Inline, Radio, Text, type RadioProps, type TextProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, textControl, vocab, words } from "../schema";

export default defineSpec({
  name: "Radio",
  blurb: "여럿 중 하나를 고르는 개별 입력입니다. 관련 선택지는 화면에서 묶습니다.",
  controls: [
    boolControl<RadioProps, "checked">("checked", true),
    enumControl<RadioProps, "size">("size", vocab("CONTROL_SIZES")),
    boolControl<RadioProps, "disabled">("disabled"),
    textControl<TextProps, "children">("children", "옵션", { key: "label", target: "Text" }),
  ],
  defaults: { size: "md" },
  subject: (state) => (
    <Inline as="label" gap="sm" align="center">
      <Radio checked={flag(state, "checked")} size={pick<NonNullable<RadioProps["size"]>>(state, "size")} disabled={flag(state, "disabled")} readOnly />
      <Text variant="body" as="span">{words(state, "label")}</Text>
    </Inline>
  ),
});
