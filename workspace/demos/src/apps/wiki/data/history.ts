import { chance, int, NOW, pick, random } from "../../../kit";
import { hash, sizeOf } from "../lib/text";
import type { Rev } from "./types";
import { USERS, WIKI_OPENED } from "./users";

const DAY = 86_400_000;
const MINUTE = 60_000;

export const splitUnits = (text: string): string[] => {
  const units: string[] = [];
  let current: string[] = [];
  let fence = false;
  let macro = false;
  const flush = () => {
    if (current.length > 0) units.push(current.join("\n"));
    current = [];
  };
  for (const line of text.replace(/\r\n?/g, "\n").split("\n")) {
    if (fence) {
      current.push(line);
      if (/^```\s*$/.test(line)) fence = false;
    } else if (macro) {
      current.push(line);
      if (line.trim() === "}}") macro = false;
    } else if (line.trim() === "") flush();
    else {
      current.push(line);
      if (line.startsWith("```")) fence = true;
      else if (/^\{\{(정보상자|틀)/.test(line.trim()) && !/\}\}\s*$/.test(line.trim())) macro = true;
    }
  }
  flush();
  return units;
};

export const normalize = (text: string) => splitUnits(text).join("\n\n");

const balanced = (text: string) => text.split("[").length === text.split("]").length && text.split("[[").length === text.split("]]").length;

const shorten = (unit: string): string | null => {
  const lines = unit.split("\n");
  const first = lines[0] ?? "";
  if (/^={2,4} /.test(first)) {
    if (lines.length < 2) return null;
    const rest = shorten(lines.slice(1).join("\n"));
    return rest === null ? null : [first, rest].join("\n");
  }
  if (first.startsWith("|")) return lines.length > 4 ? lines.slice(0, -1).join("\n") : null;
  if (/^(\*|\d{1,2}\.) /.test(first)) return lines.length > 2 ? lines.slice(0, -1).join("\n") : null;
  if (/^(\{\{|```|----|>|\[\[분류)/.test(first)) return null;
  const sentences = unit.split(/(?<=[다요]\.)\s+/);
  if (sentences.length < 2) return null;
  const shorter = sentences.slice(0, -1).join(" ");
  return balanced(shorter) ? shorter : null;
};

const describeAdd = (units: readonly string[], r: () => number) => {
  const first = units[0] ?? "";
  const heading = /^={2,4} (.+?) ={2,4}/.exec(first);
  if (heading) return pick(r, [`‘${heading[1]}’ 절 추가`, `${heading[1]} 서술 추가`, `‘${heading[1]}’ 항목 추가`]);
  if (first.startsWith("{{정보상자")) return "정보상자 추가";
  if (first.startsWith("{{틀")) return "틀 추가";
  if (first.startsWith("{{그림")) return pick(r, ["그림 추가", "그림 설명 추가"]);
  if (/^\{\{(참고|주의|안내)/.test(first)) return "안내문 추가";
  if (first.startsWith("|")) return pick(r, ["표 추가", "정리표 추가", "수치 표 보강"]);
  if (/^(\*|\d{1,2}\.) /.test(first)) return pick(r, ["목록 추가", "항목 정리"]);
  if (first.startsWith("```")) return "예제 코드 추가";
  if (first.startsWith(">")) return "인용 추가";
  if (first.startsWith("[[분류:")) return pick(r, ["분류 추가", "분류 정리"]);
  return pick(r, ["내용 보강", "문단 추가", "서술 보충", "설명 추가"]);
};

const MODS = ["문장 다듬음", "표현 정리", "수치 정정", "오타 수정", "내용 수정", "서술 보강", "문맥 정리", "문장 정리"];
const VANDAL = ["테스트입니다. 지워 주세요.", "여기에 글을 써 봅니다.", "아무 말이나 적어 봅니다.", "이 문서는 곧 수정됩니다."];

type Ev = { key: number } & ({ kind: "add"; units: number[] } | { kind: "mod"; unit: number } | { kind: "vandal" } | { kind: "revert" });

export const buildHistory = (title: string, source: string): Rev[] => {
  const r = random(`history:${title}`);
  const units = splitUnits(source);
  const n = units.length;
  const final = units.join("\n\n");
  const rich = final.length > 1800;
  const h = hash(title);

  const crew = [0, 3, 5, 9].map((step) => USERS[(h + step) % USERS.length]!);
  const author = (at: number) => {
    const x = r();
    const pickUser = x < 0.4 ? crew[0]! : x < 0.65 ? crew[1]! : x < 0.85 ? crew[2]! : crew[3]!;
    return pickUser.joined <= at ? pickUser.name : USERS[0]!.name;
  };

  const before = units.map((unit) => shorten(unit));
  const initial = rich ? Math.max(1, Math.min(n, 1 + int(r, 0, 2))) : Math.max(1, Math.ceil(n / 2));
  const events: Ev[] = [];
  const addIndex = new Array<number>(n).fill(-1);
  let k = initial;
  let slot = 0;
  while (k < n) {
    const size = rich ? int(r, 1, 3) : 1;
    const group: number[] = [];
    for (let j = 0; j < size && k < n; j++) {
      addIndex[k] = slot;
      group.push(k++);
    }
    events.push({ key: slot, kind: "add", units: group });
    slot++;
  }
  const adds = slot;
  const modded = new Set<number>();
  for (let u = 0; u < n; u++) {
    if (before[u] !== null && chance(r, rich ? 0.35 : 0.75)) {
      modded.add(u);
      events.push({ key: addIndex[u]! + 0.2 + r() * Math.max(1, adds - addIndex[u]!), kind: "mod", unit: u });
    }
  }
  if (chance(r, rich ? 0.55 : 0.18) && adds >= 1) {
    const v = r() * adds;
    events.push({ key: v, kind: "vandal" });
    events.push({ key: v + 0.4 + r() * 1.5, kind: "revert" });
  }
  events.sort((a, b) => a.key - b.key);

  const lastAge = h % 5 === 0 ? (0.08 + (h % 7) * 0.1) * DAY : (0.6 + r() * 38) * DAY;
  const updated = NOW.getTime() - lastAge;
  const span = rich ? int(r, 100, 230) : int(r, 25, 150);
  const created = Math.min(updated - 2 * DAY, Math.max(WIKI_OPENED + int(r, 0, 10) * DAY, updated - span * DAY));
  const count = events.length + 1;
  const spread = Array.from({ length: count - 1 }, () => Math.pow(r(), 0.55)).sort((a, b) => a - b);
  const times: number[] = [Math.round(created / 1000) * 1000];
  spread.forEach((u, index) => {
    const raw = index === spread.length - 1 ? updated : created + (updated - created) * u;
    times.push(Math.min(NOW.getTime() - MINUTE, Math.max(Math.round(raw / 1000) * 1000, times[times.length - 1]! + 7 * MINUTE)));
  });

  const state: (string | null)[] = new Array(n).fill(null);
  let vandal: { text: string; after: number } | null = null;
  const show = (u: number) => (modded.has(u) ? before[u]! : units[u]!);
  const compose = () => {
    const parts: string[] = [];
    if (vandal && vandal.after < 0) parts.push(vandal.text);
    for (let u = 0; u < n; u++) {
      if (state[u] !== null) parts.push(state[u]!);
      if (vandal && vandal.after === u) parts.push(vandal.text);
    }
    return parts.join("\n\n");
  };

  const revs: Rev[] = [];
  const push = (text: string, partial: Pick<Rev, "author" | "summary" | "minor" | "kind"> & { revertOf?: number }) => {
    const index = revs.length;
    const size = sizeOf(text);
    revs.push({ n: index + 1, title, text, at: times[index]!, size, delta: size - (revs[index - 1]?.size ?? 0), ...partial });
  };

  for (let u = 0; u < initial; u++) state[u] = show(u);
  push(compose(), { author: crew[0]!.name, summary: "새 문서", minor: false, kind: "create" });

  let vandalRev = 0;
  for (const event of events) {
    const at = times[revs.length]!;
    if (event.kind === "add") {
      for (const u of event.units) state[u] = show(u);
      push(compose(), {
        author: author(at),
        summary: event.units.length > 1 ? pick(r, ["내용 보강", "서술 보충", "문단 추가"]) : describeAdd(event.units.map((u) => units[u]!), r),
        minor: false,
        kind: "edit",
      });
    } else if (event.kind === "mod") {
      state[event.unit] = units[event.unit]!;
      push(compose(), { author: author(at), summary: pick(r, MODS), minor: chance(r, 0.5), kind: "edit" });
    } else if (event.kind === "vandal") {
      const present = state.map((text, u) => (text === null ? -1 : u)).filter((u) => u >= 0);
      vandal = { text: pick(r, VANDAL), after: present.length > 0 ? pick(r, present) : -1 };
      vandalRev = revs.length + 1;
      push(compose(), { author: `익명 203.0.113.${int(r, 2, 250)}`, summary: pick(r, ["테스트", "연습 편집", "수정"]), minor: false, kind: "edit" });
    } else {
      vandal = null;
      push(compose(), { author: pick(r, [crew[0]!.name, USERS[0]!.name, crew[1]!.name]), summary: pick(r, ["테스트 편집 되돌림", "장난 편집 되돌림"]), minor: false, kind: "revert", revertOf: Math.max(1, vandalRev - 1) });
    }
  }
  return revs;
};
