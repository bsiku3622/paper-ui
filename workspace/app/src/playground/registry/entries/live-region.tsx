import { useState } from "react";

import { Button, LiveRegion, Stack, Text, announce, type LiveRegionProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, local, pick } from "../schema";
import { useWords } from "../../../site/locale";

const WORDS = {
  ko: { none: "아직 알릴 내용이 없습니다.", saved: (n: number) => `${n}번째로 저장했습니다.`, announced: "저장했습니다.", update: "영역 내용 바꾸기", call: "announce() 호출", note: "영역의 글자가 바뀌면 보조 기술이 읽습니다. announce()는 화면에 아무것도 남기지 않고 읽히기만 합니다." },
  en: { none: "Nothing to announce yet.", saved: (n: number) => `Saved ${n} ${n === 1 ? "time" : "times"}.`, announced: "Saved.", update: "Change the region's content", call: "Call announce()", note: "Assistive technology reads the region when its text changes. announce() leaves nothing on screen; it is only read." },
};

export default defineSpec({
  name: "LiveRegion",
  blurb: { ko: "보조 기술이 지켜보는 영역입니다. 처음부터 마운트해 두고 내용만 바꾸며, polite는 status로 · assertive는 alert로 읽힙니다. 한 번 알리고 사라지는 메시지는 announce()로 보냅니다.", en: "An area that assistive technology watches. Mount it from the start and change only its content; polite is read as status, assertive as alert. A message that is announced once and gone goes through announce()." },
  controls: [
    enumControl<LiveRegionProps, "politeness">("politeness", local<LiveRegionProps, "politeness">()(["polite", "assertive"], "LiveRegion's own two levels")),
    boolControl<LiveRegionProps, "atomic">("atomic", true, { behaviorOnly: "atomic changes what a reader says after an update, which a static render does not show" }),
  ],
  defaults: { politeness: "polite", atomic: true },
  useHarness: () => {
    const w = useWords(WORDS);
    const [count, setCount] = useState(0);
    return {
      message: count === 0 ? w.none : w.saved(count),
      update: () => setCount(count + 1),
    };
  },
  subject: (state, { message }) => (
    <LiveRegion data-testid="live-region" politeness={pick<NonNullable<LiveRegionProps["politeness"]>>(state, "politeness")} atomic={flag(state, "atomic")}>
      {message}
    </LiveRegion>
  ),
  Stage: ({ subject, state, harness }) => {
    const w = useWords(WORDS);
    return (
    <Stack gap="md" align="start" paddingY="xl">
      {subject}
      <Button variant="hairline" onClick={harness.update}>{w.update}</Button>
      <Button variant="hairline" onClick={() => announce(w.announced, { politeness: pick<NonNullable<LiveRegionProps["politeness"]>>(state, "politeness") })}>{w.call}</Button>
      <Text variant="caption">{w.note}</Text>
    </Stack>
    );
  },
});
