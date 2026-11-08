import { Icon, type IconProps } from "@studio-baeks/paper-ui";

import { glyph } from "../demo";
import { defineSpec, enumControl, pick, vocab } from "../schema";
import { pick as inLocale } from "../../../site/locale";

const WORDS = {
  ko: { info: "정보" },
  en: { info: "Information" },
};

export default defineSpec({
  name: "Icon",
  blurb: { ko: "Primitive 아이콘입니다. 옆에 서는 Text 역할 이름으로 아트보드 크기를 고르고 currentColor 또는 ink로 그립니다. size를 주지 않으면 컨트롤 안에서는 그 컨트롤이 정한 크기를, 그 밖에서는 body를 쓰고, 명시한 size가 이깁니다.", en: "The primitive icon. The artboard size is chosen by the name of the Text role beside it, and it is drawn in currentColor or ink. Without size it takes the size its control sets, and outside a control it uses body; an explicit size wins." },
  controls: [
    enumControl<IconProps, "ink">("ink", vocab("INKS")),
    enumControl<IconProps, "size">("size", vocab("ICON_SIZES"), { omitted: "auto" }),
  ],
  defaults: {},
  subject: (state, _harness, locale) => {
    const w = inLocale(WORDS, locale);
    return (
    <Icon aria-label={w.info} ink={pick<NonNullable<IconProps["ink"]>>(state, "ink")} size={pick<NonNullable<IconProps["size"]>>(state, "size")}>
      {glyph.info}
    </Icon>
    );
  },
});
