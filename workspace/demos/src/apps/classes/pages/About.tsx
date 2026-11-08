import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Badge, Button, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { clearStored, Glyph, PageHeader, Segmented, useToast } from "../../../kit";
import { divisionOf } from "../data/majors";
import { particleRo } from "../lib/utils";
import { path, type Role, useClasses } from "../state";
import { Card, Dialog, Eyebrow, Hint, Pair } from "../ui/parts";
import { MajorPicker } from "../ui/MajorPicker";
import { Devices } from "./about/Devices";
import { Guide } from "./about/Guide";

const ROLES = [
  { id: "user", label: "학생" },
  { id: "manager", label: "매니저" },
  { id: "admin", label: "관리자" },
] as const;

const MajorSettings = () => {
  const { major, setMajor } = useClasses();
  const toast = useToast();
  const [choice, setChoice] = useState<string | null>(major.major);
  const changed = choice !== major.major;
  const save = (track: string | null) => {
    setMajor({ major: track, answered: true });
    setChoice(track);
    toast(track ? `전공을 ${track}${particleRo(track)} 저장했습니다` : "전공을 정하지 않은 것으로 저장했습니다");
  };
  return (
    <Card title="전공" description="심화필수 전공 트랙입니다. 학사일정의 “내 학년·전공 것만”과 Ask의 “내 일정”이 이 값을 씁니다. 3학년 2학기까지 바꿀 수 있습니다.">
      <Inline gap="sm" align="center" wrap>
        <Eyebrow>지금</Eyebrow>
        {major.answered ? (
          major.major ? (
            <>
              <Badge variant="solid" size="md">{major.major}</Badge>
              <Text as="span" ink="tertiary">{divisionOf(major.major)}</Text>
            </>
          ) : (
            <Badge variant="soft" size="md">아직 정하지 않음</Badge>
          )
        ) : (
          <Badge variant="soft" size="md" accent="warning">아직 답하지 않음</Badge>
        )}
      </Inline>
      <MajorPicker value={choice} onChange={setChoice} />
      <Inline gap="sm" justify="end" wrap>
        <Button variant="ghost" onClick={() => save(null)}>미정으로 두기</Button>
        <Button variant="solid" disabled={!choice || (!changed && major.answered)} onClick={() => save(choice)}>{choice ? `${choice}${particleRo(choice)} 저장` : "트랙을 골라 주세요"}</Button>
      </Inline>
      <Hint>저장하는 것은 트랙 이름 하나입니다. 누가 어떤 트랙을 골랐는지는 관리자에게도 보이지 않고, 관리자는 트랙별 인원 수만 봅니다.</Hint>
    </Card>
  );
};

export const AboutPage = () => {
  const { session, setRole, setMajor, major } = useClasses();
  const toast = useToast();
  const [reset, setReset] = useState(false);

  return (
    <>
      <PageHeader eyebrow="앱" title="설정" description="사용법을 읽고, 전공과 로그인한 기기를 관리합니다." />
      <Guide />
      <MajorSettings />
      <Devices />

      <Card title="시연" description="이 앱은 데모라서 계정의 권한을 바꿔 가며 화면이 어떻게 달라지는지 볼 수 있습니다.">
        <Stack gap="md">
          <Stack gap="sm">
            <Eyebrow>이 계정의 권한</Eyebrow>
            <Segmented label="권한" value={session.role} options={ROLES.map(({ id, label }) => ({ id, label }))} onChange={(id) => { setRole(id as Role); toast(`${ROLES.find((item) => item.id === id)?.label ?? ""} 권한으로 바꿨습니다`); }} />
            <Hint>학생은 학사일정을 “제안”하고, 매니저는 일정을 추가하고 제안을 허용·거절하고, 관리자는 거기에 관리 화면이 더해집니다.</Hint>
          </Stack>
          <Inline gap="sm" wrap>
            <Button variant="hairline" onClick={() => { setMajor({ major: major.major, answered: false }); toast("다음 화면에서 전공을 다시 묻습니다"); }}>전공 질문 다시 받기</Button>
            <Button variant="hairline" as={RouterLink} to={`${path()}?prompt=major`}>전공 질문 미리 보기</Button>
            <Button variant="hairline" accent="error" onClick={() => setReset(true)}><Glyph name="history" />처음 상태로</Button>
          </Inline>
        </Stack>
      </Card>

      <Card title="앱 정보">
        <Stack gap="sm">
          <Pair label="이름">KSA Class Explorer — 한국과학영재학교 수업 탐색 서비스</Pair>
          <Pair label="데이터">학교 수업 정보 · 학사일정 · 급식 (이 화면의 값은 모두 만든 것입니다)</Pair>
          <Pair label="버전"><Inline gap="xs" align="center"><Text as="span" numeric>v0.1.0</Text><Badge size="xs" variant="solid">beta</Badge></Inline></Pair>
          <Inline><Button as={RouterLink} to={path("/privacy")} variant="ghost" size="sm"><Glyph name="shield-check" />개인정보처리방침</Button></Inline>
        </Stack>
      </Card>

      <Dialog
        open={reset}
        onOpenChange={setReset}
        title="처음 상태로 돌릴까요?"
        description="이 앱이 이 기기에 저장한 것을 모두 지웁니다 — 내 일정, 친구, 자몽 기록, 올린 자료, 수강 정정 계획, 설정."
        size="measure.xs"
        footer={<><Button variant="ghost" onClick={() => setReset(false)}>취소</Button><Button variant="solid" accent="error" onClick={() => { clearStored("classes:"); window.location.assign(path()); }}>모두 지우기</Button></>}
      >
        <Text ink="secondary">되돌릴 수 없습니다. 로그인 상태도 처음으로 돌아가 이 화면이 다시 열립니다.</Text>
      </Dialog>
    </>
  );
};
