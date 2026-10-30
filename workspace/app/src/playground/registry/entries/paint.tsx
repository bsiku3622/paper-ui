import { Paint, Text, type PaintProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, vocab } from "../schema";
import { paintSample } from "./examples.css";

export default defineSpec({
  name: "Paint",
  blurb: "Box 위에 accent × variant를 입히는 primitive입니다. accent는 의미를, variant는 시각 무게를 고르고 둘의 조합은 하나의 지도에서 옵니다. accent를 주지 않으면 칠하지 않습니다. hoverable은 포인터가 올라갈 수 있는 환경에서, 막히지 않은 대상에만 hover 색을 띄웁니다. Button과 Badge가 이 위에 섭니다.",
  controls: [
    enumControl<PaintProps, "accent">("accent", vocab("ACCENTS"), { initial: "primary" }),
    enumControl<PaintProps, "variant">("variant", vocab("VARIANTS")),
    boolControl<PaintProps, "hoverable">("hoverable"),
    boolControl<PaintProps, "aria-disabled">("aria-disabled", false, { key: "disabled", label: "aria-disabled" }),
  ],
  defaults: { variant: "solid" },
  subject: (state) => (
    <Paint
      data-testid="paint-example"
      className={paintSample}
      accent={pick<NonNullable<PaintProps["accent"]>>(state, "accent")}
      variant={pick<NonNullable<PaintProps["variant"]>>(state, "variant")}
      hoverable={flag(state, "hoverable")}
      aria-disabled={flag(state, "disabled") || undefined}
      padding="md"
      width="md"
    >
      <Text as="span" ink="inherit">accent × variant</Text>
    </Paint>
  ),
});
