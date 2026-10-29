import { Inline, type InlineProps } from "@studio-baeks/paper-ui";

import { sunkenBoxes } from "../demo";
import { boolControl, defineSpec, enumControl, flag, pick, vocab } from "../schema";

export default defineSpec({
  name: "Inline",
  blurb: "가로로 늘어놓습니다. gap·rowGap·columnGap으로 간격을, justify·align·wrap으로 한 줄 안의 배치를 정합니다.",
  controls: [
    enumControl<InlineProps, "gap">("gap", vocab("SPACES"), { initial: "sm" }),
    enumControl<InlineProps, "rowGap">("rowGap", vocab("SPACES")),
    enumControl<InlineProps, "columnGap">("columnGap", vocab("SPACES")),
    enumControl<InlineProps, "align">("align", vocab("ALIGNS"), { rootDefault: "center" }),
    enumControl<InlineProps, "justify">("justify", vocab("JUSTIFIES"), { initial: "start" }),
    boolControl<InlineProps, "wrap">("wrap"),
  ],
  defaults: {},
  subject: (state) => (
    <Inline
      gap={pick<NonNullable<InlineProps["gap"]>>(state, "gap")}
      rowGap={pick<NonNullable<InlineProps["rowGap"]>>(state, "rowGap")}
      columnGap={pick<NonNullable<InlineProps["columnGap"]>>(state, "columnGap")}
      align={pick<NonNullable<InlineProps["align"]>>(state, "align")}
      justify={pick<NonNullable<InlineProps["justify"]>>(state, "justify")}
      wrap={flag(state, "wrap")}
      width="18rem"
      height="4rem"
    >
      {sunkenBoxes(["A", "B", "C"])}
    </Inline>
  ),
});
