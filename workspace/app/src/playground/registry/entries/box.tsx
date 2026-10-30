import { Box, Text, type BoxProps } from "@studio-baeks/paper-ui";
import { CONTAINERS, DIMENSIONS, MEASURES } from "@studio-baeks/paper-ui/tokens";

import { defineSpec, enumControl, local, pick, sample, vocab } from "../schema";
import { boxSample } from "./examples.css";

const KEYWORDS = ["full", "fit", "min-content", "max-content"] as const;
const widths = () => sample(
  [...DIMENSIONS, ...MEASURES.map((measure) => `measure.${measure}` as const), ...CONTAINERS.map((container) => `container.${container}` as const), ...KEYWORDS],
  "width takes any CSS length; these are the names of every family",
);
const heights = () => sample([...DIMENSIONS, ...KEYWORDS], "height takes any CSS length; these are the names of every family");
const OVERFLOWS = ["visible", "hidden", "clip", "scroll", "auto"] as const;
const OVERFLOW_REASON = "Box's own overflow keywords, which are all it takes";

export default defineSpec({
  name: "Box",
  blurb: "바탕이 되는 칸입니다. padding을 얹고, width·height·min/max·overflow로 box model을 정합니다. 이름 있는 크기(dimension, measure, container, 키워드)는 class가 되고, 그 밖의 CSS 길이만 화면 고유 layout을 위해 inline으로 갑니다. 면·테두리·모서리·높이·테마는 Surface가, 색은 Paint가 맡으므로 Box에는 어떤 색도 없고, flex·position·gap 책임도 열지 않습니다.",
  controls: [
    enumControl<BoxProps, "padding">("padding", vocab("SPACES")),
    enumControl<BoxProps, "paddingX">("paddingX", vocab("SPACES")),
    enumControl<BoxProps, "paddingY">("paddingY", vocab("SPACES")),
    enumControl<BoxProps, "width">("width", widths(), { initial: "md" }),
    enumControl<BoxProps, "minWidth">("minWidth", widths()),
    enumControl<BoxProps, "maxWidth">("maxWidth", widths()),
    enumControl<BoxProps, "height">("height", heights()),
    enumControl<BoxProps, "minHeight">("minHeight", heights()),
    enumControl<BoxProps, "maxHeight">("maxHeight", heights()),
    enumControl<BoxProps, "overflow">("overflow", local<BoxProps, "overflow">()(OVERFLOWS, OVERFLOW_REASON)),
    enumControl<BoxProps, "overflowX">("overflowX", local<BoxProps, "overflowX">()(OVERFLOWS, OVERFLOW_REASON)),
    enumControl<BoxProps, "overflowY">("overflowY", local<BoxProps, "overflowY">()(OVERFLOWS, OVERFLOW_REASON)),
  ],
  defaults: {},
  subject: (state) => (
    <Box
      className={boxSample}
      padding={pick<NonNullable<BoxProps["padding"]>>(state, "padding")}
      paddingX={pick<NonNullable<BoxProps["paddingX"]>>(state, "paddingX")}
      paddingY={pick<NonNullable<BoxProps["paddingY"]>>(state, "paddingY")}
      width={pick(state, "width")}
      minWidth={pick(state, "minWidth")}
      maxWidth={pick(state, "maxWidth")}
      height={pick(state, "height")}
      minHeight={pick(state, "minHeight")}
      maxHeight={pick(state, "maxHeight")}
      overflow={pick<NonNullable<BoxProps["overflow"]>>(state, "overflow")}
      overflowX={pick<NonNullable<BoxProps["overflowX"]>>(state, "overflowX")}
      overflowY={pick<NonNullable<BoxProps["overflowY"]>>(state, "overflowY")}
    >
      <Text variant="caption" as="span">Box</Text>
    </Box>
  ),
});
