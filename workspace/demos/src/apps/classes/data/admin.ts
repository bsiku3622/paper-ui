// 관리: the made-up numbers behind the operator console — accounts, devices that are signed in, data revisions, backups,
// what Ask remembers and how the major survey stands. Nobody here is real: the usernames are invented, the addresses are
// in the ranges reserved for documentation (RFC 5737), the backups are names and sizes with nothing behind them, and the
// facts are original sentences about school life.

import { ago, int, pick, random, shuffle } from "../../../kit";
import { termIndex } from "../lib/index";
import type { Role } from "../state";
import { CLASSROOMS, termData, TERMS, termLabel, type TermKey } from "./build";
import { ME } from "./people";

// ── accounts and the devices they are signed in on ───────────────────────────

export type Account = { id: number; username: string; role: Role; demoStuId: string | null; createdAt: string };
export type DeviceKind = "web" | "mobile";
export type DeviceSession = { id: number; accountId: number; username: string; device: DeviceKind; agent: string; ip: string; lastUsedAt: string; expiresAt: string; current: boolean };

export const firstAccounts = (): Account[] => [
  { id: 1, username: "jiwoo", role: "admin", demoStuId: null, createdAt: "2026-02-20T10:12:00+09:00" },
  { id: 2, username: "office", role: "manager", demoStuId: null, createdAt: "2026-02-20T10:20:00+09:00" },
  { id: 3, username: "seoyeon", role: "user", demoStuId: null, createdAt: "2026-03-02T21:04:00+09:00" },
  { id: 4, username: "doyun", role: "user", demoStuId: null, createdAt: "2026-03-03T08:31:00+09:00" },
  { id: 5, username: "jiho", role: "user", demoStuId: null, createdAt: "2026-03-03T22:47:00+09:00" },
  { id: 6, username: "harin", role: "manager", demoStuId: null, createdAt: "2026-03-05T13:15:00+09:00" },
  { id: 7, username: "minjun", role: "user", demoStuId: null, createdAt: "2026-03-09T19:40:00+09:00" },
  { id: 8, username: "seoah", role: "user", demoStuId: null, createdAt: "2026-03-12T20:02:00+09:00" },
  { id: 9, username: "hajun", role: "user", demoStuId: null, createdAt: "2026-04-01T12:55:00+09:00" },
  { id: 10, username: "yerin", role: "user", demoStuId: null, createdAt: "2026-04-14T18:33:00+09:00" },
  { id: 11, username: "siwoo", role: "user", demoStuId: null, createdAt: "2026-05-06T09:09:00+09:00" },
  { id: 12, username: "jian", role: "user", demoStuId: null, createdAt: "2026-08-24T21:26:00+09:00" },
  { id: 13, username: "yuna", role: "user", demoStuId: null, createdAt: "2026-09-01T07:58:00+09:00" },
  { id: 14, username: "guest-demo", role: "user", demoStuId: ME.stuId, createdAt: "2026-09-18T15:00:00+09:00" },
  { id: 15, username: "review-demo", role: "user", demoStuId: ME.stuId, createdAt: "2026-10-02T11:45:00+09:00" },
];

const SESSION_DAYS = 30;
const device = (id: number, accountId: number, username: string, kind: DeviceKind, agent: string, ip: string, minutesAgo: number, current = false): DeviceSession => {
  const last = ago(minutesAgo);
  return { id, accountId, username, device: kind, agent, ip, lastUsedAt: last.toISOString(), expiresAt: new Date(last.getTime() + SESSION_DAYS * 86_400_000).toISOString(), current };
};

export const firstSessions = (): DeviceSession[] => [
  device(1, 1, "jiwoo", "web", "Chrome · macOS", "203.0.113.12", 3, true),
  device(2, 1, "jiwoo", "mobile", "Safari · iOS", "203.0.113.48", 60 * 26),
  device(3, 2, "office", "web", "Edge · Windows", "198.51.100.23", 45),
  device(4, 3, "seoyeon", "mobile", "Chrome · Android", "203.0.113.91", 12),
  device(5, 4, "doyun", "web", "Firefox · Windows", "203.0.113.67", 60 * 5),
  device(6, 5, "jiho", "mobile", "Safari · iOS", "192.0.2.150", 60 * 9),
  device(7, 6, "harin", "web", "Chrome · Windows", "198.51.100.77", 60 * 30),
  device(8, 7, "minjun", "mobile", "Chrome · Android", "203.0.113.5", 60 * 52),
  device(9, 9, "hajun", "web", "Safari · macOS", "192.0.2.31", 60 * 80),
  device(10, 14, "guest-demo", "web", "Chrome · Linux", "198.51.100.200", 60 * 3),
];

// ── the major survey: counts only ────────────────────────────────────────────
// Everyone with a verified student ID except the demo account, whose own answer is added live from the app's state.

export const SURVEY_TRACKS = ["수학", "정보과학", "물리학", "지구과학", "화학", "생물학"] as const;
export const SURVEY_BASE: Record<string, number> = { 수학: 21, 정보과학: 33, 물리학: 17, 지구과학: 12, 화학: 15, 생물학: 14, 미정: 13, "아직 답 안 함": 47 };

// ── what Ask remembers ───────────────────────────────────────────────────────

export type MemoryPost = { id: number; title: string; postedOn: string; board: string; summary: string };
export type MemoryFact = { id: number; postId: number; statement: string; topic: string; grades: number[]; majors: string[]; validUntil: string | null; status: "active" | "hidden"; edited: boolean };

export const MEMORY_POSTS: readonly MemoryPost[] = [
  { id: 1, title: "2학기 기말고사 일정 안내", postedOn: "2026-10-27", board: "공지사항 · 교무연구부", summary: "기말고사는 12월 9일부터 나흘 동안 치르며, 시험 기간에는 정규 수업 대신 과목별 자율학습이 이어집니다." },
  { id: 2, title: "수강 정정 기간 안내", postedOn: "2026-10-30", board: "공지사항 · 교무연구부", summary: "수강 정정은 11월 13일 오후 5시까지 학생 포털에서 신청하고, 담당 교사가 확인하면 확정됩니다." },
  { id: 3, title: "11월 귀가일과 기숙사 휴관 안내", postedOn: "2026-10-26", board: "공지사항 · 학생생활부", summary: "11월 20일 저녁부터 22일 밤까지 기숙사를 닫습니다. 귀가 신청은 18일까지 받습니다." },
  { id: 4, title: "주중 외출 규정 개정 안내", postedOn: "2026-09-14", board: "규정 게시판 · 학생생활부", summary: "주중 외출의 시간과 신청 방법이 바뀐 내용을 정리했습니다." },
  { id: 5, title: "동아리 발표회 안내", postedOn: "2026-10-20", board: "공지사항 · 학생생활부", summary: "동아리 발표회는 11월 10일 저녁에 학부별 강의실에서 열리며, 발표 자료는 앞서 제출합니다." },
  { id: 6, title: "교내 알고리즘 경진대회 접수", postedOn: "2026-10-22", board: "공지사항 · 학생생활부", summary: "접수는 11월 6일까지 받고, 대회는 11월 14일 아침에 창5701에서 열립니다." },
  { id: 7, title: "영어Ⅲ 말하기 평가 안내", postedOn: "2026-10-12", board: "공지사항 · 교무연구부", summary: "2학년 영어Ⅲ 말하기 평가를 11월 셋째 주 수업 시간에 진행합니다." },
  { id: 8, title: "석식 시간과 알레르기 표시 안내", postedOn: "2026-10-29", board: "공지사항 · 학생생활부", summary: "11월 11일부터 석식 배식 시각을 앞당기고, 알레르기 표시를 식당 입구에도 붙입니다." },
  { id: 9, title: "체육 수업 복장 안내(이전 학기)", postedOn: "2026-03-04", board: "규정 게시판 · 폐지", summary: "지난 학기의 체육 수업 복장 규정입니다. 지금 규정은 새 공지를 따릅니다." },
  { id: 10, title: "3학년 진학 설명회 안내", postedOn: "2026-10-15", board: "공지사항 · 진로진학부", summary: "3학년을 대상으로 한 진학 설명회가 11월 12일 저녁에 대강당에서 열립니다." },
];

type FactRow = readonly [postId: number, statement: string, topic: string, grades: number[], majors: string[], validUntil: string | null, status: "active" | "hidden", edited: boolean];
const FACT_ROWS: readonly FactRow[] = [
  [1, "2학기 기말고사는 12월 9일(수)부터 12일(토)까지 나흘간 치릅니다.", "기말고사 기간", [], [], "2026-12-12", "active", false],
  [1, "시험 기간에는 정규 수업이 없고, 시험이 없는 시간에는 과목별 자율학습이 편성됩니다.", "시험 기간 수업", [], [], "2026-12-12", "active", false],
  [1, "채점 결과에 이의가 있으면 성적을 공개한 날부터 이틀 안에 담당 교사에게 서면으로 신청합니다.", "성적 이의신청", [], [], null, "active", true],
  [2, "수강 정정은 11월 13일(금) 오후 5시까지 학생 포털에서 신청합니다.", "수강 정정 마감", [], [], "2026-11-13", "active", false],
  [2, "정정한 과목은 담당 교사가 확인해야 확정되고, 정원이 찬 분반으로는 옮길 수 없습니다.", "수강 정정 확정", [], [], "2026-11-13", "active", false],
  [2, "AP 과목과 특강은 수강 정정으로 바꿀 수 없습니다.", "정정 제외 과목", [2, 3], [], "2026-11-13", "active", false],
  [3, "11월 20일(금) 저녁부터 22일(일) 밤까지 기숙사를 닫습니다.", "기숙사 휴관", [], [], "2026-11-22", "active", false],
  [3, "귀가 신청은 11월 18일(수)까지 학생 포털에서 하며, 신청하지 않은 학생은 기숙사에 남을 수 없습니다.", "귀가 신청", [], [], "2026-11-18", "active", false],
  [3, "사정이 있어 남아야 하는 학생은 사감 교사의 허락을 미리 받아야 합니다.", "기숙사 잔류", [], [], null, "active", false],
  [4, "주중 외출은 수요일 오후 4시 30분부터 6시까지, 하루 전에 신청한 학생만 할 수 있습니다.", "주중 외출 시간", [2, 3], [], null, "active", false],
  [4, "1학년은 학기 시작 뒤 첫 6주 동안 주중 외출을 할 수 없습니다.", "1학년 외출 제한", [1], [], "2026-04-17", "active", false],
  [4, "외출 중 귀교 시각을 넘기면 상벌점 규정에 따라 벌점이 매겨집니다.", "귀교 시각", [], [], null, "hidden", false],
  [5, "동아리 발표회는 11월 10일(화) 저녁 7시 30분부터 학부별 강의실에서 열립니다.", "동아리 발표회", [2, 3], [], "2026-11-10", "active", false],
  [5, "발표 자료는 11월 8일(일)까지 지도 교사에게 제출합니다.", "발표 자료 제출", [2, 3], [], "2026-11-08", "active", false],
  [6, "교내 알고리즘 경진대회 참가 접수는 11월 6일(금)까지 받습니다.", "경진대회 접수", [], ["정보과학", "수학"], "2026-11-06", "active", false],
  [6, "대회는 11월 14일(토) 오전 9시부터 창5701에서 치릅니다.", "경진대회 일시", [], ["정보과학", "수학"], "2026-11-14", "active", false],
  [6, "참가자는 개인 노트북을 가져올 수 없고, 실습실 컴퓨터만 쓸 수 있습니다.", "경진대회 준비물", [], ["정보과학", "수학"], "2026-11-14", "active", false],
  [7, "2학년 영어Ⅲ 말하기 평가는 11월 16일부터 20일 사이 수업 시간에 진행합니다.", "영어Ⅲ 말하기 평가", [2], [], "2026-11-20", "active", false],
  [7, "평가 순서는 수업 시간에 교사가 정하고, 사정이 있으면 전날까지 알립니다.", "말하기 평가 순서", [2], [], "2026-11-20", "active", true],
  [8, "11월 11일(수)부터 석식 배식은 오후 5시 30분에 시작합니다.", "석식 시간", [], [], null, "active", false],
  [8, "알레르기를 일으킬 수 있는 식품은 급식 게시판과 식당 입구에 함께 표시합니다.", "알레르기 표시", [], [], null, "active", false],
  [9, "체육 수업에는 학교 체육복과 실내 운동화를 착용해야 합니다.", "체육 복장", [], [], null, "hidden", false],
  [9, "체육복을 잊은 학생은 수업 전에 대여를 신청합니다.", "체육복 대여", [], [], "2026-07-20", "hidden", false],
  [10, "3학년 진학 설명회는 11월 12일(목) 오후 8시에 대강당에서 열립니다.", "진학 설명회", [3], [], "2026-11-12", "active", false],
  [10, "설명회 영상은 행사가 끝난 이튿날 학교 포털에 올라옵니다.", "설명회 영상", [3], [], "2026-12-31", "active", true],
];

export const firstFacts = (): MemoryFact[] =>
  FACT_ROWS.map(([postId, statement, topic, grades, majors, validUntil, status, edited], index) => ({ id: index + 1, postId, statement, topic, grades, majors, validUntil, status, edited }));

// ── data revisions ───────────────────────────────────────────────────────────

export type VersionSource = "sync" | "edit" | "seed";
export type Move = { class: string; from: string; to: string };
export type ChangeSummary = {
  changed: boolean;
  classes: { added: string[]; removed: string[]; moved: Move[]; swapped: Move[]; assigned: number; kept: number };
  times: { added: number; removed: number };
  enrollments: { added: number; removed: number; byClass: { class: string; delta: number }[] };
  students: { new: number; renamed: number };
  teachersRenamed: number;
};
export type VersionRow = {
  term: string;
  version: number;
  at: string;
  source: VersionSource;
  note: string | null;
  synced: number | null;
  skipped: number | null;
  errors: number | null;
  elapsed: string | null;
  backup: string | null;
  summary: ChangeSummary | null;
};

// "2026-10-29T19:19:45+09:00" → "20261029-191945"
const stampOf = (iso: string) => `${iso.slice(0, 10).replaceAll("-", "")}-${iso.slice(11, 19).replaceAll(":", "")}`;
export const backupName = (iso: string, kind: BackupKind, term?: string, version?: number) =>
  `ksa_timetable-${stampOf(iso)}-${kind === "before-sync" ? `sync-${term}-v${version}` : kind}.db`;

export const emptySummary = (): ChangeSummary => ({
  changed: false,
  classes: { added: [], removed: [], moved: [], swapped: [], assigned: 0, kept: 0 },
  times: { added: 0, removed: 0 },
  enrollments: { added: 0, removed: 0, byClass: [] },
  students: { new: 0, renamed: 0 },
  teachersRenamed: 0,
});

// A believable difference between two revisions of a term, drawn from the term's own classes and teachers. `scale` is how
// much changed: the first collection after a term opens moves a lot, the later ones only a little.
export const makeSummary = (seed: string, term: TermKey, scale: number): ChangeSummary => {
  const r = random(seed);
  const data = termData(term);
  const classes = data.subjects.flatMap((subject) => subject.sections.map((section) => ({ name: `${subject.subject} ${section.section}`, teacher: section.teacher })));
  const teachers = [...termIndex(data).teachers.keys()];
  const order = shuffle(r, classes);
  const count = (base: number) => Math.max(0, Math.round(base * scale * (0.7 + r() * 0.6)));
  const added = order.splice(0, count(3)).map((item) => item.name);
  const removed = order.splice(0, count(2)).map((item) => item.name);
  const moved = order.splice(0, count(5)).map((item): Move => {
    const from = pick(r, CLASSROOMS);
    const others = CLASSROOMS.filter((room) => room !== from);
    return { class: item.name, from, to: pick(r, others) };
  });
  const swapped = order.splice(0, count(3)).map((item): Move => ({ class: item.name, from: item.teacher, to: pick(r, teachers.filter((teacher) => teacher !== item.teacher)) }));
  const byClass = order
    .splice(0, count(6))
    .map((item) => ({ class: item.name, delta: (r() < 0.5 ? -1 : 1) * int(r, 1, 9) }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const summary: ChangeSummary = {
    changed: true,
    classes: { added, removed, moved, swapped, assigned: count(14), kept: Math.max(0, classes.length - added.length - removed.length - moved.length) },
    times: { added: count(12), removed: count(11) },
    enrollments: { added: count(90), removed: count(100), byClass },
    students: { new: count(1.2), renamed: 0 },
    teachersRenamed: 0,
  };
  summary.changed = added.length + removed.length + moved.length + swapped.length + summary.times.added + summary.times.removed + summary.enrollments.added + summary.enrollments.removed > 0;
  return summary;
};

export const renameSummary = (kind: "student" | "teacher"): ChangeSummary => ({ ...emptySummary(), changed: true, students: { new: 0, renamed: kind === "student" ? 1 : 0 }, teachersRenamed: kind === "teacher" ? 1 : 0 });

type Plan = { version: number; at: string; source: VersionSource; scale?: number; note?: string; synced?: number; skipped?: number; elapsed?: string; kind?: "student" | "teacher" };

const PLANS: readonly { term: TermKey; list: readonly Plan[] }[] = [
  {
    term: TERMS[0]!,
    list: [
      { version: 1, at: "2026-08-19T10:05:00+09:00", source: "seed", note: "버전을 두기 전부터 있던 데이터입니다." },
      { version: 2, at: "2026-08-21T19:19:45+09:00", source: "sync", scale: 2.4, synced: 365, skipped: 312, elapsed: "24.6초" },
      { version: 3, at: "2026-08-28T08:41:12+09:00", source: "sync", scale: 1.5, synced: 371, skipped: 309, elapsed: "26.1초" },
      { version: 4, at: "2026-09-03T14:02:30+09:00", source: "edit", kind: "student", note: "학교 시스템의 표기와 달라서 운영자가 학생 이름 하나를 고쳤습니다." },
      { version: 5, at: "2026-09-17T20:11:09+09:00", source: "sync", scale: 0.9, synced: 374, skipped: 306, elapsed: "23.8초" },
      { version: 6, at: "2026-10-08T18:02:31+09:00", source: "sync", scale: 0.7, synced: 374, skipped: 306, elapsed: "25.0초" },
      { version: 7, at: "2026-10-29T19:19:45+09:00", source: "sync", scale: 0.5, synced: 376, skipped: 304, elapsed: "24.2초" },
    ],
  },
  {
    term: TERMS[1]!,
    list: [
      { version: 1, at: "2026-02-19T09:30:00+09:00", source: "seed", note: "버전을 두기 전부터 있던 데이터입니다." },
      { version: 2, at: "2026-02-26T19:05:11+09:00", source: "sync", scale: 2.6, synced: 342, skipped: 290, elapsed: "22.9초" },
      { version: 3, at: "2026-03-04T08:50:40+09:00", source: "sync", scale: 1.8, synced: 349, skipped: 284, elapsed: "23.4초" },
      { version: 4, at: "2026-03-18T20:14:02+09:00", source: "sync", scale: 0.8, synced: 351, skipped: 282, elapsed: "22.1초" },
      { version: 5, at: "2026-04-02T13:20:48+09:00", source: "edit", kind: "teacher", note: "학교 시스템의 표기와 달라서 운영자가 교사 이름 하나를 고쳤습니다." },
      { version: 6, at: "2026-05-12T19:33:27+09:00", source: "sync", scale: 0.4, synced: 351, skipped: 282, elapsed: "21.7초" },
    ],
  },
];

export const firstVersions = (): VersionRow[] =>
  PLANS.flatMap(({ term, list }) =>
    list.map((plan): VersionRow => {
      const label = termLabel(term);
      const sync = plan.source === "sync";
      return {
        term: label,
        version: plan.version,
        at: plan.at,
        source: plan.source,
        note: plan.note ?? null,
        synced: sync ? plan.synced ?? null : null,
        skipped: sync ? plan.skipped ?? null : null,
        errors: sync ? 0 : null,
        elapsed: sync ? plan.elapsed ?? null : null,
        backup: sync ? backupName(plan.at, "before-sync", label, plan.version) : null,
        summary: plan.source === "seed" ? null : plan.source === "edit" ? renameSummary(plan.kind ?? "student") : makeSummary(`classes:admin:${label}:v${plan.version}`, term, plan.scale ?? 1),
      };
    }),
  );

// ── backups ──────────────────────────────────────────────────────────────────

export type BackupKind = "auto" | "before-sync" | "manual";
export type Backup = { name: string; kind: BackupKind; note: string | null; bytes: number; createdAt: string };

type BackupRow = readonly [at: string, kind: BackupKind, note: string | null, megabytes: number];
const BACKUP_ROWS: readonly BackupRow[] = [
  ["2026-11-04T03:10:00+09:00", "auto", null, 23.4],
  ["2026-11-03T03:10:00+09:00", "auto", null, 23.3],
  ["2026-11-02T03:10:00+09:00", "auto", null, 23.3],
  ["2026-11-01T03:10:00+09:00", "auto", null, 23.1],
  ["2026-10-31T03:10:00+09:00", "auto", null, 23.1],
  ["2026-10-30T03:10:00+09:00", "auto", null, 22.9],
  ["2026-10-29T19:19:45+09:00", "before-sync", "2026-2 v7", 22.8],
  ["2026-10-29T03:10:00+09:00", "auto", null, 22.8],
  ["2026-10-22T11:40:12+09:00", "manual", "중간고사 뒤 점검", 22.5],
  ["2026-10-08T18:02:31+09:00", "before-sync", "2026-2 v6", 22.1],
  ["2026-09-17T20:11:09+09:00", "before-sync", "2026-2 v5", 21.4],
  ["2026-08-28T08:41:12+09:00", "before-sync", "2026-2 v3", 20.6],
  ["2026-08-21T19:19:45+09:00", "before-sync", "2026-2 v2", 19.8],
  ["2026-05-12T19:33:27+09:00", "before-sync", "2026-1 v6", 18.9],
  ["2026-03-18T20:14:02+09:00", "before-sync", "2026-1 v4", 18.2],
  ["2026-03-04T08:50:40+09:00", "before-sync", "2026-1 v3", 17.6],
  ["2026-02-26T19:05:11+09:00", "before-sync", "2026-1 v2", 16.9],
];

export const firstBackups = (): Backup[] =>
  BACKUP_ROWS.map(([at, kind, note, megabytes]) => {
    const [term, version] = note && kind === "before-sync" ? note.split(" v") : [undefined, undefined];
    return { name: backupName(at, kind, term, version ? Number(version) : undefined), kind, note, bytes: Math.round(megabytes * 1024 * 1024), createdAt: at };
  });

// ── a day that follows another weekday's timetable ───────────────────────────

export type Override = { id: number; date: string; sourceDay: "MON" | "TUE" | "WED" | "THU" | "FRI"; title: string };

export const firstOverrides = (): Override[] => [
  { id: 1, date: "2026-09-26", sourceDay: "THU", title: "개교기념 행사 보강 — 목요일 시간표 운영" },
  { id: 2, date: "2026-10-30", sourceDay: "MON", title: "재량휴업일 보강 — 월요일 시간표 운영" },
  { id: 3, date: "2026-11-21", sourceDay: "FRI", title: "귀가일 전 보충 수업 — 금요일 시간표 운영" },
  { id: 4, date: "2026-12-05", sourceDay: "WED", title: "기말고사 대비 보충 수업 — 수요일 시간표 운영" },
];
