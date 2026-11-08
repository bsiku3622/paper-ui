import { Box, Button, Grid, Inline, Marker, Pressable, Select, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../../kit";
import { GRADE_OPTIONS, TIER_LABEL, type Course } from "../../data/catalog";
import { displayName, prereqWords, slotLabel, TERM_KEYS, type CourseState, type ZamongEntry } from "../../lib/curriculum";

export type CardActions = {
  onChoose: (course: string, term: string) => void;
  onGrade: (course: string, grade: string) => void;
  onEc: (course: string) => void;
};

export type CourseCardProps = CardActions & {
  course: Course;
  entry: ZamongEntry | undefined;
  state: CourseState;
  pinned?: boolean;
  onHover?: (name: string | null) => void;
  onPin?: (name: string) => void;
};

export const CourseCard = ({ course, entry, state, pinned = false, onHover, onPin, onChoose, onGrade, onEc }: CourseCardProps) => {
  const name = displayName(course.name);
  const taken = entry !== undefined;
  const tags = [TIER_LABEL[course.tier], course.pf ? "P/F" : null, course.requiredAdvanced ? "트랙필수" : null].filter(Boolean).join(" · ");
  const prereq = prereqWords(course.name);
  const hint = !taken && state === "inferred" ? "이수 추정" : null;

  const heading = (
    <Inline as="span" justify="between" align="baseline" gap="sm">
      <Text as="span" strong ink={taken ? "primary" : "secondary"}>{course.requiredAdvanced ? <Marker>{name}</Marker> : name}</Text>
      <Text as="span" variant="caption" ink="tertiary" numeric>{course.credits}학점</Text>
    </Inline>
  );

  return (
    <Surface
      fill="sunken"
      border={taken}
      radius="md"
      padding="md"
      height="full"
      hoverable={onHover !== undefined}
      selected={pinned}
      onMouseEnter={() => onHover?.(course.name)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(course.name)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onHover?.(null);
      }}
    >
      <Stack gap="sm" height="full" justify="between">
        <Stack gap="sm">
          {onPin ? (
            <Box as={Pressable} width="full" onPress={() => onPin(course.name)} aria-pressed={pinned} aria-label={`${name} 상세 보기`}>
              {heading}
            </Box>
          ) : (
            heading
          )}

          <Inline justify="between" align="center" gap="sm">
            <Text as="span" variant="label" strong={false} ink="tertiary">{tags}</Text>
            {course.ec ? (
              <Button size="xs" variant="hairline" selected={entry?.ec ?? false} disabled={!taken} aria-label={`${name}을 영어 강의(EC)로 들었음`} onClick={() => onEc(course.name)}>EC</Button>
            ) : null}
          </Inline>

          {prereq || hint ? (
            <Inline gap="xs" align="start">
              {!taken && state === "locked" ? <Glyph name="lock" size="label" ink="tertiary" /> : null}
              <Text as="span" variant="label" strong={false} ink="tertiary">{[prereq ? `선수 ${prereq}` : null, hint].filter(Boolean).join(" · ")}</Text>
            </Inline>
          ) : null}
        </Stack>

        <Grid columns="minmax(0, 1fr) minmax(0, 1fr)" gap="xs">
          <Select size="sm" aria-label={`${name} 학기`} value={entry?.term ?? ""} onChange={(event) => onChoose(course.name, event.target.value)}>
            <Select.Option value="">학기</Select.Option>
            {TERM_KEYS.map((key) => (
              <Select.Option key={key} value={key}>{slotLabel(key)}</Select.Option>
            ))}
          </Select>
          {course.pf ? (
            <Select size="sm" aria-label={`${name} 평어`} value="pf" disabled onChange={() => undefined}>
              <Select.Option value="pf">P/F</Select.Option>
            </Select>
          ) : (
            <Select size="sm" aria-label={`${name} 평어`} value={entry?.grade ?? ""} disabled={!taken} onChange={(event) => onGrade(course.name, event.target.value)}>
              <Select.Option value="">평어</Select.Option>
              {GRADE_OPTIONS.map((grade) => (
                <Select.Option key={grade} value={grade}>{grade}</Select.Option>
              ))}
            </Select>
          )}
        </Grid>
      </Stack>
    </Surface>
  );
};
