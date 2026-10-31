import { Icon, type IconProps } from "@studio-baeks/paper-ui";

import { glyph } from "../demo";
import { defineSpec, enumControl, pick, vocab } from "../schema";

export default defineSpec({
  name: "Icon",
  blurb: "Primitive 아이콘입니다. 옆에 서는 Text 역할 이름으로 아트보드 크기를 고르고 currentColor 또는 ink로 그립니다. size를 주지 않으면 컨트롤 안에서는 그 컨트롤이 정한 크기를, 그 밖에서는 body를 쓰고, 명시한 size가 이깁니다.",
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
