import { useState } from "react";

import { Button, Field, FocusScope, Pressable, Stack } from "@studio-baeks/paper-ui";

import { named } from "../jsx";
import { defineSpec } from "../schema";
import { control } from "./examples.css";

export default defineSpec({
  name: "FocusScope",
  blurb: "자식의 초기 포커스, 범위 안의 포커스 유지, 해제 뒤 원래 요소로의 복귀를 독립적으로 고릅니다.",
  controls: [],
  defaults: {},
  gated: "the opener mounts the scope, so focus enters and returns only after a press",
  useHarness: () => {
    const [open, setOpen] = useState(false);
    return { open, setOpen };
  },
  subject: (_state, { setOpen }) => (
    // Opened by an explicit user action; focus enters the new scope and is restored on close.
    // eslint-disable-next-line jsx-a11y/no-autofocus -- the example shows focus landing on the first input as the scope opens
    <FocusScope contain restoreFocus autoFocus>
      <Stack role="group" aria-label="포커스 범위" gap="sm" padding="md" border radius="md" width="full">
        <Field aria-label="첫 입력" placeholder="자동 포커스" />
        <Button onClick={named("close", () => setOpen(false))}>Focus scope 닫기</Button>
      </Stack>
    </FocusScope>
  ),
  Stage: ({ subject, harness }) => (
    <Stack gap="md" width="full" align="start">
      <Pressable className={control} onPress={() => harness.setOpen(true)} disabled={harness.open}>Focus scope 열기</Pressable>
      {harness.open && subject}
    </Stack>
  ),
});
