import { Stack, Text } from "@studio-baeks/paper-ui";

import { Anchor, Stat, StatRow } from "../../../../kit";
import { hhmm } from "../../data/periods";
import { dayLabel, rangeLabel, type Countdown, type MyExams } from "../../lib/exams";

const dday = (count: Countdown) => (count.kind === "ahead" ? `D-${count.days}` : count.kind === "today" ? "D-DAY" : count.kind === "over" ? "종료" : "—");

const next = (count: Countdown): string => {
  switch (count.kind) {
    case "ahead":
      return `${dayLabel(count.exam.date!)} ${count.exam.start !== null ? hhmm(count.exam.start) : ""} ${count.exam.subject}`.replace(/\s+/g, " ");
    case "today":
      return `오늘 ${count.exam.start !== null ? hhmm(count.exam.start) : ""} ${count.exam.subject}`.replace(/\s+/g, " ");
    case "over":
      return `${count.since}일 전에 끝났습니다`;
    default:
      return "날짜가 정해진 내 시험이 없습니다";
  }
};

export const Summary = ({ mine, count, days }: { mine: MyExams; count: Countdown; days: number }) => {
  const { period, exams, missing, subjects } = mine;
  const separate = exams.filter((exam) => exam.date === null).length;
  return (
    <Anchor>
      <Stack gap="lg">
        <Stack gap="xs">
          <Text as="h2" variant="subheading">{period.title}</Text>
          <Text variant="caption" ink="tertiary">{rangeLabel(period)} · {days}일간</Text>
        </Stack>
        <StatRow>
          <Stat label="다음 시험" value={dday(count)} note={next(count)} />
          <Stat label="내 시험" value={exams.length} unit="개" note={separate > 0 ? `별도 실시 ${separate}개 포함` : exams.length > 0 ? `${exams.length}개 모두 날짜가 있습니다` : "이 시험 기간에는 내 시험이 없습니다"} />
          <Stat label="시험이 있는 과목" value={subjects - missing.length} unit={`/ ${subjects}과목`} note={missing.length > 0 ? `${missing.length}과목은 시간표에 없습니다` : "모든 과목에 시험이 있습니다"} />
        </StatRow>
      </Stack>
    </Anchor>
  );
};
