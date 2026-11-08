import { Badge, type BadgeProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, faceProps, flag, pick, textControl, vocab, words } from "../schema";

export default defineSpec({
  name: "Badge",
  blurb: { ko: "상태 한 낱말입니다. accent × variant로 그리고, muted는 고른 accent의 subtle 글자입니다. dot은 앞에 상태 점을 붙입니다. 표시용이라 hover가 없습니다.", en: "One word of status. Drawn by accent × variant; muted is the chosen accent's subtle ink. dot puts a status dot in front. It is display only, so it has no hover." },
  controls: [
    enumControl<BadgeProps, "accent">("accent", vocab("ACCENTS")),
    enumControl<BadgeProps, "variant">("variant", vocab("VARIANTS")),
    enumControl<BadgeProps, "fill">("fill", vocab("SURFACE_FILLS"), { behaviorOnly: "only hairline, dashed, ghost and muted have a face to choose" }),
    boolControl<BadgeProps, "shadow">("shadow", false, { behaviorOnly: "only a face casts one: solid, soft, or a fill" }),
    boolControl<BadgeProps, "dot">("dot"),
    enumControl<BadgeProps, "size">("size", vocab("CONTROL_SIZES")),
    enumControl<BadgeProps, "fontSize">("fontSize", vocab("CONTROL_FONT_SIZES")),
    enumControl<BadgeProps, "shape">("shape", vocab("CONTROL_SHAPES")),
    enumControl<BadgeProps, "gap">("gap", vocab("SPACES"), { rootDefault: "xs", behaviorOnly: "it shows once the badge holds a dot beside its word" }),
    enumControl<BadgeProps, "align">("align", vocab("ALIGNS"), { rootDefault: "center" }),
    enumControl<BadgeProps, "justify">("justify", vocab("JUSTIFIES"), { rootDefault: "start", behaviorOnly: "it shows once the badge is wider than its content" }),
    textControl<BadgeProps, "children">("children", { ko: "진행", en: "In progress" }),
  ],
  defaults: { accent: "primary", variant: "soft", size: "md", shape: "pill" },
  sheet: { matrix: { rows: "accent", columns: "variant" }, strips: [{ key: "size" }, { key: "shape" }] },
  subject: (state) => (
    <Badge
      accent={pick<NonNullable<BadgeProps["accent"]>>(state, "accent")}
      variant={pick<NonNullable<BadgeProps["variant"]>>(state, "variant")}
      {...faceProps(state)}
      dot={flag(state, "dot")}
      size={pick<NonNullable<BadgeProps["size"]>>(state, "size")}
      fontSize={pick<NonNullable<BadgeProps["fontSize"]>>(state, "fontSize")}
      shape={pick<NonNullable<BadgeProps["shape"]>>(state, "shape")}
      gap={pick<NonNullable<BadgeProps["gap"]>>(state, "gap")}
      align={pick<NonNullable<BadgeProps["align"]>>(state, "align")}
      justify={pick<NonNullable<BadgeProps["justify"]>>(state, "justify")}
    >
      {words(state, "children")}
    </Badge>
  ),
});
