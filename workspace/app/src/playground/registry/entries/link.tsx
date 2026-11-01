import type { ElementType } from "react";

import { Link, type LinkProps } from "@studio-baeks/paper-ui";

import { stay } from "../demo";
import { defineSpec, enumControl, pick, sample, textControl, vocab, words } from "../schema";

export default defineSpec({
  name: "Link",
  blurb: "딴 데로 가는 글자입니다. 색은 링크 역할이고, 밑줄이 링크임을 알립니다. 문장 안 링크는 늘 밑줄을 긋고(always), 위치가 링크임을 말해 주는 단독 링크만 가리킬 때 긋습니다(hover). as에 라우터의 Link를 주면 태그 하나만 그립니다. as가 button이면 button reset을 받아 링크와 같은 모습입니다.",
  controls: [
    enumControl<LinkProps<ElementType>, "as">("as", sample(["a", "span"] as const, "the tags a link can stand on; as also takes a router's link component")),
    enumControl<LinkProps, "underline">("underline", vocab("LINK_UNDERLINES")),
    textControl<LinkProps, "children">("children", "링크"),
  ],
  defaults: { as: "a", underline: "always" },
  subject: (state) => {
    const underline = pick<NonNullable<LinkProps["underline"]>>(state, "underline");
    return pick(state, "as") === "span" ? <Link as="span" underline={underline}>{words(state, "children")}</Link> : <Link href="#" onClick={stay} underline={underline}>{words(state, "children")}</Link>;
  },
});
