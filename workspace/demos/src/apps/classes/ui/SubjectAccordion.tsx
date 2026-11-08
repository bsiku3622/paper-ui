// A subject as a row that opens: its name, how many sections and students, who teaches; opened, what the course is and
// every section with its teacher, room, times and roster. One list of these is one card — a line between them, no card in a card.
// The home page uses the same part for "the subjects I take", with only my sections in it.

import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Badge, Box, Button, Grid, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";
import { courseOf, TIER_LABEL } from "../data/catalog";
import { subjectBase, termLabel, type Section, type SubjectData } from "../data/build";
import type { Material } from "../data/materials";
import { cohortOf, formatTimes, koreanName, sectionNumber } from "../lib/utils";
import { path, useClasses } from "../state";
import { MaterialPreview } from "./MaterialPreview";
import { Highlight, QueryChip, StudentChip } from "./parts";

export const SectionCard = ({ section, terms, years, focus }: { section: Section; terms: readonly string[]; years: readonly string[]; focus: string | null }) => {
  const roster = section.students.filter((student) => years.length === 0 || years.includes(cohortOf(student.stuId)));
  return (
    <Surface fill="sunken" radius="md" padding="md">
      <Stack gap="md">
        <Inline gap="sm" align="center" wrap>
          <Badge variant="solid" size="sm">{sectionNumber(section.section)}분반</Badge>
          <QueryChip kind="teacher" value={section.teacher} terms={terms} label={<><Glyph name="user" /><Highlight text={section.teacher} terms={terms} /></>} />
          <QueryChip kind="room" value={section.room} terms={terms} />
          <Text as="span" variant="caption" ink="tertiary" numeric>{formatTimes(section.times)}</Text>
        </Inline>
        <Inline gap="xs" wrap align="center">
          {roster.map((student) => (
            <StudentChip key={student.stuId} stuId={student.stuId} name={student.name} terms={terms} selected={focus === student.stuId} />
          ))}
          {roster.length === 0 ? <Text as="span" variant="caption" ink="tertiary">선택한 학년의 수강생이 없습니다.</Text> : null}
        </Inline>
      </Stack>
    </Surface>
  );
};

// What the course is: its place in the curriculum and what it needs, and its syllabus when the school has shared one.
const CourseInfo = ({ subject }: { subject: SubjectData }) => {
  const { materials, term } = useClasses();
  const [open, setOpen] = useState<Material | null>(null);
  const course = courseOf(subject.subject) ?? courseOf(subjectBase(subject.subject));
  const syllabus = materials.find((item) => item.status === "approved" && item.primarySyllabus && item.subject === subject.subject && item.term === termLabel(term));
  if (!course) return null;
  return (
    <Stack gap="sm">
      <Text ink="secondary">{course.description}</Text>
      <Inline gap="xs" wrap align="center">
        <Badge variant="soft" size="sm">{course.department}</Badge>
        <Badge variant="soft" size="sm">{TIER_LABEL[course.tier]}</Badge>
        <Badge variant="soft" size="sm">{course.credits}학점</Badge>
        {course.pf ? <Badge variant="soft" size="sm">P/F</Badge> : null}
        {subject.isEc ? <Badge variant="soft" size="sm" accent="info">영어 강의</Badge> : null}
        {syllabus ? <Button variant="hairline" size="xs" onClick={() => setOpen(syllabus)}><Glyph name="file-text" />강의계획서</Button> : null}
        <Button as={RouterLink} to={`${path("/files")}?subject=${subject.subjectId}`} variant="ghost" size="xs"><Glyph name="folder-open" />자료 더 보기</Button>
      </Inline>
      <MaterialPreview material={open} onClose={() => setOpen(null)} />
    </Stack>
  );
};

export const SubjectRow = ({ subject, expanded, onToggle, terms = [], years = [], focus = null }: { subject: SubjectData; expanded: boolean; onToggle: () => void; terms?: readonly string[]; years?: readonly string[]; focus?: string | null }) => {
  const teachers = [...new Set(subject.sections.map((section) => section.teacher))];
  return (
    <Stack gap="sm">
      <Button variant="ghost" size="lg" fontSize="body" strong={false} fullWidth justify="between" aria-expanded={expanded} onClick={onToggle}>
        <Inline as="span" gap="sm" align="center" minWidth={0}>
          <Text as="span" strong truncate><Highlight text={koreanName(subject.subject)} terms={terms} /></Text>
          {subject.pf ? <Badge size="xs" variant="soft">P/F</Badge> : null}
          <Text as="span" ink="tertiary" truncate>
            {teachers.slice(0, 3).join(" · ")}{teachers.length > 3 ? ` 외 ${teachers.length - 3}명` : ""}
          </Text>
        </Inline>
        <Inline as="span" gap="md" align="center">
          <Text as="span" variant="caption" ink="secondary" numeric>{subject.sections.length}개 분반</Text>
          <Text as="span" variant="caption" ink="secondary" numeric>{subject.studentCount}명</Text>
          <Glyph name={expanded ? "chevron-up" : "chevron-down"} ink="tertiary" />
        </Inline>
      </Button>
      {expanded ? (
        <Box paddingX="md" paddingY="sm">
          <Stack gap="md">
            <CourseInfo subject={subject} />
            <Grid columns={{ base: 1, lg: 2 }} gap="md" align="start">
              {subject.sections.map((section) => <SectionCard key={section.id} section={section} terms={terms} years={years} focus={focus} />)}
            </Grid>
          </Stack>
        </Box>
      ) : null}
    </Stack>
  );
};
