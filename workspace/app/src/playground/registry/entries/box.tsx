import { Box, Text, type BoxProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pending, pick, subset, vocab } from "../schema";

const SIZES = ["xs", "sm", "md", "lg", "xl", "fit", "full"] as const;
const lengths = () => pending(SIZES, "S13", "the width family");
const overflows = () => pending(["visible", "hidden", "auto"] as const, "S13", "the overflow keywords");

export default defineSpec({
  name: "Box",
  blurb: "구조 패널입니다. surface·border·radius·elevation·theme과 padding을 얹고, width·height·min/max·overflow로 box model을 정합니다. 이름 있는 크기는 Shape sizing token이고, 실제 CSS 길이는 화면 고유 layout을 위한 통로입니다. elevation은 z와 그림자를 함께 정합니다. 색과 flex·position 책임은 열지 않습니다.",
  controls: [
    enumControl<BoxProps, "surface">("surface", vocab("SURFACES"), { initial: "raised" }),
    boolControl<BoxProps, "border">("border"),
    enumControl<BoxProps, "theme">("theme", vocab("BOX_THEMES")),
    enumControl<BoxProps, "elevation">("elevation", subset("ELEVATIONS", ["raised", "sticky", "overlay", "modal", "toast"], "base is the ground, so omitting the prop is how a Box stays on it")),
    enumControl<BoxProps, "radius">("radius", pending(["sm", "md", "lg", "full"] as const, "S13", "BOX_RADII"), { initial: "md" }),
    enumControl<BoxProps, "padding">("padding", vocab("SPACES")),
    enumControl<BoxProps, "paddingX">("paddingX", vocab("SPACES")),
    enumControl<BoxProps, "paddingY">("paddingY", vocab("SPACES")),
    enumControl<BoxProps, "gap">("gap", vocab("SPACES")),
    enumControl<BoxProps, "width">("width", lengths(), { initial: "md" }),
    enumControl<BoxProps, "minWidth">("minWidth", lengths()),
    enumControl<BoxProps, "maxWidth">("maxWidth", lengths()),
    enumControl<BoxProps, "height">("height", lengths()),
    enumControl<BoxProps, "minHeight">("minHeight", lengths()),
    enumControl<BoxProps, "maxHeight">("maxHeight", lengths()),
    enumControl<BoxProps, "overflow">("overflow", overflows()),
    enumControl<BoxProps, "overflowX">("overflowX", overflows()),
    enumControl<BoxProps, "overflowY">("overflowY", overflows()),
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
      gap={pick<NonNullable<BoxProps["gap"]>>(state, "gap")}
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
