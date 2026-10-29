import { Box, Text, type BoxProps } from "@studio-baeks/paper-ui";
import { CONTAINERS, DIMENSIONS, MEASURES } from "@studio-baeks/paper-ui/tokens";

import { boolControl, defineSpec, enumControl, flag, local, pick, sample, subset, vocab } from "../schema";

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
  blurb: "구조 패널입니다. surface·border·radius·elevation·theme과 padding을 얹고, width·height·min/max·overflow로 box model을 정합니다. 이름 있는 크기(dimension, measure, container, 키워드)는 class가 되고, 그 밖의 CSS 길이만 화면 고유 layout을 위해 inline으로 갑니다. elevation은 z와 그림자를 함께 정합니다. 색과 flex·position·gap 책임은 열지 않습니다.",
  controls: [
    enumControl<BoxProps, "surface">("surface", vocab("SURFACES"), { initial: "raised" }),
    boolControl<BoxProps, "border">("border"),
    enumControl<BoxProps, "theme">("theme", vocab("BOX_THEMES")),
    enumControl<BoxProps, "elevation">("elevation", subset("ELEVATIONS", ["raised", "sticky", "overlay", "modal", "toast"], "base is the ground, so omitting the prop is how a Box stays on it")),
    enumControl<BoxProps, "radius">("radius", vocab("BOX_RADII"), { initial: "md" }),
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
      surface={pick<NonNullable<BoxProps["surface"]>>(state, "surface")}
      border={flag(state, "border")}
      theme={pick<NonNullable<BoxProps["theme"]>>(state, "theme")}
      elevation={pick<NonNullable<BoxProps["elevation"]>>(state, "elevation")}
      radius={pick<NonNullable<BoxProps["radius"]>>(state, "radius")}
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
      <Text variant="caption" as="span">surface={pick(state, "surface") ?? "none"}</Text>
    </Box>
  ),
});
