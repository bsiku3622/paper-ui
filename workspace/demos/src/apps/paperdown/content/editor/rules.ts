import { insertInlineMath, insertRule, setBlock, toggleList, toggleQuote, type BlockKind } from "./commands";
import { cutRange, isElement, mapRange, marksAt, parseRuns, placeSelection, positionAt, readCarets, renderRuns, textOf, type MarkName, type Marks, type Run } from "./dom";

const BLOCK_RULES: { test: RegExp; apply: (root: HTMLElement, match: RegExpExecArray) => void }[] = [
  { test: /^(#{1,3})\s$/, apply: (root, match) => void setBlock(root, `h${match[1]!.length}` as BlockKind) },
  { test: /^\s*[-+*]\s$/, apply: (root) => void toggleList(root, "bullet") },
  { test: /^\s*\d+\.\s$/, apply: (root) => void toggleList(root, "ordered") },
  { test: /^\s*>\s$/, apply: (root) => void toggleQuote(root) },
  {
    test: /^\s*\[([ xX]?)\]\s$/,
    apply: (root, match) => {
      toggleList(root, "task");
      if (match[1] && match[1] !== " ") {
        const item = readCarets(root)?.start.block.closest<HTMLElement>("li");
        if (item) item.dataset.checked = "true";
      }
    },
  },
  { test: /^```[a-z]*\s$/, apply: (root) => void setBlock(root, "code") },
  { test: /^(?:---|—-|___\s|\*\*\*\s)$/, apply: (root) => void insertRule(root) },
];

const TYPOGRAPHY: { test: RegExp; text: string }[] = [
  { test: /(?:-->|->|—>)$/, text: "→" },
  { test: /(?:==>|=>)$/, text: "⇒" },
  { test: /--$/, text: "—" },
];

const inner = (marker: string) => `([^\\s${marker}](?:[^\\n${marker}]*?[^\\s${marker}])?)`;
const MARKS: { test: RegExp; open: number; mark: keyof Marks }[] = [
  { test: new RegExp(`(?:^|[^*])\\*\\*${inner("*")}\\*\\*$`), open: 2, mark: "bold" },
  { test: new RegExp(`(?:^|[^*\\w])\\*${inner("*")}\\*$`), open: 1, mark: "italic" },
  { test: new RegExp(`(?:^|[^_\\w])_${inner("_")}_$`), open: 1, mark: "italic" },
  { test: new RegExp(`~~${inner("~")}~~$`), open: 2, mark: "strike" },
  { test: new RegExp(`==${inner("=")}==$`), open: 2, mark: "highlight" },
  { test: /`([^`\n]+)`$/, open: 1, mark: "code" },
];

const insertAt = (runs: Run[], at: number, text: string, marks: Marks): Run[] => {
  const out: Run[] = [];
  let position = 0;
  let placed = false;
  for (const run of runs) {
    const length = run.kind === "text" ? run.text.length : 1;
    if (!placed && run.kind === "text" && at >= position && at <= position + length) {
      const cut = at - position;
      if (cut > 0) out.push({ kind: "text", text: run.text.slice(0, cut), marks: run.marks });
      out.push({ kind: "text", text, marks });
      if (cut < run.text.length) out.push({ kind: "text", text: run.text.slice(cut), marks: run.marks });
      placed = true;
    } else out.push(run);
    position += length;
  }
  if (!placed) out.push({ kind: "text", text, marks });
  return out;
};

const placeOutside = (block: HTMLElement, offset: number) => {
  const at = positionAt(block, offset);
  let node: Node = at.node;
  while (node.parentNode && node.parentNode !== block && isElement(node.parentNode)) node = node.parentNode;
  if (node === block || node.nodeType === Node.TEXT_NODE) {
    placeSelection({ block, offset });
    return;
  }
  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
};

export type PlainAfter = (pending: { patch: Partial<Record<MarkName, boolean>>; block: HTMLElement; offset: number }) => void;

export const applyRules = (root: HTMLElement, plainAfter?: PlainAfter): boolean => {
  const carets = readCarets(root);
  if (!carets || !carets.collapsed) return false;
  const block = carets.start.block;
  if (block.tagName === "PRE") return false;
  const offset = carets.start.offset;
  const runs = parseRuns(block);
  const before = textOf(runs, 0, offset);

  if (block.tagName === "P" && block.parentElement === root) {
    for (const rule of BLOCK_RULES) {
      const match = rule.test.exec(before);
      if (!match) continue;
      renderRuns(block, cutRange(runs, 0, offset));
      placeSelection({ block, offset: 0 });
      rule.apply(root, match);
      return true;
    }
  }

  for (const rule of TYPOGRAPHY) {
    const match = rule.test.exec(before);
    if (!match) continue;
    const length = match[0].length;
    const marks = marksAt(runs, offset);
    renderRuns(block, insertAt(cutRange(runs, offset - length, offset), offset - length, rule.text, marks));
    placeSelection({ block, offset: offset - length + rule.text.length });
    return true;
  }

  const math = /(?:^|[^$])\$([^$\n]+)\$$/.exec(before);
  if (math) {
    const length = math[1]!.length + 2;
    renderRuns(block, cutRange(runs, offset - length, offset));
    insertInlineMath(block, offset - length, math[1]!);
    return true;
  }

  for (const rule of MARKS) {
    const match = rule.test.exec(before);
    if (!match) continue;
    const inner = match[1]!;
    const total = inner.length + rule.open * 2;
    const start = offset - total;
    const kept = cutRange(cutRange(runs, offset - rule.open, offset), start, start + rule.open);
    renderRuns(block, mapRange(kept, start, start + inner.length, (marks) => ({ ...marks, [rule.mark]: true })));
    placeOutside(block, start + inner.length);
    plainAfter?.({ patch: { [rule.mark]: false }, block, offset: start + inner.length });
    return true;
  }
  return false;
};
