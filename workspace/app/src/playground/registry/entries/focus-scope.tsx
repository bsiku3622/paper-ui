import { useState } from "react";

import { Button, Field, FocusScope, Stack, Surface } from "@studio-baeks/paper-ui";

import { named } from "../jsx";
import { defineSpec } from "../schema";
import { pick as inLocale, useWords } from "../../../site/locale";

const WORDS = {
  ko: { group: "포커스 범위", first: "첫 입력", auto: "자동 포커스", close: "Focus scope 닫기", open: "Focus scope 열기" },
  en: { group: "Focus scope", first: "First input", auto: "Autofocus", close: "Close focus scope", open: "Open focus scope" },
};

export default defineSpec({
  name: "FocusScope",
  blurb: { ko: "자식의 초기 포커스, 범위 안의 포커스 유지, 해제 뒤 원래 요소로의 복귀를 독립적으로 고릅니다.", en: "Chooses independently the initial focus of a child, keeping focus inside the scope, and returning to the original element after release." },
  controls: [],
  defaults: {},
  gated: "the opener mounts the scope, so focus enters and returns only after a press",
  useHarness: () => {
    const [open, setOpen] = useState(false);
    return { open, setOpen };
  },
  subject: (_state, { setOpen }, locale) => {
    const w = inLocale(WORDS, locale);
    return (
    // Opened by an explicit user action; focus enters the new scope and is restored on close.
    // eslint-disable-next-line jsx-a11y/no-autofocus -- the example shows focus landing on the first input as the scope opens
    <FocusScope contain restoreFocus autoFocus>
      <Surface as={Stack} role="group" aria-label={w.group} gap="sm" padding="md" border radius="md" width="full">
        <Field aria-label={w.first} placeholder={w.auto} />
        <Button onClick={named("close", () => setOpen(false))}>{w.close}</Button>
      </Surface>
    </FocusScope>
    );
  },
  Stage: ({ subject, harness }) => {
    const w = useWords(WORDS);
    return (
    <Stack gap="md" width="full" align="start">
      <Button variant="hairline" onClick={() => harness.setOpen(true)} disabled={harness.open}>{w.open}</Button>
      {harness.open && subject}
    </Stack>
    );
  },
});
