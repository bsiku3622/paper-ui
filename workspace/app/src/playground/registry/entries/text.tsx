import { Text, type TextProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, textControl, vocab, words } from "../schema";

export default defineSpec({
  name: "Text",
  blurb: "variant가 크기·굵기·잉크를 정하고, family가 서체(sans·mono)를 정합니다. 제목 위계와 텍스트 역할이 한 축에 있고, numeric은 숫자 글리프의 자리만 맞춥니다.",
  controls: [
    enumControl<TextProps, "variant">("variant", vocab("TEXT_VARIANTS")),
    enumControl<TextProps, "family">("family", vocab("TEXT_FAMILIES")),
    enumControl<TextProps, "ink">("ink", vocab("INKS"), { derived: "the omitted ink is the variant's own, so naming it changes nothing" }),
    boolControl<TextProps, "numeric">("numeric"),
    textControl<TextProps, "children">("children", "다람쥐 헌 쳇바퀴 Aa 0123"),
  ],
  defaults: { variant: "body", family: "sans" },
  subject: (state) => (
    <Text variant={pick<NonNullable<TextProps["variant"]>>(state, "variant")} family={pick<NonNullable<TextProps["family"]>>(state, "family")} ink={pick<NonNullable<TextProps["ink"]>>(state, "ink")} numeric={flag(state, "numeric")}>
      {words(state, "children")}
    </Text>
  ),
});
