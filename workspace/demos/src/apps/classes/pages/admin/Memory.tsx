import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Badge, Button, Field, FormField, Inline, Stack, Surface, Text, Textarea } from "@studio-baeks/paper-ui";

import { Empty, Glyph, Segmented, useToast } from "../../../../kit";
import { MEMORY_POSTS, type MemoryFact, type MemoryPost } from "../../data/admin";
import { TRACKS } from "../../data/majors";
import { useClasses } from "../../state";
import { Card, Eyebrow } from "../../ui/parts";
import { dayLabel, Pager, SearchField, Toolbar, useBriefly } from "./parts";
import { useAdmin } from "./store";

type Filter = "all" | "active" | "hidden" | "edited";
const FILTERS: readonly Filter[] = ["all", "active", "hidden", "edited"];
const FILTER_LABEL: Record<Filter, string> = { all: "전체", active: "활성", hidden: "숨김", edited: "고친 것" };
const POSTS_PER_PAGE = 4;
const STATEMENT_MIN = 5;
const STATEMENT_MAX = 300;
const TOPIC_MAX = 60;

const validity = (until: string | null, today: string) => {
  if (!until) return null;
  const [year, month, day] = until.split("-");
  const date = `${year === today.slice(0, 4) ? "" : `${year}/`}${Number(month)}/${Number(day)}`;
  const expired = until < today;
  return { label: expired ? `${date} 기한 지남` : `~${date}까지 유효`, expired };
};

const gradesLabel = (grades: readonly number[]) => (grades.length === 0 ? "" : `${[...grades].sort().join("·")}학년`);
const majorsLabel = (majors: readonly string[]) => majors.join("·");

type Draft = { statement: string; topic: string; grades: number[]; majors: string[]; validUntil: string };
const draftOf = (fact: MemoryFact): Draft => ({ statement: fact.statement, topic: fact.topic, grades: fact.grades, majors: fact.majors, validUntil: fact.validUntil ?? "" });
const sameList = <T,>(a: readonly T[], b: readonly T[]) => a.length === b.length && a.every((item) => b.includes(item));
const changedFrom = (fact: MemoryFact, draft: Draft) =>
  draft.statement.trim() !== fact.statement || draft.topic.trim() !== fact.topic || !sameList(draft.grades, fact.grades) || !sameList(draft.majors, fact.majors) || draft.validUntil !== (fact.validUntil ?? "");
const toggled = <T,>(list: readonly T[], value: T) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

const FactEditor = ({ fact, onCancel, onSave }: { fact: MemoryFact; onCancel: () => void; onSave: (draft: Draft) => void }) => {
  const [draft, setDraft] = useState<Draft>(() => draftOf(fact));
  const length = [...draft.statement.trim()].length;
  const statementIssue = length < STATEMENT_MIN ? `문장은 ${STATEMENT_MIN}자 이상이어야 합니다.` : length > STATEMENT_MAX ? `문장은 ${STATEMENT_MAX}자까지입니다.` : null;
  const topicIssue = [...draft.topic.trim()].length > TOPIC_MAX ? `주제는 ${TOPIC_MAX}자까지입니다.` : null;
  const patch = (next: Partial<Draft>) => setDraft((now) => ({ ...now, ...next }));
  return (
    <Stack gap="md">
      <FormField label="문장" description={`글을 읽지 않은 사람도 알아듣는 한 문장으로 적습니다 · ${length}/${STATEMENT_MAX}자`} invalid={statementIssue !== null} error={statementIssue}>
        <Textarea rows={3} value={draft.statement} onChange={(event) => patch({ statement: event.target.value })} />
      </FormField>
      <FormField label="주제" description="사실을 한눈에 부르는 이름입니다." invalid={topicIssue !== null} error={topicIssue}>
        <Field value={draft.topic} placeholder="예: 주중 외출 시간" onChange={(event) => patch({ topic: event.target.value })} />
      </FormField>
      <Stack gap="xs">
        <Eyebrow>대상 학년 — 고르지 않으면 전교생</Eyebrow>
        <Inline gap="xs" wrap>
          {[1, 2, 3].map((grade) => (
            <Button key={grade} variant="hairline" size="sm" selected={draft.grades.includes(grade)} onClick={() => patch({ grades: toggled(draft.grades, grade) })}>{grade}학년</Button>
          ))}
        </Inline>
      </Stack>
      <Stack gap="xs">
        <Eyebrow>대상 전공 — 고르지 않으면 전공과 상관없음</Eyebrow>
        <Inline gap="xs" wrap>
          {TRACKS.map((track) => (
            <Button key={track} variant="hairline" size="sm" selected={draft.majors.includes(track)} onClick={() => patch({ majors: toggled(draft.majors, track) })}>{track}</Button>
          ))}
        </Inline>
      </Stack>
      <FormField label="유효 기한" description={draft.validUntil ? "이 날이 지나면 Ask가 쓰지 않습니다." : "기한 없이 씁니다. 규칙처럼 늘 맞는 사실입니다."}>
        <Inline gap="sm" align="center" wrap>
          <Field type="date" value={draft.validUntil} onChange={(event) => patch({ validUntil: event.target.value })} />
          <Button variant="ghost" size="sm" disabled={!draft.validUntil} onClick={() => patch({ validUntil: "" })}>계속 유효</Button>
        </Inline>
      </FormField>
      <Inline justify="between" align="center" gap="md" wrap>
        <Text variant="caption" ink="tertiary">고친 사실은 글을 다시 분석해도 그대로 남습니다.</Text>
        <Inline gap="sm">
          <Button variant="hairline" onClick={onCancel}>취소</Button>
          <Button variant="solid" disabled={statementIssue !== null || topicIssue !== null} onClick={() => onSave(draft)}>저장</Button>
        </Inline>
      </Inline>
    </Stack>
  );
};

const FactLine = ({ fact, today, onEdit, onToggle }: { fact: MemoryFact; today: string; onEdit: () => void; onToggle: () => void }) => {
  const hidden = fact.status === "hidden";
  const until = validity(fact.validUntil, today);
  const inUse = !hidden && !until?.expired;
  const detail = [gradesLabel(fact.grades), majorsLabel(fact.majors), until?.label ?? ""].filter(Boolean).join(" · ");
  return (
    <Inline justify="between" align="start" gap="md" wrap>
      <Stack gap="xs" minWidth={0}>
        <Text ink={inUse ? "primary" : "tertiary"}>{fact.statement}</Text>
        <Inline gap="sm" align="center" wrap>
          {fact.topic ? <Badge size="sm" variant="soft">{fact.topic}</Badge> : null}
          {detail ? <Text as="span" variant="caption" ink="tertiary">{detail}</Text> : null}
          {hidden ? <Badge size="xs" variant="hairline">숨김</Badge> : null}
          {fact.edited ? <Badge size="xs" variant="soft" accent="info">고친 것</Badge> : null}
        </Inline>
      </Stack>
      <Inline gap="xs">
        <Button variant="ghost" size="xs" onClick={onEdit}><Glyph name="pencil" />고치기</Button>
        <Button variant="ghost" size="xs" onClick={onToggle}><Glyph name={hidden ? "eye" : "eye-off"} />{hidden ? "되살리기" : "숨기기"}</Button>
      </Inline>
    </Inline>
  );
};

export const MemoryPanel = () => {
  const { clock } = useClasses();
  const { facts, setFacts } = useAdmin();
  const toast = useToast();
  const [params] = useSearchParams();
  const [filter, setFilter] = useState<Filter>(() => FILTERS.find((item) => item === params.get("filter")) ?? "all");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [page, setPage] = useState(Number(params.get("page")) || 1);
  const [editing, setEditing] = useState<number | null>(() => Number(params.get("edit")) || null);
  const [busy, refresh] = useBriefly();

  const counts = useMemo(
    () => ({ all: facts.length, active: facts.filter((fact) => fact.status === "active").length, hidden: facts.filter((fact) => fact.status === "hidden").length, edited: facts.filter((fact) => fact.edited).length }),
    [facts],
  );

  const groups = useMemo(() => {
    const words = query.trim().toLowerCase();
    const posts = new Map<number, MemoryPost>(MEMORY_POSTS.map((post) => [post.id, post]));
    const matches = (fact: MemoryFact) => {
      if (filter === "active" && fact.status !== "active") return false;
      if (filter === "hidden" && fact.status !== "hidden") return false;
      if (filter === "edited" && !fact.edited) return false;
      if (!words) return true;
      return [fact.statement, fact.topic, posts.get(fact.postId)?.title ?? ""].some((text) => text.toLowerCase().includes(words));
    };
    return [...MEMORY_POSTS]
      .sort((a, b) => b.postedOn.localeCompare(a.postedOn))
      .map((post) => ({ post, facts: facts.filter((fact) => fact.postId === post.id && matches(fact)) }))
      .filter((group) => group.facts.length > 0);
  }, [facts, filter, query]);

  const pages = Math.max(1, Math.ceil(groups.length / POSTS_PER_PAGE));
  const current = Math.min(page, pages);
  const visible = groups.slice((current - 1) * POSTS_PER_PAGE, current * POSTS_PER_PAGE);

  const change = (id: number, next: Partial<MemoryFact>) => setFacts((list) => list.map((fact) => (fact.id === id ? { ...fact, ...next } : fact)));
  const toggle = (fact: MemoryFact) => {
    const hide = fact.status === "active";
    change(fact.id, { status: hide ? "hidden" : "active" });
    toast(hide ? "숨겼습니다. Ask가 더는 쓰지 않습니다" : "되살렸습니다", { action: { label: "되돌리기", onSelect: () => change(fact.id, { status: fact.status }) } });
  };
  const save = (fact: MemoryFact, draft: Draft) => {
    setEditing(null);
    if (!changedFrom(fact, draft)) return;
    change(fact.id, {
      statement: draft.statement.trim(),
      topic: draft.topic.trim(),
      grades: [...draft.grades].sort(),
      majors: TRACKS.filter((track) => draft.majors.includes(track)),
      validUntil: draft.validUntil || null,
      edited: true,
    });
    toast("고쳤습니다. 글을 다시 분석해도 그대로 남습니다");
  };

  return (
    <Card
      title="Ask가 기억하는 사실"
      description="학교 공지에서 뽑은 짧은 사실입니다. Ask는 질문에 맞는 사실을 골라 답에 쓰고, 숨겼거나 기한이 지난 사실은 쓰지 않습니다. 숨기거나 고친 사실은 글을 다시 분석해도 그대로 남습니다."
      padding="lg"
      actions={
        <Button variant="ghost" size="sm" loading={busy} onClick={() => refresh(() => toast("기억을 새로 받았습니다"))}>
          <Glyph name="refresh-cw" />새로 받기
        </Button>
      }
    >
      <SearchField label="기억 찾기" placeholder="문장 · 주제 · 글 제목으로 찾기" value={query} onChange={(value) => { setQuery(value); setPage(1); }} />
      <Toolbar
        start={
          <Segmented
            label="기억 거르기"
            value={filter}
            onChange={(id) => { setFilter(id as Filter); setPage(1); }}
            options={FILTERS.map((id) => ({ id, label: FILTER_LABEL[id], count: counts[id] }))}
          />
        }
        end={pages > 1 || groups.length > 0 ? <Pager page={current} pages={pages} onPage={setPage} note={`글 ${groups.length}개`} /> : null}
      />

      {facts.length === 0 ? (
        <Empty glyph="brain" title="아직 기억이 없습니다" description="학교 공지를 분석하면 사실이 쌓입니다." />
      ) : visible.length === 0 ? (
        <Empty glyph="search" title="조건에 맞는 기억이 없습니다" description="검색어를 줄이거나 다른 상태를 골라 보세요." />
      ) : (
        <Stack gap="md">
          {visible.map(({ post, facts: lines }) => (
            <Surface as="section" key={post.id} fill="sunken" radius="md" padding="lg" aria-label={post.title}>
              <Stack gap="md">
                <Inline justify="between" align="start" gap="md" wrap>
                  <Stack gap="xs" minWidth={0}>
                    <Text as="span" variant="caption" ink="tertiary" numeric>{[dayLabel(`${post.postedOn}T12:00:00+09:00`), post.board, `사실 ${lines.length}`].join(" · ")}</Text>
                    <Text as="h3" variant="subheading">{post.title}</Text>
                    <Text variant="caption" ink="secondary">{post.summary}</Text>
                  </Stack>
                  <Button variant="ghost" size="xs" onClick={() => toast("데모라 원문 게시판은 열지 않습니다")}><Glyph name="external-link" />원문</Button>
                </Inline>
                <Stack as="ul">
                  {lines.map((fact) => (
                    <Surface as="li" key={fact.id} border="top" paddingY="md">
                      {editing === fact.id ? (
                        <FactEditor fact={fact} onCancel={() => setEditing(null)} onSave={(draft) => save(fact, draft)} />
                      ) : (
                        <FactLine fact={fact} today={clock.key} onEdit={() => setEditing(fact.id)} onToggle={() => toggle(fact)} />
                      )}
                    </Surface>
                  ))}
                </Stack>
              </Stack>
            </Surface>
          ))}
        </Stack>
      )}
    </Card>
  );
};
