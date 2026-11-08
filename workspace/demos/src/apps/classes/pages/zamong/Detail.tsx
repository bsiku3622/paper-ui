// The detail of one course, under the board: what it is, what it needs and what builds on it. It shows the card the pointer
// or the keyboard is on, or else the one held open.

import { Grid, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { TIER_LABEL, type Course } from "../../data/catalog";
import { displayName, PREREQ_INDEX, prereqWords, unlocksOf } from "../../lib/curriculum";
import { Hint } from "../../ui/parts";

const recommendedIn = (value: string) => (value === "summer" ? "여름학기" : value ? `${value}학기` : "");

const Relation = ({ label, children }: { label: string; children: string }) => (
  <Grid columns="5rem minmax(0, 1fr)" gap="sm" align="baseline">
    <Text as="span" variant="caption" ink="tertiary">{label}</Text>
    <Text as="span" variant="caption" ink="secondary">{children}</Text>
  </Grid>
);

export const Detail = ({ course }: { course: Course | undefined }) => {
  if (!course) return <Hint>카드의 학기 칸을 고르면 들은 과목으로 잡힙니다. 카드에 마우스를 올리거나 이름을 누르면 상세가 여기에 열립니다.</Hint>;

  const name = displayName(course.name);
  const recommended = recommendedIn(course.recommended);
  const facts = [
    `${course.credits}학점`,
    TIER_LABEL[course.tier],
    course.requiredAdvanced ? "트랙필수" : null,
    course.pf ? "P/F" : null,
    recommended ? `권장 ${recommended}` : null,
    course.apCredits > 0 ? `AP ${course.apCredits}학점 인정` : null,
    course.ec ? "영어 강의 있음" : null,
  ].filter(Boolean);
  const after = unlocksOf(course.name, course.department);

  return (
    <Surface as="section" aria-label={`${name} 상세`} fill="sunken" radius="md" padding="lg">
      <Stack gap="sm">
        <Stack gap="xs">
          <Text as="h3" variant="subheading">{name}</Text>
          {course.english ? <Text as="span" variant="caption" ink="tertiary">{course.english}</Text> : null}
        </Stack>
        <Text variant="caption" ink="secondary" numeric>{facts.join(" · ")}</Text>
        {PREREQ_INDEX.has(course.name) ? <Relation label="선수 과목">{prereqWords(course.name, course.department)}</Relation> : null}
        {after.length > 0 ? <Relation label="후수 과목">{after.join(", ")}</Relation> : null}
        <Text ink="secondary">{course.description}</Text>
      </Stack>
    </Surface>
  );
};
