import { useState } from "react";

import { Pressable, Stack, Text, type PressableProps, type PressableState } from "@studio-baeks/paper-ui";

import { named } from "../jsx";
import { boolControl, defineSpec, flag } from "../schema";
import { control } from "./examples.css";

export default defineSpec({
  name: "Pressable",
  blurb: "Native button의 입력을 press 이벤트로 통합합니다. Paper의 색·크기를 고르지 않고 active·focus-visible 상태를 제공합니다. `as`로 Selectable·Floating.Trigger 같은 부품에 press를 올립니다.",
  controls: [boolControl<PressableProps, "disabled">("disabled")],
  defaults: { disabled: false },
  useHarness: () => {
    const [count, setCount] = useState(0);
    return { count, press: () => setCount((value) => value + 1) };
  },
  subject: (state, harness) => (
    <Pressable data-testid="press-example" className={control} disabled={flag(state, "disabled")} onPress={named("handlePress", harness.press)}>
      {named('({ isActive }) => (isActive ? "누르는 중" : "실행")', ({ isActive }: PressableState) => (isActive ? "누르는 중" : "실행"))}
    </Pressable>
  ),
  Stage: ({ subject, harness }) => (
    <Stack gap="md" align="start">
      {subject}
      <Text as="output" variant="caption" aria-live="polite">실행: {harness.count}</Text>
    </Stack>
  ),
});
