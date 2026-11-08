import { Label, type LabelProps } from "@studio-baeks/paper-ui";

import { defineSpec, textControl, words } from "../schema";

export default defineSpec({
  name: "Label",
  blurb: { ko: "폼 라벨입니다. label 역할을 그대로 써서 문장형 대소문자에 semibold입니다. mono나 대문자 변환은 없습니다.", en: "A form label. It uses the label role as it is: sentence case in semibold. There is no mono or uppercase transform." },
  controls: [textControl<LabelProps, "children">("children", { ko: "이메일", en: "Email" })],
  defaults: {},
  subject: (state) => <Label>{words(state, "children")}</Label>,
});
