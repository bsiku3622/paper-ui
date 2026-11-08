import { useMemo, type ReactNode } from "react";

import { Button, Grid, Inline, Stack, Switch, Text } from "@studio-baeks/paper-ui";

import { Empty } from "../../../../kit";
import { subjectQuery, teacherQuery } from "../../lib/search";
import { Card, searchHref } from "../../ui/parts";
import { BarList, type Bar } from "./Bars";
import { breakdown, WEEK_SLOTS, type Bucket, type RoomUse, type SubjectCount, type TeacherLoad } from "./stats";

const NoCohort = ({ onAll }: { onAll: () => void }) => (
  <Empty glyph="filter" title="고른 학번이 없습니다" description="학번을 하나 이상 골라야 숫자가 나옵니다." action={<Button size="sm" variant="hairline" onClick={onAll}>모두 고르기</Button>} />
);

const BreakdownSwitch = ({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) => (
  <Inline as="label" gap="sm">
    <Switch size="sm" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    <Text as="span" ink="secondary">학번별 인원</Text>
  </Inline>
);

const Block = ({ title, caption, children }: { title: string; caption: string; children: ReactNode }) => (
  <Stack gap="md" minWidth={0}>
    <Stack gap="xs">
      <Text as="h3" variant="subheading">{title}</Text>
      <Text variant="caption" ink="tertiary">{caption}</Text>
    </Stack>
    {children}
  </Stack>
);

const bucketRows = (buckets: readonly Bucket[], unit: string, who: string, perCohort: boolean): Bar[] => {
  const max = Math.max(1, ...buckets.map((bucket) => bucket.count));
  return buckets.map((bucket) => ({
    key: String(bucket.value),
    label: `${bucket.value}${unit}`,
    value: bucket.count / max,
    valueText: `${bucket.count}${who}`,
    note: perCohort ? breakdown(bucket.byCohort) : undefined,
  }));
};

type Cohorts = { noCohort: boolean; onAll: () => void; perCohort: boolean; onPerCohort: (next: boolean) => void };

export const SubjectsPanel = ({ counts, noCohort, onAll, perCohort, onPerCohort }: Cohorts & { counts: readonly SubjectCount[] }) => {
  const rows = useMemo<Bar[]>(() => {
    const max = Math.max(1, ...counts.map((item) => item.students));
    return counts.map((item) => ({
      key: item.subject,
      label: item.name,
      value: item.students / max,
      valueText: `${item.students}명`,
      href: searchHref(subjectQuery(item.subject)),
      hint: `${item.name} ${item.students}명, 검색에서 열기`,
      note: perCohort ? breakdown(item.byCohort) : undefined,
    }));
  }, [counts, perCohort]);
  return (
    <Card
      title="과목별 수강 인원"
      description="고른 학번이 듣는 과목을 많이 듣는 순서로 봅니다. 줄을 누르면 검색에서 그 과목을 엽니다."
      actions={<BreakdownSwitch checked={perCohort} onChange={onPerCohort} />}
    >
      {noCohort ? <NoCohort onAll={onAll} /> : <BarList name="과목별 수강 인원" rows={rows} limit={15} />}
    </Card>
  );
};

export const DistributionPanel = ({ periods, subjects, teachers, noCohort, perCohort, onPerCohort }: Omit<Cohorts, "onAll"> & { periods: readonly Bucket[]; subjects: readonly Bucket[]; teachers: readonly Bucket[] }) => {
  const periodRows = useMemo(() => bucketRows(periods, "교시", "명", perCohort), [periods, perCohort]);
  const subjectRows = useMemo(() => bucketRows(subjects, "과목", "명", perCohort), [subjects, perCohort]);
  const teacherRows = useMemo(() => bucketRows(teachers, "교시", "명", false), [teachers]);
  const empty = <Text ink="tertiary">고른 학번이 없습니다.</Text>;
  return (
    <Card
      title="분포"
      description="학생이 한 주에 듣는 교시와 과목의 수, 교사가 가르치는 교시의 수가 어떻게 퍼져 있는지 봅니다."
      actions={<BreakdownSwitch checked={perCohort} onChange={onPerCohort} />}
    >
      <Grid columns={{ base: 1, lg: 2, xl: 3 }} gap="xl" align="start">
        <Block title="주당 교시 수" caption="학생이 한 주에 듣는 교시 수별 인원입니다.">
          {noCohort ? empty : <BarList name="주당 교시 수별 학생" rows={periodRows} dense />}
        </Block>
        <Block title="수강 과목 수" caption="학생이 이번 학기에 듣는 과목 수별 인원입니다.">
          {noCohort ? empty : <BarList name="수강 과목 수별 학생" rows={subjectRows} dense />}
        </Block>
        <Block title="교사 시수" caption="교사가 한 주에 가르치는 교시 수별 교사 수입니다. 학번과 상관없이 셉니다.">
          <BarList name="주당 교시 수별 교사" rows={teacherRows} dense />
        </Block>
      </Grid>
    </Card>
  );
};

export const StaffPanel = ({ teachers, rooms }: { teachers: readonly TeacherLoad[]; rooms: readonly RoomUse[] }) => {
  const teacherRows = useMemo<Bar[]>(() => {
    const max = Math.max(1, ...teachers.map((teacher) => teacher.periods));
    return teachers.map((teacher) => ({
      key: teacher.name,
      label: teacher.name,
      value: teacher.periods / max,
      valueText: `${teacher.periods}교시 · ${teacher.sections}분반`,
      href: searchHref(teacherQuery(teacher.name)),
      hint: `${teacher.name} 교사, 한 주 ${teacher.periods}교시 ${teacher.sections}분반. 검색에서 열기`,
    }));
  }, [teachers]);
  const roomRows = useMemo<Bar[]>(
    () =>
      rooms.map((room) => ({
        key: room.name,
        label: room.name,
        value: room.periods / WEEK_SLOTS,
        valueText: `${room.periods}/${WEEK_SLOTS}교시 · ${room.sections}분반`,
        href: searchHref(`room:${room.name}`),
        hint: `${room.name}, 한 주 ${WEEK_SLOTS}교시 가운데 ${room.periods}교시 사용. 검색에서 열기`,
      })),
    [rooms],
  );
  return (
    <Card title="교사와 강의실" description="학교 전체의 한 주를 기준으로 셉니다. 줄을 누르면 검색에서 그 교사나 강의실을 엽니다.">
      <Grid columns={{ base: 1, xl: 2 }} gap="2xl" align="start">
        <Block title="교사별 수업 시수" caption="맡은 분반이 한 주에 열리는 교시를 모두 더한 값입니다.">
          <BarList name="교사별 수업 시수" rows={teacherRows} limit={15} />
        </Block>
        <Block title="강의실 사용률" caption={`한 주 ${WEEK_SLOTS}교시 가운데 수업이 있는 교시입니다.`}>
          <BarList name="강의실 사용률" rows={roomRows} limit={15} />
        </Block>
      </Grid>
    </Card>
  );
};
