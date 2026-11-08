import { Text, type TextProps } from "@studio-baeks/paper-ui";
import type { TextVariant } from "@studio-baeks/paper-ui/tokens";

import { answer, answerControl, boolControl, defineSpec, enumControl, flag, pick, textControl, vocab, words } from "../schema";

type Props = TextProps<TextVariant>;

export default defineSpec({
  name: "Text",
  blurb: { ko: "variant가 크기·굵기·잉크를 정하고, family가 서체(sans·mono)를 정합니다. 제목 위계와 텍스트 역할이 한 축에 있고, strong은 역할이 정한 강조 굵기를 켜고 끄며, numeric은 숫자 글리프의 자리만 맞춥니다. truncate는 줄을 바꾸는 대신 한 줄로 자릅니다.", en: "variant sets size, weight and ink, and family sets the typeface (sans, mono). The heading hierarchy and the text roles share one axis; strong turns the role's emphasis weight on and off, and numeric only aligns the digit glyphs. truncate cuts to one line instead of wrapping." },
  controls: [
    enumControl<Props, "variant">("variant", vocab("TEXT_VARIANTS")),
    enumControl<Props, "family">("family", vocab("TEXT_FAMILIES")),
    enumControl<Props, "ink">("ink", vocab("INKS"), { derived: "the omitted ink is the variant's own, so naming it changes nothing" }),
    answerControl("strong", "strong takes a boolean: omitted is the role's own weight, true the role's strong one, false the regular one"),
    boolControl<Props, "numeric">("numeric"),
    boolControl<Props, "truncate">("truncate"),
    textControl<Props, "children">("children", "다람쥐 헌 쳇바퀴 Aa 0123"),
  ],
  defaults: { variant: "body", family: "sans" },
  subject: (state) => (
    <Text variant={pick<NonNullable<Props["variant"]>>(state, "variant")} family={pick<NonNullable<Props["family"]>>(state, "family")} ink={pick<NonNullable<Props["ink"]>>(state, "ink")} strong={answer(state, "strong")} numeric={flag(state, "numeric")} truncate={flag(state, "truncate")}>
      {words(state, "children")}
    </Text>
  ),
});
