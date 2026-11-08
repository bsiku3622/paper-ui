// diff.ts — what changed between two revisions: lines first, then the words inside a changed line. The file has no imports so
// a script can load it on its own.

export type Op = { kind: "same" | "del" | "add"; text: string };
export type Seg = { text: string; changed: boolean };

const lcs = <T,>(a: readonly T[], b: readonly T[], limit = 3_000_000): Op[] | null => {
  const n = a.length;
  const m = b.length;
  if (n * m > limit) return null;
  const w = m + 1;
  const dp = new Uint16Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * w + j] = a[i] === b[j] ? dp[(i + 1) * w + j + 1]! + 1 : Math.max(dp[(i + 1) * w + j]!, dp[i * w + j + 1]!);
    }
  }
  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ kind: "same", text: String(a[i]) });
      i++;
      j++;
    } else if (dp[(i + 1) * w + j]! >= dp[i * w + j + 1]!) {
      ops.push({ kind: "del", text: String(a[i++]) });
    } else {
      ops.push({ kind: "add", text: String(b[j++]) });
    }
  }
  while (i < n) ops.push({ kind: "del", text: String(a[i++]) });
  while (j < m) ops.push({ kind: "add", text: String(b[j++]) });
  return ops;
};

const diffSeq = (a: readonly string[], b: readonly string[]): Op[] => {
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }
  const middle =
    lcs(a.slice(start, endA), b.slice(start, endB)) ??
    ([...a.slice(start, endA).map((text) => ({ kind: "del" as const, text })), ...b.slice(start, endB).map((text) => ({ kind: "add" as const, text }))] satisfies Op[]);
  return [
    ...a.slice(0, start).map((text) => ({ kind: "same" as const, text })),
    ...middle,
    ...a.slice(endA).map((text) => ({ kind: "same" as const, text })),
  ];
};

export const diffLines = (before: string, after: string): Op[] => diffSeq(before.split("\n"), after.split("\n"));

// The words of two lines, marking the ones that are not shared. Long lines are not split any further.
export const diffWords = (before: string, after: string): { old: Seg[]; next: Seg[] } => {
  const tokens = (text: string) => text.match(/\s+|[^\s]+/g) ?? [];
  const a = tokens(before);
  const b = tokens(after);
  if (a.length + b.length > 500) return { old: [{ text: before, changed: true }], next: [{ text: after, changed: true }] };
  const ops = diffSeq(a, b);
  const old: Seg[] = [];
  const next: Seg[] = [];
  const push = (list: Seg[], text: string, changed: boolean) => {
    const last = list[list.length - 1];
    if (last && last.changed === changed) last.text += text;
    else list.push({ text, changed });
  };
  for (const op of ops) {
    if (op.kind !== "add") push(old, op.text, op.kind === "del");
    if (op.kind !== "del") push(next, op.text, op.kind === "add");
  }
  return { old, next };
};

export type Line =
  | { kind: "same"; oldNo: number; newNo: number; text: string }
  | { kind: "change"; oldNo: number | null; newNo: number | null; old: string | null; next: string | null }
  | { kind: "gap"; count: number };

// Rows to show: a removed and an added line next to each other become one changed row, and long runs that did not change
// shrink to a gap with `context` lines kept beside each change.
export const diffRows = (before: string, after: string, context = 2): Line[] => {
  const ops = diffLines(before, after);
  const rows: Line[] = [];
  let oldNo = 0;
  let newNo = 0;
  let k = 0;
  while (k < ops.length) {
    const op = ops[k]!;
    if (op.kind === "same") {
      oldNo++;
      newNo++;
      rows.push({ kind: "same", oldNo, newNo, text: op.text });
      k++;
      continue;
    }
    const dels: string[] = [];
    const adds: string[] = [];
    while (k < ops.length && ops[k]!.kind !== "same") {
      (ops[k]!.kind === "del" ? dels : adds).push(ops[k]!.text);
      k++;
    }
    const pairs = Math.max(dels.length, adds.length);
    for (let p = 0; p < pairs; p++) {
      const old = dels[p] ?? null;
      const next = adds[p] ?? null;
      rows.push({ kind: "change", oldNo: old === null ? null : ++oldNo, newNo: next === null ? null : ++newNo, old, next });
    }
  }
  const keep = new Array<boolean>(rows.length).fill(false);
  rows.forEach((row, index) => {
    if (row.kind === "same") return;
    for (let d = -context; d <= context; d++) if (rows[index + d]) keep[index + d] = true;
  });
  const out: Line[] = [];
  let run: Line[] = [];
  const flush = () => {
    if (run.length > 3) out.push({ kind: "gap", count: run.length });
    else out.push(...run);
    run = [];
  };
  rows.forEach((row, index) => {
    if (keep[index] || row.kind !== "same") {
      flush();
      out.push(row);
    } else run.push(row);
  });
  flush();
  return out;
};
