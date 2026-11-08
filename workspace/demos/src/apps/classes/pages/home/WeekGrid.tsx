import { Box, Grid, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { SurfaceLink } from "../../../../kit";
import { DAYS, DAY_LABEL, type Day } from "../../data/periods";
import { blocksOf, type HomeData } from "../../lib/home";
import { isBreakGap, gapName } from "../../lib/schedule";
import { sectionQuery } from "../../lib/search";
import { koreanName, sectionNumber } from "../../lib/utils";
import { searchHref } from "../../ui/parts";

const ROW = 2.75;
const GAP = 1.25;

type Row = { kind: "period"; period: number } | { kind: "gap"; name: string };

export const WeekGrid = ({ home, minute, markToday }: { home: HomeData; minute: number | null; markToday: boolean }) => {
  const last = Math.max(1, ...DAYS.flatMap((day) => home.week[day].map((klass) => klass.period)));
  const periods = home.periods.filter((item) => item.period <= last);
  const rows: Row[] = [];
  periods.forEach((item, index) => {
    const before = periods[index - 1];
    if (before && !isBreakGap(before.end, item.start)) rows.push({ kind: "gap", name: gapName(before.end, item.start, home.breaks) });
    rows.push({ kind: "period", period: item.period });
  });
  const columns = "2rem repeat(5, minmax(0, 1fr))";

  const column = (day: Day) => {
    const blocks = blocksOf(home.week[day], home.periods);
    const items = [];
    for (let index = 0; index < rows.length; ) {
      const row = rows[index]!;
      if (row.kind === "gap") {
        items.push(<Grid key={`gap-${index}`} rows={`${GAP}rem`} />);
        index += 1;
        continue;
      }
      const block = blocks.find((item) => item.periods[0] === row.period);
      if (!block) {
        items.push(<Grid key={`free-${index}`} rows={`${ROW}rem`} />);
        index += 1;
        continue;
      }
      const span = block.periods.length;
      const now = markToday && home.day === day && minute !== null && minute >= block.start.start && minute < block.end.end;
      const { klass } = block;
      const link = (
        <SurfaceLink to={searchHref(sectionQuery(klass.subject, klass.section))} paddingX="sm" paddingY="xs" aria-label={`${koreanName(klass.subject)} ${DAY_LABEL[day]} ${block.periods.join("·")}교시, ${klass.room}`}>
          <Stack as="span" gap="xs">
            <Text as="span" variant="label" ink="inherit" truncate>{koreanName(klass.subject)}</Text>
            <Text as="span" variant="label" strong={false} ink={now ? "inherit" : "tertiary"} truncate>{klass.room}</Text>
            {span > 1 ? <Text as="span" variant="label" strong={false} ink={now ? "inherit" : "tertiary"} truncate>{sectionNumber(klass.section)}분반 · {klass.teacher}</Text> : null}
          </Stack>
        </SurfaceLink>
      );
      items.push(
        now ? (
          <Surface as={Grid} key={`block-${index}`} rows={`${span * ROW}rem`} theme="inverse" radius="sm" overflow="hidden">{link}</Surface>
        ) : (
          <Surface as={Grid} key={`block-${index}`} rows={`${span * ROW}rem`} fill="sunken" border radius="sm" overflow="hidden">{link}</Surface>
        ),
      );
      index += span;
    }
    return <Stack key={day}>{items}</Stack>;
  };

  return (
    <Box overflowX="auto">
      <Stack gap="xs" minWidth="measure.xs">
        <Grid columns={columns} gap="xs">
          <Box />
          {DAYS.map((day) => {
            const today = markToday && home.day === day;
            return (
              <Inline key={day} justify="center" align="center">
                {today ? (
                  <Surface theme="inverse" radius="full" paddingX="md">
                    <Text as="span" variant="label" ink="inherit">{DAY_LABEL[day]}</Text>
                  </Surface>
                ) : (
                  <Text as="span" variant="label" ink="tertiary">{DAY_LABEL[day]}</Text>
                )}
              </Inline>
            );
          })}
        </Grid>
        <Grid columns={columns} gap="xs" align="start">
          <Stack>
            {rows.map((row, index) =>
              row.kind === "gap" ? (
                <Grid key={`label-gap-${index}`} rows={`${GAP}rem`} align="center">
                  <Text as="span" variant="label" strong={false} ink="tertiary" truncate>{row.name}</Text>
                </Grid>
              ) : (
                <Grid key={`label-${row.period}`} rows={`${ROW}rem`}>
                  <Inline justify="center" align="start">
                    <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{row.period}</Text>
                  </Inline>
                </Grid>
              ),
            )}
          </Stack>
          {DAYS.map((day) => column(day))}
        </Grid>
      </Stack>
    </Box>
  );
};
