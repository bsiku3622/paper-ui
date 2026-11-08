// 통계 — the term's numbers counted in the browser: how many students take each subject, how the weeks and the subject
// counts are spread, how much the teachers teach and the rooms are used, and a tool that lays students' timetables over one
// another to find the periods they all have free.
//
// The four numbers on top are the summary (the Anchor); below them the sections are tabs, one at a time — the original had
// seven closed accordions. The tab and the students being compared live in the address (?tab=compare&ids=25-307,25-310).

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Button, Inline, Spinner, Stack, Text } from "@studio-baeks/paper-ui";

import { Anchor, formatNumber, Glyph, PageHeader, Stat, StatRow, Tabs, useToast } from "../../../kit";
import { termLabel } from "../data/build";
import { termIndex } from "../lib/index";
import { useClasses } from "../state";
import { Eyebrow, Hint, ScrollTabs } from "../ui/parts";
import { ComparePanel } from "./analysis/CompareTab";
import { DistributionPanel, StaffPanel, SubjectsPanel } from "./analysis/Panels";
import { roomUses, studentLoads, subjectCounts, teacherBuckets, teacherLoads } from "./analysis/stats";

const TAB_IDS = ["subjects", "distribution", "staff", "compare"] as const;

export const AnalysisPage = () => {
  const { data, term, clock } = useClasses();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const cohorts = useMemo(() => Object.keys(data.cohorts), [data]);
  const [years, setYears] = useState<string[]>(cohorts);
  // ?by=cohort starts with the people of each cohort written under every bar.
  const [perCohort, setPerCohort] = useState(params.get("by") === "cohort");
  // ?state=loading holds the recount that "새로고침" starts, for a screenshot of it.
  const [busy, setBusy] = useState(params.get("state") === "loading");
  const [updated, setUpdated] = useState(clock.minute);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // The students being compared, and the tab, are read from the address.
  const index = termIndex(data);
  const ids = useMemo(
    () =>
      (params.get("ids") ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter((id, position, list) => id !== "" && list.indexOf(id) === position && index.students.has(id)),
    [params, index],
  );
  const wanted = params.get("tab");
  const tab = TAB_IDS.find((id) => id === wanted) ?? (ids.length > 0 ? "compare" : "subjects");
  const update = (change: (next: URLSearchParams) => void) =>
    setParams(
      (now) => {
        const next = new URLSearchParams(now);
        change(next);
        return next;
      },
      { replace: true },
    );
  const setTab = (id: string) => update((next) => next.set("tab", id));
  const setIds = (list: string[]) =>
    update((next) => {
      next.set("tab", "compare");
      if (list.length > 0) next.set("ids", list.join(","));
      else next.delete("ids");
    });

  // everything counted from the term
  const counts = useMemo(() => subjectCounts(data, years), [data, years]);
  const loads = useMemo(() => studentLoads(data, years), [data, years]);
  const teachers = useMemo(() => teacherLoads(data), [data]);
  const rooms = useMemo(() => roomUses(data), [data]);
  const teacherSpread = useMemo(() => teacherBuckets(teachers), [teachers]);
  const totalPeriods = useMemo(() => teachers.reduce((sum, teacher) => sum + teacher.periods, 0), [teachers]);
  const average = counts.length > 0 ? counts.reduce((sum, item) => sum + item.students, 0) / counts.length : 0;

  const refresh = () => {
    window.clearTimeout(timer.current);
    setBusy(true);
    timer.current = window.setTimeout(() => {
      setBusy(false);
      setUpdated(clock.minute);
      toast("통계를 다시 계산했습니다");
    }, 700);
  };
  const time = `${String(Math.floor(updated / 60)).padStart(2, "0")}:${String(updated % 60).padStart(2, "0")}`;
  const noCohort = years.length === 0;
  const all = () => setYears(cohorts);

  return (
    <>
      <PageHeader
        eyebrow={`${termLabel(term)}학기`}
        title="통계"
        description="수강 인원과 교사의 수업 시수, 강의실 사용률을 학기 데이터로 셉니다. 친구들의 시간표를 겹쳐 같이 비는 교시도 찾습니다."
      />

      <Stack gap="xs">
        <Inline justify="between" align="center" gap="md" wrap>
          <Inline gap="sm" align="center" wrap role="group" aria-label="학번 거르기">
            <Eyebrow>학번</Eyebrow>
            {cohorts.map((cohort) => {
              const on = years.includes(cohort);
              return (
                <Button key={cohort} variant="hairline" size="sm" selected={on} onClick={() => setYears((now) => (now.includes(cohort) ? now.filter((item) => item !== cohort) : [...now, cohort]))}>
                  {cohort}학번<Text as="span" variant="label" strong={false} ink="tertiary" numeric>{data.cohorts[cohort]}</Text>
                </Button>
              );
            })}
            {years.length < cohorts.length ? <Button variant="ghost" size="sm" onClick={all}>전체</Button> : null}
          </Inline>
          <Inline gap="sm" align="center">
            <Text as="span" variant="caption" ink="tertiary" numeric>{time} 기준</Text>
            <Button variant="ghost" size="sm" loading={busy} loadingLabel="통계를 다시 계산하는 중" onClick={refresh}><Glyph name="refresh-cw" />새로고침</Button>
          </Inline>
        </Inline>
        <Hint>학번은 수강 인원과 분포에 적용됩니다. 교사와 강의실은 학번과 상관없이 학교 전체의 한 주를 셉니다.</Hint>
      </Stack>

      <Anchor>
        <StatRow>
          <Stat label="주간 총 시수" value={formatNumber(totalPeriods)} unit="교시" note="모든 분반의 합" />
          <Stat label="사용 중인 강의실" value={rooms.length} unit="곳" note="한 주에 한 번이라도" />
          <Stat label="수강 중인 과목" value={counts.length} unit="개" note="고른 학번 기준" />
          <Stat label="평균 수강 인원" value={average.toFixed(1)} unit="명" note="과목당 · 고른 학번" />
        </StatRow>
      </Anchor>

      {busy ? (
        <Stack align="center" gap="md" padding="3xl">
          <Spinner size="lg" label="통계를 다시 계산하는 중" />
          <Text ink="tertiary">통계를 다시 계산하고 있습니다.</Text>
        </Stack>
      ) : (
        <ScrollTabs selected={tab}>
          <Tabs
            label="통계 보기"
            value={tab}
            onChange={setTab}
            items={[
              { id: "subjects", label: "과목별 인원", panel: <SubjectsPanel counts={counts} noCohort={noCohort} onAll={all} perCohort={perCohort} onPerCohort={setPerCohort} /> },
              { id: "distribution", label: "분포", panel: <DistributionPanel periods={loads.periods} subjects={loads.subjects} teachers={teacherSpread} noCohort={noCohort} perCohort={perCohort} onPerCohort={setPerCohort} /> },
              { id: "staff", label: "교사·강의실", panel: <StaffPanel teachers={teachers} rooms={rooms} /> },
              { id: "compare", label: "시간표 비교", count: ids.length > 0 ? ids.length : undefined, panel: <ComparePanel ids={ids} onIds={setIds} seed={{ who: params.get("who") ?? undefined, cell: params.get("cell") ?? undefined }} /> },
            ]}
          />
        </ScrollTabs>
      )}
    </>
  );
};
