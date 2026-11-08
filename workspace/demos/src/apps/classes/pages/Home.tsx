import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";

import { Badge, Box, Button, Divider, Grid, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Anchor, Empty, Glyph, PageHeader, Segmented, Stat, StatRow, SurfaceLink, useStored } from "../../../kit";
import { CATEGORY_ACCENT, timeLabel, weekMarkers, weekOf as termWeek } from "../lib/calendar";
import { collectSubjects, buildHome, dayBlocks, deriveHomeView, planHome } from "../lib/home";
import { duration, koreanName } from "../lib/utils";
import { path, useClasses } from "../state";
import { Card, Eyebrow, PlanMark } from "../ui/parts";
import { SubjectRow } from "../ui/SubjectAccordion";
import { termLabel } from "../data/build";
import { EXAM_PERIODS } from "../data/generated/exams";
import { DayRuler } from "./home/DayRuler";
import { Hero } from "./home/Hero";
import { MealPanel } from "./home/Meal";
import { Timeline } from "./home/Timeline";
import { usePlannedSections } from "./home/usePlan";
import { WeekGrid } from "./home/WeekGrid";

const DEMOS = [
  { id: "real", label: "지금" },
  { id: "class", label: "수업 중", key: "2026-11-04", minute: 9 * 60 + 55 },
  { id: "free", label: "공강", key: "2026-11-04", minute: 11 * 60 + 10 },
  { id: "before", label: "수업 전", key: "2026-11-04", minute: 8 * 60 },
  { id: "after", label: "수업 끝", key: "2026-11-04", minute: 21 * 60 + 40 },
  { id: "weekend", label: "주말", key: "2026-11-07", minute: 10 * 60 },
  { id: "holiday", label: "휴업", key: "2026-10-09", minute: 10 * 60 },
  { id: "exam", label: "시험 주간", key: "2026-12-08", minute: 10 * 60 },
  { id: "vacation", label: "방학", key: "2026-12-20", minute: 10 * 60 },
] as const;

const OFF_LINES = {
  vacation: ["오늘 1교시는 없습니다. 2교시도 없습니다.", "시간표가 쉬는 중입니다.", "방학에는 늦잠이 시간표입니다."],
  weekend: ["주말이 천천히 지나가길 바랍니다.", "오늘은 시간표를 덮어 둬도 됩니다.", "교시 번호가 없는 하루입니다."],
  holiday: ["달력이 하루를 비워 줬습니다.", "오늘은 종이 울리지 않습니다.", "쉬는 날에는 시간표도 쉽니다."],
} as const;

export const Home = () => {
  const { data, me, clock, events, term, tradeOpen } = useClasses();
  const params = useSearchParams()[0];
  const asked = params.get("demo");
  const [demoId, setDemoId] = useState<(typeof DEMOS)[number]["id"]>(DEMOS.find((item) => item.id === asked)?.id ?? "real");
  const demo = DEMOS.find((item) => item.id === demoId)!;
  const at = demo.id === "real" ? clock : { key: demo.key, minute: demo.minute };
  const current = useMemo(() => buildHome(data, me.stuId, at.key, at.minute, events), [data, me.stuId, at.key, at.minute, events]);

  const plannedSections = usePlannedSections(data, me.stuId, tradeOpen);
  const [shown, setShown] = useStored<"current" | "plan">("classes:home-timetable", "current");
  const wanted = params.get("view");
  useEffect(() => {
    if (wanted === "plan" || wanted === "current") setShown(wanted);
  }, [wanted, setShown]);
  const planned = shown === "plan" && plannedSections !== null;
  const departments = useMemo(() => new Map(data.subjects.map((subject) => [subject.subject, subject.department])), [data]);
  const home = useMemo(() => (planned && plannedSections ? planHome(current, plannedSections, departments) : current), [planned, plannedSections, current, departments]);
  const view = deriveHomeView(home);
  const exam = EXAM_PERIODS.find((item) => home.date >= item.visibleFrom && home.date <= item.visibleUntil);
  const subjects = useMemo(() => collectSubjects(home.week), [home.week]);
  const markers = useMemo(() => weekMarkers(events), [events]);
  const week = termWeek(new Date(`${home.date}T00:00:00`), markers);
  const [open, setOpen] = useState<string[]>([]);

  const quip = home.offReason ? (OFF_LINES[home.offReason][Number(home.date.replaceAll("-", "")) % 3] ?? null) : null;
  const blocks = dayBlocks(home);
  const upcoming = blocks.filter((block) => block.start.start > home.minute).length;

  const mine = useMemo(() => {
    const planIds = planned && plannedSections ? new Set(plannedSections.map((section) => section.id)) : null;
    return data.subjects
      .map((subject) => ({ ...subject, sections: subject.sections.filter((section) => (planIds ? planIds.has(section.id) : section.students.some((student) => student.stuId === me.stuId))) }))
      .filter((subject) => subject.sections.length > 0);
  }, [data, me.stuId, planned, plannedSections]);
  const credits = mine.reduce((sum, subject) => sum + (subject.credits ?? 0), 0);
  const weekPeriods = subjects.reduce((sum, item) => sum + item.periodCount, 0);

  return (
    <>
      <PageHeader
        eyebrow={`${termLabel(term)}학기${week ? ` · ${week}주차` : ""}`}
        title="오늘"
        description={`${me.name}님의 시간표입니다. 지금 있어야 할 교실과 오늘의 하루를 한 화면에 모았습니다.`}
        actions={
          <Stack gap="xs">
            <Eyebrow>시연 상태 — 날짜와 시각을 바꿔 다른 날의 화면을 봅니다</Eyebrow>
            <Box overflowX="auto">
              <Segmented label="시연 상태" options={DEMOS.map(({ id, label }) => ({ id, label }))} value={demoId} onChange={(id) => setDemoId(id as typeof demoId)} />
            </Box>
          </Stack>
        }
      />

      {exam ? (
        <SurfaceLink to={path("/exams")} card padding="md">
          <Inline justify="between" align="center" gap="md">
            <Inline as="span" gap="md" align="center" minWidth={0}>
              <Glyph name="clipboard-list" />
              <Stack as="span" gap="xs">
                <Text as="span" strong>{exam.kind === "final" ? "기말고사" : "중간고사"} 시험 시간표 보러 가기</Text>
                <Text as="span" variant="caption" ink="tertiary" numeric>{exam.start.slice(5).replace("-", "/")}–{exam.end.slice(5).replace("-", "/")}</Text>
              </Stack>
            </Inline>
            <Glyph name="arrow-right" ink="tertiary" />
          </Inline>
        </SurfaceLink>
      ) : null}

      {tradeOpen ? (
        <SurfaceLink to={path("/trade")} card padding="md">
          <Inline justify="between" align="center" gap="md">
            <Inline as="span" gap="sm" align="center" minWidth={0}>
              <Glyph name="repeat" />
              <Text as="span">지금은 수강 정정 기간입니다. Class Explorer와 함께 트레이드 조합을 찾아보세요.</Text>
            </Inline>
            <Glyph name="arrow-right" ink="tertiary" />
          </Inline>
        </SurfaceLink>
      ) : null}

      {plannedSections ? (
        <Inline gap="md" align="center" wrap>
          <Segmented
            label="볼 시간표"
            options={[
              { id: "current", label: "기존 시간표" },
              { id: "plan", label: "트레이드 계획" },
            ]}
            value={planned ? "plan" : "current"}
            onChange={(id) => setShown(id === "plan" ? "plan" : "current")}
          />
          {planned ? <Text variant="caption" ink="tertiary">수강 정정 페이지에서 짜 둔 계획입니다. 아직 등록된 시간표가 아닙니다.</Text> : null}
        </Inline>
      ) : null}

      <Anchor>
        <StatRow>
          <Stat label="오늘 수업" value={home.today.length} unit="교시" note={home.hasClass ? (view.freeMinutes > 0 ? `공강 ${duration(view.freeMinutes)}` : "공강 없음") : (home.offLabel ?? "")} />
          <Stat label="남은 수업" value={home.hasClass ? upcoming + (view.current ? 1 : 0) : 0} unit="개" note={!home.hasClass ? (home.offLabel ?? "") : view.next ? `다음 ${koreanName(view.next.subject)}` : "오늘은 끝났습니다"} />
          <Stat label="이번 주" value={weekPeriods} unit="교시" note={`${subjects.length}개 과목`} />
          <Stat label="이번 학기" value={credits} unit="학점" note={`${mine.length}개 과목`} />
        </StatRow>
      </Anchor>

      <Card padding="xl">
        <Grid columns={{ base: 1, lg: "minmax(0, 1fr) auto minmax(0, 15rem) auto minmax(0, 17rem)" }} gap="xl" align="stretch">
          <Hero key={`${home.date}-${demoId}-${planned}`} home={home} view={view} quip={quip} planned={planned} />
          <Inline hideBelow="lg" align="stretch"><Divider orientation="vertical" /></Inline>
          <Stack gap="md" minWidth={0}>
            <Text as="h2" variant="subheading">오늘 일정</Text>
            {home.events.length === 0 ? (
              <Text ink="tertiary">오늘 일정이 없습니다.</Text>
            ) : (
              <Stack as="ul" gap="sm">
                {home.events.slice(0, 5).map((event) => (
                  <Inline as="li" key={event.id} gap="sm" align="start">
                    <Badge dot accent={CATEGORY_ACCENT[event.category]} variant="soft" size="xs" aria-label="분류" />
                    <Stack gap="xs" minWidth={0}>
                      <Text as="span">{event.title}</Text>
                      {timeLabel(event) ? <Text as="span" variant="caption" ink="tertiary" numeric>{timeLabel(event)}</Text> : null}
                    </Stack>
                  </Inline>
                ))}
                {home.events.length > 5 ? <Text as="li" variant="caption" ink="tertiary">외 {home.events.length - 5}개</Text> : null}
              </Stack>
            )}
            <Button as={RouterLink} to={path("/calendar")} variant="ghost" size="sm"><Glyph name="calendar-days" />학사일정 전체</Button>
          </Stack>
          <Inline hideBelow="lg" align="stretch"><Divider orientation="vertical" /></Inline>
          <MealPanel today={home.date} minute={home.minute} />
        </Grid>
      </Card>

      <Grid columns={{ base: 1, lg: "minmax(0, 5fr) minmax(0, 7fr)" }} gap="xl" align="start">
        <Card title="오늘" actions={planned ? <PlanMark /> : undefined} description={home.hasClass ? `수업 ${blocks.length}개${view.freeMinutes > 0 ? ` · 공강 ${duration(view.freeMinutes)}` : ""}` : (home.offLabel ?? "")}>
          {home.hasClass && home.today.length > 0 ? (
            <Stack gap="lg">
              <DayRuler periods={home.periods} breaks={home.breaks} today={home.today} minute={home.hasClass ? home.minute : null} active={view.currentPeriods} />
              <Timeline today={home.today} periods={home.periods} minute={home.hasClass ? home.minute : null} />
            </Stack>
          ) : (
            <Empty glyph="calendar-off" title="오늘은 정해진 수업이 없습니다" description={quip ?? undefined} />
          )}
        </Card>
        <Card title="이번 학기 시간표" actions={planned ? <PlanMark /> : undefined} description={`${weekPeriods}교시 · ${subjects.length}개 과목`}>
          <WeekGrid home={home} minute={home.hasClass ? home.minute : null} markToday={home.hasClass} />
        </Card>
      </Grid>

      <Card title="이번 학기 과목" actions={planned ? <PlanMark /> : undefined} description={`${mine.length}개 과목 · ${credits}학점. 눌러서 분반과 수강생을 봅니다.`}>
        <Stack gap="sm">
          {mine.map((subject) => (
            <SubjectRow
              key={subject.subjectId}
              subject={subject}
              expanded={open.includes(subject.subject)}
              onToggle={() => setOpen((now) => (now.includes(subject.subject) ? now.filter((name) => name !== subject.subject) : [...now, subject.subject]))}
              focus={me.stuId}
            />
          ))}
        </Stack>
      </Card>
    </>
  );
};
