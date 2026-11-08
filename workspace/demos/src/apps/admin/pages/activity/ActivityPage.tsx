// 활동 기록: everything that happened in the hub, newest first, grouped by day. The original had no log; with five services
// behind one login it is where "who changed that, and when" is answered. What the demo's user does shows up here at once.
// The strip at the top counts a month, the chart is a bar a day, and the filters above the list scope the list.

import { Fragment, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Badge, Button, Divider, Field, Grid, Inline, Select, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, PageHeader, SectionHeader, Stat, useFace } from "../../../../kit";
import { BarChart } from "../../content/charts";
import { SERVICE_LABEL } from "../../data/activity";
import type { ActivityEvent, ServiceId } from "../../data/types";
import { DAY, now } from "../../lib/clock";
import { dayKey, elapsed, formatClock, formatDayHeading, formatMoment, formatShortDay } from "../../lib/format";
import { LATENCY, useDelay, useDemoState } from "../../lib/hooks";
import { useAdmin } from "../../store/store";
import { ChartCard } from "../../ui/ChartCard";
import { Loading, Mono } from "../../ui/Parts";
import { Summary } from "../../ui/Summary";
import { Table, type Column } from "../../ui/Table";

const PAGE = 30;
const SERVICES = Object.keys(SERVICE_LABEL) as ServiceId[];
const RANGES = [
  { value: "all", label: "전체 기간", days: Infinity },
  { value: "today", label: "오늘", days: 1 },
  { value: "week", label: "최근 7일", days: 7 },
  { value: "month", label: "최근 30일", days: 30 },
] as const;

const dayLabel = (ms: number) => {
  const heading = formatDayHeading(ms);
  if (dayKey(ms) === dayKey(now())) return `오늘 · ${heading}`;
  return dayKey(ms) === dayKey(now() - DAY) ? `어제 · ${heading}` : heading;
};

const LevelMark = ({ level }: { level: ActivityEvent["level"] }) =>
  level === "info" ? null : <Glyph name="triangle-alert" size="caption" ink={level === "warning" ? "warning" : "error"} label={level === "warning" ? "경고" : "오류"} />;

export const ActivityPage = () => {
  const { events } = useAdmin();
  const face = useFace();
  const demo = useDemoState();
  const [params] = useSearchParams();
  const { ready } = useDelay(LATENCY.list);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [service, setService] = useState(params.get("service") ?? "all");
  const [level, setLevel] = useState(params.get("level") ?? "all");
  const [range, setRange] = useState(params.get("range") ?? "all");
  const [limit, setLimit] = useState(PAGE);

  const all = demo === "empty" ? [] : events;
  const at = now();
  const days = RANGES.find((item) => item.value === range)?.days ?? Infinity;
  const search = query.trim().toLowerCase();
  const filtered = all.filter(
    (event) =>
      (service === "all" || event.service === service) &&
      (level === "all" || event.level !== "info") &&
      (days === Infinity || event.at > at - days * DAY) &&
      (!search || [event.title, event.detail ?? "", event.actor, SERVICE_LABEL[event.service]].some((text) => text.toLowerCase().includes(search))),
  );
  const visible = filtered.slice(0, limit);

  // The month in numbers.
  const month = all.filter((event) => event.at > at - 30 * DAY);
  const warnings = month.filter((event) => event.level !== "info");
  const busiest = SERVICES.map((id) => ({ id, count: month.filter((event) => event.service === id).length })).sort((a, b) => b.count - a.count)[0];
  const lastLogin = all.find((event) => event.service === "hub" && event.title === "로그인했습니다");
  const perDay = Array.from({ length: 30 }, (_, index) => {
    const start = at - (29 - index) * DAY;
    return { day: start, count: all.filter((event) => dayKey(event.at) === dayKey(start)).length };
  });

  // Rows grouped by day, in order.
  const groups: { key: number; at: number; rows: ActivityEvent[] }[] = [];
  for (const event of visible) {
    const key = dayKey(event.at);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.rows.push(event);
    else groups.push({ key, at: event.at, rows: [event] });
  }

  const dayColumns: Column<(typeof perDay)[number]>[] = [
    { id: "day", header: "날짜", track: "minmax(8rem, 1fr)", render: (item) => <Text as="span">{formatDayHeading(item.day)}</Text> },
    { id: "count", header: "기록", track: "6rem", render: (item) => <Text as="span" numeric>{item.count}건</Text> },
  ];

  const reset = () => {
    setQuery("");
    setService("all");
    setLevel("all");
    setRange("all");
  };

  return (
    <>
      <PageHeader title="활동 기록" description="서비스에서 일어난 일을 시간순으로 모았습니다." />

      <Summary>
        <Stat label="최근 30일 기록" value={ready ? month.length : "–"} unit="건" note={ready ? `오늘 ${all.filter((event) => dayKey(event.at) === dayKey(at)).length}건` : "불러오는 중…"} />
        <Stat label="경고" value={ready ? warnings.length : "–"} unit="건" note={ready ? "비밀번호 오류, 응답 없음 같은 것" : "불러오는 중…"} tone={ready && warnings.length > 0 ? "warning" : undefined} />
        <Stat label="가장 활발한 서비스" value={ready ? SERVICE_LABEL[busiest?.id ?? "hub"] : "–"} note={ready ? `${busiest?.count ?? 0}건` : "불러오는 중…"} small />
        <Stat label="마지막 로그인" value={ready ? (lastLogin ? elapsed(lastLogin.at) : "없음") : "–"} note={ready && lastLogin ? formatMoment(lastLogin.at) : "관리자"} small />
      </Summary>

      <ChartCard
        title="하루별 활동"
        description="최근 30일, 하루에 몇 건이 남았는지"
        chart={
          <BarChart
            label="최근 30일 하루별 활동 기록 수"
            bars={perDay.map((item) => ({ key: String(item.day), value: item.count, tick: formatShortDay(item.day), heading: formatDayHeading(item.day) }))}
            format={(value) => `${value}건`}
            size="md"
            whole
          />
        }
        table={<Table label="하루별 활동" dense stackBelow="sm" rows={[...perDay].reverse()} rowKey={(item) => String(item.day)} columns={dayColumns} card={(item) => <Inline justify="between"><Text as="span">{formatDayHeading(item.day)}</Text><Text as="span" numeric>{item.count}건</Text></Inline>} />}
      />

      <Stack gap="md">
        <SectionHeader title="기록" description={`${filtered.length}건`} />
        <Grid columns={{ base: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))", xl: "minmax(12rem, 1fr) 10rem 8rem 9rem auto" }} gap="sm" align="center">
          <Field size="sm" leading={<Glyph name="search" />} aria-label="활동 기록 찾기" placeholder="제목, 내용, 사람 찾기" value={query} clearable onClear={() => setQuery("")} onChange={(event) => { setQuery(event.currentTarget.value); setLimit(PAGE); }} />
          <Select size="sm" aria-label="서비스" value={service} onChange={(event) => { setService(event.currentTarget.value); setLimit(PAGE); }}>
            <Select.Option value="all">모든 서비스</Select.Option>
            {SERVICES.map((id) => <Select.Option key={id} value={id}>{SERVICE_LABEL[id]}</Select.Option>)}
          </Select>
          <Select size="sm" aria-label="수준" value={level} onChange={(event) => { setLevel(event.currentTarget.value); setLimit(PAGE); }}>
            <Select.Option value="all">모든 수준</Select.Option>
            <Select.Option value="warning">경고만</Select.Option>
          </Select>
          <Select size="sm" aria-label="기간" value={range} onChange={(event) => { setRange(event.currentTarget.value); setLimit(PAGE); }}>
            {RANGES.map((item) => <Select.Option key={item.value} value={item.value}>{item.label}</Select.Option>)}
          </Select>
          <Button size="sm" variant="ghost" onClick={reset} disabled={!query && service === "all" && level === "all" && range === "all"}>조건 지우기</Button>
        </Grid>

        {!ready ? (
          <Loading label="활동 기록 불러오는 중" />
        ) : groups.length === 0 ? (
          <Surface {...face} radius="lg"><Empty glyph="history" title="조건에 맞는 기록이 없습니다" description="찾는 말이나 기간을 바꿔 보세요." action={<Button variant="hairline" onClick={reset}>조건 지우기</Button>} /></Surface>
        ) : (
          <Surface {...face} radius="lg" overflow="hidden">
            <Stack>
              {groups.map((group, groupIndex) => (
                <Fragment key={group.key}>
                  {groupIndex > 0 ? <Divider /> : null}
                  <Inline justify="between" align="baseline" paddingX="xl" paddingY="md">
                    <Text as="h3" variant="label" strong>{dayLabel(group.at)}</Text>
                    <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{group.rows.length}건</Text>
                  </Inline>
                  <Stack as="ul">
                    {group.rows.map((event, index) => (
                      <Stack key={event.id} as="li">
                        {index > 0 ? <Divider aria-hidden /> : null}
                        <Surface as={Grid} hoverable columns={{ base: "minmax(0, 1fr)", md: "4rem 8.5rem minmax(0, 1fr) 7rem" }} gap="sm" align="center" paddingX="xl" paddingY="md">
                          <Text as="span" variant="caption" ink="tertiary" numeric>{formatClock(event.at)}</Text>
                          <Inline gap="xs"><Badge variant="hairline" size="sm">{SERVICE_LABEL[event.service]}</Badge></Inline>
                          <Stack minWidth={0}>
                            <Inline gap="xs" minWidth={0}>
                              <Text as="span" truncate>{event.title}</Text>
                              <LevelMark level={event.level} />
                            </Inline>
                            {event.detail ? <Text as="span" variant="label" strong={false} ink="tertiary" truncate>{event.detail}</Text> : null}
                          </Stack>
                          <Text as="span" variant="caption" ink="tertiary" truncate>{event.actor}</Text>
                        </Surface>
                      </Stack>
                    ))}
                  </Stack>
                </Fragment>
              ))}
              {filtered.length > visible.length ? (
                <>
                  <Divider />
                  <Inline justify="center" padding="lg">
                    <Button variant="hairline" onClick={() => setLimit((current) => current + PAGE)}>{filtered.length - visible.length}건 더 보기</Button>
                  </Inline>
                </>
              ) : null}
            </Stack>
          </Surface>
        )}
      </Stack>
      <Text as="p" variant="caption" ink="tertiary">기록은 <Mono>30일</Mono> 동안 보관합니다. 이 데모에서는 새로 만든 기록이 브라우저에만 남습니다.</Text>
    </>
  );
};
