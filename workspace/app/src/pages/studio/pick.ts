// The picker inside the studio's frame. With picking on, the part under the pointer gets a line and its name, a click reports
// it to the studio instead of reaching the page, and the chosen part keeps its line while its props are changed.
//
// A part is found through React: the marked props sit on the part's fiber (and on its element, when the part passes them on), so
// a part that draws no attribute of its own is found as well as one that does.

import { embedded, siteOf } from "./mark";
import { hide, makeLines, nameAt, place, type Box, type Lines } from "./overlay";
import { send, type PartSite, type PickReport } from "./protocol";
import * as s from "./studio.css";

type Fiber = { memoizedProps?: Record<string, unknown> | null; return?: Fiber | null; child?: Fiber | null; sibling?: Fiber | null; stateNode?: unknown };
type Hit = { key: string; nodes: Element[] };

const MARK = "data-studio-part";

const fiberOf = (start: Node): Fiber | null => {
  for (let node: Node | null = start; node; node = node.parentNode) {
    const name = Object.keys(node).find((own) => own.startsWith("__reactFiber$"));
    if (name) return (node as unknown as Record<string, Fiber>)[name] ?? null;
  }
  return null;
};

// The elements a fiber draws: itself when it is one, else the first elements below it.
const nodesOf = (fiber: Fiber): Element[] => {
  if (fiber.stateNode instanceof Element) return [fiber.stateNode];
  const found: Element[] = [];
  const walk = (parent: Fiber) => {
    for (let child = parent.child ?? null; child; child = child.sibling ?? null) {
      if (child.stateNode instanceof Element) found.push(child.stateNode);
      else walk(child);
    }
  };
  walk(fiber);
  return found;
};

// The marked parts at a node, nearest first. A part and the element it hands the mark to are the same use, and the outer one's
// elements are the part's whole (a field's frame, not only its input).
const hitsAt = (target: Node): Hit[] => {
  const hits: Hit[] = [];
  for (let fiber = fiberOf(target); fiber; fiber = fiber.return ?? null) {
    const key = fiber.memoizedProps?.[MARK];
    if (typeof key !== "string") continue;
    const nodes = nodesOf(fiber);
    const same = hits.find((hit) => hit.key === key);
    if (same) same.nodes = nodes;
    else hits.push({ key, nodes });
  }
  return hits;
};

const componentOf = (key: string) => key.slice(key.indexOf("#") + 1, key.lastIndexOf(":"));
const fileOf = (key: string) => key.slice(0, key.indexOf("#"));

const unite = (nodes: Element[]): Box | null => {
  const rects = nodes.filter((node) => node.isConnected).map((node) => node.getBoundingClientRect()).filter((rect) => rect.width > 0 || rect.height > 0);
  if (rects.length === 0) return null;
  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.right));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));
  return { x: left, y: top, width: right - left, height: bottom - top };
};

let lines: Lines | null = null;
let pickedKey: string | null = null;
let pickedNodes: Element[] = [];
let lastChain: Hit[] = [];
let loop = 0;

const ensure = (): Lines => (lines ??= makeLines());

const follow = () => {
  loop = 0;
  if (!lines || pickedKey === null) return;
  if (pickedNodes.length === 0 || !pickedNodes.some((node) => node.isConnected)) {
    const again = Array.from(document.querySelectorAll(`[${MARK}="${CSS.escape(pickedKey)}"]`));
    if (again.length > 0) pickedNodes = again;
  }
  place(lines.picked, unite(pickedNodes));
  loop = requestAnimationFrame(follow);
};

const outline = (key: string | null, nodes: Element[]) => {
  const own = ensure();
  pickedKey = key;
  pickedNodes = nodes;
  if (loop) cancelAnimationFrame(loop);
  loop = 0;
  if (key === null) {
    hide(own.picked);
    return;
  }
  loop = requestAnimationFrame(follow);
};

const siteReport = (key: string): PartSite => {
  const site = siteOf(key);
  return { key, component: componentOf(key), file: fileOf(key), line: site?.line ?? 0, literals: site?.literals ?? {}, dynamic: site?.dynamic ?? [] };
};

const reportOf = (hits: Hit[]): PickReport | null => {
  const first = hits[0];
  if (!first) return null;
  const rect = unite(first.nodes) ?? { x: 0, y: 0, width: 0, height: 0 };
  const count = document.querySelectorAll(`[${MARK}="${CSS.escape(first.key)}"]`).length;
  return {
    ...siteReport(first.key),
    count: Math.max(count, 1),
    rect,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    chain: hits.slice(1).map((hit) => siteReport(hit.key)),
  };
};

const isOverlay = (target: EventTarget | null) => target instanceof Node && lines !== null && (lines.hover.contains(target) || lines.picked.contains(target));

const onMove = (event: PointerEvent) => {
  if (!lines || !(event.target instanceof Node) || isOverlay(event.target)) return;
  const hit = hitsAt(event.target)[0];
  const box = hit ? unite(hit.nodes) : null;
  if (!hit || !box) {
    hide(lines.hover);
    return;
  }
  place(lines.hover, box);
  nameAt(lines.name, componentOf(hit.key), box);
};

const swallow = (event: Event) => {
  if (isOverlay(event.target)) return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
};

const onClick = (event: MouseEvent) => {
  swallow(event);
  if (!(event.target instanceof Node) || isOverlay(event.target)) return;
  const hits = hitsAt(event.target);
  const report = reportOf(hits);
  if (!report) return;
  lastChain = hits;
  outline(report.key, hits[0] ? hits[0].nodes : []);
  send({ kind: "pick", pick: report });
};

const onKey = (event: KeyboardEvent) => {
  if (event.key === "Escape") send({ kind: "escape" });
};

const SWALLOWED = ["pointerdown", "pointerup", "mousedown", "mouseup", "touchstart", "dblclick", "auxclick", "contextmenu"] as const;

let on = false;

export const setPicking = (next: boolean): void => {
  if (!embedded || next === on) return;
  on = next;
  const own = ensure();
  if (next) {
    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey, true);
    for (const type of SWALLOWED) document.addEventListener(type, swallow, true);
    document.documentElement.classList.add(s.crosshair);
  } else {
    document.removeEventListener("pointermove", onMove, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKey, true);
    for (const type of SWALLOWED) document.removeEventListener(type, swallow, true);
    document.documentElement.classList.remove(s.crosshair);
    hide(own.hover);
  }
};

// The studio picked a part from its list (a parent of the one clicked, or one it remembers): draw its line.
export const setSelected = (key: string | null): void => {
  if (!embedded) return;
  if (key === null) {
    outline(null, []);
    return;
  }
  if (key === pickedKey) return;
  const fromChain = lastChain.find((hit) => hit.key === key);
  outline(key, fromChain?.nodes ?? Array.from(document.querySelectorAll(`[${MARK}="${CSS.escape(key)}"]`)));
};
