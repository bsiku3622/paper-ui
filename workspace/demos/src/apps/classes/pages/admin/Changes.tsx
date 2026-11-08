// What changed between two revisions of a term: how many classes, times and enrolments came and went, and the names behind
// the biggest moves. Never a student's name — a revision only says how many places were added or removed in each class.

import type { ReactNode } from "react";

import { Grid, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../../kit";
import type { ChangeSummary, Move } from "../../data/admin";

const MAX_ROWS = 6;

// +3, −2 — nothing for 0.
const Delta = ({ value }: { value: number }) =>
  value === 0 ? null : (
    <Text as="span" ink={value > 0 ? "success" : "error"} numeric>{value > 0 ? "+" : "−"}{Math.abs(value)}</Text>
  );

const Figure = ({ label, children }: { label: string; children: ReactNode }) => (
  <Stack gap="xs" minWidth={0}>
    <Text as="span" variant="label" strong={false} ink="tertiary">{label}</Text>
    <Inline gap="sm" align="baseline">{children}</Inline>
  </Stack>
);

const Pair = ({ label, added, removed }: { label: string; added: number; removed: number }) => (
  <Figure label={label}>
    {added === 0 && removed === 0 ? <Text as="span" ink="tertiary">변화 없음</Text> : (
      <>
        <Delta value={added} />
        <Delta value={-removed} />
      </>
    )}
  </Figure>
);

const Plain = ({ label, value }: { label: string; value: number }) => (
  <Figure label={label}><Text as="span" numeric>{value}</Text></Figure>
);

const Block = ({ title, count, children }: { title: string; count: number; children: ReactNode }) => (
  <Stack gap="xs" minWidth={0}>
    <Text as="span" variant="label" strong={false} ink="tertiary">{title} {count}</Text>
    <Stack as="ul" gap="xs">{children}</Stack>
    {count > MAX_ROWS ? <Text as="span" variant="caption" ink="tertiary">외 {count - MAX_ROWS}건</Text> : null}
  </Stack>
);

const Names = ({ title, items }: { title: string; items: readonly string[] }) =>
  items.length === 0 ? null : (
    <Block title={title} count={items.length}>
      {items.slice(0, MAX_ROWS).map((item) => <Text as="li" key={item} variant="caption" truncate>{item}</Text>)}
    </Block>
  );

const Moves = ({ title, items }: { title: string; items: readonly Move[] }) =>
  items.length === 0 ? null : (
    <Block title={title} count={items.length}>
      {items.slice(0, MAX_ROWS).map((item) => (
        <Inline as="li" key={item.class} gap="xs" align="center" minWidth={0}>
          <Text as="span" variant="caption" truncate>{item.class}</Text>
          <Text as="span" variant="caption" ink="tertiary">{item.from}</Text>
          <Glyph name="arrow-right" size="label" ink="tertiary" />
          <Text as="span" variant="caption">{item.to}</Text>
        </Inline>
      ))}
    </Block>
  );

export const Changes = ({ data }: { data: ChangeSummary }) => {
  if (!data.changed) return <Text ink="tertiary">직전 회차와 같습니다.</Text>;
  const { classes, times, enrollments, students } = data;
  // A revision that only corrected a name has nothing to say about classes, times or places.
  const shifted = classes.added.length + classes.removed.length + classes.moved.length + classes.swapped.length + times.added + times.removed + enrollments.added + enrollments.removed > 0;
  return (
    <Stack gap="lg">
      <Grid columns={{ base: 2, md: 4 }} gap="md">
        {shifted ? <Pair label="분반" added={classes.added.length} removed={classes.removed.length} /> : null}
        {shifted ? <Pair label="시간" added={times.added} removed={times.removed} /> : null}
        {shifted ? <Pair label="수강" added={enrollments.added} removed={enrollments.removed} /> : null}
        {classes.kept > 0 ? <Plain label="유지한 분반" value={classes.kept} /> : null}
        {classes.moved.length > 0 ? <Plain label="교실 이동" value={classes.moved.length} /> : null}
        {classes.swapped.length > 0 ? <Plain label="교사 교체" value={classes.swapped.length} /> : null}
        {classes.assigned > 0 ? <Plain label="교실 배정" value={classes.assigned} /> : null}
        {students.new > 0 ? <Plain label="신규 학생" value={students.new} /> : null}
        {students.renamed > 0 ? <Plain label="학생 이름 수정" value={students.renamed} /> : null}
        {data.teachersRenamed > 0 ? <Plain label="교사 이름 수정" value={data.teachersRenamed} /> : null}
      </Grid>
      <Grid columns={{ base: 1, md: 2 }} gap="lg" align="start">
        <Names title="신설" items={classes.added} />
        <Names title="폐강" items={classes.removed} />
        <Moves title="교사 교체" items={classes.swapped} />
        <Moves title="교실 이동" items={classes.moved} />
        {enrollments.byClass.length > 0 ? (
          <Block title="인원 변동" count={enrollments.byClass.length}>
            {enrollments.byClass.slice(0, MAX_ROWS).map((row) => (
              <Inline as="li" key={row.class} gap="sm" align="center" minWidth={0}>
                <Text as="span" variant="caption" truncate>{row.class}</Text>
                <Text as="span" variant="caption" ink={row.delta > 0 ? "success" : "error"} numeric>{row.delta > 0 ? "+" : "−"}{Math.abs(row.delta)}</Text>
              </Inline>
            ))}
          </Block>
        ) : null}
      </Grid>
    </Stack>
  );
};
