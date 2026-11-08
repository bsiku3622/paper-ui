import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Badge, Button, Field, FormField, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, Segmented, useToast } from "../../../../kit";
import { backupName, makeSummary, renameSummary, type ChangeSummary } from "../../data/admin";
import { TERMS, termLabel, type TermKey } from "../../data/build";
import { termIndex } from "../../lib/index";
import { cohortOf, koreanName, particleRo } from "../../lib/utils";
import { useClasses } from "../../state";
import { Card, Dialog, Hint } from "../../ui/parts";
import { Changes } from "./Changes";
import { Mono, SearchField, stamp, Table, Toolbar, useBriefly, whenLabel, type TableRow } from "./parts";
import { useAdmin } from "./store";
import { STEP_MS, SYNC_STEPS, SyncDialog, type SyncStart } from "./Sync";

type View = "students" | "teachers" | "subjects";
const VIEWS: readonly View[] = ["students", "teachers", "subjects"];
const VIEW_LABEL: Record<View, string> = { students: "학생", teachers: "교사", subjects: "과목" };
const PLACEHOLDER: Record<View, string> = { students: "학번 또는 이름으로 찾기", teachers: "교사 이름으로 찾기", subjects: "과목 이름으로 찾기" };
const PAGE = 25;

type RenameTarget = { kind: "student" | "teacher"; key: string; name: string };
type SyncResult = { term: string; changed: boolean; version: number | null; synced: number; skipped: number; elapsed: string; backup: string | null; summary: ChangeSummary | null };

const RenameDialog = ({ target, onClose, onSave }: { target: RenameTarget; onClose: () => void; onSave: (name: string) => void }) => {
  const [value, setValue] = useState(target.name);
  const field = useRef<HTMLInputElement>(null);
  const name = value.trim();
  const ready = name !== "" && name !== target.name;
  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={target.kind === "student" ? "학생 이름 고치기" : "교사 이름 고치기"}
      description={target.kind === "student" ? `학번 ${target.key}의 이름입니다. 고친 이름은 데이터 회차에 “수정”으로 남습니다.` : "고친 이름은 이 교사의 모든 분반에 적용되고, 데이터 회차에 “수정”으로 남습니다."}
      size="measure.xs"
      focusRef={field}
      footer={
        <>
          <Button variant="hairline" onClick={onClose}>취소</Button>
          <Button variant="solid" type="submit" form="admin-rename" disabled={!ready}>저장</Button>
        </>
      }
    >
      <Stack
        as="form"
        id="admin-rename"
        onSubmit={(event) => {
          event.preventDefault();
          if (ready) onSave(name);
        }}
      >
        <FormField label="이름">
          <Field ref={field} value={value} placeholder="이름 입력" onChange={(event) => setValue(event.target.value)} />
        </FormField>
      </Stack>
    </Dialog>
  );
};

export const DataPanel = () => {
  const { data, term, clock } = useClasses();
  const { versions, setVersions, backups, setBackups, renames, setRenames } = useAdmin();
  const toast = useToast();
  const [params] = useSearchParams();
  const [view, setView] = useState<View>(() => VIEWS.find((item) => item === params.get("tab")) ?? "students");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [limit, setLimit] = useState(PAGE);
  const [renaming, setRenaming] = useState<RenameTarget | null>(null);
  const [syncing, setSyncing] = useState(params.get("dialog") === "sync");
  const [lastSync, setLastSync] = useState<SyncResult | null>(null);
  const [busy, refresh] = useBriefly();

  const start: SyncStart = { state: params.get("state") === "run" ? "run" : params.get("state") === "fail" ? "fail" : "pick", step: Number(params.get("step")) || 0 };
  const index = useMemo(() => termIndex(data), [data]);
  const label = termLabel(term);

  const students = useMemo(
    () =>
      data.students
        .map((student) => {
          const entry = index.students.get(student.stuId);
          return { stuId: student.stuId, name: renames.students[student.stuId] ?? student.name, subjects: entry?.subjects.length ?? 0, periods: entry?.placed.length ?? 0 };
        })
        .sort((a, b) => a.stuId.localeCompare(b.stuId)),
    [data, index, renames],
  );
  const teachers = useMemo(
    () =>
      [...index.teachers.values()]
        .map((teacher) => ({ key: teacher.name, name: renames.teachers[teacher.name] ?? teacher.name, sections: teacher.sections, subjects: teacher.subjects, periods: teacher.placed.length }))
        .sort((a, b) => a.name.localeCompare(b.name, "ko")),
    [index, renames],
  );
  const subjects = data.subjects;

  const words = query.trim().toLowerCase();
  const found = {
    students: students.filter((row) => !words || row.stuId.toLowerCase().includes(words) || row.name.toLowerCase().includes(words)),
    teachers: teachers.filter((row) => !words || row.name.toLowerCase().includes(words)),
    subjects: subjects.filter((row) => !words || row.subject.toLowerCase().includes(words) || row.english.toLowerCase().includes(words)),
  };
  const total = { students: students.length, teachers: teachers.length, subjects: subjects.length };

  const lastCollected = [...versions].filter((row) => row.term === label && row.source === "sync").sort((a, b) => b.at.localeCompare(a.at))[0];

  const rename = (target: RenameTarget, name: string) => {
    setRenames((now) => (target.kind === "student" ? { ...now, students: { ...now.students, [target.key]: name } } : { ...now, teachers: { ...now.teachers, [target.key]: name } }));
    const version = Math.max(0, ...versions.filter((row) => row.term === label).map((row) => row.version)) + 1;
    setVersions((list) => [
      ...list,
      { term: label, version, at: stamp(clock), source: "edit", note: `${target.kind === "student" ? `학번 ${target.key}의 이름` : "교사 이름"}을 ${target.name}에서 ${name}${particleRo(name)} 고쳤습니다.`, synced: null, skipped: null, errors: null, elapsed: null, backup: null, summary: renameSummary(target.kind) },
    ]);
    setRenaming(null);
    toast(`이름을 고쳤습니다 · ${label} 회차 v${version}`);
  };

  const collected = (picked: TermKey) => {
    const name = termLabel(picked);
    const rows = versions.filter((row) => row.term === name);
    const first = rows.length === 0;
    const elapsed = `${((SYNC_STEPS.length * STEP_MS) / 1000).toFixed(1)}초`;
    const version = Math.max(0, ...rows.map((row) => row.version)) + 1;
    const summary = first || name !== termLabel(TERMS[0]!) ? null : makeSummary(`classes:admin:${name}:v${version}:live`, picked, 0.6);
    setSyncing(false);
    if (!first && (!summary || !summary.changed)) {
      setLastSync({ term: name, changed: false, version: null, synced: 378, skipped: 302, elapsed, backup: null, summary: null });
      toast(`${name} 학기는 바뀐 것이 없습니다`);
      return;
    }
    const at = stamp(clock);
    const snapshot = first ? null : backupName(at, "before-sync", name, version);
    const synced = first ? 402 : 378;
    const skipped = first ? 0 : 302;
    setVersions((list) => [...list, { term: name, version, at, source: "sync", note: first ? "처음 받은 학기입니다." : null, synced, skipped, errors: 0, elapsed, backup: snapshot, summary }]);
    if (snapshot) {
      const latest = [...backups].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
      setBackups((list) => [{ name: snapshot, kind: "before-sync", note: `${name} v${version}`, bytes: (latest?.bytes ?? 23_000_000) + 131_072, createdAt: at }, ...list]);
    }
    setLastSync({ term: name, changed: true, version, synced, skipped, elapsed, backup: snapshot, summary });
    toast(`${name} 학기를 받았습니다 · 회차 v${version}`);
  };

  const edit = (kind: "student" | "teacher", key: string, name: string) => (
    <IconButton variant="ghost" size="sm" aria-label={`${name} 이름 고치기`} onClick={() => setRenaming({ kind, key, name })}><Glyph name="pencil" /></IconButton>
  );
  const studentRows: TableRow[] = found.students.slice(0, limit).map((row) => ({
    id: row.stuId,
    cells: [
      <Stack key="name" minWidth={0}>
        <Text as="span" truncate>{row.name}</Text>
        <Text as="span" variant="caption" ink="tertiary" numeric>{row.stuId} · {cohortOf(row.stuId)}학번</Text>
      </Stack>,
      <Text key="subjects" as="span" ink="secondary" numeric>{row.subjects}과목</Text>,
      <Text key="periods" as="span" ink="secondary" numeric>주 {row.periods}교시</Text>,
      edit("student", row.stuId, row.name),
    ],
  }));
  const teacherRows: TableRow[] = found.teachers.slice(0, limit).map((row) => ({
    id: row.key,
    cells: [
      <Stack key="name" minWidth={0}>
        <Text as="span" truncate>{row.name}</Text>
        <Text as="span" variant="caption" ink="tertiary" numeric>분반 {row.sections}개 · 주 {row.periods}교시</Text>
      </Stack>,
      <Text key="sections" as="span" ink="secondary" numeric>{row.sections}개</Text>,
      <Text key="subjects" as="span" ink="secondary" truncate>{row.subjects.map(koreanName).join(", ")}</Text>,
      edit("teacher", row.key, row.name),
    ],
  }));
  const subjectRows: TableRow[] = found.subjects.slice(0, limit).map((row) => ({
    id: row.subjectId,
    cells: [
      <Stack key="name" minWidth={0}>
        <Inline as="span" gap="sm" align="center" minWidth={0}>
          <Text as="span" truncate>{koreanName(row.subject)}</Text>
          {row.isEc ? <Badge size="xs" variant="soft" accent="info">영어 강의</Badge> : null}
          {row.pf ? <Badge size="xs" variant="soft">P/F</Badge> : null}
        </Inline>
        <Text as="span" variant="caption" ink="tertiary" truncate>{row.english || "영문 이름 없음"}</Text>
      </Stack>,
      <Text key="credits" as="span" ink="secondary" numeric>{row.credits === null ? "–" : `${row.credits}학점`}</Text>,
      row.department ? <Text key="department" as="span" ink="secondary">{row.department}</Text> : <Badge key="department" size="xs" variant="soft" accent="warning">교육과정 없음</Badge>,
      <Text key="sections" as="span" ink="secondary" numeric>{row.sections.length}개</Text>,
      <Text key="students" as="span" ink="secondary" numeric>{row.studentCount}명</Text>,
    ],
  }));

  const shown = found[view].length;

  return (
    <Card
      title="학기 데이터"
      description={`${label}학기 · 학생 ${total.students}명 · 교사 ${total.teachers}명 · 과목 ${total.subjects}개. ${lastCollected ? `마지막으로 받은 때는 ${whenLabel(lastCollected.at)}입니다.` : "아직 받은 기록이 없습니다."}`}
      padding="lg"
      actions={
        <>
          <Button variant="ghost" size="sm" loading={busy} onClick={() => refresh(() => toast("목록을 새로 읽었습니다"))}><Glyph name="refresh-cw" />새로 읽기</Button>
          <Button variant="solid" size="sm" onClick={() => setSyncing(true)}><Glyph name="database" />KEIS에서 다시 받기</Button>
        </>
      }
    >
      {lastSync ? (
        <Surface fill="sunken" radius="md" padding="lg">
          <Stack gap="md">
            <Inline justify="between" align="start" gap="md">
              <Inline gap="sm" align="center" wrap minWidth={0}>
                <Glyph name={lastSync.changed ? "circle-check" : "equal"} ink={lastSync.changed ? "success" : "tertiary"} />
                <Text strong>{lastSync.changed ? "받기를 마쳤습니다" : "바뀐 것이 없습니다"}</Text>
                <Mono>{lastSync.term}</Mono>
                {lastSync.version ? <Mono>v{lastSync.version}</Mono> : null}
              </Inline>
              <IconButton variant="ghost" size="xs" aria-label="결과 닫기" onClick={() => setLastSync(null)}><Glyph name="x" /></IconButton>
            </Inline>
            <Text variant="caption" ink="tertiary">
              {lastSync.changed
                ? `받은 분반 ${lastSync.synced}개 · 건너뛴 분반 ${lastSync.skipped}개 · 오류 0 · ${lastSync.elapsed}${lastSync.backup ? ` · 직전 스냅샷 ${lastSync.backup}` : ""}`
                : "바뀐 것이 없으면 회차도 백업도 새로 만들지 않습니다. 다시 돌렸다는 것과 달라졌다는 것은 다른 일입니다."}
            </Text>
            {lastSync.summary ? <Changes data={lastSync.summary} /> : null}
          </Stack>
        </Surface>
      ) : null}

      <Toolbar
        start={
          <Segmented
            label="데이터 종류"
            value={view}
            onChange={(id) => {
              setView(id as View);
              setQuery("");
              setLimit(PAGE);
            }}
            options={VIEWS.map((id) => ({ id, label: VIEW_LABEL[id], count: total[id] }))}
          />
        }
        end={<Text as="span" variant="caption" ink="tertiary" numeric>{words ? `${total[view]}개 중 ${shown}개` : `${total[view]}개`}</Text>}
      />
      <SearchField label={`${VIEW_LABEL[view]} 찾기`} placeholder={PLACEHOLDER[view]} value={query} onChange={(value) => { setQuery(value); setLimit(PAGE); }} />

      {view === "subjects" ? <Hint>교육과정에 이어지지 않은 과목은 학점과 계열을 알 수 없습니다. 외국인 전형 과목이나 개편 전 이름이 여기에 해당합니다.</Hint> : null}

      {shown === 0 ? (
        <Empty glyph="search" title={`찾은 ${VIEW_LABEL[view]}이 없습니다`} description="검색어를 줄이거나 다른 말로 찾아 보세요." />
      ) : view === "students" ? (
        <Table
          label="학생 목록"
          tracks={{ base: "minmax(0, 1fr) auto", md: "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) auto" }}
          columns={[{ head: "이름과 학번" }, { head: "수강 과목", hideBelow: "md" }, { head: "시간표", hideBelow: "md" }, { head: "", end: true }]}
          rows={studentRows}
        />
      ) : view === "teachers" ? (
        <Table
          label="교사 목록"
          tracks={{ base: "minmax(0, 1fr) auto", md: "minmax(0, 1fr) 6rem minmax(0, 2fr) auto" }}
          columns={[{ head: "교사" }, { head: "분반", hideBelow: "md" }, { head: "담당 과목", hideBelow: "md" }, { head: "", end: true }]}
          rows={teacherRows}
        />
      ) : (
        <Table
          label="과목 목록"
          tracks={{ base: "minmax(0, 1fr) auto", md: "minmax(0, 2fr) 5rem minmax(0, 1fr) 5rem 5rem" }}
          columns={[{ head: "과목" }, { head: "학점", hideBelow: "md" }, { head: "계열", hideBelow: "md" }, { head: "분반", hideBelow: "md" }, { head: "수강생", end: true }]}
          rows={subjectRows}
        />
      )}
      {shown > limit ? (
        <Inline justify="center">
          <Button variant="ghost" size="sm" onClick={() => setLimit((now) => now + PAGE)}><Glyph name="plus" />더 보기 ({shown - limit})</Button>
        </Inline>
      ) : null}

      {renaming ? <RenameDialog key={renaming.key} target={renaming} onClose={() => setRenaming(null)} onSave={(name) => rename(renaming, name)} /> : null}
      <SyncDialog open={syncing} onClose={() => setSyncing(false)} onFinish={collected} start={start} />
    </Card>
  );
};
