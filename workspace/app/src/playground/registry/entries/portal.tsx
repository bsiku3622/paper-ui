import { useState } from "react";

import { Portal, Pressable, Surface, Text, useResolvedTheme } from "@studio-baeks/paper-ui";

import { named } from "../jsx";
import { defineSpec } from "../schema";
import { control, portalNote } from "./examples.css";
import { pick as inLocale } from "../../../site/locale";

const WORDS = {
  ko: { open: "Portal 열기", close: "Portal 닫기", note: "body로 옮겨진 내용 · useResolvedTheme(): " },
  en: { open: "Open Portal", close: "Close Portal", note: "Content moved to body · useResolvedTheme(): " },
};

type PortalExampleProps = { openLabel: string; closeLabel: string; note: string };

const PortalExample = ({ openLabel, closeLabel, note }: PortalExampleProps) => {
  const [open, setOpen] = useState(false);
  const mode = useResolvedTheme();
  return (
    <>
      <Pressable className={control} onPress={() => setOpen((value) => !value)}>{open ? closeLabel : openLabel}</Pressable>
      {open ? (
        <Portal>
          <Surface className={portalNote} fill="raised" border radius="md" padding="md" elevation="overlay">
            <Text variant="caption">{note}{mode}</Text>
          </Surface>
        </Portal>
      ) : null}
    </>
  );
};

export default defineSpec({
  name: "Portal",
  blurb: { ko: "자식을 container(기본은 document.body)로 옮깁니다. 하나뿐인 root(display contents)가 열린 자리의 테마를 다시 걸어, 옮겨진 내용도 열린 자리의 모드로 그려지고, 열린 자리의 방향과 덮어쓴 Shape·Layout·Typography 원본도 함께 옮겨집니다. Floating의 panel과 backdrop이 이 길로 옮겨집니다.", en: "Moves its children into a container (document.body by default). The single root (display contents) reapplies the theme of where it was opened, so moved content is drawn in that place's mode, and the direction and any overridden Shape, Layout and Typography sources move with it. The panel and backdrop of Floating travel this way." },
  controls: [],
  defaults: {},
  parts: {
    PortalExample: named(
      `const PortalExample = ({ openLabel, closeLabel, note }) => {
  const [open, setOpen] = useState(false);
  const mode = useResolvedTheme();
  return (
    <>
      <Pressable onPress={() => setOpen((value) => !value)}>{open ? closeLabel : openLabel}</Pressable>
      {open ? (
        <Portal>
          <Surface fill="raised" border radius="md" padding="md" elevation="overlay">
            <Text variant="caption">{note}{mode}</Text>
          </Surface>
        </Portal>
      ) : null}
    </>
  );
};`,
      PortalExample,
    ),
  },
  subject: (_state, _harness, locale) => {
    const w = inLocale(WORDS, locale);
    return (
    <Surface theme="inverse" border radius="md" padding="md" width="md">
      <PortalExample openLabel={w.open} closeLabel={w.close} note={w.note} />
    </Surface>
    );
  },
});
