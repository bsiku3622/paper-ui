import { useRef, useState } from "react";

import { Box, Stack, Text, mergeProps, mergeRefs, useFocusRing, usePressable } from "@studio-baeks/paper-ui";

import { spreadOf } from "../jsx";
import { defineSpec } from "../schema";
import { control } from "./examples.css";
import { pick as inLocale, useWords } from "../../../site/locale";

const WORDS = {
  ko: { button: "Hook으로 조립한 버튼", ran: "실행: " },
  en: { button: "Button built from hooks", ran: "Ran: " },
};

export default defineSpec({
  name: "Composition",
  blurb: { ko: "mergeProps는 이벤트를 차례로 실행하고 className을 잇고 style을 키별로 합칩니다. mergeRefs는 같은 요소를 연결합니다. composeEventHandlers는 caller가 preventDefault하면 내부 동작을 건너뜁니다.", en: "mergeProps runs event handlers in turn, joins className and merges style key by key. mergeRefs connects the same element. composeEventHandlers skips the inner behaviour when the caller calls preventDefault." },
  controls: [],
  defaults: {},
  useHarness: () => {
    const forwarded = useRef<HTMLButtonElement>(null);
    const [count, setCount] = useState(0);
    const { pressProps } = usePressable({ onPress: () => setCount((value) => value + 1) });
    const { focusProps } = useFocusRing();
    return { count, forwarded, props: mergeProps(pressProps, focusProps) };
  },
  subject: (_state, { forwarded, props }, locale) =>
    spreadOf(
      <Box as="button" {...props} ref={mergeRefs(props.ref, forwarded)} type="button" className={control}>{inLocale(WORDS, locale).button}</Box>,
      "mergeProps(pressProps, focusProps)",
      Object.keys(props),
    ),
  Stage: ({ subject, harness }) => {
    const w = useWords(WORDS);
    return (
    <Stack gap="md" align="start">
      {subject}
      <Text as="output" aria-live="polite">{w.ran}{harness.count}</Text>
    </Stack>
    );
  },
});
