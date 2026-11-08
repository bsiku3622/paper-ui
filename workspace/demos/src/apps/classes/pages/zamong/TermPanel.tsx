import { useEffect, useState } from "react";

import { Box, Grid, Text } from "@studio-baeks/paper-ui";

import { COURSE_BY_NAME } from "../../data/catalog";
import { courseState, slotLabel, type TermKey, type TermSummary, type ZamongMap } from "../../lib/curriculum";
import { Dialog, Hint } from "../../ui/parts";
import { CourseCard, type CardActions } from "./CourseCard";

const NONE: ReadonlySet<string> = new Set();

export type TermPanelProps = CardActions & {
  term: TermKey | null;
  terms: readonly TermSummary[];
  entries: ZamongMap;
  taken: ReadonlySet<string>;
  inferred: ReadonlySet<string>;
  onClose: () => void;
};

export const TermPanel = ({ term, terms, entries, taken, inferred, onClose, onChoose, onGrade, onEc }: TermPanelProps) => {
  const [last, setLast] = useState<TermKey>("1");
  useEffect(() => {
    if (term) setLast(term);
  }, [term]);
  const key = term ?? last;
  const summary = terms.find((item) => item.key === key);
  const courses = summary?.courses ?? [];

  return (
    <Dialog
      open={term !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={slotLabel(key)}
      description={`${courses.length}과목 · ${summary?.credits ?? 0}학점${summary?.gpa != null ? ` · 평점 ${summary.gpa.toFixed(2)}` : ""}`}
      size="measure.lg"
    >
      {courses.length === 0 ? (
        <Text ink="tertiary">이 학기에 담은 과목이 없습니다. 로드맵의 ‘과목 넣기’에서 먼저 넣어 주세요.</Text>
      ) : (
        <Grid as="ul" columns={{ base: 1, sm: 2 }} gap="md" align="stretch">
          {courses.map(({ name }) => {
            const course = COURSE_BY_NAME.get(name);
            return course ? (
              <Box as="li" key={name}>
                <CourseCard course={course} entry={entries[name]} state={courseState(name, taken, NONE, inferred)} onChoose={onChoose} onGrade={onGrade} onEc={onEc} />
              </Box>
            ) : null;
          })}
        </Grid>
      )}
      <Hint>평어와 EC를 넣으면 평점과 졸업 요건에 바로 반영됩니다. 학기를 바꾸면 그 학기로 과목이 옮겨 가고, 비우면 기록이 지워집니다.</Hint>
    </Dialog>
  );
};
