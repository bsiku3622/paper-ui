// What a person has written in 자몽 and what can be done to it. Everything is kept with useStored (this browser only):
//   classes:zamong        a record per course name — { term, grade, ec }; no term, no record
//   classes:zamong-hours  the 시수 typed by the person
//   classes:zamong-seeded whether the offer of a ready-made history (밑칠) has been answered, so it is not made twice
// Every change that throws something away says so in a toast with a way back.

import { useCallback, useMemo } from "react";

import { useStored, useToast } from "../../../../kit";
import { termData, TERMS } from "../../data/build";
import { buildSeed, SEED_HOURS } from "../../data/zamongSeed";
import { EMPTY_HOURS, displayName, inferPrereqs, isTermKey, slotLabel, summarize, termSlotOf, type Hours, type ZamongEntry, type ZamongMap } from "../../lib/curriculum";
import { termIndex } from "../../lib/index";
import { useClasses } from "../../state";

const NOTHING: ZamongMap = {};

type Snapshot = { entries: ZamongMap; hours: Hours; seeded: boolean };

export const useZamong = () => {
  const { me } = useClasses();
  const toast = useToast();
  const [entries, setEntries] = useStored<ZamongMap>("classes:zamong", NOTHING);
  const [hours, setHours] = useStored<Hours>("classes:zamong-hours", EMPTY_HOURS);
  const [seeded, setSeeded] = useStored<boolean>("classes:zamong-seeded", false);

  const summary = useMemo(() => summarize(entries, hours), [entries, hours]);
  const taken = useMemo(() => new Set(Object.keys(entries)), [entries]);
  const inferred = useMemo(() => inferPrereqs(taken), [taken]);
  const recordCount = taken.size;

  const restore = useCallback(
    (snapshot: Snapshot) => {
      setEntries(snapshot.entries);
      setHours(snapshot.hours);
      setSeeded(snapshot.seeded);
    },
    [setEntries, setHours, setSeeded],
  );

  // Choosing the term is "took it"; clearing it removes the record (grade and EC with it). `announce` is for a change that moves
  // the card out of sight, as the term panel does.
  const choose = useCallback(
    (course: string, value: string, announce = false) => {
      const before = entries[course];
      const name = displayName(course);
      if (value === "") {
        if (!before) return;
        setEntries((now) => Object.fromEntries(Object.entries(now).filter(([key]) => key !== course)));
        toast(`${name} 기록을 지웠습니다`, { action: { label: "되돌리기", onSelect: () => setEntries((now) => ({ ...now, [course]: before })) } });
        return;
      }
      if (!isTermKey(value) || before?.term === value) return;
      const next: ZamongEntry = { term: value, grade: before?.grade ?? null, ec: before?.ec ?? false };
      setEntries((now) => ({ ...now, [course]: next }));
      if (announce) {
        toast(before ? `${name}: ${slotLabel(value)}로 옮겼습니다` : `${name}: ${slotLabel(value)}에 넣었습니다`, {
          action: { label: "되돌리기", onSelect: () => setEntries((now) => (before ? { ...now, [course]: before } : Object.fromEntries(Object.entries(now).filter(([key]) => key !== course)))) },
        });
      }
    },
    [entries, setEntries, toast],
  );

  // A grade or EC belongs to a record, and a record exists only once the term is chosen.
  const change = useCallback(
    (course: string, patch: (entry: ZamongEntry) => Partial<ZamongEntry>) =>
      setEntries((now) => {
        const entry = now[course];
        return entry ? { ...now, [course]: { ...entry, ...patch(entry) } } : now;
      }),
    [setEntries],
  );
  const grade = useCallback((course: string, value: string) => change(course, () => ({ grade: value || null })), [change]);
  const toggleEc = useCallback((course: string) => change(course, (entry) => ({ ec: !entry.ec })), [change]);

  const setHour = useCallback(
    (key: keyof Hours, value: number) => setHours((now) => ({ ...now, [key]: Math.max(0, Math.min(999, Math.round(value) || 0)) })),
    [setHours],
  );

  // 밑칠: the account's invented history, with this term's timetable in its own semester. Only the person's own values remain after.
  const applySeed = useCallback(
    (silent = false) => {
      const term = TERMS[0]!;
      const mine = termIndex(termData(term)).students.get(me.stuId);
      const current = (mine?.sections ?? []).map(({ subject }) => ({ subject: subject.subject, isEc: subject.isEc }));
      const before: Snapshot = { entries, hours, seeded };
      setEntries(buildSeed(current, termSlotOf(me.stuId, term.year, term.semester) ?? "4"));
      setHours(SEED_HOURS);
      setSeeded(true);
      if (!silent) toast("이 학교 수강 이력으로 채웠습니다", { action: { label: "되돌리기", onSelect: () => restore(before) } });
    },
    [entries, hours, me.stuId, restore, seeded, setEntries, setHours, setSeeded, toast],
  );

  const skipSeed = useCallback(() => setSeeded(true), [setSeeded]);

  const reset = useCallback(() => {
    const before: Snapshot = { entries, hours, seeded };
    setEntries(NOTHING);
    setHours(EMPTY_HOURS);
    setSeeded(false);
    toast("처음 상태로 돌렸습니다", { action: { label: "되돌리기", onSelect: () => restore(before) } });
  }, [entries, hours, restore, seeded, setEntries, setHours, setSeeded, toast]);

  return { entries, hours, seeded, summary, taken, inferred, recordCount, choose, grade, toggleEc, setHour, applySeed, skipSeed, reset };
};
