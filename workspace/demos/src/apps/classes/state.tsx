import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { NOW, useStored } from "../../kit";
import { termData, TERMS, termLabel, type TermData, type TermKey } from "./data/build";
import { firstMaterials, type Material } from "./data/materials";
import { ME, type Student } from "./data/people";
import { BASE_EVENTS, type CalendarEvent, type EventRequest } from "./lib/calendar";

export const BASE = "/classes";
export const path = (rest = "") => `${BASE}${rest}`;

export type Role = "user" | "manager" | "admin";
export const ROLE_RANK: Record<Role, number> = { user: 0, manager: 1, admin: 2 };
export const hasRole = (role: Role, minimum: Role) => ROLE_RANK[role] >= ROLE_RANK[minimum];

export type Session = { signedIn: boolean; username: string; role: Role; linked: boolean };
export type TradeConfig = { enabled: boolean; deadline: string; term: string };
export type MajorState = { major: string | null; answered: boolean };
export type Clock = { key: string; minute: number };

export const clockAt = (ms: number): Clock => {
  const kst = new Date(ms + 9 * 3_600_000);
  const key = `${kst.getUTCFullYear()}-${String(kst.getUTCMonth() + 1).padStart(2, "0")}-${String(kst.getUTCDate()).padStart(2, "0")}`;
  return { key, minute: kst.getUTCHours() * 60 + kst.getUTCMinutes() };
};

type Value = {
  term: TermKey;
  setTerm: (term: TermKey) => void;
  data: TermData;
  clock: Clock;
  me: Student;
  session: Session;
  signIn: (username: string) => void;
  signOut: () => void;
  linkGoogle: () => void;
  setRole: (role: Role) => void;
  major: MajorState;
  setMajor: (next: MajorState) => void;
  friends: string[];
  addFriend: (stuId: string) => void;
  removeFriend: (stuId: string) => void;
  events: CalendarEvent[];
  personal: CalendarEvent[];
  setPersonal: (next: CalendarEvent[] | ((now: CalendarEvent[]) => CalendarEvent[])) => void;
  shared: CalendarEvent[];
  setShared: (next: CalendarEvent[] | ((now: CalendarEvent[]) => CalendarEvent[])) => void;
  requests: EventRequest[];
  setRequests: (next: EventRequest[] | ((now: EventRequest[]) => EventRequest[])) => void;
  materials: Material[];
  setMaterials: (next: Material[] | ((now: Material[]) => Material[])) => void;
  tradeOpen: boolean;
  tradeConfig: TradeConfig;
  setTradeConfig: (next: TradeConfig) => void;
  studentName: (stuId: string) => string;
};

const Ctx = createContext<Value | null>(null);
export const useClasses = () => {
  const value = useContext(Ctx);
  if (!value) throw new Error("useClasses needs <ClassesProvider>");
  return value;
};

const FIRST_PERSONAL: CalendarEvent[] = [
  { id: 9001, title: "정보과학 스터디", start: "2026-11-06", end: "2026-11-06", mode: "clock", startMinute: 20 * 60 + 30, endMinute: 21 * 60 + 20, startPeriod: null, endPeriod: null, category: "event", grades: [], majors: [], personal: true, seriesId: "s1", note: "창5702에서 그래프 문제를 같이 풉니다." },
  { id: 9002, title: "정보과학 스터디", start: "2026-11-13", end: "2026-11-13", mode: "clock", startMinute: 20 * 60 + 30, endMinute: 21 * 60 + 20, startPeriod: null, endPeriod: null, category: "event", grades: [], majors: [], personal: true, seriesId: "s1", note: "창5702에서 그래프 문제를 같이 풉니다." },
  { id: 9003, title: "수학 과제 정리", start: "2026-11-10", end: "2026-11-10", mode: "period", startMinute: null, endMinute: null, startPeriod: 10, endPeriod: 11, category: "academic", grades: [], majors: [], personal: true, seriesId: null, note: null },
];

const FIRST_REQUESTS: EventRequest[] = [
  { id: 1, title: "정보과학 동아리 발표회", start: "2026-11-24", end: "2026-11-24", category: "event", grades: [], majors: ["정보과학"], note: "저녁 시간대에 형3302에서 열 계획입니다.", status: "pending", reason: null, requestedBy: "오지안", createdAt: "2026-11-02T09:10:00+09:00" },
  { id: 2, title: "화학 실험실 안전 교육", start: "2026-11-17", end: "2026-11-17", category: "academic", grades: [2], majors: ["화학"], note: null, status: "pending", reason: null, requestedBy: "송민재", createdAt: "2026-11-03T13:40:00+09:00" },
  { id: 3, title: "천체 관측의 밤", start: "2026-11-12", end: "2026-11-12", category: "event", grades: [], majors: ["지구과학"], note: "날씨가 맑으면 옥상에서 합니다.", status: "approved", reason: null, requestedBy: "류하늘", createdAt: "2026-10-29T18:05:00+09:00" },
  { id: 4, title: "교내 윷놀이 대회", start: "2026-11-09", end: "2026-11-09", category: "event", grades: [], majors: [], note: null, status: "rejected", reason: "같은 주에 다른 행사가 있어 일정이 겹칩니다.", requestedBy: "배수아", createdAt: "2026-10-27T11:20:00+09:00" },
];

export const ClassesProvider = ({ children }: { children: ReactNode }) => {
  const [term, setTerm] = useStored<TermKey>("classes:term", TERMS[0]!);
  const [session, setSession] = useStored<Session>("classes:session", { signedIn: true, username: "jiwoo", role: "admin", linked: true });
  const [major, setMajor] = useStored<MajorState>("classes:major", { major: "정보과학", answered: true });
  const [personal, setPersonal] = useStored<CalendarEvent[]>("classes:personal-events", FIRST_PERSONAL);
  const [requests, setRequests] = useStored<EventRequest[]>("classes:event-requests", FIRST_REQUESTS);
  const [tradeConfig, setTradeConfig] = useStored<TradeConfig>("classes:trade-config", { enabled: true, deadline: "2026-11-13", term: "2026-2" });
  const data = useMemo(() => termData(term), [term]);
  const [friends, setFriends] = useStored<string[]>("classes:friends", () => {
    const mine = new Set(data.subjects.flatMap((subject) => subject.sections.filter((section) => section.students.some((student) => student.stuId === ME.stuId)).map((section) => section.id)));
    const shared = new Map<string, number>();
    for (const subject of data.subjects) for (const section of subject.sections) if (mine.has(section.id)) for (const student of section.students) if (student.stuId !== ME.stuId) shared.set(student.stuId, (shared.get(student.stuId) ?? 0) + 1);
    return [...shared.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 5).map(([stuId]) => stuId);
  });

  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get("term");
    const found = TERMS.find((item) => termLabel(item) === asked);
    if (found) setTerm(found);
  }, [setTerm]);

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((value) => value + 15), 15_000);
    return () => window.clearInterval(timer);
  }, []);
  const clock = useMemo(() => clockAt(NOW.getTime() + elapsed * 1000), [elapsed]);

  const names = useMemo(() => new Map(data.students.map((student) => [student.stuId, student.name])), [data]);
  const [shared, setShared] = useStored<CalendarEvent[]>("classes:shared-events", []);
  const [materials, setMaterials] = useStored<Material[]>("classes:materials", firstMaterials);
  const events = useMemo(() => {
    const approved = requests
      .filter((item) => item.status === "approved")
      .map((item): CalendarEvent => ({ id: 70000 + item.id, title: item.title, start: item.start, end: item.end, mode: "allday", startMinute: null, endMinute: null, startPeriod: null, endPeriod: null, category: item.category, grades: item.grades, majors: item.majors, personal: false, seriesId: null, note: item.note }));
    return [...BASE_EVENTS, ...shared, ...approved, ...personal];
  }, [shared, requests, personal]);

  const value: Value = {
    term,
    setTerm,
    data,
    clock,
    me: ME,
    session,
    signIn: useCallback((username: string) => setSession({ signedIn: true, username, role: "admin", linked: username !== "legacy" }), [setSession]),
    signOut: useCallback(() => setSession((now) => ({ ...now, signedIn: false })), [setSession]),
    linkGoogle: useCallback(() => setSession((now) => ({ ...now, linked: true })), [setSession]),
    setRole: useCallback((role: Role) => setSession((now) => ({ ...now, role })), [setSession]),
    major,
    setMajor,
    friends,
    addFriend: useCallback((stuId: string) => setFriends((now) => (now.includes(stuId) ? now : [...now, stuId])), [setFriends]),
    removeFriend: useCallback((stuId: string) => setFriends((now) => now.filter((item) => item !== stuId)), [setFriends]),
    events,
    personal,
    setPersonal,
    shared,
    setShared,
    requests,
    setRequests,
    materials,
    setMaterials,
    tradeOpen: tradeConfig.enabled && termLabel(term) === tradeConfig.term,
    tradeConfig,
    setTradeConfig,
    studentName: useCallback((stuId: string) => names.get(stuId) ?? stuId, [names]),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
