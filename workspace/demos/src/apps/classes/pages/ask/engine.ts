import type { TermData } from "../../data/build";
import { EXAM_PERIODS } from "../../data/generated/exams";
import { DAY_FULL, DAY_LABEL, PERIODS, hhmm, type Day } from "../../data/periods";
import { termIndex } from "../../lib";
import { CATEGORY_LABEL, dayCode, fromKey, gradeOf, isForMe, addDays, toKey, type CalendarEvent } from "../../lib/calendar";
import { koreanName, periodRuns, weekdayOf } from "../../lib/utils";

export type Step = { id: string; label: string };
export type Answer = { steps: Step[]; text: string };
export type Context = { data: TermData; stuId: string; clockKey: string; minute: number; events: readonly CalendarEvent[]; major: string | null };

export const SUGGESTIONS = ["오늘 형3404 빈 교시 뭐 있어?", "내 공강이 언제야?", "오케스트라 연주회 언제야?", "기말고사 일정 알려줘", "다음 수업이 어디서 해?", "이번 주 내 일정만 알려줘", "정보과학3은 누가 가르쳐?"];

const ROOM = /형\d{4}|탐\d{4}|창\d{4}|예\d{4}/;
const dayOf = (key: string): Day | null => {
  const code = dayCode(fromKey(key));
  return code === "SAT" || code === "SUN" ? null : code;
};

const md = (key: string) => `${Number(key.slice(5, 7))}월 ${Number(key.slice(8, 10))}일`;

const eventLine = (event: CalendarEvent) => {
  const [, month, day] = event.start.split("-").map(Number) as [number, number, number];
  const [, endMonth, endDay] = event.end.split("-").map(Number) as [number, number, number];
  return `${month}월 ${day}일${event.end !== event.start ? `~${endMonth}월 ${endDay}일` : ""}(${weekdayOf(event.start)}) ${event.title}`;
};

export const answer = (question: string, ctx: Context): Answer => {
  const q = question.trim();
  const index = termIndex(ctx.data);
  const mine = index.students.get(ctx.stuId);
  const today = dayOf(ctx.clockKey);
  const steps: Step[] = [];
  const note = (id: string, label: string) => steps.push({ id, label });

  const room = ROOM.exec(q)?.[0];
  if (room && /빈|공강|비어|비는|사용|쓰/.test(q)) {
    note("rooms", `${room}의 시간표 찾기`);
    const placed = index.rooms.get(room) ?? [];
    if (!today) return { steps, text: `오늘은 주말이라 수업이 없어 ${room}는 하루 종일 비어 있습니다.` };
    const used = placed.filter((item) => item.day === today).sort((a, b) => a.period - b.period);
    const taken = new Set(used.map((item) => item.period));
    const free = PERIODS.map((item) => item.period).filter((period) => period <= 9 && !taken.has(period));
    const lines = used.map((item) => `${item.period}교시 ${koreanName(item.subject)}(${item.section.replace(/\D/g, "")}분반)`);
    return {
      steps,
      text: placed.length === 0
        ? `${room}에서 열리는 수업이 이번 학기에는 없습니다. 하루 종일 비어 있습니다.`
        : `오늘(${DAY_LABEL[today]}) ${room}는 ${periodRuns(free)}에 비어 있습니다.\n수업이 있는 교시는 ${lines.length ? lines.join(", ") : "없습니다"}.`,
    };
  }

  if (/공강|비는 시간|빈 시간|비어/.test(q) && /내|나의|제|시간표/.test(q) || /공강이 언제/.test(q)) {
    note("timetable", "내 시간표 읽기");
    const days: Day[] = ["MON", "TUE", "WED", "THU", "FRI"];
    const lines = days.map((day) => {
      const busy = new Set((mine?.placed ?? []).filter((item) => item.day === day).map((item) => item.period));
      const free = PERIODS.map((item) => item.period).filter((period) => period <= 9 && !busy.has(period));
      return `${DAY_LABEL[day]} ${periodRuns(free)}`;
    });
    return { steps, text: `1~9교시 중 수업이 없는 교시입니다.\n${lines.join("\n")}` };
  }

  if (/시험|기말|중간/.test(q)) {
    note("exams", "내 시험 시간표 찾기");
    const period = EXAM_PERIODS.find((item) => (/중간/.test(q) ? item.kind === "midterm" : item.kind === "final")) ?? EXAM_PERIODS[EXAM_PERIODS.length - 1]!;
    const names = new Set((mine?.subjects ?? []).map((name) => koreanName(name).replace(/\(EC\)$/, "")));
    const picked = period.exams.filter((exam) => exam.date && names.has(exam.subject.replace(/\(EC\)$/, "")));
    if (picked.length === 0) return { steps, text: `${period.title}에서 내 수강 과목의 시험을 찾지 못했습니다.` };
    const sorted = [...picked].sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));
    return {
      steps,
      text: `${period.title}는 ${md(period.start)}부터 ${md(period.end)}까지입니다.\n${sorted.map((exam) => `${md(exam.date!)}(${weekdayOf(exam.date!)}) ${hhmm(exam.start ?? 0)}–${hhmm(exam.end ?? 0)} ${exam.subject}`).join("\n")}`,
    };
  }

  if (/마감|일정|행사|언제|개학|종업|방학|귀가|귀교|휴업/.test(q) && !/수업/.test(q)) {
    note("calendar", "학사일정 검색");
    const wantsMine = /내 일정|내 학년|내 전공|나한테/.test(q);
    const grade = gradeOf(ctx.stuId, fromKey(ctx.clockKey));
    const words = q.replace(/[?？!.]/g, "").split(/\s+/).filter((word) => word.length >= 2 && !/마감|언제|알려|일정|뭐야|있어|이번|주|내|것만|전공|학년|보고서|발표/.test(word));
    const from = ctx.clockKey;
    const to = toKey(addDays(fromKey(from), wantsMine ? 7 : 120));
    let found = ctx.events.filter((event) => event.end >= from && event.start <= to && !/주차 종료/.test(event.title));
    if (wantsMine) found = found.filter((event) => isForMe(event, grade, ctx.major));
    else if (words.length) found = found.filter((event) => words.some((word) => event.title.toLowerCase().includes(word.toLowerCase())));
    found = [...found].sort((a, b) => a.start.localeCompare(b.start)).slice(0, 6);
    if (found.length === 0) return { steps, text: "그 기간에 맞는 학사일정을 찾지 못했습니다. 일정 이름을 조금 다르게 물어봐 주세요." };
    return { steps, text: `${wantsMine ? "이번 주 내 학년·전공에 해당하는 일정입니다." : "다가오는 일정입니다."}\n${found.map((event) => `${eventLine(event)} · ${CATEGORY_LABEL[event.category]}`).join("\n")}` };
  }

  if (/다음 수업|지금 수업|어디서|어디야|몇 교시/.test(q)) {
    note("timetable", "내 시간표 읽기");
    if (!today) return { steps, text: "오늘은 주말이라 수업이 없습니다." };
    const classes = (mine?.placed ?? []).filter((item) => item.day === today).sort((a, b) => a.period - b.period);
    const next = classes.find((item) => (PERIODS.find((period) => period.period === item.period)?.end ?? 0) > ctx.minute);
    if (!next) return { steps, text: `오늘(${DAY_FULL[today]}) 남은 수업이 없습니다.` };
    const start = PERIODS.find((period) => period.period === next.period)?.start ?? 0;
    return { steps, text: `${ctx.minute >= start ? "지금은" : "다음 수업은"} ${next.period}교시 ${koreanName(next.subject)}(${hhmm(start)})이고, ${next.room}에서 합니다. 담당은 ${next.teacher} 선생님입니다.` };
  }

  const subject = ctx.data.subjects.find((item) => q.replace(/\s/g, "").includes(koreanName(item.subject).replace(/\s/g, "")));
  if (subject) {
    note("search", `${koreanName(subject.subject)} 분반 찾기`);
    return {
      steps,
      text: `${koreanName(subject.subject)}은(는) ${subject.sections.length}개 분반이 있고 ${subject.studentCount}명이 듣습니다.\n${subject.sections.map((section) => `${section.section} · ${section.teacher} 선생님 · ${section.room}`).join("\n")}`,
    };
  }

  note("search", "학교 자료에서 찾기");
  return { steps, text: "그 질문은 학교 시스템에서 찾지 못했습니다. 이런 것을 물어볼 수 있습니다.\n· 오늘 형3404 빈 교시 뭐 있어?\n· 내 공강이 언제야?\n· 기말고사 일정 알려줘\n· 오케스트라 연주회 언제야?" };
};
