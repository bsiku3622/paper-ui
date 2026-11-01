import { useState } from "react";

import { Portal, Pressable, Surface, Text, useResolvedTheme } from "@studio-baeks/paper-ui";

import { named } from "../jsx";
import { defineSpec } from "../schema";
import { control, portalNote } from "./examples.css";

// Reads the mode the portal root re-established where its children landed.
const PortalExample = () => {
  const [open, setOpen] = useState(false);
  const mode = useResolvedTheme();
  return (
    <>
      <Pressable className={control} onPress={() => setOpen((value) => !value)}>{open ? "Portal 닫기" : "Portal 열기"}</Pressable>
      {open ? (
        <Portal>
          <Surface className={portalNote} fill="raised" border radius="md" padding="md" elevation="overlay">
            <Text variant="caption">body로 옮겨진 내용 · useResolvedTheme(): {mode}</Text>
          </Surface>
        </Portal>
      ) : null}
    </>
  );
};

export default defineSpec({
  name: "Portal",
  blurb: "자식을 container(기본은 document.body)로 옮깁니다. 하나뿐인 root(display contents)가 열린 자리의 테마를 다시 걸어, 옮겨진 내용도 열린 자리의 모드로 그려지고, 열린 자리의 방향과 덮어쓴 Shape·Layout·Typography 원본도 함께 옮겨집니다. Floating의 panel과 backdrop이 이 길로 옮겨집니다.",
  controls: [],
  defaults: {},
  parts: {
    PortalExample: named(
      `const PortalExample = () => {
  const [open, setOpen] = useState(false);
  const mode = useResolvedTheme();
  return (
    <>
      <Pressable onPress={() => setOpen((value) => !value)}>{open ? "Portal 닫기" : "Portal 열기"}</Pressable>
      {open ? (
        <Portal>
          <Surface fill="raised" border radius="md" padding="md" elevation="overlay">
            <Text variant="caption">body로 옮겨진 내용 · useResolvedTheme(): {mode}</Text>
          </Surface>
        </Portal>
      ) : null}
    </>
  );
};`,
      PortalExample,
    ),
  },
  subject: () => (
    <Surface theme="inverse" border radius="md" padding="md" width="md">
      <PortalExample />
    </Surface>
  ),
});
