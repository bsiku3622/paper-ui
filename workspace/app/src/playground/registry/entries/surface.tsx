import { Surface, Text, type SurfaceProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, subset, vocab } from "../schema";

export default defineSpec({
  name: "Surface",
  blurb: "Box 위에 면을 얹는 primitive입니다. fill·border·radius·elevation·theme이 면의 색과 선과 그림자의 유일한 출처이고, theme은 하위 트리 하나의 모드를 정합니다. 테마가 있으면 fill을 주지 않아도 그 모드의 canvas를 깝니다. elevation은 z와 그림자를 함께 정합니다. as로 Stack·Inline·Grid 위에 올려 써도 요소는 하나입니다.",
  controls: [
    enumControl<SurfaceProps, "fill">("fill", vocab("SURFACE_FILLS"), { initial: "raised" }),
    boolControl<SurfaceProps, "border">("border"),
    enumControl<SurfaceProps, "theme">("theme", vocab("SURFACE_THEMES")),
    enumControl<SurfaceProps, "elevation">("elevation", subset("ELEVATIONS", ["raised", "sticky", "overlay", "modal", "toast"], "base is the ground, so omitting the prop is how a Surface stays on it")),
    enumControl<SurfaceProps, "radius">("radius", vocab("SURFACE_RADII"), { initial: "md" }),
  ],
  defaults: {},
  subject: (state) => (
    <Surface
      fill={pick<NonNullable<SurfaceProps["fill"]>>(state, "fill")}
      border={flag(state, "border")}
      theme={pick<NonNullable<SurfaceProps["theme"]>>(state, "theme")}
      elevation={pick<NonNullable<SurfaceProps["elevation"]>>(state, "elevation")}
      radius={pick<NonNullable<SurfaceProps["radius"]>>(state, "radius")}
      padding="md"
      width="md"
    >
      <Text variant="caption" as="span">fill={pick(state, "fill") ?? "none"}</Text>
    </Surface>
  ),
});
