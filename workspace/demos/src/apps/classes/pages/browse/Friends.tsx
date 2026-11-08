// 친구 — add people and see who is free right now. Adding is one-way: nobody has to accept, because the app already
// holds the whole term. One search box does both jobs: it narrows the friends you have, and when the person is not among
// them it offers the school to pick from (from two letters, eight at most). What shows is only when someone has a class —
// never which class.

import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Badge, Button, Field, IconButton, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, Person, useToast } from "../../../../kit";
import { PERIODS, type Day } from "../../data/periods";
import { termIndex } from "../../lib";
import { dayCode } from "../../lib/calendar";
import { useClasses } from "../../state";
import { Card, Eyebrow, Hint, Rows, SlotGrid, type Slot, searchHref } from "../../ui/parts";

const LOOKUP_MIN = 2;
const LOOKUP_LIMIT = 8;

export const Friends = () => {
  const { data, me, friends, addFriend, removeFriend, clock } = useClasses();
  const toast = useToast();
  const index = useMemo(() => termIndex(data), [data]);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const known = friends.map((stuId) => index.students.get(stuId)).filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);
  const shown = q ? known.filter((entry) => entry.name.toLowerCase().includes(q) || entry.stuId.includes(q)) : known;
  const candidates = useMemo(() => {
    if (q.length < LOOKUP_MIN) return [];
    return [...index.students.values()]
      .filter((entry) => entry.stuId !== me.stuId && !friends.includes(entry.stuId) && (entry.name.toLowerCase().includes(q) || entry.stuId.includes(q)))
      .slice(0, LOOKUP_LIMIT);
  }, [index, q, me.stuId, friends]);

  // Is a friend free in the period it is now? Not asked outside school hours.
  const today = dayCode(new Date(`${clock.key}T00:00:00`));
  const day = today === "SAT" || today === "SUN" ? null : (today as Day);
  const livePeriod = day ? (PERIODS.find((period) => clock.minute >= period.start && clock.minute < period.end)?.period ?? null) : null;
  const busyAt = (stuId: string, d: string, p: number) => Boolean(index.students.get(stuId)?.placed.some((item) => item.day === d && item.period === p));
  const freeNow = (stuId: string) => (day && livePeriod !== null ? !busyAt(stuId, day, livePeriod) : null);
  const freeCount = day && livePeriod !== null ? known.filter((entry) => freeNow(entry.stuId)).length : null;

  const everyone = [me.stuId, ...friends];
  const cell = (d: Day, p: number): Slot | undefined => {
    if (friends.length === 0) return undefined;
    const free = everyone.filter((stuId) => !busyAt(stuId, d, p)).length;
    // only the periods that nearly everyone shares are worth a mark; the rest of the grid stays quiet
    if (free < everyone.length - 1) return undefined;
    return { text: free === everyone.length ? "모두" : `${free}명`, tone: free === everyone.length ? "success" : "plain", hint: `${d} ${p}교시, ${everyone.length}명 중 ${free}명 공강` };
  };

  const add = (stuId: string, name: string) => {
    addFriend(stuId);
    toast(`${name}님을 친구로 추가했습니다`, { action: { label: "되돌리기", onSelect: () => removeFriend(stuId) } });
  };
  const remove = (stuId: string, name: string) => {
    removeFriend(stuId);
    toast(`${name}님을 친구에서 뺐습니다`, { action: { label: "되돌리기", onSelect: () => addFriend(stuId) } });
  };

  return (
    <Stack gap="xl">
      <Card
        title={`친구 ${friends.length}명`}
        description="추가하면 끝입니다. 상대가 수락할 필요가 없고, 상대는 누가 추가했는지 알지 못합니다."
        actions={freeCount !== null && friends.length > 0 ? <Badge variant="soft" accent="success" size="md"><Glyph name="users" />지금 공강 {freeCount}명</Badge> : null}
      >
        <Field aria-label="이름이나 학번으로 찾기" placeholder="이름이나 학번으로 찾기" leading={<Glyph name="search" />} clearable value={query} onChange={(event) => setQuery(event.target.value)} />

        {shown.length === 0 && !q ? (
          <Empty glyph="users" title="아직 등록한 사람이 없습니다" description="이름으로 찾아 추가해 보세요." />
        ) : shown.length > 0 ? (
          <Rows>
            {shown.map((entry) => {
              const free = freeNow(entry.stuId);
              return (
                <Inline key={entry.stuId} justify="between" align="center" gap="md">
                  <Inline gap="md" align="center" minWidth={0}>
                    <Person name={entry.name} sub={entry.stuId} />
                    {free === true ? <Badge variant="soft" accent="success" size="sm">공강</Badge> : free === false ? <Badge variant="soft" size="sm">수업 중</Badge> : null}
                  </Inline>
                  <Inline gap="xs">
                    <Button as={RouterLink} to={searchHref(`student:${entry.stuId}`)} variant="ghost" size="sm">시간표</Button>
                    <IconButton variant="ghost" size="sm" aria-label={`${entry.name} 친구에서 빼기`} onClick={() => remove(entry.stuId, entry.name)}><Glyph name="x" /></IconButton>
                  </Inline>
                </Inline>
              );
            })}
          </Rows>
        ) : null}

        {freeCount === null && friends.length > 0 && !q ? <Hint>지금은 수업 시간이 아니라 공강을 따지지 않습니다.</Hint> : null}

        {q ? (
          q.length < LOOKUP_MIN ? (
            <Hint>두 글자부터 전교생에서 찾습니다.</Hint>
          ) : candidates.length === 0 ? (
            shown.length === 0 ? <Text ink="tertiary">찾은 사람이 없습니다.</Text> : null
          ) : (
            <Stack gap="sm">
              <Eyebrow>친구로 추가</Eyebrow>
              <Rows>
                {candidates.map((entry) => (
                  <Inline key={entry.stuId} justify="between" align="center" gap="md">
                    <Person name={entry.name} sub={entry.stuId} />
                    <Button size="sm" variant="hairline" onClick={() => add(entry.stuId, entry.name)}><Glyph name="plus" />추가</Button>
                  </Inline>
                ))}
              </Rows>
            </Stack>
          )
        ) : null}
      </Card>

      <Card title="함께 비는 시간" description={friends.length ? "나와 친구들이 같은 교시에 비는 시간입니다. 무슨 수업인지는 보이지 않습니다." : "친구를 추가하면 함께 비는 시간이 나타납니다."}>
        <SlotGrid label="나와 친구들의 공강 시간표" rowHeight="2.25rem" cell={cell} />
        <Hint>초록색은 {friends.length + 1}명 모두가 비는 교시이고, 회색은 한 명만 수업이 있는 교시입니다. 나머지는 비워 둡니다.</Hint>
      </Card>
    </Stack>
  );
};
