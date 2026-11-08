import { useEffect, useRef, useState, type FormEvent } from "react";

import { Badge, Box, Button, Checkbox, Divider, Field, Grid, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";
import type { CalendarEvent, Task } from "../data/types";
import { TODAY, WEEKDAYS, addMonths, dateKey, longDay, monthCells, monthOf, monthTitle } from "../lib/dates";

const TaskSection = ({ title, tasks, onToggle, onAdd }: { title: string; tasks: readonly Task[]; onToggle: (id: string) => void; onAdd: (text: string) => void }) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (adding) field.current?.focus();
  }, [adding]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft("");
    setAdding(false);
  };
  return (
    <Stack as="section" aria-label={title} gap="sm">
      <Inline justify="between">
        <Text as="h3" variant="label" ink="primary">{title}</Text>
        <IconButton size="xs" variant="muted" aria-label={`${title} 추가`} aria-expanded={adding} onClick={() => setAdding((now) => !now)}><Glyph name="plus" ink="tertiary" /></IconButton>
      </Inline>
      <Stack gap="xs">
        {tasks.map((task) => (
          <Inline as="label" key={task.id} gap="sm" paddingY="xs">
            <Checkbox size="sm" checked={task.done} onChange={() => onToggle(task.id)} />
            <Text as={task.done ? "s" : "span"} variant="caption" ink={task.done ? "tertiary" : "secondary"}>{task.text}</Text>
          </Inline>
        ))}
      </Stack>
      {adding ? (
        <Grid as="form" columns="minmax(0, 1fr) auto" gap="xs" onSubmit={submit}>
          <Field ref={field} size="sm" aria-label={`${title} 이름`} placeholder="새 항목" value={draft} onChange={(event) => setDraft(event.target.value)} />
          <Button size="sm" type="submit">추가</Button>
        </Grid>
      ) : null}
    </Stack>
  );
};

const Calendar = ({ events, onAdd }: { events: readonly CalendarEvent[]; onAdd: (date: string) => void }) => {
  const [month, setMonth] = useState(monthOf(TODAY));
  const year = Number(month.slice(0, 4));
  const number = Number(month.slice(5, 7));
  const marked = new Set(events.map((event) => event.date));
  const listed = events.filter((event) => event.date.startsWith(month)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  return (
    <Surface as="section" aria-label="월간 달력" fill="raised" border elevation="overlay" radius="sm" padding="lg">
      <Stack gap="md">
        <Inline justify="between">
          <Inline gap="sm">
            <Glyph name="calendar-days" />
            <Text as="h2" variant="label" ink="primary">Calendar</Text>
          </Inline>
          <Inline gap="xs">
            <IconButton size="xs" variant="muted" aria-label="이전 달" onClick={() => setMonth(addMonths(month, -1))}><Glyph name="chevron-left" ink="tertiary" /></IconButton>
            <IconButton size="xs" variant="muted" aria-label="다음 달" onClick={() => setMonth(addMonths(month, 1))}><Glyph name="chevron-right" ink="tertiary" /></IconButton>
          </Inline>
        </Inline>
        <Text as="p" variant="label" strong={false} ink="tertiary">{monthTitle(month)}</Text>
        <Grid columns="repeat(7, minmax(0, 1fr))" columnGap="xs">
          {WEEKDAYS.map((name) => (
            <Inline key={name} justify="center"><Text as="span" variant="label" strong={false} ink="tertiary">{name}</Text></Inline>
          ))}
          {monthCells(month).map((day, index) => {
            if (day === null) return <Box key={index} />;
            const key = dateKey(year, number, day);
            const today = key === TODAY;
            return (
              <Button
                key={key}
                size="xs"
                variant={today ? "solid" : "muted"}
                fullWidth
                title="일정 추가"
                aria-label={`${number}월 ${day}일 일정 추가${marked.has(key) ? " (일정 있음)" : ""}`}
                badge={marked.has(key) ? <Badge accent="info" dot variant="ghost" size="xs" /> : undefined}
                onClick={() => onAdd(key)}
              >
                {day}
              </Button>
            );
          })}
        </Grid>
        <Divider />
        <Stack gap="xs">
          {listed.map((event) => (
            <Inline key={event.id} gap="sm">
              <Badge accent="info" dot variant="ghost" size="xs" aria-hidden />
              <Text as="span" variant="label" strong={false} ink="tertiary">{Number(event.date.slice(8))}일 · {event.title}</Text>
            </Inline>
          ))}
        </Stack>
      </Stack>
    </Surface>
  );
};

type Props = {
  todos: readonly Task[];
  routines: readonly Task[];
  events: readonly CalendarEvent[];
  onToggle: (which: "todos" | "routines", id: string) => void;
  onAddTask: (which: "todos" | "routines", text: string) => void;
  onAddEvent: (date: string) => void;
  onClose: () => void;
};

export const TodayPanel = ({ todos, routines, events, onToggle, onAddTask, onAddEvent, onClose }: Props) => {
  return (
    <Stack gap="md">
      <Surface as="section" aria-label="오늘의 흐름" fill="raised" border elevation="overlay" radius="sm" padding="lg">
        <Stack gap="lg">
          <Inline justify="between" align="start" gap="sm">
            <Stack gap="xs">
              <Text as="h2" variant="subheading">오늘의 흐름</Text>
              <Text as="p" variant="label" strong={false} ink="tertiary">{longDay(TODAY)}</Text>
            </Stack>
            <IconButton size="sm" variant="muted" aria-label="패널 닫기" onClick={onClose}><Glyph name="x" ink="tertiary" /></IconButton>
          </Inline>
          <TaskSection title="To-Do" tasks={todos} onToggle={(id) => onToggle("todos", id)} onAdd={(text) => onAddTask("todos", text)} />
          <TaskSection title="Routine" tasks={routines} onToggle={(id) => onToggle("routines", id)} onAdd={(text) => onAddTask("routines", text)} />
        </Stack>
      </Surface>
      <Calendar events={events} onAdd={onAddEvent} />
    </Stack>
  );
};
