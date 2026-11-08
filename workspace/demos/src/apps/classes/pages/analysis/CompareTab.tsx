import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";

import { Badge, Button, Field, Grid, IconButton, Inline, Pressable, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, useToast } from "../../../../kit";
import { DAY_FULL, DAYS, hhmm, periodTime, slotKey, type Day } from "../../data/periods";
import { termIndex } from "../../lib/index";
import { cohortOf, koreanName } from "../../lib/utils";
import { useClasses } from "../../state";
import { Card, Eyebrow, Highlight, Hint } from "../../ui/parts";
import { CompareGrid, type Cell } from "./CompareGrid";
import { shortName } from "./stats";
import { classify, personOf, suggest, summarize, type Person } from "./weeks";

const Detail = ({ people, day, period, onClose }: { people: readonly Person[]; day: Day; period: number; onClose: () => void }) => {
  const time = periodTime(period);
  const key = slotKey(day, period);
  return (
    <Surface as="section" fill="sunken" radius="md" padding="md" aria-label={`${DAY_FULL[day]} ${period}교시`}>
      <Stack gap="sm">
        <Inline justify="between" align="center" gap="md">
          <Inline gap="sm" align="baseline" wrap>
            <Text as="h4" variant="subheading">{DAY_FULL[day]} {period}교시</Text>
            {time ? <Text as="span" variant="caption" ink="tertiary" numeric>{hhmm(time.start)}–{hhmm(time.end)}</Text> : null}
          </Inline>
          <IconButton variant="ghost" size="xs" aria-label="닫기" onClick={onClose}><Glyph name="x" /></IconButton>
        </Inline>
        <Stack as="ul" gap="xs">
          {people.map((person) => {
            const placed = person.at.get(key);
            return (
              <Inline as="li" key={person.stuId} justify="between" align="baseline" gap="md">
                <Text as="span">{person.name}</Text>
                {placed ? <Text as="span" ink="secondary" truncate>{koreanName(placed.subject)} · {placed.room}</Text> : <Text as="span" ink="success">공강</Text>}
              </Inline>
            );
          })}
        </Stack>
      </Stack>
    </Surface>
  );
};

const periodFrom = (value: string | undefined): { day: Day; period: number } | null => {
  const [day, period] = (value ?? "").split("-");
  const found = DAYS.find((item) => item === day);
  const number = Number(period);
  return found && Number.isInteger(number) && periodTime(number) ? { day: found, period: number } : null;
};

export const ComparePanel = ({ ids, onIds, seed }: { ids: string[]; onIds: (next: string[]) => void; seed?: { who?: string; cell?: string } }) => {
  const { data, me, friends, studentName } = useClasses();
  const toast = useToast();
  const listId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(seed?.who ?? "");
  const [cursor, setCursor] = useState(0);
  const [active, setActive] = useState<{ day: Day; period: number } | null>(() => periodFrom(seed?.cell));

  const index = termIndex(data);
  const people = useMemo(
    () =>
      ids.flatMap((id) => {
        const entry = index.students.get(id);
        return entry ? [personOf(entry)] : [];
      }),
    [ids, index],
  );
  const found = useMemo(() => suggest(data, query, ids), [data, query, ids]);
  const summary = useMemo(() => summarize(people), [people]);
  const text = query.trim();
  const open = found.list.length > 0;
  const current = Math.min(cursor, found.list.length - 1);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const add = (id: string) => {
    onIds([...ids, id]);
    setQuery("");
    setCursor(0);
    input.current?.focus();
  };
  const remove = (id: string) => onIds(ids.filter((item) => item !== id));
  const clearAll = () => {
    const before = ids;
    onIds([]);
    setActive(null);
    toast("비교하던 학생을 모두 뺐습니다", { action: { label: "되돌리기", onSelect: () => onIds(before) } });
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    const count = found.list.length;
    if (event.key === "ArrowDown" && count > 0) {
      event.preventDefault();
      setCursor(Math.min(count - 1, current + 1));
    } else if (event.key === "ArrowUp" && count > 0) {
      event.preventDefault();
      setCursor(Math.max(0, current - 1));
    } else if (event.key === "Enter" && count > 0) {
      event.preventDefault();
      const target = found.list[current];
      if (target) add(target.stuId);
    } else if (event.key === "Escape" && (text !== "" || count > 0)) {
      event.preventDefault();
      event.stopPropagation();
      setQuery("");
      setCursor(0);
    }
  };

  const quick = [me.stuId, ...friends].filter((id, position, list) => list.indexOf(id) === position && !ids.includes(id) && index.students.has(id)).slice(0, 6);

  const cell = (day: Day, period: number): Cell => {
    if (people.length === 0) return {};
    const key = slotKey(day, period);
    const where = `${DAY_FULL[day]} ${period}교시`;
    const pressed = active?.day === day && active.period === period;
    const press = { onPress: () => setActive(pressed ? null : { day, period }), pressed };
    const { kind, busy } = classify(people, key);
    const first = busy[0]?.placed;
    if (people.length === 1) {
      return {
        tone: pressed ? "strong" : "plain",
        text: first ? koreanName(first.subject) : undefined,
        sub: first?.room,
        hint: first ? `${where}, ${koreanName(first.subject)} ${first.room}` : `${where}, 수업 없음`,
        ...press,
      };
    }
    if (kind === "free") return { tone: pressed ? "strong" : "success", text: "공강", hint: `${where}, 모두 비어 있음`, ...press };
    if (kind === "common" && first) {
      const together = busy.every((item) => item.placed.subjectId === first.subjectId && item.placed.section === first.section);
      return { tone: pressed ? "strong" : "info", text: koreanName(first.subject), sub: together ? first.room : "다른 분반", hint: `${where}, 모두 ${koreanName(first.subject)}`, ...press };
    }
    if (kind === "conflict") return { tone: pressed ? "strong" : "warning", text: "충돌", hint: `${where}, 모두 수업이 있지만 서로 다른 수업입니다`, ...press };
    return {
      tone: pressed ? "strong" : "plain",
      text: busy.length <= 2 ? busy.map((item) => shortName(item.person.name)).join("·") : `${busy.length}명`,
      sub: busy.length === 1 && first ? koreanName(first.subject) : undefined,
      hint: `${where}, ${busy.length}명이 수업 중`,
      ...press,
    };
  };

  return (
    <Card title="시간표 비교" description="학생을 두 명 이상 고르면 모두가 비는 교시와 같이 듣는 수업을 찾아 줍니다.">
      <Grid columns={{ base: 1, xl: "minmax(0, 5fr) minmax(0, 7fr)" }} gap="2xl" align="start">
        <Stack gap="xl">
          <Stack gap="sm">
            <Text as="h3" variant="subheading">학생 추가</Text>
            <Field
              ref={input}
              aria-label="학생 이름 또는 학번"
              placeholder="이름 또는 학번 (두 글자 이상)"
              leading={<Glyph name="search" />}
              clearable
              autoComplete="off"
              role="combobox"
              aria-expanded={open}
              aria-controls={open ? listId : undefined}
              aria-autocomplete="list"
              aria-activedescendant={open ? `${listId}-${current}` : undefined}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCursor(0);
              }}
              onKeyDown={onKeyDown}
            />
            {open ? (
              <Surface fill="sunken" radius="md" padding="xs" id={listId} role="listbox" aria-label="학생 후보">
                <Stack gap="xs">
                  {found.list.map((entry, position) => (
                    <Surface
                      key={entry.stuId}
                      as={Pressable}
                      role="option"
                      id={`${listId}-${position}`}
                      aria-selected={position === current}
                      hoverable
                      selected={position === current}
                      radius="sm"
                      paddingX="md"
                      paddingY="sm"
                      onPress={() => add(entry.stuId)}
                    >
                      <Inline as="span" justify="between" gap="md">
                        <Text as="span" truncate><Highlight text={entry.name} terms={[text]} /></Text>
                        <Text as="span" variant="caption" ink="tertiary" numeric>{entry.stuId} · {entry.subjects.length}과목</Text>
                      </Inline>
                    </Surface>
                  ))}
                </Stack>
              </Surface>
            ) : null}
            {[...text].length >= 2 && !open ? <Text as="p" variant="caption" ink="tertiary" role="status">‘{text}’와 일치하는 학생이 없습니다.</Text> : null}
            {found.total > found.list.length ? <Text as="p" variant="caption" ink="tertiary" role="status">일치하는 학생이 {found.total}명입니다. 글자를 더 넣으면 줄어듭니다.</Text> : null}
            <Hint>두 글자 이상 넣으면 후보가 나옵니다. 초성으로도 찾고, ↑ ↓ 와 Enter 로 고를 수 있습니다.</Hint>
          </Stack>

          <Stack gap="sm">
            <Inline justify="between" align="center" gap="md">
              <Inline gap="sm" align="baseline">
                <Text as="h3" variant="subheading">비교할 학생</Text>
                <Text as="span" variant="caption" ink="tertiary" numeric>{people.length}명</Text>
              </Inline>
              {people.length > 0 ? <Button variant="ghost" size="xs" onClick={clearAll}>모두 빼기</Button> : null}
            </Inline>
            {people.length === 0 ? (
              <Text ink="tertiary">아직 고른 학생이 없습니다.</Text>
            ) : (
              <Inline as="ul" gap="xs" wrap aria-label="비교 중인 학생">
                {people.map((person) => (
                  <Inline as="li" key={person.stuId}>
                    <Button variant="muted" fill="sunken" size="sm" shape="pill" aria-label={`${person.name} 빼기`} onClick={() => remove(person.stuId)}>
                      <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{cohortOf(person.stuId)}</Text>
                      {person.name}
                      <Glyph name="x" />
                    </Button>
                  </Inline>
                ))}
              </Inline>
            )}
          </Stack>

          {quick.length > 0 ? (
            <Stack gap="sm">
              <Eyebrow>빠른 추가</Eyebrow>
              <Inline gap="xs" wrap>
                {quick.map((id) => (
                  <Button key={id} variant="dashed" size="xs" shape="pill" onClick={() => add(id)}>
                    <Glyph name="plus" />
                    {id === me.stuId ? `${me.name} (나)` : studentName(id)}
                  </Button>
                ))}
              </Inline>
            </Stack>
          ) : null}
        </Stack>

        <Stack gap="md" minWidth={0}>
          <Inline justify="between" align="center" gap="md" wrap>
            <Text as="h3" variant="subheading">{people.length === 1 ? `${people[0]?.name}의 시간표` : "공통 시간표"}</Text>
            {people.length >= 2 ? (
              <Inline gap="xs" wrap>
                <Badge variant="soft" accent="success" size="sm">공통 빈 교시 {summary.free}</Badge>
                <Badge variant="soft" accent="info" size="sm">같은 수업 {summary.common}</Badge>
                <Badge variant="soft" accent={summary.conflict > 0 ? "warning" : "primary"} size="sm">충돌 {summary.conflict}</Badge>
              </Inline>
            ) : null}
          </Inline>
          <CompareGrid label={people.length === 1 ? `${people[0]?.name}의 주간 시간표` : "공통 시간표"} cell={cell} />
          {active && people.length > 0 ? (
            <Detail people={people} day={active.day} period={active.period} onClose={() => setActive(null)} />
          ) : (
            <Hint>
              {people.length === 0
                ? "학생을 고르면 한 주의 수업이 여기 나옵니다. 두 명 이상 고르면 공통 빈 교시를 칸마다 칠해 보여 줍니다."
                : people.length === 1
                  ? "한 명을 더 고르면 공통 빈 교시와 충돌을 보여 줍니다. 칸을 누르면 그 교시를 자세히 봅니다."
                  : "위 배지와 같은 색으로 칠한 칸이 공통 빈 교시, 같은 수업, 충돌입니다. 칸을 누르면 누가 어디 있는지 봅니다."}
            </Hint>
          )}
        </Stack>
      </Grid>
    </Card>
  );
};
