import { Icon, type IconProps } from "@studio-baeks/paper-ui";

import { glyph } from "../demo";
import { defineSpec, enumControl, pick, vocab } from "../schema";

export default defineSpec({
  name: "Icon",
  blurb: "Primitive 아이콘입니다. 옆에 서는 Text 역할 이름으로 아트보드 크기를 고르고 currentColor 또는 ink로 그립니다.",
  controls: [
    enumControl<IconProps, "ink">("ink", vocab("INKS")),
    enumControl<IconProps, "size">("size", vocab("ICON_SIZES")),
  ],
  defaults: { size: "body" },
  subject: (state) => (
    <Icon aria-label="정보" ink={pick<NonNullable<IconProps["ink"]>>(state, "ink")} size={pick<NonNullable<IconProps["size"]>>(state, "size")}>
      {glyph.info}
    </Icon>
  ),
});
