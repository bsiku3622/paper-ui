import { useState } from "react";

import { Pressable, Stack, Text, type PressableProps, type PressableState } from "@studio-baeks/paper-ui";

import { named } from "../jsx";
import { boolControl, defineSpec, enumControl, flag, local, pick } from "../schema";
import { control } from "./examples.css";
import { pick as inLocale, useWords } from "../../../site/locale";

const WORDS = {
  ko: { pressing: "누르는 중", run: "실행", ran: "실행: " },
  en: { pressing: "Pressing", run: "Run", ran: "Ran: " },
};

export default defineSpec({
  name: "Pressable",
  blurb: { ko: "Native button의 입력을 press 이벤트로 통합합니다. Paper의 색·크기를 고르지 않고 active·focus-visible 상태를 제공하며, 키보드 포커스 링은 그 판정에서 스스로 그립니다. as로 Selectable·Floating.Trigger 같은 부품에 press를 올립니다. motion press는 누르는 동안 눌림 한 단계만큼 내려앉는 움직임과 포인터 커서, 비활성의 모습을 입히고 색은 입히지 않습니다. focusable은 비활성인 대상을 Tab 순서에 남기고 aria-disabled로 알립니다.", en: "Unifies the input of a native button into press events. It does not choose Paper's colour or size; it provides the active and focus-visible states, and draws the keyboard focus ring itself from that judgement. as lifts press onto parts such as Selectable and Floating.Trigger. motion press gives a press-down movement of one step, a pointer cursor and the disabled look, and no colour. focusable keeps a disabled target in the Tab order and reports it with aria-disabled." },
  controls: [
    boolControl<PressableProps, "disabled">("disabled"),
    boolControl<PressableProps, "focusable">("focusable", false, { behaviorOnly: "focusable shows only on a disabled target" }),
    enumControl<PressableProps, "motion">("motion", local<PressableProps, "motion">()(["none", "press"], "Pressable's own two motions: none, or the 1px press of a button")),
  ],
  defaults: { disabled: false, motion: "none" },
  useHarness: () => {
    const [count, setCount] = useState(0);
    return { count, press: () => setCount((value) => value + 1) };
  },
  subject: (state, harness, locale) => {
    const w = inLocale(WORDS, locale);
    return (
    <Pressable data-testid="press-example" className={control} disabled={flag(state, "disabled")} focusable={flag(state, "focusable")} motion={pick<NonNullable<PressableProps["motion"]>>(state, "motion")} onPress={named("handlePress", harness.press)}>
      {named(`({ isActive }) => (isActive ? "${w.pressing}" : "${w.run}")`, ({ isActive }: PressableState) => (isActive ? w.pressing : w.run))}
    </Pressable>
    );
  },
  Stage: ({ subject, harness }) => {
    const w = useWords(WORDS);
    return (
    <Stack gap="md" align="start">
      {subject}
      <Text as="output" variant="caption" aria-live="polite">{w.ran}{harness.count}</Text>
    </Stack>
    );
  },
});
