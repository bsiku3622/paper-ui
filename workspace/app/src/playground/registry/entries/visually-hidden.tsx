import { Pressable, Stack, Text, VisuallyHidden } from "@studio-baeks/paper-ui";

import { glyph } from "../demo";
import { defineSpec } from "../schema";
import { control } from "./examples.css";

export default defineSpec({
  name: "VisuallyHidden",
  blurb: "콘텐츠를 화면에서 숨기고 접근성 트리에 남깁니다. isFocusable은 skip link처럼 포커스될 때 보이는 콘텐츠를 만듭니다.",
  controls: [],
  defaults: {},
  subject: () => (
    <Stack gap="md" align="start">
      <Pressable className={control}>
        {glyph.plus}
        <VisuallyHidden>새 항목 추가</VisuallyHidden>
      </Pressable>
      <Text variant="caption">화면에는 아이콘만, 접근성 이름에는 숨긴 텍스트를 사용합니다.</Text>
      <VisuallyHidden isFocusable><a href="#hidden-target">본문으로 건너뛰기</a></VisuallyHidden>
      <Text id="hidden-target" tabIndex={-1}>건너뛰기 링크의 도착점</Text>
    </Stack>
  ),
});
