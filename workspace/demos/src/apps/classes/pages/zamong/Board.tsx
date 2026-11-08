// One department's sheet of the workbook: its courses as cards, in columns by prerequisite depth — the left column needs nothing
// from this department, each column after it builds on the one before. No lines join the cards; each card says in words what
// it needs, other departments' courses included. A department where no course needs another (융합) is a plain grid, because a
// ladder of one column would only be a long list.

import { Box, Grid, Stack, Text } from "@studio-baeks/paper-ui";

import { Empty } from "../../../../kit";
import type { Course } from "../../data/catalog";
import { boardOf, courseState, type ZamongMap } from "../../lib/curriculum";
import { CourseCard, type CardActions } from "./CourseCard";

const NONE: ReadonlySet<string> = new Set();

const depthLabel = (depth: number) => (depth === 0 ? "선수 없음" : `선수 ${depth}단계`);

export type BoardProps = CardActions & {
  department: string;
  entries: ZamongMap;
  // The names on record, and the courses they imply
  taken: ReadonlySet<string>;
  inferred: ReadonlySet<string>;
  pinned: string | null;
  onHover: (name: string | null) => void;
  onPin: (name: string) => void;
};

export const Board = ({ department, entries, taken, inferred, pinned, onHover, onPin, onChoose, onGrade, onEc }: BoardProps) => {
  const board = boardOf(department);
  const card = (course: Course) => (
    <Box as="li" key={course.name}>
      <CourseCard
        course={course}
        entry={entries[course.name]}
        state={courseState(course.name, taken, NONE, inferred)}
        pinned={pinned === course.name}
        onHover={onHover}
        onPin={onPin}
        onChoose={onChoose}
        onGrade={onGrade}
        onEc={onEc}
      />
    </Box>
  );

  if (board.courses.length === 0) return <Empty glyph="book-open" title="이 학과에는 등록된 과목이 없습니다" />;

  if (!board.ladder) {
    return (
      <Grid as="ul" columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} gap="md" align="stretch">
        {board.courses.map(card)}
      </Grid>
    );
  }

  // Wider than the window, the sheet scrolls sideways; narrower than md, the columns fold into one list, in reading order.
  return (
    <Box overflowX="auto">
      <Grid columns={{ base: 1, md: `repeat(${board.columns.length}, 15rem)` }} gap="md" align="start">
        {board.columns.map((column) => (
          <Stack key={column.depth} as="section" gap="sm" aria-label={`${department} ${depthLabel(column.depth)}`}>
            <Text as="span" variant="label" ink="tertiary">{depthLabel(column.depth)}</Text>
            <Stack as="ul" gap="sm">
              {column.courses.map(card)}
            </Stack>
          </Stack>
        ))}
      </Grid>
    </Box>
  );
};
