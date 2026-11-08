import { Marker, type MarkerProps } from "@studio-baeks/paper-ui";

import { defineSpec, textControl, words } from "../schema";

export default defineSpec({
  name: "Marker",
  blurb: { ko: "형광펜입니다. 문장 속 낱말 뒤에 칠을 깔아 눈길을 끕니다. 칠은 장식이라 상태를 말하지 않고, 글자의 크기와 굵기는 둘러싼 글자를 따릅니다. 줄이 넘어가면 줄마다 칠이 이어집니다.", en: "A highlighter. It lays paint behind a word in a sentence to draw the eye. The paint is decoration, so it says nothing about state, and the text size and weight follow the surrounding text. When the line wraps, the paint continues on each line." },
  controls: [textControl<MarkerProps, "children">("children", { ko: "이어서", en: "Continued" })],
  defaults: {},
  subject: (state) => <Marker>{words(state, "children")}</Marker>,
});
