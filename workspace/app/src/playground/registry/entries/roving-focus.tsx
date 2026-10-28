import { useState } from "react";

import { Button, Pressable, RovingFocus, Stack, Text, type RovingFocusProps } from "@studio-baeks/paper-ui";

import { named } from "../jsx";
import { boolControl, defineSpec, enumControl, flag, local, pick } from "../schema";
import { control, roving } from "./examples.css";

export default defineSpec({
  name: "RovingFocus",
  blurb: "그룹의 Tab 진입점을 하나로 유지합니다. 방향키·Home·End, RTL, 비활성 항목, 제거 뒤 focus 이동을 관리합니다.",
  controls: [
    enumControl<RovingFocusProps, "orientation">("orientation", local<RovingFocusProps, "orientation">()(["horizontal", "vertical", "both"], "ORIENTATIONS plus RovingFocus's own 'both'")),
    enumControl<RovingFocusProps, "dir">("dir", local<RovingFocusProps, "dir">()(["ltr", "rtl"], "the two writing directions")),
    boolControl<RovingFocusProps, "loop">("loop", true, { behaviorOnly: "wrapping happens on a key press, which a static render does not show" }),
  ],
  defaults: { orientation: "horizontal", dir: "ltr", loop: false },
  useHarness: () => {
    const [last, setLast] = useState(true);
    return { last, remove: () => setLast(false), restore: () => setLast(true) };
  },
  subject: (state, { last, remove }) => (
    <RovingFocus
      role="toolbar"
      aria-label="텍스트 도구"
      className={roving}
      orientation={pick<NonNullable<RovingFocusProps["orientation"]>>(state, "orientation")}
      dir={pick<NonNullable<RovingFocusProps["dir"]>>(state, "dir")}
      loop={flag(state, "loop")}
    >
      <RovingFocus.Item value="bold" className={control}>굵게</RovingFocus.Item>
      <RovingFocus.Item value="italic" disabled className={control}>기울임</RovingFocus.Item>
      <RovingFocus.Item as={Pressable} value="underline" className={control}>밑줄</RovingFocus.Item>
      {last && <RovingFocus.Item value="remove" className={control} onClick={named("remove", remove)}>이 항목 제거</RovingFocus.Item>}
    </RovingFocus>
  ),
  Stage: ({ subject, harness }) => (
    <Stack gap="md" align="start">
      {subject}
      <Button onClick={harness.restore}>항목 복원</Button>
      <Text variant="caption">Tab으로 들어온 뒤 방향키·Home·End로 탐색합니다. 기울임은 건너뜁니다.</Text>
    </Stack>
  ),
});
