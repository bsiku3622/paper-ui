import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Badge, Box, Button, Grid, IconButton, Inline, Pressable, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, Menu, PageHeader, useToast } from "../../../kit";
import {
  addDays, CATEGORY_ACCENT, CATEGORY_LABEL, fromKey, gradeLabel, gradeOf, groupByDate, inMonth, isForMe, majorLabel, MONTH_LABEL, monthGrid, timeLabel, toKey, weekMarkers, weekOf, WEEKDAY_LABEL,
  type CalendarEvent, type EventCategory,
} from "../lib/calendar";
import { hasRole, useClasses } from "../state";
import { BelowMd } from "../content/BelowMd";
import { Card, Count, Hint, Notice } from "../ui/parts";
import { EventForm, type Draft, type Purpose } from "./calendar/EventForm";

const MAX_CHIPS = 3;
const minuteOf = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

const DayCell = ({ date, year, month, events, selected, today, week, onPick }: { date: Date; year: number; month: number; events: CalendarEvent[]; selected: boolean; today: boolean; week: number | null; onPick: () => void }) => {
  const key = toKey(date);
  const starting = events.filter((event) => event.start === key);
  const outside = !inMonth(date, year, month);
  const holiday = starting.some((event) => event.category === "holiday") || date.getDay() === 0;
  return (
    <Surface as={Pressable} fill={outside ? undefined : "sunken"} radius="md" padding="sm" hoverable selected={selected} onPress={onPick} aria-pressed={selected} aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일, 일정 ${events.length}개`}>
      <Stack as="span" gap="xs" align="stretch" height="full">
        <Inline as="span" justify="between" align="center">
          {today ? (
            <Surface theme="inverse" radius="full" paddingX="sm"><Text as="span" variant="label" ink="inherit" numeric>{date.getDate()}</Text></Surface>
          ) : (
            <Text as="span" variant="label" ink={outside ? "tertiary" : holiday ? "error" : "primary"} strong={!outside} numeric>{date.getDate()}</Text>
          )}
          {week !== null && date.getDay() === 0 ? <Box as="span" hideBelow="md"><Text as="span" variant="label" strong={false} ink="tertiary" numeric>{week}주</Text></Box> : null}
        </Inline>
        <BelowMd>
          <Inline as="span" gap="xs" wrap>
            {starting.slice(0, 6).map((event) => <Badge key={`${event.id}-${key}`} dot size="xs" variant="soft" accent={event.personal ? "info" : CATEGORY_ACCENT[event.category]} aria-label={event.personal ? "내 일정" : CATEGORY_LABEL[event.category]} />)}
          </Inline>
        </BelowMd>
        <Stack as="span" gap="xs" hideBelow="md">
          {starting.slice(0, MAX_CHIPS).map((event) => (
            <Inline as="span" key={`${event.id}-${key}`} gap="xs" align="center" minWidth={0}>
              <Badge dot size="xs" variant="soft" accent={event.personal ? "info" : CATEGORY_ACCENT[event.category]} aria-label={event.personal ? "내 일정" : CATEGORY_LABEL[event.category]} />
              <Text as="span" variant="label" strong={false} ink={outside ? "tertiary" : "secondary"} truncate>{event.title}</Text>
            </Inline>
          ))}
          {starting.length > MAX_CHIPS ? <Text as="span" variant="label" strong={false} ink="tertiary">+{starting.length - MAX_CHIPS}</Text> : null}
        </Stack>
      </Stack>
    </Surface>
  );
};

export const CalendarPage = () => {
  const { events, personal, setPersonal, shared, setShared, requests, setRequests, session, me, major, clock } = useClasses();
  const toast = useToast();
  const now = fromKey(clock.key);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selected, setSelected] = useState<string | null>(clock.key);
  const [onlyMine, setOnlyMine] = useState(false);
  const asked = useSearchParams()[0].get("form");
  const [form, setForm] = useState<Purpose | null>(asked === "personal" || asked === "shared" || asked === "request" ? asked : null);
  const isManager = hasRole(session.role, "manager");

  const grade = gradeOf(me.stuId, new Date(year, month - 1, 1));
  const mineLabel = [grade ? `${grade}학년` : "", major.major ?? ""].filter(Boolean).join("·");
  const visible = useMemo(() => (onlyMine ? events.filter((event) => isForMe(event, grade, major.major)) : events), [events, onlyMine, grade, major.major]);
  const byDate = useMemo(() => groupByDate(visible), [visible]);
  const markers = useMemo(() => weekMarkers(events), [events]);
  const days = monthGrid(year, month);
  const dayEvents = selected ? (byDate[selected] ?? []) : [];

  const shift = (delta: number) => {
    const next = new Date(year, month - 1 + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth() + 1);
    setSelected(null);
  };
  const goToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setSelected(clock.key);
  };

  const submit = (draft: Draft) => {
    const purpose = form!;
    const base = { title: draft.title.trim(), category: draft.category, note: draft.note.trim() || null };
    if (purpose === "request") {
      setRequests((list) => [{ id: Math.max(0, ...list.map((item) => item.id)) + 1, ...base, start: draft.start, end: draft.end, grades: draft.grades, majors: draft.majors, status: "pending", reason: null, requestedBy: me.name, createdAt: `${clock.key}T${String(Math.floor(clock.minute / 60)).padStart(2, "0")}:${String(clock.minute % 60).padStart(2, "0")}:00+09:00` }, ...list]);
      toast("제안했습니다. 매니저가 확인하면 알려 드립니다");
    } else {
      const series = draft.weeks > 1 ? `s${Date.now()}` : null;
      const made: CalendarEvent[] = Array.from({ length: purpose === "personal" ? draft.weeks : 1 }, (_, index) => {
        const shiftDays = index * 7;
        return {
          id: Date.now() + index,
          ...base,
          start: toKey(addDays(fromKey(draft.start), shiftDays)),
          end: toKey(addDays(fromKey(draft.end), shiftDays)),
          mode: purpose === "personal" ? draft.mode : "allday",
          startMinute: draft.mode === "clock" && purpose === "personal" ? minuteOf(draft.startTime) : null,
          endMinute: draft.mode === "clock" && purpose === "personal" ? minuteOf(draft.endTime) : null,
          startPeriod: draft.mode === "period" && purpose === "personal" ? draft.startPeriod : null,
          endPeriod: draft.mode === "period" && purpose === "personal" ? draft.endPeriod : null,
          grades: purpose === "personal" ? [] : draft.grades,
          majors: purpose === "personal" ? [] : draft.majors,
          personal: purpose === "personal",
          seriesId: series,
        };
      });
      if (purpose === "personal") setPersonal((list) => [...list, ...made]);
      else setShared((list) => [...list, ...made]);
      toast(purpose === "personal" ? "내 일정에 넣었습니다" : "학사일정에 넣었습니다");
    }
    setSelected(draft.start);
    const start = fromKey(draft.start);
    setYear(start.getFullYear());
    setMonth(start.getMonth() + 1);
    setForm(null);
  };

  const remove = (event: CalendarEvent, series: boolean) => {
    const keep = (list: CalendarEvent[]) => list.filter((item) => (series && event.seriesId ? item.seriesId !== event.seriesId : item.id !== event.id));
    const removed = event.personal ? personal : shared;
    if (event.personal) setPersonal(keep);
    else setShared(keep);
    toast(series && event.seriesId ? "반복 일정을 모두 지웠습니다" : "일정을 지웠습니다", {
      action: { label: "되돌리기", onSelect: () => (event.personal ? setPersonal(removed) : setShared(removed)) },
    });
  };

  const decide = (id: number, approve: boolean) => {
    setRequests((list) => list.map((item) => (item.id === id ? { ...item, status: approve ? "approved" : "rejected", reason: approve ? null : "일정이 겹치거나 학교 행사로 다루기 어려운 제안입니다." } : item)));
    toast(approve ? "허용했습니다. 모두의 달력에 들어갑니다" : "거절했습니다");
  };

  const week = selected ? weekOf(fromKey(selected), markers) : null;
  const pending = requests.filter((item) => item.status === "pending");

  return (
    <>
      <PageHeader
        eyebrow="학교 일정과 내 일정"
        title="학사일정"
        description="행사와 시험, 귀가일을 한 달력에서 봅니다. 내 일정은 나만 보입니다."
        actions={
          <>
            <Button variant="hairline" onClick={goToday}>오늘</Button>
            {isManager ? <Button variant="hairline" onClick={() => setForm("shared")}>학사일정 추가</Button> : <Button variant="hairline" onClick={() => setForm("request")}>일정 제안</Button>}
            <Button variant="solid" onClick={() => setForm("personal")}><Glyph name="plus" />내 일정</Button>
          </>
        }
      />

      <Inline justify="between" align="center" gap="md" wrap>
        <Inline gap="sm" align="center">
          <IconButton variant="hairline" aria-label="이전 달" onClick={() => shift(-1)}><Glyph name="chevron-left" /></IconButton>
          <Text as="h2" variant="heading" numeric>{year}년 {MONTH_LABEL[month - 1]}</Text>
          <IconButton variant="hairline" aria-label="다음 달" onClick={() => shift(1)}><Glyph name="chevron-right" /></IconButton>
        </Inline>
        <Inline gap="sm" align="center" wrap>
          {mineLabel ? <Button variant="hairline" selected={onlyMine} onClick={() => setOnlyMine((value) => !value)}>{mineLabel} 것만</Button> : null}
        </Inline>
      </Inline>

      <Grid columns={{ base: 1, xl: "minmax(0, 1fr) 20rem" }} gap="xl" align="start">
        <Card padding="lg" label="월 달력">
          <Stack gap="sm">
            <Grid columns={7} gap="xs">
              {WEEKDAY_LABEL.map((label, index) => (
                <Inline key={label} justify="center"><Text as="span" variant="label" ink={index === 0 ? "error" : "tertiary"}>{label}</Text></Inline>
              ))}
            </Grid>
            <Grid columns={7} rows={{ base: "repeat(6, 4.75rem)", md: "repeat(6, 6.5rem)" }} gap="xs">
              {days.map((date) => {
                const key = toKey(date);
                return <DayCell key={key} date={date} year={year} month={month} events={byDate[key] ?? []} selected={selected === key} today={key === clock.key} week={weekOf(date, markers)} onPick={() => setSelected(key)} />;
              })}
            </Grid>
          </Stack>
        </Card>

        <Stack gap="xl">
          <Card padding="lg" label="고른 날">
            {selected ? (
              <>
                <Inline justify="between" align="baseline">
                  <Text as="h2" variant="heading">{fromKey(selected).getMonth() + 1}월 {fromKey(selected).getDate()}일</Text>
                  {week !== null ? <Text as="span" variant="caption" ink="tertiary" numeric>{week}주차</Text> : null}
                </Inline>
                {dayEvents.length === 0 ? <Text ink="tertiary">일정이 없습니다.</Text> : null}
                <Stack gap="md">
                  {dayEvents.map((event) => (
                    <Stack key={event.id} gap="xs">
                      <Inline gap="sm" align="start" justify="between">
                        <Inline gap="sm" align="start" minWidth={0}>
                          <Box paddingY="xs"><Badge dot size="xs" variant="soft" accent={event.personal ? "info" : CATEGORY_ACCENT[event.category]} aria-label="분류" /></Box>
                          <Stack gap="xs" minWidth={0}>
                            <Text as="span">{event.title}</Text>
                            <Text as="span" variant="caption" ink="tertiary">
                              {[event.personal ? "내 일정" : CATEGORY_LABEL[event.category], timeLabel(event), gradeLabel(event.grades), majorLabel(event.majors), event.start !== event.end ? `${event.start} → ${event.end}` : ""].filter(Boolean).join(" · ")}
                            </Text>
                            {event.note ? <Text as="span" variant="caption" ink="secondary">{event.note}</Text> : null}
                          </Stack>
                        </Inline>
                        {event.personal || (isManager && shared.some((item) => item.id === event.id)) ? (
                          <Menu
                            label={`${event.title} 일정`}
                            size="xs"
                            items={[
                              { id: "one", label: "이 일정 지우기", glyph: "trash-2", danger: true, onSelect: () => remove(event, false) },
                              ...(event.seriesId ? [{ id: "all", label: "반복 일정 모두 지우기", glyph: "trash-2" as const, danger: true, onSelect: () => remove(event, true) }] : []),
                            ]}
                          />
                        ) : null}
                      </Inline>
                    </Stack>
                  ))}
                </Stack>
                <Button variant="hairline" fullWidth onClick={() => setForm("personal")}><Glyph name="plus" />이 날에 내 일정</Button>
              </>
            ) : (
              <Text ink="tertiary">날짜를 누르면 그날 일정을 자세히 봅니다.</Text>
            )}
          </Card>

          <Card title="분류" padding="lg">
            <Stack gap="sm">
              {(Object.keys(CATEGORY_LABEL) as EventCategory[]).map((key) => (
                <Inline key={key} gap="sm" align="center">
                  <Badge dot size="xs" variant="soft" accent={CATEGORY_ACCENT[key]} aria-label="" />
                  <Text as="span" ink="secondary">{CATEGORY_LABEL[key]}</Text>
                </Inline>
              ))}
              <Inline gap="sm" align="center">
                <Badge dot size="xs" variant="soft" accent="info" aria-label="" />
                <Text as="span" ink="secondary">내 일정</Text>
              </Inline>
            </Stack>
          </Card>
        </Stack>
      </Grid>

      <Card
        title="일정 제안"
        description={isManager ? "학생들이 보낸 제안입니다. 허용하면 모두의 달력에 들어갑니다." : "내가 보낸 제안과 다른 학생이 보낸 제안의 처리 결과입니다."}
        actions={pending.length ? <Count>{pending.length}건 대기</Count> : null}
      >
        {requests.length === 0 ? (
          <Empty glyph="inbox" title="제안이 없습니다" description="학교 일정에 넣고 싶은 일이 있으면 일정 제안으로 보내세요." />
        ) : (
          <Stack gap="md">
            {requests.map((item) => (
              <Surface key={item.id} fill="sunken" radius="md" padding="md">
                <Inline justify="between" align="start" gap="md" wrap>
                  <Stack gap="xs" minWidth={0}>
                    <Inline gap="sm" align="center" wrap>
                      <Text as="span" strong>{item.title}</Text>
                      <Badge size="sm" variant="soft" accent={item.status === "approved" ? "success" : item.status === "rejected" ? "error" : "warning"}>{item.status === "approved" ? "허용" : item.status === "rejected" ? "거절" : "대기"}</Badge>
                    </Inline>
                    <Text as="span" variant="caption" ink="tertiary">
                      {[`${item.start}${item.end !== item.start ? ` → ${item.end}` : ""}`, CATEGORY_LABEL[item.category], gradeLabel(item.grades), majorLabel(item.majors), `${item.requestedBy} 제안`].filter(Boolean).join(" · ")}
                    </Text>
                    {item.note ? <Text as="span" variant="caption" ink="secondary">{item.note}</Text> : null}
                    {item.reason ? <Text as="span" variant="caption" ink="error">거절 사유 · {item.reason}</Text> : null}
                  </Stack>
                  {isManager && item.status === "pending" ? (
                    <Inline gap="sm">
                      <Button size="sm" variant="hairline" onClick={() => decide(item.id, false)}>거절</Button>
                      <Button size="sm" variant="solid" onClick={() => decide(item.id, true)}>허용</Button>
                    </Inline>
                  ) : null}
                </Inline>
              </Surface>
            ))}
          </Stack>
        )}
      </Card>

      {onlyMine ? <Notice tone="info" glyph="filter">{mineLabel} 일정과 대상이 정해지지 않은 일정만 보이고 있습니다.</Notice> : null}
      <Hint>달력에는 그날 시작하는 일정만 적습니다. 며칠에 걸친 일정은 시작하는 날에 적히고, 지나는 날에는 “진행 중”으로 셉니다.</Hint>

      <EventForm purpose={form ?? "personal"} date={selected ?? clock.key} open={form !== null} onClose={() => setForm(null)} onSubmit={submit} />
    </>
  );
};
