import { useState } from "react";

import { Button, Pressable, RovingFocus, Stack, Text, type RovingFocusProps } from "@studio-baeks/paper-ui";

import { named } from "../jsx";
import { boolControl, defineSpec, enumControl, flag, local, pick } from "../schema";
import { control, roving } from "./examples.css";
import { pick as inLocale, useWords } from "../../../site/locale";

const WORDS = {
  ko: { label: "텍스트 도구", bold: "굵게", italic: "기울임", underline: "밑줄", remove: "이 항목 제거", restore: "항목 복원", note: "Tab으로 들어온 뒤 방향키·Home·End로 탐색합니다. 기울임은 건너뜁니다." },
  en: { label: "Text tools", bold: "Bold", italic: "Italic", underline: "Underline", remove: "Remove this item", restore: "Restore item", note: "Tab in, then move with the arrow keys, Home and End. Italic is skipped." },
};

export default defineSpec({
  name: "RovingFocus",
  blurb: { ko: "그룹의 Tab 진입점을 하나로 유지합니다. 방향키·Home·End, RTL, 비활성 항목, 제거 뒤 focus 이동을 관리합니다.", en: "Keeps one Tab entry point for the group. It manages arrow keys, Home and End, RTL, disabled items, and where focus goes after a removal." },
  controls: [
    enumControl<RovingFocusProps, "orientation">("orientation", local<RovingFocusProps, "orientation">()(["horizontal", "vertical", "both"], "ORIENTATIONS plus RovingFocus's own 'both'")),
    enumControl<RovingFocusProps, "dir">("dir", local<RovingFocusProps, "dir">()(["ltr", "rtl"], "the two writing directions"), { omitted: "inherit" }),
    boolControl<RovingFocusProps, "loop">("loop", true, { behaviorOnly: "wrapping happens on a key press, which a static render does not show" }),
  ],
  defaults: { orientation: "horizontal", loop: false },
  useHarness: () => {
    const [last, setLast] = useState(true);
    return { last, remove: () => setLast(false), restore: () => setLast(true) };
  },
  subject: (state, { last, remove }, locale) => {
    const w = inLocale(WORDS, locale);
    return (
    <RovingFocus
      role="toolbar"
      aria-label={w.label}
      className={roving}
      orientation={pick<NonNullable<RovingFocusProps["orientation"]>>(state, "orientation")}
      dir={pick<NonNullable<RovingFocusProps["dir"]>>(state, "dir")}
      loop={flag(state, "loop")}
    >
      <RovingFocus.Item value="bold" className={control}>{w.bold}</RovingFocus.Item>
      <RovingFocus.Item value="italic" disabled className={control}>{w.italic}</RovingFocus.Item>
      <RovingFocus.Item as={Pressable} value="underline" className={control}>{w.underline}</RovingFocus.Item>
      {last && <RovingFocus.Item value="remove" className={control} onClick={named("remove", remove)}>{w.remove}</RovingFocus.Item>}
    </RovingFocus>
    );
  },
  Stage: ({ subject, harness }) => {
    const w = useWords(WORDS);
    return (
    <Stack gap="md" align="start">
      {subject}
      <Button onClick={harness.restore}>{w.restore}</Button>
      <Text variant="caption">{w.note}</Text>
    </Stack>
    );
  },
});
