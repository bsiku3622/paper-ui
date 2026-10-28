import { Text, type TextProps } from "@studio-baeks/paper-ui";

import { inkOptions } from "../demo";
import { defineSpec, enumControl, pick, textControl, vocab, words } from "../schema";

export default defineSpec({
  name: "Text",
  blurb: "variant가 크기·굵기·잉크를 정하고, family가 서체(sans·mono)를 정합니다. 제목 위계와 텍스트 역할이 한 축에 있습니다.",
  controls: [
    enumControl<TextProps, "variant">("variant", vocab("TEXT_VARIANTS")),
    enumControl<TextProps, "family">("family", vocab("TEXT_FAMILIES")),
    enumControl<TextProps, "ink">("ink", inkOptions()),
    textControl<TextProps, "children">("children", "다람쥐 헌 쳇바퀴 Aa 0123"),
  ],
  defaults: { variant: "body", family: "sans" },
  subject: (state) => (
    <Text variant={pick<NonNullable<TextProps["variant"]>>(state, "variant")} family={pick<NonNullable<TextProps["family"]>>(state, "family")} ink={pick<NonNullable<TextProps["ink"]>>(state, "ink")}>
      {words(state, "children")}
    </Text>
  ),
});
