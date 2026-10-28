import { Inline, type InlineProps } from "@studio-baeks/paper-ui";

import { sunkenBoxes } from "../demo";
import { boolControl, defineSpec, enumControl, flag, pending, pick, vocab } from "../schema";

export default defineSpec({
  name: "Inline",
  blurb: "가로로 늘어놓습니다. gap·justify·align·wrap으로 한 줄 안의 배치를 정합니다.",
  controls: [
    enumControl<InlineProps, "gap">("gap", vocab("SPACES"), { initial: "sm" }),
    enumControl<InlineProps, "align">("align", pending(["center", "start", "end", "baseline"] as const, "S13", "ALIGNS"), { initial: "center" }),
    enumControl<InlineProps, "justify">("justify", pending(["start", "center", "end", "between"] as const, "S13", "JUSTIFIES"), { initial: "start" }),
    boolControl<InlineProps, "wrap">("wrap"),
  ],
  defaults: { align: "center" },
  subject: (state) => (
    <Inline
      gap={pick<NonNullable<InlineProps["gap"]>>(state, "gap")}
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
