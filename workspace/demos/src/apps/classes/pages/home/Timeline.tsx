import { Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { SurfaceLink } from "../../../../kit";
import { hhmm, type PeriodTime } from "../../data/periods";
import { blocksOf, type DayBlock, type TodayClass } from "../../lib/home";
import { sectionQuery } from "../../lib/search";
import { koreanName, periodRuns, sectionNumber } from "../../lib/utils";
import { searchHref } from "../../ui/parts";

type Row = { kind: "class"; block: DayBlock } | { kind: "free"; period: PeriodTime };

export const Timeline = ({ today, periods, minute }: { today: readonly TodayClass[]; periods: readonly PeriodTime[]; minute: number | null }) => {
  const blocks = blocksOf(today, periods);
  if (blocks.length === 0) return null;
  const firstPeriod = blocks[0]!.periods[0]!;
  const lastPeriod = blocks[blocks.length - 1]!.periods.slice(-1)[0]!;
  const rows: Row[] = [];
  for (let period = firstPeriod; period <= lastPeriod; ) {
    const block = blocks.find((item) => item.periods[0] === period);
    if (block) {
      rows.push({ kind: "class", block });
      period += block.periods.length;
    } else {
      const time = periods.find((item) => item.period === period);
      if (time) rows.push({ kind: "free", period: time });
      period += 1;
    }
  }

  return (
    <Stack as="ul" gap="xs" aria-label="오늘 수업 목록">
      {rows.map((row) => {
        const start = row.kind === "class" ? row.block.start.start : row.period.start;
        const end = row.kind === "class" ? row.block.end.end : row.period.end;
        const now = minute !== null && minute >= start && minute < end;
        const past = minute !== null && minute >= end;
        const time = (
          <Stack gap="xs" width="xs">
            <Text as="span" ink={past ? "tertiary" : "primary"} numeric strong={now}>{hhmm(start)}</Text>
            <Text as="span" variant="label" strong={false} ink="tertiary">{row.kind === "class" ? periodRuns(row.block.periods) : `${row.period.period}교시`}</Text>
          </Stack>
        );
        if (row.kind === "free") {
          return (
            <Surface as="li" key={`free-${row.period.period}`} selected={now} paddingX="md" paddingY="sm" radius="md">
              <Inline gap="md" align="start">
                {time}
                <Text as="span" ink="tertiary">공강</Text>
              </Inline>
            </Surface>
          );
        }
        const { klass } = row.block;
        return (
          <Stack as="li" key={`class-${klass.period}`}>
            <SurfaceLink to={searchHref(sectionQuery(klass.subject, klass.section))} paddingX="md" paddingY="sm" radius="md" selected={now} aria-label={`${koreanName(klass.subject)} ${klass.room} 보기`}>
              <Inline gap="md" align="start" justify="between">
                <Inline as="span" gap="md" align="start" minWidth={0}>
                  {time}
                  <Stack as="span" gap="xs" minWidth={0}>
                    <Text as="span" ink={past ? "secondary" : "primary"} strong={now} truncate>{koreanName(klass.subject)}</Text>
                    <Text as="span" variant="caption" ink="tertiary" truncate>{klass.teacher} · {sectionNumber(klass.section)}분반</Text>
                  </Stack>
                </Inline>
                <Text as="span" ink={past ? "secondary" : "primary"} strong={now}>{klass.room}</Text>
              </Inline>
            </SurfaceLink>
          </Stack>
        );
      })}
    </Stack>
  );
};
