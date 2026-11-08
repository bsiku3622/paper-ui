import { Pressable, Stack, Text, VisuallyHidden } from "@studio-baeks/paper-ui";

import { glyph } from "../demo";
import { defineSpec } from "../schema";
import { control } from "./examples.css";
import { pick as inLocale } from "../../../site/locale";

const WORDS = {
  ko: { add: "새 항목 추가", note: "화면에는 아이콘만, 접근성 이름에는 숨긴 텍스트를 사용합니다.", skip: "본문으로 건너뛰기", target: "건너뛰기 링크의 도착점" },
  en: { add: "Add new item", note: "The screen shows only the icon; the hidden text is its accessible name.", skip: "Skip to content", target: "Where the skip link lands" },
};

export default defineSpec({
  name: "VisuallyHidden",
  blurb: { ko: "콘텐츠를 화면에서 숨기고 접근성 트리에 남깁니다. focusable은 skip link처럼 포커스될 때 보이는 콘텐츠를 만듭니다.", en: "Hides content from the screen and keeps it in the accessibility tree. focusable makes content that is visible when focused, like a skip link." },
  controls: [],
  defaults: {},
  subject: (_state, _harness, locale) => {
    const w = inLocale(WORDS, locale);
    return (
    <Stack gap="md" align="start">
      <Pressable className={control}>
        {glyph.plus}
        <VisuallyHidden>{w.add}</VisuallyHidden>
      </Pressable>
      <Text variant="caption">{w.note}</Text>
      <VisuallyHidden focusable><a href="#hidden-target">{w.skip}</a></VisuallyHidden>
      <Text id="hidden-target" tabIndex={-1}>{w.target}</Text>
    </Stack>
    );
  },
});
