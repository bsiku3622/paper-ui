import { useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import { Button, Stack, Text } from "@studio-baeks/paper-ui";

import { useStored } from "../../../kit";
import { courseOf } from "../data/catalog";
import { TRACKS } from "../data/majors";
import { particleRo, koreanName } from "../lib/utils";
import { termIndex } from "../lib";
import { path, useClasses } from "../state";
import { Dialog, Notice } from "./parts";
import { MajorPicker } from "./MajorPicker";

export const MajorPrompt = () => {
  const { major, setMajor, data, me, clock } = useClasses();
  const [params, setParams] = useSearchParams();
  const [snoozed, setSnoozed] = useStored<string>("classes:major-snoozed", "");
  const [choice, setChoice] = useState<string | null>(null);
  const forced = params.get("prompt") === "major";
  const onSettings = useLocation().pathname.startsWith(path("/about"));
  const open = forced || (!major.answered && snoozed !== clock.key && !onSettings);

  const suggestion = useMemo(() => {
    const entry = termIndex(data).students.get(me.stuId);
    const by = new Map<string, string[]>();
    for (const name of entry?.subjects ?? []) {
      const department = courseOf(name)?.department ?? courseOf(name.replace(/\(EC\)$/, ""))?.department;
      if (department && TRACKS.includes(department)) by.set(department, [...(by.get(department) ?? []), koreanName(name)]);
    }
    const best = [...by.entries()].sort((a, b) => b[1].length - a[1].length)[0];
    return best ? { track: best[0], courses: best[1] } : null;
  }, [data, me.stuId]);

  const close = () => {
    if (forced) setParams({}, { replace: true });
    else setSnoozed(clock.key);
  };
  const answer = (track: string | null) => {
    setMajor({ major: track, answered: true });
    if (forced) setParams({}, { replace: true });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => { if (!next) close(); }}
      title="전공을 입력해 주세요"
      description="학사일정과 Ask의 답을 내 전공에 맞춰 보여 드리려고 묻습니다. 심화필수 전공 트랙은 3학년 2학기까지 바꿀 수 있어서, 고른 뒤에도 설정에서 언제든 고칠 수 있습니다."
      footer={
        <>
          <Button variant="ghost" onClick={close}>나중에</Button>
          <Button variant="hairline" onClick={() => answer(null)}>아직 정하지 않았어요</Button>
          <Button variant="solid" disabled={!choice} onClick={() => choice && answer(choice)}>{choice ? `${choice}${particleRo(choice)} 저장` : "트랙을 골라 주세요"}</Button>
        </>
      }
    >
      <Stack gap="md">
        {suggestion ? (
          <Notice tone="info" glyph="lightbulb">
            <Stack as="span" gap="xs">
              <Text as="span" strong ink="inherit">수강 이력으로 보면 {suggestion.track} 트랙 같아요</Text>
              <Text as="span" variant="caption" ink="inherit">{suggestion.courses.join(" · ")} — 짐작이라 틀릴 수 있어요. 맞으면 아래에서 직접 눌러 주세요.</Text>
            </Stack>
          </Notice>
        ) : null}
        <MajorPicker value={choice} onChange={setChoice} suggested={suggestion?.track} />
      </Stack>
    </Dialog>
  );
};
