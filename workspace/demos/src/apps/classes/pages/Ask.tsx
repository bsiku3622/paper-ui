import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { PageHeader } from "../../../kit";
import { useClasses } from "../state";
import { Card } from "../ui/parts";
import { Chat } from "./ask/Chat";
import { seed } from "./ask/store";

export const AskPage = () => {
  const { data, me, clock, events, major } = useClasses();
  const [params] = useSearchParams();
  const demo = params.get("demo") === "done";
  useEffect(() => {
    if (demo) seed(["오늘 형3404 빈 교시 뭐 있어?", "오케스트라 연주회 언제야?", "기말고사 일정 알려줘"], { data, stuId: me.stuId, clockKey: clock.key, minute: clock.minute, events, major: major.major });
  }, [demo, data, me.stuId, clock.key, clock.minute, events, major.major]);

  return (
    <>
      <PageHeader eyebrow="AI에게 묻기" title="Ask" description="학교 시스템에서 찾아 답합니다. 시간표와 빈 교실, 학사일정, 시험을 묻거나 이 학기 과목의 분반을 물어보세요." />
      <Card padding="xl" label="대화">
        <Chat />
      </Card>
    </>
  );
};
