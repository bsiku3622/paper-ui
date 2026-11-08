import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Button, Divider, Inline, Spinner, Stack, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, PageHeader, Segmented } from "../../../kit";
import { termLabel, TERMS } from "../data/build";
import { countdown, examConflicts, examDays, KIND_LABEL, myExams, periodsOf } from "../lib/exams";
import { useClasses } from "../state";
import { Card, Hint, Notice } from "../ui/parts";
import { Days, Separate } from "./exams/Schedule";
import { Summary } from "./exams/Summary";

const LOADING_MS = 450;

export const ExamsPage = () => {
  const { me, clock, term, setTerm } = useClasses();
  const [params, setParams] = useSearchParams();
  const periods = useMemo(() => periodsOf(term), [term]);
  const asked = params.get("period");
  const kind = periods.find((period) => period.kind === asked)?.kind ?? periods[periods.length - 1]?.kind ?? "";

  const [shown, setShown] = useState(kind);
  useEffect(() => {
    if (shown === kind) return;
    const timer = window.setTimeout(() => setShown(kind), LOADING_MS);
    return () => window.clearTimeout(timer);
  }, [kind, shown]);
  const loading = shown !== kind;

  const all = useMemo(() => periods.map((period) => myExams(period, me.stuId)), [periods, me.stuId]);
  const mine = all.find((item) => item.period.kind === shown) ?? all[all.length - 1];

  const header = (
    <PageHeader
      eyebrow={`${me.name} · ${me.stuId}`}
      title="시험"
      description="이번 학기 수강 과목의 시험을 날짜별로 봅니다. 학교가 공지한 시험 시간표에서 내 과목을 이름으로 찾아 맞췄습니다."
      actions={
        periods.length > 0 ? (
          <Segmented
            label="시험 종류"
            options={periods.map((period) => ({ id: period.kind, label: KIND_LABEL[period.kind] ?? period.kind, count: all.find((item) => item.period.key === period.key)?.exams.length }))}
            value={kind}
            onChange={(id) => setParams({ period: id }, { replace: true })}
          />
        ) : null
      }
    />
  );

  if (!mine) {
    const posted = TERMS.find((item) => periodsOf(item).length > 0);
    return (
      <>
        {header}
        <Card>
          <Empty
            glyph="clipboard-list"
            title={`${termLabel(term)}학기에 등록된 시험 시간표가 없습니다`}
            description="학교가 시험 시간표를 공지하면 이 자리에 내 시험이 나옵니다."
            action={posted ? <Button size="sm" variant="hairline" onClick={() => setTerm(posted)}>{termLabel(posted)}학기 보기</Button> : undefined}
          />
        </Card>
      </>
    );
  }

  if (loading) {
    return (
      <>
        {header}
        <Card label="시험 시간표를 불러오는 중">
          <Stack align="center" padding="3xl"><Spinner size="lg" label="시험 시간표를 불러오는 중" /></Stack>
        </Card>
      </>
    );
  }

  const days = examDays(mine.period, mine.exams);
  const separate = mine.exams.filter((exam) => exam.date === null);
  const conflicts = examConflicts(mine.exams);

  return (
    <>
      {header}
      <Summary mine={mine} count={countdown(mine.exams, clock)} days={days.length} />

      {conflicts.size > 0 ? <Notice tone="warning" glyph="triangle-alert">시험 시간이 겹치는 과목이 있습니다. 두 과목의 일정을 모두 표시했으니 담당 교사의 안내를 확인하세요.</Notice> : null}

      <Card title="시험 일정" description="시험이 없는 날도 한 칸씩 남겨 시험 주간 전체를 보여 줍니다." gap="xl">
        {mine.exams.length === 0 ? <Empty glyph="clipboard-list" title="이 시험 기간에 내 시험이 없습니다" description="이번 학기에 듣는 과목이 이 시험 시간표에 없습니다." /> : null}
        <Days days={days} today={clock.key} conflicts={conflicts} />
        {separate.length > 0 ? (
          <>
            <Divider />
            <Separate exams={separate} />
          </>
        ) : null}
        {mine.missing.length > 0 ? (
          <>
            <Divider />
            <Stack gap="xs">
              <Inline gap="sm" align="start">
                <Glyph name="info" ink="tertiary" />
                <Text ink="secondary">시험 시간표에 없는 과목 — {mine.missing.join(", ")}</Text>
              </Inline>
              <Hint>수강 중인 {mine.subjects}과목 중 {mine.missing.length}과목입니다. 실기·실험 과목이거나 별도 안내가 있는 과목일 수 있습니다.</Hint>
            </Stack>
          </>
        ) : null}
      </Card>

      <Hint>시험실은 평소 수업 강의실과 다를 수 있습니다. 분반을 가리지 못하는 시험은 학교가 적은 배정 안내를 그대로 보여 드립니다.</Hint>
    </>
  );
};
