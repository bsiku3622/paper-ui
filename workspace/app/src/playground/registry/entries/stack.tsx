import { Stack, type StackProps } from "@studio-baeks/paper-ui";

import { sunkenBoxes } from "../demo";
import { defineSpec, enumControl, pending, pick, vocab } from "../schema";

export default defineSpec({
  name: "Stack",
  blurb: "세로로 쌓습니다. gap으로 사이 간격을, align으로 가로 정렬을 정합니다.",
  controls: [
    enumControl<StackProps, "gap">("gap", vocab("SPACES"), { initial: "md" }),
    enumControl<StackProps, "align">("align", pending(["stretch", "start", "center", "end"] as const, "S13", "ALIGNS"), { initial: "stretch" }),
  ],
  defaults: {},
  subject: (state) => (
    <Stack gap={pick<NonNullable<StackProps["gap"]>>(state, "gap")} align={pick<NonNullable<StackProps["align"]>>(state, "align")} width="12rem">
      {sunkenBoxes(["하나", "둘", "셋"])}
    </Stack>
  ),
});
