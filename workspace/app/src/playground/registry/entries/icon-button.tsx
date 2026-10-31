import { IconButton, type IconButtonProps } from "@studio-baeks/paper-ui";

import { glyph } from "../demo";
import { boolControl, defineSpec, enumControl, flag, pick, vocab } from "../schema";

export default defineSpec({
  name: "IconButton",
  blurb: "아이콘만 담는 정사각 버튼입니다. Button과 분리해 iconSize와 접근성 이름을 명시합니다. 안의 Icon은 iconSize를 주지 않으면 컨트롤 높이를 따릅니다.",
  controls: [
    enumControl<IconButtonProps, "accent">("accent", vocab("ACCENTS")),
    enumControl<IconButtonProps, "variant">("variant", vocab("VARIANTS")),
    enumControl<IconButtonProps, "size">("size", vocab("CONTROL_SIZES")),
    enumControl<IconButtonProps, "shape">("shape", vocab("CONTROL_SHAPES")),
    enumControl<IconButtonProps, "iconSize">("iconSize", vocab("ICON_SIZES"), { omitted: "auto", derived: "the omitted size is the control's own icon size, body at md, so naming it there changes nothing" }),
    boolControl<IconButtonProps, "disabled">("disabled"),
  ],
  defaults: { accent: "primary", variant: "solid", size: "md", shape: "rounded" },
  subject: (state) => (
    <IconButton
      accent={pick<NonNullable<IconButtonProps["accent"]>>(state, "accent")}
      variant={pick<NonNullable<IconButtonProps["variant"]>>(state, "variant")}
      size={pick<NonNullable<IconButtonProps["size"]>>(state, "size")}
      shape={pick<NonNullable<IconButtonProps["shape"]>>(state, "shape")}
      iconSize={pick<NonNullable<IconButtonProps["iconSize"]>>(state, "iconSize")}
      disabled={flag(state, "disabled")}
      aria-label="추가"
    >
      {glyph.plus}
    </IconButton>
  ),
});
