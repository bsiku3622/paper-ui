import { useState } from "react";

import { Button, LiveRegion, Stack, Text, announce, type LiveRegionProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, local, pick } from "../schema";

export default defineSpec({
  name: "LiveRegion",
  blurb: "보조 기술이 지켜보는 영역입니다. 처음부터 마운트해 두고 내용만 바꾸며, polite는 status로 · assertive는 alert로 읽힙니다. 한 번 알리고 사라지는 메시지는 announce()로 보냅니다.",
  controls: [
    enumControl<LiveRegionProps, "politeness">("politeness", local<LiveRegionProps, "politeness">()(["polite", "assertive"], "LiveRegion's own two levels")),
    boolControl<LiveRegionProps, "atomic">("atomic", true, { behaviorOnly: "atomic changes what a reader says after an update, which a static render does not show" }),
  ],
  defaults: { politeness: "polite", atomic: true },
  useHarness: () => {
    const [message, setMessage] = useState("아직 알릴 내용이 없습니다.");
    const [count, setCount] = useState(0);
    return {
      message,
      update: () => {
        setCount(count + 1);
        setMessage(`${count + 1}번째로 저장했습니다.`);
      },
    };
  },
  subject: (state, { message }) => (
    <LiveRegion data-testid="live-region" politeness={pick<NonNullable<LiveRegionProps["politeness"]>>(state, "politeness")} atomic={flag(state, "atomic")}>
      {message}
    </LiveRegion>
  ),
  Stage: ({ subject, state, harness }) => (
    <Stack gap="md" align="start" paddingY="xl">
      {subject}
      <Button variant="hairline" onClick={harness.update}>영역 내용 바꾸기</Button>
      <Button variant="hairline" onClick={() => announce("저장했습니다.", { politeness: pick<NonNullable<LiveRegionProps["politeness"]>>(state, "politeness") })}>announce() 호출</Button>
      <Text variant="caption">영역의 글자가 바뀌면 보조 기술이 읽습니다. announce()는 화면에 아무것도 남기지 않고 읽히기만 합니다.</Text>
    </Stack>
  ),
});
