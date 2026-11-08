// Content: the paper's undo history. The browser's own history cannot be trusted once the editor has rewritten blocks
// itself, so each step is the paper's HTML and where the selection was (a textblock's number and a position in it).

import { renderMath } from "./commands";
import { placeSelection, readCarets, textblocks } from "./dom";

type Mark = { block: number; offset: number };
export type Snap = { html: string; start: Mark | null; end: Mark | null };

const MERGE_MS = 700;
const LIMIT = 200;

// What the paper holds, without what only the screen adds (the gaps that move blocks onto the next page).
export const cleanHtml = (root: HTMLElement): string => {
  const copy = root.cloneNode(true) as HTMLElement;
  for (const element of Array.from(copy.querySelectorAll<HTMLElement>("[data-pgap]"))) {
    element.style.marginTop = "";
    element.removeAttribute("data-pgap");
    if (!element.getAttribute("style")) element.removeAttribute("style");
  }
  for (const element of Array.from(copy.querySelectorAll<HTMLElement>("[data-placeholder],.is-empty"))) {
    element.removeAttribute("data-placeholder");
    element.classList.remove("is-empty");
    if (!element.getAttribute("class")) element.removeAttribute("class");
  }
  for (const element of Array.from(copy.querySelectorAll<HTMLElement>("[data-type$='-math']"))) {
    element.removeAttribute("contenteditable");
    element.textContent = "";
  }
  for (const element of Array.from(copy.querySelectorAll<HTMLElement>("[data-selected]"))) element.removeAttribute("data-selected");
  return copy.innerHTML;
};

// Give a paper its formulas (they are stored as their LaTeX) and the paragraph an empty paper needs.
export const hydrate = (root: HTMLElement) => {
  for (const element of Array.from(root.querySelectorAll<HTMLElement>("[data-type$='-math']"))) renderMath(element);
  if (root.children.length === 0) {
    const paragraph = document.createElement("p");
    paragraph.append(document.createElement("br"));
    root.append(paragraph);
  }
};

export const load = (root: HTMLElement, html: string) => {
  root.innerHTML = html;
  hydrate(root);
};

export const capture = (root: HTMLElement): Snap => {
  const carets = readCarets(root);
  const all = textblocks(root);
  const mark = (caret: { block: HTMLElement; offset: number } | undefined): Mark | null => {
    if (!caret) return null;
    const block = all.indexOf(caret.block);
    return block < 0 ? null : { block, offset: caret.offset };
  };
  return { html: cleanHtml(root), start: mark(carets?.start), end: mark(carets?.end) };
};

export const restore = (root: HTMLElement, snap: Snap) => {
  load(root, snap.html);
  const all = textblocks(root);
  const start = snap.start ? all[snap.start.block] : undefined;
  const end = snap.end ? all[snap.end.block] : undefined;
  if (start && end && snap.start && snap.end) placeSelection({ block: start, offset: snap.start.offset }, { block: end, offset: snap.end.offset });
};

export class History {
  private past: Snap[] = [];
  private future: Snap[] = [];
  private current: Snap;
  private at = 0;
  private kind = "";

  constructor(first: Snap) {
    this.current = first;
  }

  get canUndo() {
    return this.past.length > 0;
  }

  get canRedo() {
    return this.future.length > 0;
  }

  reset(first: Snap) {
    this.past = [];
    this.future = [];
    this.current = first;
    this.at = 0;
    this.kind = "";
  }

  // The state after a change. Typing in a row is one step; anything else is a step of its own.
  record(snap: Snap, kind: "type" | "edit") {
    if (snap.html === this.current.html) {
      this.current = snap;
      return false;
    }
    const now = Date.now();
    const merge = kind === "type" && this.kind === "type" && now - this.at < MERGE_MS && this.past.length > 0;
    if (!merge) {
      this.past.push(this.current);
      if (this.past.length > LIMIT) this.past.shift();
    }
    this.current = snap;
    this.future = [];
    this.at = now;
    this.kind = kind;
    return true;
  }

  undo(now: Snap): Snap | null {
    const previous = this.past.pop();
    if (!previous) return null;
    this.future.push(now);
    this.current = previous;
    this.kind = "";
    return previous;
  }

  redo(now: Snap): Snap | null {
    const next = this.future.pop();
    if (!next) return null;
    this.past.push(now);
    this.current = next;
    this.kind = "";
    return next;
  }
}
