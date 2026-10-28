import { Label, type LabelProps } from "@studio-baeks/paper-ui";

import { defineSpec, textControl, words } from "../schema";

export default defineSpec({
  name: "Label",
  blurb: "폼 라벨입니다. label 역할을 그대로 써서 문장형 대소문자에 semibold입니다. mono나 대문자 변환은 없습니다.",
  controls: [textControl<LabelProps, "children">("children", "이메일")],
  defaults: {},
  subject: (state) => <Label>{words(state, "children")}</Label>,
});
