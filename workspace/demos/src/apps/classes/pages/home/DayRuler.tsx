// DayRuler — the whole school day on one line, to scale. Each period is as wide as it lasts, so lunch and dinner stay
// holes; the periods you have a class in are filled, the ones you don't are outlined, the class you are in is ink, and a bar
// marks where it is now. The list below the ruler answers "what is next?"; the ruler answers "what shape is today?" —
// neither stands in for the other.

import { Grid, Inline, Paint, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { hhmm, type BreakTime, type PeriodTime } from "../../data/periods";
import type { TodayClass } from "../../lib/home";
import { gapName, isBreakGap } from "../../lib/schedule";

type Segment =
  | { kind: "period"; start: number; end: number; period: number; klass: TodayClass | null }
  | { kind: "gap"; start: number; end: number; name: string; short: boolean };

const segmentsOf = (periods: readonly PeriodTime[], breaks: readonly BreakTime[], today: readonly TodayClass[]): Segment[] => {
  const out: Segment[] = [];
  periods.forEach((item, index) => {
    const before = periods[index - 1];
    if (before && item.start > before.end) {
      out.push({ kind: "gap", start: before.end, end: item.start, name: gapName(before.end, item.start, breaks), short: isBreakGap(before.end, item.start) });
    }
    out.push({ kind: "period", start: item.start, end: item.end, period: item.period, klass: today.find((klass) => klass.period === item.period) ?? null });
  });
  return out;
};

// A segment that holds "now" is cut in two with the bar between; only the wider half carries the period's number.
type Cell = { key: string; segment: Segment; bar: boolean; numbered: boolean };

export const DayRuler = ({ periods, breaks, today, minute, active }: { periods: readonly PeriodTime[]; breaks: readonly BreakTime[]; today: readonly TodayClass[]; minute: number | null; active: readonly number[] }) => {
  const segments = segmentsOf(periods, breaks, today);
  const first = periods[0]!.start;
  const last = periods[periods.length - 1]!.end;
  const live = minute !== null && minute >= first && minute < last ? minute : null;

  // Every segment is a track as many fr wide as it lasts; the bar for "now" is a track of its own between two halves.
  const tracks: string[] = [];
  const cells: Cell[] = [];
  for (const segment of segments) {
    if (live !== null && live >= segment.start && live < segment.end) {
      const before = live - segment.start;
      const after = segment.end - live;
      tracks.push(`${before}fr`, "0.125rem", `${after}fr`);
      cells.push({ key: `${segment.start}a`, segment, bar: false, numbered: before >= after }, { key: `${segment.start}bar`, segment, bar: true, numbered: false }, { key: `${segment.start}b`, segment, bar: false, numbered: after > before });
    } else {
      tracks.push(`${segment.end - segment.start}fr`);
      cells.push({ key: `${segment.start}`, segment, bar: false, numbered: true });
    }
  }

  return (
    <Stack gap="xs" role="img" aria-label={`하루 시간표, 수업 ${today.length}교시${live !== null ? `, 지금 ${hhmm(live)}` : ""}`}>
      <Grid columns={tracks.join(" ")} align="stretch" height="xs">
        {cells.map(({ key, segment, bar, numbered }) => {
          if (bar) return <Surface key={key} theme="inverse" />;
          if (segment.kind === "gap") {
            return (
              <Inline key={key} justify="center" align="center">
                {!segment.short && segment.end - segment.start > 30 && !cells.some((cell) => cell.bar && cell.segment === segment) ? <Text as="span" variant="label" strong={false} ink="tertiary" truncate>{segment.name}</Text> : null}
              </Inline>
            );
          }
          const now = active.includes(segment.period);
          const body = (
            <Inline justify="center" align="center" height="full">
              {numbered ? <Text as="span" variant="label" strong={now} ink={segment.klass ? "inherit" : "tertiary"} numeric>{segment.period}</Text> : null}
            </Inline>
          );
          if (now) return <Paint key={key} accent="primary" variant="solid" height="full">{body}</Paint>;
          return segment.klass ? (
            <Surface key={key} fill="sunken" height="full">{body}</Surface>
          ) : (
            <Surface key={key} border height="full">{body}</Surface>
          );
        })}
      </Grid>
      <Grid columns={tracks.join(" ")}>
        {cells.map((cell, index) => {
          const isFirst = index === 0;
          const isLast = index === cells.length - 1;
          const afterBar = index > 0 && cells[index - 1]!.bar;
          return (
            <Inline key={cell.key} justify={isLast ? "end" : "start"}>
              {isFirst ? (
                <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{hhmm(first)}</Text>
              ) : isLast ? (
                <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{hhmm(last)}</Text>
              ) : afterBar && live !== null ? (
                <Text as="span" variant="label" ink="primary" numeric>{hhmm(live)}</Text>
              ) : null}
            </Inline>
          );
        })}
      </Grid>
    </Stack>
  );
};
