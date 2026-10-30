import { useRef, useState } from "react";

import { Box, Stack, Text, mergeProps, mergeRefs, useFocusRing, usePressable } from "@studio-baeks/paper-ui";

import { spreadOf } from "../jsx";
import { defineSpec } from "../schema";
import { control } from "./examples.css";

export default defineSpec({
  name: "Composition",
  blurb: "mergeProps는 이벤트를 병합하고 mergeRefs는 같은 요소를 연결합니다. composeEventHandlers는 preventDefault로 내부 동작을 취소하는 경로입니다.",
  controls: [],
  defaults: {},
  useHarness: () => {
    const ref = useRef<HTMLButtonElement>(null);
    const forwarded = useRef<HTMLButtonElement>(null);
    const [count, setCount] = useState(0);
    const { pressProps, isPressed } = usePressable({ onPress: () => setCount((value) => value + 1) }, ref);
    const { focusProps, isFocusVisible } = useFocusRing();
    const states = { "data-pressed": isPressed || undefined, "data-focus-visible": isFocusVisible || undefined };
    return { count, ref, forwarded, props: { ...mergeProps(pressProps, focusProps), ...states } };
  },
  subject: (_state, { ref, forwarded, props }) =>
    spreadOf(
      <Box as="button" {...props} ref={mergeRefs(ref, forwarded)} type="button" className={control}>Hook으로 조립한 버튼</Box>,
      "mergeProps(pressProps, focusProps)",
      Object.keys(props),
    ),
  Stage: ({ subject, harness }) => (
    <Stack gap="md" align="start">
      {subject}
      <Text as="output" aria-live="polite">실행: {harness.count}</Text>
    </Stack>
  ),
});
