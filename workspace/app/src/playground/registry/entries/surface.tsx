import { Surface, Text, type SurfaceProps } from "@studio-baeks/paper-ui";
import { LINE_SIDES, type LineSide } from "@studio-baeks/paper-ui/tokens";

import { boolControl, defineSpec, enumControl, flag, pick, sample, subset, vocab } from "../schema";

export default defineSpec({
  name: "Surface",
  blurb: "Box 위에 면을 얹는 primitive입니다. fill·border·radius·shadow·elevation·theme이 면의 색과 선과 그림자의 유일한 출처이고, theme은 하위 트리 하나의 모드를 정합니다. 테마가 있으면 fill을 주지 않아도 그 모드의 canvas를 깝니다. elevation은 position과 z와 그림자를 한 번에 정하고, 지면에 붙은 면은 prop을 생략합니다. hoverable은 면을 항목으로 만들어 포인터·눌림·선택이 중립 tint로 드러나게 하고, selected는 data-selected를 답니다. as로 Stack·Inline·Grid 위에 올려 써도 요소는 하나입니다.",
  controls: [
    enumControl<SurfaceProps, "fill">("fill", vocab("SURFACE_FILLS"), { initial: "raised" }),
    enumControl<{ border: LineSide | "true" }, "border">("border", sample(["true", ...LINE_SIDES], "border takes true for the whole way round, or one of the line's sides")),
    enumControl<SurfaceProps, "theme">("theme", vocab("SURFACE_THEMES")),
    boolControl<SurfaceProps, "shadow">("shadow", false, { behaviorOnly: "only a fill casts one, and an elevation's shadow wins" }),
    enumControl<SurfaceProps, "elevation">("elevation", vocab("ELEVATIONS")),
    enumControl<SurfaceProps, "top">("top", subset("SPACES", ["xs", "sm", "md", "lg", "xl"], "a sticky face stops close to the edge; the larger steps are page distances", ["none"]), { behaviorOnly: "only a sticky face stops, and only once the page scrolls" }),
    enumControl<SurfaceProps, "radius">("radius", vocab("SURFACE_RADII"), { initial: "md" }),
    boolControl<SurfaceProps, "hoverable">("hoverable"),
    boolControl<SurfaceProps, "selected">("selected"),
  ],
  defaults: {},
  subject: (state) => (
    <Surface
      data-testid="surface-example"
      {...({ fill: pick<NonNullable<SurfaceProps["fill"]>>(state, "fill"), shadow: flag(state, "shadow") } as { fill?: undefined; shadow?: false })}
      border={pick(state, "border") === "true" ? true : pick<LineSide>(state, "border")}
      theme={pick<NonNullable<SurfaceProps["theme"]>>(state, "theme")}
      elevation={pick<NonNullable<SurfaceProps["elevation"]>>(state, "elevation")}
      top={pick<NonNullable<SurfaceProps["top"]>>(state, "top")}
      radius={pick<NonNullable<SurfaceProps["radius"]>>(state, "radius")}
      hoverable={flag(state, "hoverable")}
      selected={flag(state, "selected")}
      padding="md"
      width="md"
    >
      <Text variant="caption" as="span">fill={pick(state, "fill") ?? "none"}</Text>
    </Surface>
  ),
});
