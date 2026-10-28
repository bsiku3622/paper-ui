import { Badge, type BadgeProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pending, pick, textControl, vocab, words } from "../schema";

export default defineSpec({
  name: "Badge",
  blurb: "상태 한 낱말입니다. accent × variant로 그리고, muted는 고른 accent의 subtle 글자입니다. dot은 앞에 상태 점을 붙입니다. 표시용이라 hover가 없습니다.",
  controls: [
    enumControl<BadgeProps, "accent">("accent", vocab("ACCENTS")),
    enumControl<BadgeProps, "variant">("variant", vocab("VARIANTS")),
    boolControl<BadgeProps, "dot">("dot"),
    enumControl<BadgeProps, "size">("size", vocab("CONTROL_SIZES")),
    enumControl<BadgeProps, "fontSize">("fontSize", pending(["label", "caption", "body"] as const, "S12", "CONTROL_FONT_SIZES")),
    enumControl<BadgeProps, "shape">("shape", vocab("CONTROL_SHAPES")),
    textControl<BadgeProps, "children">("children", "진행"),
  ],
  defaults: { accent: "primary", variant: "soft", size: "md", shape: "rounded" },
  subject: (state) => (
    <Badge
      accent={pick<NonNullable<BadgeProps["accent"]>>(state, "accent")}
      variant={pick<NonNullable<BadgeProps["variant"]>>(state, "variant")}
      dot={flag(state, "dot")}
      size={pick<NonNullable<BadgeProps["size"]>>(state, "size")}
      fontSize={pick<NonNullable<BadgeProps["fontSize"]>>(state, "fontSize")}
      shape={pick<NonNullable<BadgeProps["shape"]>>(state, "shape")}
    >
      {words(state, "children")}
    </Badge>
  ),
});
