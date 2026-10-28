import { Spinner, type SpinnerProps } from "@studio-baeks/paper-ui";

import { defineSpec, enumControl, pick, textControl, vocab, words } from "../schema";

export default defineSpec({
  name: "Spinner",
  blurb: "진행 중 표시입니다. 옅은 링에 한 조각만 진해 회전으로 읽힙니다. 주기는 motion 토큰이 정하고, label이 접근성 이름이 됩니다.",
  controls: [
    enumControl<SpinnerProps, "size">("size", vocab("CONTROL_SIZES")),
    textControl<SpinnerProps, "label">("label", ""),
  ],
  defaults: { size: "md", label: "불러오는 중" },
  subject: (state) => <Spinner size={pick<NonNullable<SpinnerProps["size"]>>(state, "size")} label={words(state, "label") || undefined} />,
});
