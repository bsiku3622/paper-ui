// The search engine: it runs entirely in the browser over the term's data.
//
//   미적분             a word — a subject, a teacher, a room, a student, a time ("화2"); what you type loosely still finds it
//   ㅈㅂㄱㅎ3          initials only
//   student:25-307     only students (s: st:)      teacher:윤다인 (t: te:)      room:형3407 (r: ro:)
//   정보과학3/2,3      sections 2 and 3 of a subject
//   a + b   a & b   !a   ( … )    or / and / not / groups
//
// Names with brackets would be read as groups, so a link that opens a search builds its query with subjectQuery().

import type { Section, SubjectData, TermData } from "../data/build";
import { termIndex, type Placed } from "./index";
import { cohortOf, formatTimes, koreanName, sectionNumber } from "./utils";

export type Mode = "general" | "student" | "teacher" | "room";

// ── queries that open a search ───────────────────────────────────────────────

// "미적분학2(EC)" → "미적분학2 EC": the brackets go, the letters stay, so it still finds only that subject.
export const subjectQuery = (subject: string) => koreanName(subject).replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
export const sectionQuery = (subject: string, section: string) => `${subjectQuery(subject)}/${sectionNumber(section)}`;
export const teacherQuery = (name: string) => `teacher:${name}`;

// ── loose matching ───────────────────────────────────────────────────────────

const ROMAN: [string, string][] = [["Ⅻ", "12"], ["Ⅺ", "11"], ["Ⅹ", "10"], ["Ⅸ", "9"], ["Ⅷ", "8"], ["Ⅶ", "7"], ["Ⅵ", "6"], ["Ⅴ", "5"], ["Ⅳ", "4"], ["Ⅲ", "3"], ["Ⅱ", "2"], ["Ⅰ", "1"]];
// Roman numerals first (lower-casing would break them), then lower case, then no spaces or marks.
export const normalize = (text: string) => {
  let out = text;
  for (const [roman, arabic] of ROMAN) out = out.replaceAll(roman, arabic);
  return out.toLowerCase().replace(/[\s\-_.,()·:/]/g, "");
};

const INITIALS = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
export const initials = (text: string) =>
  [...text].map((char) => {
    const code = char.charCodeAt(0) - 0xac00;
    return code >= 0 && code <= 11171 ? INITIALS[Math.floor(code / 588)]! : char;
  }).join("");

// The letters of `term` appear in order in `target`, close enough together to mean it ("정3" → 정보과학3).
const inOrder = (target: string, term: string) => {
  let best = Infinity;
  for (let start = target.indexOf(term[0]!); start !== -1; start = target.indexOf(term[0]!, start + 1)) {
    let at = start;
    let found = true;
    for (let i = 1; i < term.length; i++) {
      at = target.indexOf(term[i]!, at + 1);
      if (at === -1) {
        found = false;
        break;
      }
    }
    if (!found) break;
    best = Math.min(best, at - start + 1);
  }
  return best <= term.length * 3 + 2;
};

const fuzzy = (item: string, term: string) => {
  const target = normalize(item);
  const word = normalize(term);
  if (!word) return false;
  if (target.includes(word)) return true;
  if (word.length < 2) return false;
  return inOrder(target, word) || inOrder(initials(target), word);
};

const matchesItem = (item: string, term: string, strictId: boolean) => {
  const word = term.trim();
  if (!word) return false;
  if (strictId && word.includes("-")) return item.toLowerCase() === word.toLowerCase();
  if (item.toLowerCase().includes(word.toLowerCase())) return true;
  if (/^[ㄱ-ㅎ]+$/.test(word)) return initials(item).includes(word);
  return fuzzy(item, word);
};

// ── the expression ───────────────────────────────────────────────────────────

type Token = { kind: "term"; text: string } | { kind: "op"; text: "+" | "&" | "!" | "(" | ")" };

const tokenize = (expression: string): Token[] => {
  const tokens: Token[] = [];
  let buffer = "";
  const flush = () => {
    const text = buffer.trim();
    if (text) tokens.push({ kind: "term", text });
    buffer = "";
  };
  for (let i = 0; i < expression.length; i++) {
    const char = expression[i]!;
    if (char === "&") {
      flush();
      tokens.push({ kind: "op", text: "&" });
      if (expression[i + 1] === "&") i++;
    } else if (char === "+" || char === "!" || char === "(" || char === ")") {
      flush();
      tokens.push({ kind: "op", text: char });
    } else buffer += char;
  }
  flush();
  return tokens;
};

const evaluate = (expression: string, match: (term: string) => boolean): boolean => {
  const tokens = tokenize(expression);
  if (tokens.length === 0) return false;
  let at = 0;
  const isOp = (text: string) => tokens[at]?.kind === "op" && tokens[at]!.text === text;
  const factor = (): boolean => {
    const token = tokens[at];
    if (!token) return false;
    at++;
    if (token.kind === "term") return match(token.text);
    if (token.text === "(") {
      const value = or();
      if (isOp(")")) at++;
      return value;
    }
    return false;
  };
  const unary = (): boolean => {
    if (isOp("!")) {
      at++;
      return !unary();
    }
    return factor();
  };
  const and = (): boolean => {
    let value = unary();
    while (isOp("&")) {
      at++;
      const right = unary();
      value = value && right;
    }
    return value;
  };
  const or = (): boolean => {
    let value = and();
    while (isOp("+")) {
      at++;
      const right = and();
      value = value || right;
    }
    return value;
  };
  return or();
};

// ── parsing a query ──────────────────────────────────────────────────────────

const PREFIX = /^(student|st|s|teacher|te|t|room|ro|r):\s*(.*)$/i;
const DIVIDER = /^(.+?)\s*\/\s*(\d+(?:\s*,\s*\d+)*)$/;

export const parseQuery = (query: string): { mode: Mode; expression: string } => {
  const text = query.trim();
  const prefixed = PREFIX.exec(text);
  if (!prefixed) return { mode: "general", expression: text };
  const key = prefixed[1]!.toLowerCase();
  const mode: Mode = key.startsWith("s") ? "student" : key.startsWith("t") ? "teacher" : "room";
  return { mode, expression: prefixed[2]!.trim() };
};

// The words to mark in what is shown: the terms of the expression, a divider term by its subject.
export const searchTerms = (query: string) =>
  tokenize(parseQuery(query).expression)
    .filter((token): token is { kind: "term"; text: string } => token.kind === "term")
    .map((token) => DIVIDER.exec(token.text)?.[1]?.trim() ?? token.text)
    .map((text) => text.toLowerCase());

// A logical search (several terms, a section divider) is read as one question about a group, so it shows the people it names.
export const isLogical = (query: string) => /[+&/(]/.test(query);

// ── what a search finds ──────────────────────────────────────────────────────

export type Entity = { type: "student" | "teacher" | "room"; id: string; name: string; subjects: string[]; times: Placed[] };
export type Outcome = {
  mode: Mode;
  expression: string;
  data: SubjectData[];
  entities: Entity[];
  warning: string | null;
  subjects: number;
  sections: number;
  students: number;
};

const ENTITY_ORDER = { teacher: 1, student: 2, room: 3 } as const;

export const search = (data: TermData, query: string, years: readonly string[]): Outcome => {
  const { mode, expression } = parseQuery(query);
  const index = termIndex(data);
  const yearOk = (stuId: string) => years.length === 0 || years.includes(cohortOf(stuId));
  const terms = tokenize(expression).filter((token): token is { kind: "term"; text: string } => token.kind === "term").map((token) => token.text);

  const out: SubjectData[] = [];
  for (const subject of data.subjects) {
    const sections: Section[] = [];
    for (const section of subject.sections) {
      const roster = section.students.filter((student) => yearOk(student.stuId));
      if (roster.length === 0) continue;
      if (expression) {
        const rooms = [...new Set([section.room, ...section.times.map((time) => time.room)])];
        const pool =
          mode === "student" ? roster.flatMap((student) => [student.stuId, student.name]) : mode === "teacher" ? [section.teacher] : mode === "room" ? rooms : [koreanName(subject.subject), subject.subject, subject.english, section.teacher, formatTimes(section.times), ...rooms, ...roster.flatMap((student) => [student.stuId, student.name])];
        const hit = evaluate(expression, (term) => {
          const divided = DIVIDER.exec(term);
          if (divided) {
            const numbers = divided[2]!.split(",").map((item) => item.trim());
            return numbers.includes(sectionNumber(section.section)) && (fuzzy(koreanName(subject.subject), divided[1]!) || fuzzy(subject.subject, divided[1]!));
          }
          return pool.some((item) => matchesItem(item, term, mode === "student" || mode === "room"));
        });
        if (!hit) continue;
      }
      sections.push({ ...section, students: roster });
    }
    if (sections.length === 0) continue;
    out.push({ ...subject, sections, studentCount: new Set(sections.flatMap((section) => section.students.map((student) => student.stuId))).size });
  }

  // the people, teachers and rooms the words name
  const entities: Entity[] = [];
  const seen = new Set<string>();
  const add = (entity: Entity) => {
    const key = `${entity.type}:${entity.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    entities.push(entity);
  };
  const named = (text: string) => terms.some((term) => (mode === "general" ? text.toLowerCase().includes(term.toLowerCase()) && term.length >= 2 : matchesItem(text, term, true)));
  if (expression && terms.some((term) => !DIVIDER.test(term))) {
    for (const subject of out) {
      for (const section of subject.sections) {
        if (mode !== "teacher" && mode !== "room") {
          for (const student of section.students) {
            if (named(student.stuId) || named(student.name)) {
              const entry = index.students.get(student.stuId);
              if (entry) add({ type: "student", id: student.stuId, name: student.name, subjects: entry.subjects, times: entry.placed });
            }
          }
        }
        if (mode !== "student" && mode !== "room" && named(section.teacher)) {
          const entry = index.teachers.get(section.teacher);
          if (entry) add({ type: "teacher", id: section.teacher, name: section.teacher, subjects: entry.subjects, times: entry.placed });
        }
        if (mode !== "student" && mode !== "teacher") {
          for (const room of new Set([section.room, ...section.times.map((time) => time.room)])) {
            if (named(room) && (mode === "room" || mode === "general")) {
              const placed = index.rooms.get(room);
              if (placed) add({ type: "room", id: room, name: room, subjects: [...new Set(placed.map((item) => item.subject))], times: placed });
            }
          }
        }
      }
    }
  }
  entities.sort((a, b) => ENTITY_ORDER[a.type] - ENTITY_ORDER[b.type] || a.name.localeCompare(b.name, "ko"));

  const warning = terms.some((term) => !DIVIDER.test(term) && term.trim().length === 1 && !/^[ㄱ-ㅎ]$/.test(term.trim())) ? "한 글자 검색은 정확히 포함된 것만 찾습니다. 두 글자 이상이면 줄여 쓴 말도 찾습니다." : null;
  return {
    mode,
    expression,
    data: out,
    entities,
    warning,
    subjects: out.length,
    sections: out.reduce((sum, subject) => sum + subject.sections.length, 0),
    students: new Set(out.flatMap((subject) => subject.sections.flatMap((section) => section.students.map((student) => student.stuId)))).size,
  };
};

// Students compared: the periods where all of them have a class but not the same one, and the ones where none does.
export const compare = (entities: readonly Entity[]) => {
  const people = entities.filter((entity) => entity.type === "student");
  if (people.length < 2) return null;
  const busy = people.map((entity) => new Map(entity.times.map((item) => [`${item.day}-${item.period}`, item.subject])));
  let conflicts = 0;
  const free: string[] = [];
  for (const day of ["MON", "TUE", "WED", "THU", "FRI"]) {
    for (let period = 1; period <= 11; period++) {
      const key = `${day}-${period}`;
      const subjects = busy.map((map) => map.get(key));
      if (subjects.every((item) => item === undefined)) free.push(key);
      else if (subjects.every((item) => item !== undefined) && new Set(subjects).size > 1) conflicts += 1;
    }
  }
  return { conflicts, free };
};
