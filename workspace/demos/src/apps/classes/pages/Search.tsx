import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

import { Badge, Button, Divider, Field, Floating, Grid, IconButton, Inline, Pressable, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, PageHeader, Segmented, Stat, StatRow, useToast } from "../../../kit";
import { cohortOf, koreanName } from "../lib/utils";
import { compare, isLogical, search, searchTerms, subjectQuery, type Entity } from "../lib/search";
import { termLabel } from "../data/build";
import { DAY_LABEL } from "../data/periods";
import { useClasses } from "../state";
import { Card, Eyebrow, Hint, Notice, searchHref, SlotGrid, type Slot } from "../ui/parts";
import { SubjectRow } from "../ui/SubjectAccordion";

const KIND = { student: "학생", teacher: "교사", room: "강의실" } as const;

const SYNTAX: [string, string][] = [
  ["미적분", "과목·교사·학생·강의실 어디서든 포함된 말을 찾습니다. 줄여 쓴 말도 찾습니다."],
  ["ㅈㅂㄱㅎ3", "초성만 입력해도 됩니다 (정보과학3)."],
  ["student:25-307", "학생만 찾습니다. s: 또는 st: 로 줄일 수 있습니다."],
  ["teacher:윤다인", "교사만 찾습니다. t: 로 줄일 수 있습니다."],
  ["room:형3407", "강의실만 찾습니다. r: 로 줄일 수 있습니다."],
  ["정보과학3/2,3", "과목의 2분반과 3분반만 찾습니다."],
  ["정보과학3 + 자료구조", "+ 는 또는, & 는 그리고, ! 는 아닌 것, 괄호로 묶습니다."],
];

const SyntaxHelp = () => (
  <Floating>
    <IconButton as={Floating.Trigger} variant="ghost" size="xs" aria-label="검색 문법 보기"><Glyph name="circle-help" /></IconButton>
    <Floating.Content as={Surface} fill="raised" border radius="lg" padding="lg" placement="bottom end" aria-label="검색 문법" maxWidth="measure.sm">
      <Stack gap="md">
        <Text as="h2" variant="subheading">검색 문법</Text>
        <Stack gap="sm">
          {SYNTAX.map(([code, text]) => (
            <Stack key={code} gap="xs">
              <Text as="span" family="mono" strong>{code}</Text>
              <Text as="span" variant="caption" ink="secondary">{text}</Text>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Floating.Content>
  </Floating>
);

const QueryText = ({ query }: { query: string }) => {
  const parts = query.split(/([()&+!])/g).filter((part) => part !== "");
  return (
    <Inline gap="xs" align="center" wrap>
      {parts.map((part, index) =>
        /^[()&+!]$/.test(part) ? (
          <Text key={index} as="span" variant="subheading" ink="info">{part}</Text>
        ) : (
          <Button key={index} as={RouterLink} to={searchHref(part.trim())} variant="ghost" size="sm" fontSize="body">{part.trim()}</Button>
        ),
      )}
    </Inline>
  );
};

const EntityTile = ({ entity, selected, onPick }: { entity: Entity; selected: boolean; onPick: () => void }) => (
  <Surface as={Pressable} hoverable selected={selected} radius="md" padding="md" onPress={onPick} aria-pressed={selected} aria-label={`${entity.name} ${KIND[entity.type]} 시간표 보기`}>
    <Stack as="span" gap="xs" align="start">
      <Inline as="span" gap="sm" align="center">
        <Text as="span" variant="subheading">{entity.name}</Text>
        <Badge size="xs" variant="soft">{KIND[entity.type]}</Badge>
      </Inline>
      <Text as="span" variant="caption" ink="tertiary" numeric>
        {entity.type === "student" ? `${entity.id} · ` : ""}
        {entity.type === "room" ? `주 ${entity.times.length}교시 사용` : `${entity.subjects.length}개 과목 · 주 ${entity.times.length}교시`}
      </Text>
    </Stack>
  </Surface>
);

const TimetableOf = ({ entity }: { entity: Entity }) => {
  const navigate = useNavigate();
  return (
    <SlotGrid
      label={`${entity.name}의 주간 시간표`}
      rowHeight="2.5rem"
      cell={(day, period): Slot | undefined => {
        const item = entity.times.find((time) => time.day === day && time.period === period);
        if (!item) return undefined;
        return {
          text: entity.type === "teacher" ? item.room : koreanName(item.subject),
          sub: entity.type === "student" ? item.room : entity.type === "teacher" ? koreanName(item.subject) : item.teacher,
          onPress: () => navigate(searchHref(subjectQuery(item.subject))),
          hint: `${DAY_LABEL[item.day]} ${period}교시 ${koreanName(item.subject)} ${item.room}`,
        };
      }}
    />
  );
};

const Consolidated = ({ entities, logical, mode }: { entities: Entity[]; logical: boolean; mode: string }) => {
  const [picked, setPicked] = useState(0);
  const [view, setView] = useState("grid");
  const [limit, setLimit] = useState(6);
  const navigate = useNavigate();
  const entity = entities[Math.min(picked, entities.length - 1)];
  const comparison = compare(entities);
  if (!entity) return null;
  return (
    <Card
      title={logical && mode === "general" ? "찾은 대상" : `${KIND[entity.type]} ${entity.name}`}
      description={entities.length > 1 ? `${entities.length}명(곳)이 걸렸습니다. 하나를 골라 시간표를 봅니다.` : undefined}
      actions={<Segmented label="보기" value={view} onChange={setView} options={[{ id: "grid", label: "시간표", glyph: "calendar-days" }, { id: "list", label: "목록", glyph: "list" }]} />}
    >
      <Grid columns={{ base: 1, lg: entities.length > 1 ? "minmax(0, 2fr) minmax(0, 3fr)" : 1 }} gap="xl" align="start">
        {entities.length > 1 ? (
          <Stack gap="xs">
            {entities.slice(0, limit).map((item, index) => (
              <EntityTile key={`${item.type}-${item.id}`} entity={item} selected={index === picked} onPick={() => setPicked(index)} />
            ))}
            {entities.length > limit ? <Button variant="ghost" size="sm" onClick={() => setLimit((value) => value + 6)}><Glyph name="plus" />더 보기 ({entities.length - limit})</Button> : null}
          </Stack>
        ) : null}
        <Stack gap="md" minWidth={0}>
          {entities.length === 1 ? (
            <Inline gap="sm" align="center" wrap>
              <Text as="span" ink="secondary">{entity.type === "student" ? `${entity.id} · ` : ""}{entity.type === "room" ? `주 ${entity.times.length}교시` : `${entity.subjects.length}개 과목 · 주 ${entity.times.length}교시`}</Text>
            </Inline>
          ) : null}
          {view === "grid" ? (
            <TimetableOf entity={entity} />
          ) : (
            <Stack gap="xs">
              <Eyebrow>{entity.type === "student" ? "수강 중" : entity.type === "teacher" ? "담당" : "사용"} {entity.subjects.length}</Eyebrow>
              <Grid columns={{ base: 1, sm: 2 }} gap="xs">
                {entity.subjects.map((subject) => (
                  <Button key={subject} as={RouterLink} to={searchHref(subjectQuery(subject))} variant="ghost" size="sm" fontSize="body" justify="start" fullWidth>{koreanName(subject)}</Button>
                ))}
              </Grid>
            </Stack>
          )}
          {comparison ? (
            <Notice tone={comparison.conflicts > 0 ? "warning" : "success"} glyph={comparison.conflicts > 0 ? "triangle-alert" : "circle-check"}>
              {comparison.conflicts > 0 ? `같은 시간에 서로 다른 수업을 듣는 교시가 ${comparison.conflicts}개 있습니다.` : "겹치는 수업 시간이 없습니다."} 모두 비어 있는 교시는 {comparison.free.length}개입니다.
            </Notice>
          ) : null}
        </Stack>
      </Grid>
      {entities.length === 1 && entity.type !== "room" ? (
        <Inline gap="sm" wrap>
          <Button variant="hairline" size="sm" onClick={() => navigate(searchHref(entity.type === "teacher" ? `teacher:${entity.name}` : `student:${entity.id}`))}><Glyph name="search" />이 {KIND[entity.type]}만 다시 찾기</Button>
        </Inline>
      ) : null}
    </Card>
  );
};

export const SearchPage = () => {
  const { data, me, term, clock } = useClasses();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const [input, setInput] = useState(query);
  const [years, setYears] = useState<string[]>(Object.keys(data.cohorts));
  const [open, setOpen] = useState<string[]>([]);
  const [updated, setUpdated] = useState(clock.minute);

  useEffect(() => setInput(query), [query]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (input !== query) setParams(input ? { q: input } : {}, { replace: true });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [input, query, setParams]);

  const outcome = useMemo(() => search(data, query, years), [data, query, years]);
  const terms = useMemo(() => searchTerms(query), [query]);
  const logical = isLogical(query);
  const consolidated = query.trim() !== "" && (outcome.mode !== "general" || logical);
  const cohorts = Object.keys(data.cohorts);

  const autoOpen = outcome.data.length <= 2 ? outcome.data.map((subject) => subject.subject) : [];
  const isOpen = (name: string) => open.includes(name) || (autoOpen.includes(name) && !open.includes(`-${name}`));
  const toggle = (name: string) => setOpen((now) => (isOpen(name) ? [...now.filter((item) => item !== name), `-${name}`] : [...now.filter((item) => item !== `-${name}`), name]));

  const examples = useMemo(() => {
    const first = data.subjects.find((subject) => subject.subject === "정보과학3") ?? data.subjects[0]!;
    const teacher = first.sections[0]?.teacher ?? "";
    const room = first.sections[0]?.room ?? "";
    return [first.subject, "ㅈㅂㄱㅎ3", `teacher:${teacher}`, `room:${room}`, `student:${me.stuId}`, `${subjectQuery(first.subject)}/2`, "미적분학2 EC + 선형대수 EC"];
  }, [data, me.stuId]);

  const time = `${String(Math.floor(updated / 60)).padStart(2, "0")}:${String(updated % 60).padStart(2, "0")}`;
  const showEntities = outcome.entities.length > 0 && (consolidated || outcome.entities.length <= 12);

  return (
    <>
      <PageHeader eyebrow={`${termLabel(term)}학기`} title="검색" description="과목, 교사, 학번, 강의실을 한 칸에서 찾습니다. 줄여 쓴 말과 초성도 알아듣습니다." />

      <Card padding="lg">
        <Field
          size="lg"
          aria-label="검색어"
          placeholder="학생 이름, 과목, 교사, 강의실 또는 논리식 (예: 정보과학3/2 + 자료구조)"
          leading={<Glyph name="search" />}
          trailing={<SyntaxHelp />}
          value={input}
          clearable
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.nativeEvent.isComposing) setParams(input ? { q: input } : {}, { replace: true });
          }}
        />
        <Inline gap="xs" wrap align="center">
          <Eyebrow>예시</Eyebrow>
          {examples.map((example) => (
            <Button key={example} as={RouterLink} to={searchHref(example)} variant="muted" size="xs">{example}</Button>
          ))}
        </Inline>
        <Divider />
        <Inline justify="between" align="center" gap="md" wrap>
          <Inline gap="sm" align="center" wrap>
            <Eyebrow>학번</Eyebrow>
            {cohorts.map((cohort) => {
              const on = years.includes(cohort);
              return (
                <Button key={cohort} variant="hairline" size="sm" selected={on} onClick={() => setYears((now) => (now.includes(cohort) ? now.filter((item) => item !== cohort) : [...now, cohort]))}>
                  {cohort}학번<Text as="span" variant="label" strong={false} ink="tertiary" numeric>{data.cohorts[cohort]}</Text>
                </Button>
              );
            })}
            {years.length < cohorts.length ? <Button variant="ghost" size="sm" onClick={() => setYears(cohorts)}>전체</Button> : null}
          </Inline>
          <Inline gap="sm" align="center">
            <Text as="span" variant="caption" ink="tertiary" numeric>{time} 기준</Text>
            <Button variant="ghost" size="sm" onClick={() => { setUpdated(clock.minute); toast("학기 데이터를 새로 받았습니다"); }}><Glyph name="refresh-cw" />새로고침</Button>
          </Inline>
        </Inline>
      </Card>

      {years.length === 0 ? (
        <Card><Empty glyph="filter" title="고른 학번이 없습니다" description="학번을 하나 이상 골라야 결과가 나옵니다." action={<Button size="sm" variant="hairline" onClick={() => setYears(cohorts)}>모두 고르기</Button>} /></Card>
      ) : null}

      {years.length > 0 && query.trim() === "" ? (
        <StatRow>
          <Stat label="과목" value={outcome.subjects} unit="개" note={`${termLabel(term)}학기 개설`} />
          <Stat label="분반" value={outcome.sections} unit="개" />
          <Stat label="수강생" value={outcome.students} unit="명" note={years.map((year) => `${year}학번`).join(" · ")} />
        </StatRow>
      ) : null}

      {years.length > 0 && query.trim() !== "" ? (
        <Card title="검색 결과" description={outcome.mode !== "general" ? `${KIND[outcome.mode]}만 찾는 중입니다.` : undefined}>
          <Stack gap="md">
            <QueryText query={query} />
            <Inline gap="xl" wrap>
              <Stat label="일치한 과목" value={outcome.subjects} unit="개" small />
              <Stat label="분반" value={outcome.sections} unit="개" small />
              <Stat label="수강생" value={outcome.students} unit="명" small />
              {outcome.entities.length > 0 ? <Stat label="찾은 대상" value={outcome.entities.length} unit={outcome.entities.length === 1 ? KIND[outcome.entities[0]!.type] : "곳"} small /> : null}
            </Inline>
            {outcome.warning ? <Notice tone="warning" glyph="triangle-alert">{outcome.warning}</Notice> : null}
          </Stack>
        </Card>
      ) : null}

      {query.trim() !== "" && showEntities && consolidated ? <Consolidated key={query} entities={outcome.entities} logical={logical} mode={outcome.mode} /> : null}

      {query.trim() !== "" && showEntities && !consolidated ? (
        <Card title="찾은 대상" description="눌러서 그 대상만 찾습니다.">
          <Grid columns={{ base: 1, md: 2, lg: 3 }} gap="sm">
            {outcome.entities.slice(0, 12).map((entity) => (
              <Button key={`${entity.type}-${entity.id}`} as={RouterLink} to={searchHref(entity.type === "teacher" ? `teacher:${entity.name}` : entity.type === "room" ? `room:${entity.name}` : `student:${entity.id}`)} variant="muted" size="lg" justify="between" fullWidth>
                <Inline as="span" gap="sm" align="center" minWidth={0}>
                  <Text as="span" truncate>{entity.name}</Text>
                  <Badge size="xs" variant="soft">{KIND[entity.type]}</Badge>
                </Inline>
                <Text as="span" variant="caption" ink="tertiary" numeric>{entity.type === "student" ? `${cohortOf(entity.id)}학번` : `${entity.subjects.length}과목`}</Text>
              </Button>
            ))}
          </Grid>
        </Card>
      ) : null}

      {years.length > 0 ? (
        <Card title={query.trim() ? "일치한 과목" : "모든 과목"} description={outcome.data.length > 2 ? "과목을 눌러 분반과 수강생을 봅니다." : undefined}>
          {outcome.data.length === 0 ? (
            <Empty glyph="search" title="찾은 것이 없습니다" description="철자를 줄이거나 초성으로 찾아 보세요. 괄호나 + & ! 는 논리식으로 읽힙니다." action={<Button as={RouterLink} to={searchHref("")} size="sm" variant="hairline">검색어 지우기</Button>} />
          ) : (
            <Stack gap="xs">
              {outcome.data.map((subject) => (
                <SubjectRow key={subject.subjectId} subject={subject} expanded={isOpen(subject.subject)} onToggle={() => toggle(subject.subject)} terms={terms} years={years} focus={outcome.mode === "student" && outcome.entities[0] ? outcome.entities[0].id : null} />
              ))}
            </Stack>
          )}
        </Card>
      ) : null}
      <Hint>데이터는 학교 시스템에서 학기마다 한 번 받아 두고, 검색은 이 기기에서 합니다.</Hint>
    </>
  );
};
