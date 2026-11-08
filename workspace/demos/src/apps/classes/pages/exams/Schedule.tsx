// The exam week of one period, as the days it spans: a column each where there is room (two, three or five), one under the other
// on a phone. A day without an exam stays and says so — the whole week is what is read. Each exam shows its real start and end,
// the subject, the section and the room; an exam with no date is set apart as 별도 실시, in the school's own words.

import { Badge, Divider, Grid, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../../kit";
import { hhmm } from "../../data/periods";
import { monthDay, type ExamDay, type MyExam } from "../../lib/exams";
import { duration, weekdayOf } from "../../lib/utils";

const timeOf = (exam: MyExam) => (exam.start !== null && exam.end !== null ? `${hhmm(exam.start)}–${hhmm(exam.end)}` : null);

// Where the exam is held: the room the section's rule names, or — when the rule does not decide — the rule itself.
const Room = ({ exam }: { exam: MyExam }) => (
  <Inline gap="xs" align="start">
    <Glyph name="map-pin" ink="secondary" />
    <Stack gap="xs" minWidth={0}>
      <Text as="span" strong>{exam.room ?? "분반별 시험실 확인"}</Text>
      {exam.room && exam.split ? <Text as="span" variant="caption" ink="tertiary">분반별: {exam.rules}</Text> : null}
      {!exam.room && exam.rules ? <Text as="span" variant="caption" ink="tertiary">{exam.rules}</Text> : null}
      {!exam.room && !exam.rules ? <Text as="span" variant="caption" ink="tertiary">시험실은 별도 안내를 확인하세요.</Text> : null}
    </Stack>
  </Inline>
);

const Entry = ({ exam, conflict }: { exam: MyExam; conflict: boolean }) => {
  const time = timeOf(exam);
  return (
    <Surface as="li" fill="sunken" radius="md" padding="md">
      <Stack gap="sm">
        {time && exam.start !== null && exam.end !== null ? (
          <Inline justify="between" align="baseline" gap="sm" wrap>
            <Text as="span" strong numeric>{time}</Text>
            <Text as="span" variant="caption" ink="tertiary">{duration(exam.end - exam.start)}</Text>
          </Inline>
        ) : null}
        <Stack gap="xs">
          <Text as="h4" variant="subheading">{exam.subject}</Text>
          {exam.topic ? <Text as="span" variant="caption" ink="secondary">{exam.topic}</Text> : null}
          <Inline gap="xs" align="center" wrap>
            <Text as="span" variant="caption" ink="tertiary">{exam.section} · {exam.teacher}</Text>
            {exam.ec ? <Badge size="xs" variant="soft">EC</Badge> : null}
          </Inline>
        </Stack>
        {exam.date !== null ? <Room exam={exam} /> : null}
        {exam.note ? <Text as="p" variant="caption" ink="secondary">{exam.note}</Text> : null}
        {exam.ambiguous ? <Text as="p" variant="caption" ink="tertiary">주제가 여럿인 특강이라 모두 보여 드립니다.</Text> : null}
        {conflict ? <Text as="p" variant="caption" ink="warning">다른 시험과 시간이 겹칩니다.</Text> : null}
      </Stack>
    </Surface>
  );
};

const DayColumn = ({ day, today, conflicts }: { day: ExamDay; today: boolean; conflicts: ReadonlySet<string> }) => (
  <Stack as="section" gap="md" aria-label={`${monthDay(day.date)} ${weekdayOf(day.date)}요일`} minWidth={0}>
    <Stack gap="sm">
      <Inline justify="between" align="baseline" gap="sm">
        <Inline gap="sm" align="center">
          <Text as="h3" variant="subheading">{weekdayOf(day.date)}요일</Text>
          {today ? <Badge size="xs" variant="solid">오늘</Badge> : null}
        </Inline>
        <Text as="span" variant="caption" ink="tertiary" numeric>{monthDay(day.date)}</Text>
      </Inline>
      <Divider />
    </Stack>
    {day.exams.length === 0 ? (
      <Text ink="tertiary">시험이 없는 날입니다.</Text>
    ) : (
      <Stack as="ul" gap="sm">
        {day.exams.map((exam) => (
          <Entry key={exam.key} exam={exam} conflict={conflicts.has(exam.key)} />
        ))}
      </Stack>
    )}
  </Stack>
);

export const Days = ({ days, today, conflicts }: { days: readonly ExamDay[]; today: string; conflicts: ReadonlySet<string> }) => (
  <Grid columns={{ base: 1, md: 2, lg: 3, xl: 5 }} gap="xl" align="start">
    {days.map((day) => (
      <DayColumn key={day.date} day={day} today={day.date === today} conflicts={conflicts} />
    ))}
  </Grid>
);

// Exams with no date or time: the school says to look for a separate notice, and so does this.
export const Separate = ({ exams }: { exams: readonly MyExam[] }) => (
  <Stack gap="md">
    <Stack gap="xs">
      <Text as="h3" variant="subheading">별도 실시</Text>
      <Text variant="caption" ink="tertiary">날짜와 시각이 정해지지 않은 시험입니다. 학교의 별도 안내를 확인해 주세요.</Text>
    </Stack>
    <Grid as="ul" columns={{ base: 1, md: 2, xl: 3 }} gap="md" align="start">
      {exams.map((exam) => (
        <Entry key={exam.key} exam={exam} conflict={false} />
      ))}
    </Grid>
  </Stack>
);
