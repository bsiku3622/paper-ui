import { useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";

import { Badge, Button, Field, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, PageHeader, Tabs } from "../../../kit";
import { CourseGraph, ALL_DEPARTMENTS } from "../content/CourseGraph";
import { CATEGORY_LABEL, COURSES, courseOf, DEPARTMENT_ORDER, PREREQUISITES, TIER_LABEL } from "../data/catalog";
import { slotKey } from "../data/periods";
import { termIndex } from "../lib";
import { cohortOf, koreanName } from "../lib/utils";
import { teacherQuery } from "../lib/search";
import { useClasses } from "../state";
import { Card, Count, Eyebrow, Hint, ScrollTabs, searchHref } from "../ui/parts";
import { Friends } from "./browse/Friends";

const PAGE = 40;

const Row = ({ to, lead, name, sub, trailing }: { to: string; lead?: string; name: string; sub: string; trailing: string }) => (
  <Button as={RouterLink} to={to} variant="ghost" size="lg" fontSize="body" strong={false} fullWidth justify="between" aria-label={`${name} 보기`}>
    <Inline as="span" gap="md" align="center" minWidth={0}>
      {lead ? <Text as="span" ink="tertiary" numeric>{lead}</Text> : null}
      <Text as="span" strong>{name}</Text>
      <Text as="span" ink="tertiary" truncate>{sub}</Text>
    </Inline>
    <Text as="span" variant="caption" ink="secondary" numeric>{trailing}</Text>
  </Button>
);

const Students = () => {
  const { data } = useClasses();
  const [query, setQuery] = useState("");
  const [years, setYears] = useState(Object.keys(data.cohorts));
  const [limit, setLimit] = useState(PAGE);
  const index = useMemo(() => termIndex(data), [data]);
  const all = useMemo(
    () =>
      [...index.students.values()]
        .map((entry) => ({ ...entry, periods: new Set(entry.placed.map((item) => slotKey(item.day, item.period))).size }))
        .sort((a, b) => a.stuId.localeCompare(b.stuId)),
    [index],
  );
  const shown = useMemo(() => {
    const periods = /^periods:(\d+)$/i.exec(query.trim());
    const count = /^subcount:(\d+)$/i.exec(query.trim());
    const text = query.trim().toLowerCase();
    return all.filter((entry) => {
      if (!years.includes(cohortOf(entry.stuId))) return false;
      if (periods) return entry.periods === Number(periods[1]);
      if (count) return entry.subjects.length === Number(count[1]);
      return !text || entry.name.toLowerCase().includes(text) || entry.stuId.includes(text);
    });
  }, [all, years, query]);
  const cohorts = Object.keys(data.cohorts);

  return (
    <Card padding="lg">
      <Field aria-label="이름이나 학번" placeholder="이름이나 학번으로 찾기 — periods:25, subcount:8 처럼 교시 수와 과목 수로도 찾습니다" leading={<Glyph name="search" />} clearable value={query} onChange={(event) => { setQuery(event.target.value); setLimit(PAGE); }} />
      <Inline gap="sm" align="center" wrap>
        <Eyebrow>학번</Eyebrow>
        {cohorts.map((cohort) => (
          <Button key={cohort} variant="hairline" size="sm" selected={years.includes(cohort)} onClick={() => setYears((now) => (now.includes(cohort) ? now.filter((item) => item !== cohort) : [...now, cohort]))}>
            {cohort}학번<Text as="span" variant="label" strong={false} ink="tertiary" numeric>{data.cohorts[cohort]}</Text>
          </Button>
        ))}
        {years.length < cohorts.length ? <Button variant="ghost" size="sm" onClick={() => setYears(cohorts)}>전체</Button> : null}
        <Text as="span" variant="caption" ink="tertiary" numeric>{shown.length}명 표시 중</Text>
      </Inline>
      {shown.length === 0 ? (
        <Empty glyph="users" title="찾은 학생이 없습니다" description="이름의 일부나 학번 숫자로 찾아 보세요." />
      ) : (
        <Stack as="ul" gap="xs">
          {shown.slice(0, limit).map((entry) => (
            <Stack as="li" key={entry.stuId}>
              <Row to={searchHref(`student:${entry.stuId}`)} lead={entry.stuId} name={entry.name} sub={entry.subjects.map(koreanName).join(" · ")} trailing={`${entry.subjects.length}과목 · ${entry.periods}교시`} />
            </Stack>
          ))}
        </Stack>
      )}
      {shown.length > limit ? <Button variant="hairline" onClick={() => setLimit((value) => value + PAGE)}><Glyph name="plus" />{Math.min(PAGE, shown.length - limit)}명 더 보기</Button> : null}
    </Card>
  );
};

const Teachers = () => {
  const { data } = useClasses();
  const [query, setQuery] = useState("");
  const index = useMemo(() => termIndex(data), [data]);
  const all = useMemo(() => [...index.teachers.values()].sort((a, b) => a.name.localeCompare(b.name, "ko")), [index]);
  const shown = all.filter((entry) => !query.trim() || entry.name.includes(query.trim()));
  return (
    <Card padding="lg">
      <Field aria-label="교사 이름" placeholder="교사 이름으로 찾기" leading={<Glyph name="search" />} clearable value={query} onChange={(event) => setQuery(event.target.value)} />
      <Text as="span" variant="caption" ink="tertiary" numeric>{shown.length}명 표시 중</Text>
      {shown.length === 0 ? (
        <Empty glyph="users" title="찾은 교사가 없습니다" />
      ) : (
        <Stack as="ul" gap="xs">
          {shown.map((entry) => (
            <Stack as="li" key={entry.name}>
              <Row to={searchHref(teacherQuery(entry.name))} name={entry.name} sub={entry.subjects.map(koreanName).join(" · ")} trailing={`${entry.sections}개 분반 · ${entry.placed.length}교시`} />
            </Stack>
          ))}
        </Stack>
      )}
    </Card>
  );
};

const Courses = () => {
  const [department, setDepartment] = useState(ALL_DEPARTMENTS);
  const [focused, setFocused] = useState<string | null>(null);
  const course = focused ? courseOf(focused) : undefined;
  const needs = course ? PREREQUISITES.filter((edge) => edge.after === course.name) : [];
  const opens = course ? PREREQUISITES.filter((edge) => edge.before === course.name) : [];

  return (
    <Card padding="lg">
      <Inline gap="xs" wrap>
        <Button variant="hairline" size="sm" selected={department === ALL_DEPARTMENTS} onClick={() => setDepartment(ALL_DEPARTMENTS)}>전체</Button>
        {DEPARTMENT_ORDER.map((name) => (
          <Button key={name} variant="hairline" size="sm" selected={department === name} onClick={() => setDepartment(name)}>{name}</Button>
        ))}
      </Inline>
      <CourseGraph courses={COURSES} prerequisites={PREREQUISITES} departments={DEPARTMENT_ORDER} department={department} focused={focused} onFocus={setFocused} />
      {course ? (
        <Surface fill="sunken" radius="md" padding="lg">
          <Stack gap="sm">
            <Inline gap="sm" align="baseline" wrap>
              <Text as="h3" variant="subheading">{course.name}</Text>
              <Text as="span" ink="tertiary">{course.english}</Text>
            </Inline>
            <Inline gap="xs" wrap>
              <Badge variant="soft" size="sm">{course.credits}학점</Badge>
              <Badge variant="soft" size="sm">{course.department}</Badge>
              <Badge variant="soft" size="sm">{CATEGORY_LABEL[course.category]}</Badge>
              <Badge variant="soft" size="sm">{TIER_LABEL[course.tier]}</Badge>
              {course.recommended ? <Badge variant="soft" size="sm">권장 {course.recommended}학기</Badge> : null}
              {course.pf ? <Badge variant="soft" size="sm">P/F</Badge> : null}
            </Inline>
            <Text ink="secondary">{course.description}</Text>
            {needs.length > 0 ? (
              <Inline gap="xs" wrap align="center">
                <Eyebrow>먼저 들어야 할 과목{needs.some((edge) => edge.alternative) ? " (점선은 택일)" : ""}</Eyebrow>
                {needs.map((edge) => <Button key={edge.before} variant="muted" size="xs" onClick={() => setFocused(edge.before)}>{edge.before}</Button>)}
              </Inline>
            ) : null}
            {opens.length > 0 ? (
              <Inline gap="xs" wrap align="center">
                <Eyebrow>이어서 들을 수 있는 과목</Eyebrow>
                {opens.map((edge) => <Button key={edge.after} variant="muted" size="xs" onClick={() => setFocused(edge.after)}>{edge.after}</Button>)}
              </Inline>
            ) : null}
            <Inline>
              <Button as={RouterLink} to={searchHref(koreanName(course.name).replace(/[()]/g, " "))} variant="hairline" size="sm"><Glyph name="search" />이번 학기 분반 찾기</Button>
            </Inline>
          </Stack>
        </Surface>
      ) : (
        <Hint>가로는 선수 깊이입니다 — 왼쪽은 선수 없이 들을 수 있는 과목이고, 오른쪽으로 갈수록 쌓아 올린 과목입니다. 점선은 택일 관계이고, 학과를 가로지르는 선은 융합 과목이 다른 학과 과목을 선수로 받는 경우입니다. 과목을 누르면 이어진 과목만 남습니다.</Hint>
      )}
    </Card>
  );
};

export const BrowsePage = () => {
  const { data, friends } = useClasses();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "students";
  const index = useMemo(() => termIndex(data), [data]);

  return (
    <>
      <PageHeader eyebrow="전교생과 교육과정" title="탐색" description="학생과 교사를 훑어 보고, 과목들이 어떻게 이어지는지 보고, 친구가 지금 비어 있는지 확인합니다." meta={<><Count>{index.students.size}명</Count><Count>{index.teachers.size}명의 교사</Count><Count>{COURSES.length}개 과목</Count></>} />
      <ScrollTabs selected={tab}>
        <Tabs
          label="탐색 구역"
          value={tab}
          onChange={(id) => setParams({ tab: id }, { replace: true })}
          items={[
            { id: "students", label: "학생", count: index.students.size, glyph: "users", panel: tab === "students" ? <Students /> : null },
            { id: "teachers", label: "교사", count: index.teachers.size, glyph: "user", panel: tab === "teachers" ? <Teachers /> : null },
            { id: "courses", label: "교육과정", count: COURSES.length, glyph: "network", panel: tab === "courses" ? <Courses /> : null },
            { id: "friends", label: "친구", count: friends.length, glyph: "users", panel: tab === "friends" ? <Friends /> : null },
          ]}
        />
      </ScrollTabs>
      <Hint>전교생 목록은 로그인한 학생에게만 보입니다. 이름과 학번 외에는 어떤 개인 정보도 싣지 않습니다.</Hint>
    </>
  );
};
