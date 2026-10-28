import { Link, type LinkProps } from "@studio-baeks/paper-ui";

import { stay } from "../demo";
import { defineSpec, textControl, words } from "../schema";

export default defineSpec({
  name: "Link",
  blurb: "파란 글자입니다. 포인트 색을 쓰는 몇 안 되는 자리 중 하나입니다.",
  controls: [textControl<LinkProps, "children">("children", "링크")],
  defaults: {},
  subject: (state) => <Link href="#" onClick={stay}>{words(state, "children")}</Link>,
});
