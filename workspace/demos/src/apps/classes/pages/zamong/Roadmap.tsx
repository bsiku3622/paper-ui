import { useMemo, useState } from "react";

import { Badge, Box, Button, Divider, Field, FormField, Grid, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph, Meter, Stat, StatRow } from "../../../../kit";
import type { Course } from "../../data/catalog";
import { displayName, HOUR_LABEL, HOUR_REQUIREMENTS, REGULAR_TERMS, searchCourses, slotLabel, TERM_CREDITS, type Hours, type TermKey, type TermSummary, type ZamongMap, type ZamongSummary } from "../../lib/curriculum";
import { Card, Hint } from "../../ui/parts";

const conclusion = (summary: ZamongSummary): { title: string; text: string } => {
  if (summary.recorded === 0) return { title: "아직 기록한 과목이 없습니다", text: "학과 판의 카드에서 학기를 고르면 들은 과목으로 잡히고, 졸업 요건이 이 자리에서 바로 계산됩니다." };
  if (summary.ready) return { title: "학점과 시수 요건을 모두 채웠습니다", text: "학과 트랙 조건은 앱이 판정하지 않습니다. 아래 학과 판에 적힌 조건을 직접 확인해 주세요." };
  const missing = summary.progress.requirements.filter((row) => row.key !== "total" && !row.met).map((row) => `${row.label} ${row.required - row.earned}학점`);
  const total = summary.hours.find((row) => row.key === "total");
  if (total && !total.met) missing.push(`시수 ${total.required - total.earned}시간`);
  else for (const row of summary.hours) if (row.key !== "total" && !row.met) missing.push(`${row.label} 시수 ${row.required - row.earned}시간`);
  return { title: "아직 졸업 요건을 채우지 못했습니다", text: `부족한 요건은 ${missing.join(", ")}입니다.` };
};

const Conclusion = ({ summary }: { summary: ZamongSummary }) => {
  const { title, text } = conclusion(summary);
  const { gpa, progress } = summary;
  const total = progress.requirements.find((row) => row.key === "total");
  const outside = summary.terms.filter((term) => !term.ok);
  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Text as="h3" variant="heading">{title}</Text>
        <Text ink="secondary">{text}</Text>
        {outside.length > 0 ? (
          <Text ink="warning">{outside.map((term) => term.label).join(", ")}: 한 학기 학점은 {TERM_CREDITS.min}~{TERM_CREDITS.max}학점이어야 합니다.</Text>
        ) : null}
      </Stack>
      <StatRow>
        <Stat small label="전체 평점" value={gpa.overall?.toFixed(2) ?? "—"} unit="/ 4.3" note={gpa.missing > 0 ? `평어가 없는 ${gpa.missing}과목은 뺐습니다` : undefined} />
        <Stat small label="자연계열 평점" value={gpa.natural?.toFixed(2) ?? "—"} unit="/ 4.3" />
        <Stat small label="들은 학점" value={progress.total} unit={`/ ${total?.required ?? 0}학점`} />
        <Stat small label="AP 인정" value={progress.ap} unit="학점" />
      </StatRow>
    </Stack>
  );
};

type TermActions = {
  placed: ZamongMap;
  onOpenTerm: (term: TermKey) => void;
  onOpenCourse: (name: string) => void;
  onPlace: (course: string, term: TermKey) => void;
};

const creditsLine = (term: TermSummary) => {
  if (term.credits === 0) return "비어 있음";
  const range = term.credits > TERM_CREDITS.max ? ` · ${TERM_CREDITS.max}학점을 넘음` : term.credits < TERM_CREDITS.min && term.key !== "S" ? ` · ${TERM_CREDITS.min}학점에 못 미침` : "";
  return `${term.credits}학점${term.gpa !== null ? ` · 평점 ${term.gpa.toFixed(2)}` : ""}${range}`;
};

const TermLine = ({ term, now, divider, placed, onOpenTerm, onOpenCourse, onPlace }: TermActions & { term: TermSummary; now: boolean; divider: boolean }) => {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => searchCourses(query), [query]);
  const place = (course: Course) => {
    onPlace(course.name, term.key);
    setQuery("");
  };
  return (
    <Stack as="li" gap="md">
      {divider ? <Divider /> : null}
      <Grid columns={{ base: 1, md: "8rem minmax(0, 1fr)" }} gap="sm" align="start">
        <Stack gap="xs">
          <Inline gap="xs" align="center">
            <Button variant="ghost" size="sm" aria-haspopup="dialog" aria-label={`${term.label} 상세 입력`} onClick={() => onOpenTerm(term.key)}>
              {term.label}
              <Glyph name="chevron-right" />
            </Button>
            {now ? <Badge size="xs" variant="soft">지금</Badge> : null}
          </Inline>
          <Box paddingX="md">
            <Text as="span" variant="label" strong={false} ink={term.ok ? "tertiary" : "warning"} numeric>{creditsLine(term)}</Text>
          </Box>
        </Stack>
        <Stack gap="sm" minWidth={0}>
          <Inline gap="xs" wrap align="center">
            {term.courses.map((course) => (
              <Button key={course.name} variant="soft" size="xs" onClick={() => onOpenCourse(course.name)}>{course.label}</Button>
            ))}
            <Box width="md">
              <Field
                size="sm"
                variant="ghost"
                aria-label={`${term.label}에 넣을 과목 이름`}
                placeholder="과목 넣기"
                leading={<Glyph name="plus" />}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.nativeEvent.isComposing) return;
                  if (event.key === "Enter" && matches[0]) place(matches[0]);
                  if (event.key === "Escape") setQuery("");
                }}
              />
            </Box>
          </Inline>
          {query.trim() ? (
            matches.length > 0 ? (
              <Stack as="ul" gap="xs" aria-label="찾은 과목">
                {matches.map((course) => {
                  const was = placed[course.name];
                  return (
                    <Box as="li" key={course.name}>
                      <Button variant="ghost" size="sm" fullWidth justify="between" onClick={() => place(course)}>
                        <Inline as="span" gap="sm" align="baseline" minWidth={0}>
                          <Text as="span">{displayName(course.name)}</Text>
                          <Text as="span" variant="caption" ink="tertiary">{course.department} · {course.credits}학점</Text>
                        </Inline>
                        {was ? <Text as="span" variant="caption" ink="tertiary">{was.term === term.key ? "이미 여기에 있음" : `지금 ${slotLabel(was.term)}`}</Text> : null}
                      </Button>
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              <Hint>찾는 과목이 없습니다. 이름의 일부나 초성으로 찾아 보세요.</Hint>
            )
          ) : null}
        </Stack>
      </Grid>
    </Stack>
  );
};

const EcLine = ({ summary, onOpenCourse }: { summary: ZamongSummary; onOpenCourse: (name: string) => void }) => (
  <Stack as="li" gap="md">
    <Divider />
    <Grid columns={{ base: 1, md: "8rem minmax(0, 1fr)" }} gap="sm" align="start">
      <Stack gap="xs">
        <Box paddingX="md"><Text as="span" strong>EC</Text></Box>
        <Box paddingX="md"><Text as="span" variant="label" strong={false} ink="tertiary" numeric>{summary.progress.ec > 0 ? `${summary.progress.ec}학점` : "영어 강의"}</Text></Box>
      </Stack>
      <Inline gap="xs" wrap align="center">
        {summary.ecCourses.map((course) => (
          <Button key={course.name} variant="soft" size="xs" onClick={() => onOpenCourse(course.name)}>{course.label}</Button>
        ))}
        {summary.ecCourses.length === 0 ? <Text ink="tertiary">영어 강의로 들은 과목이 없습니다.</Text> : null}
      </Inline>
    </Grid>
  </Stack>
);

const TermList = ({ summary, nowSlot, ...actions }: TermActions & { summary: ZamongSummary; nowSlot: TermKey | null }) => {
  const terms = summary.terms.filter((term) => term.key === "S" || Number(term.key) <= REGULAR_TERMS || term.courses.length > 0);
  return (
    <Stack gap="md">
      <Text as="h3" variant="subheading">학기별 과목</Text>
      <Stack as="ul" gap="md">
        {terms.map((term, index) => (
          <TermLine key={term.key} term={term} now={term.key === nowSlot} divider={index > 0} {...actions} />
        ))}
        <EcLine summary={summary} onOpenCourse={actions.onOpenCourse} />
      </Stack>
    </Stack>
  );
};

const Requirements = ({ summary }: { summary: ZamongSummary }) => (
  <Stack gap="md">
    <Text as="h3" variant="subheading">졸업 요건</Text>
    <Stack gap="md">
      {summary.progress.requirements.map((row) => (
        <Meter key={row.key} label={row.label} valueText={`${row.earned} / ${row.required}학점`} value={row.earned / row.required} tone={row.met ? "success" : "primary"} />
      ))}
    </Stack>
  </Stack>
);

const HoursBlock = ({ summary, hours, onHour }: { summary: ZamongSummary; hours: Hours; onHour: (key: keyof Hours, value: number) => void }) => {
  const total = summary.hours.find((row) => row.key === "total");
  return (
    <Stack gap="md">
      <Stack gap="xs">
        <Text as="h3" variant="subheading">시수</Text>
        <Hint>학교 시스템에는 없는 값이라 직접 적습니다.</Hint>
      </Stack>
      <Grid columns={3} gap="sm">
        {(["selfDev", "collab", "global"] as const).map((key) => (
          <FormField key={key} label={HOUR_LABEL[key]}>
            <Field
              size="sm"
              inputMode="numeric"
              maxLength={3}
              numeric
              textAlign="end"
              placeholder="0"
              value={hours[key] || ""}
              trailing={<Text as="span" variant="caption" ink="tertiary" numeric>/ {HOUR_REQUIREMENTS[key]}</Text>}
              onChange={(event) => onHour(key, Number(event.target.value.replace(/\D/g, "")))}
            />
          </FormField>
        ))}
      </Grid>
      {total ? <Meter label="총 시수" valueText={`${total.earned} / ${total.required}시간`} value={total.earned / total.required} tone={total.met ? "success" : "primary"} /> : null}
    </Stack>
  );
};

export type RoadmapProps = TermActions & {
  summary: ZamongSummary;
  hours: Hours;
  nowSlot: TermKey | null;
  onHour: (key: keyof Hours, value: number) => void;
};

export const Roadmap = ({ summary, hours, nowSlot, onHour, ...actions }: RoadmapProps) => (
  <Card title="로드맵" description="카드에 적은 학기·평어·EC에서 계산한 현황입니다." gap="xl">
    <Conclusion summary={summary} />
    <Divider />
    <Grid columns={{ base: 1, xl: "minmax(0, 3fr) auto minmax(0, 2fr)" }} gap="xl" align="start">
      <TermList summary={summary} nowSlot={nowSlot} {...actions} />
      <Inline hideBelow="xl" align="stretch"><Divider orientation="vertical" /></Inline>
      <Grid columns={{ base: 1, md: 2, xl: 1 }} gap="xl" align="start">
        <Requirements summary={summary} />
        <HoursBlock summary={summary} hours={hours} onHour={onHour} />
      </Grid>
    </Grid>
  </Card>
);
