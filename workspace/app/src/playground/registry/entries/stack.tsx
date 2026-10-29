import { Stack, type StackProps } from "@studio-baeks/paper-ui";

import { sunkenBoxes } from "../demo";
import { defineSpec, enumControl, pick, subset, vocab } from "../schema";

export default defineSpec({
  name: "Stack",
  blurb: "세로로 쌓습니다. gap으로 사이 간격을, align으로 가로 정렬을, justify로 세로 분배를 정합니다.",
  controls: [
    enumControl<StackProps, "gap">("gap", vocab("SPACES"), { initial: "md" }),
    enumControl<StackProps, "align">("align", subset("ALIGNS", ["start", "center", "end", "stretch"], "baseline lines up the first line of children that sit side by side, and a column has none"), { initial: "stretch" }),
    enumControl<StackProps, "justify">("justify", vocab("JUSTIFIES")),
  ],
  defaults: {},
  subject: (state) => {
    const justify = pick<NonNullable<StackProps["justify"]>>(state, "justify");
    // A distribution needs room to show.
    return (
      <Stack gap={pick<NonNullable<StackProps["gap"]>>(state, "gap")} align={pick<NonNullable<StackProps["align"]>>(state, "align")} justify={justify} width="12rem" height={justify ? "12rem" : undefined}>
        {sunkenBoxes(["하나", "둘", "셋"])}
      </Stack>
    );
  },
});
