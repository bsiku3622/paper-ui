import type { Course, Prereq } from "../data/catalog";

export const NODE_WIDTH = 150;
export const NODE_HEIGHT = 50;
const COLUMN_GAP = 58;
const ROW_GAP = 12;
const LANE_GAP = 34;
const LANE_HEAD = 18;

export type GraphNode = { name: string; course: Course; x: number; y: number; level: number };
export type GraphEdge = { before: string; after: string; alternative: boolean; path: string };
export type Graph = { nodes: GraphNode[]; edges: GraphEdge[]; width: number; height: number };
export type GraphLane = { department: string; y: number; height: number };
export type FullGraph = Graph & { lanes: GraphLane[] };

export type LayoutSize = { width: number; height: number; columnGap: number; rowGap: number; align: "top" | "center" };
export const DEFAULT_SIZE: LayoutSize = { width: NODE_WIDTH, height: NODE_HEIGHT, columnGap: COLUMN_GAP, rowGap: ROW_GAP, align: "top" };

const levelsOf = (names: ReadonlySet<string>, edges: readonly Prereq[]) => {
  const before = new Map<string, string[]>();
  for (const edge of edges) if (names.has(edge.before) && names.has(edge.after)) before.set(edge.after, [...(before.get(edge.after) ?? []), edge.before]);
  const level = new Map<string, number>();
  const visit = (name: string, path: Set<string>): number => {
    const known = level.get(name);
    if (known !== undefined) return known;
    if (path.has(name)) return 0;
    path.add(name);
    const depth = Math.max(-1, ...(before.get(name) ?? []).map((item) => visit(item, path))) + 1;
    path.delete(name);
    level.set(name, depth);
    return depth;
  };
  for (const name of names) visit(name, new Set());
  return level;
};

const curve = (fromX: number, fromY: number, toX: number, toY: number) => {
  const mid = (fromX + toX) / 2;
  return `M${fromX},${fromY} C${mid},${fromY} ${mid},${toY} ${toX},${toY}`;
};

export const layoutGraph = (courses: readonly Course[], prerequisites: readonly Prereq[], size: LayoutSize = DEFAULT_SIZE, offsetY = 0): Graph => {
  const names = new Set(courses.map((course) => course.name));
  const byName = new Map(courses.map((course) => [course.name, course]));
  const inside = prerequisites.filter((edge) => names.has(edge.before) && names.has(edge.after));
  const level = levelsOf(names, inside);
  const columns: string[][] = [];
  for (const course of courses) {
    const depth = level.get(course.name) ?? 0;
    (columns[depth] ||= []).push(course.name);
  }
  const placed = new Map<string, GraphNode>();
  const tallest = Math.max(1, ...columns.map((column) => column?.length ?? 0));
  const span = tallest * size.height + (tallest - 1) * size.rowGap;
  columns.forEach((column, depth) => {
    if (!column) return;
    const score = (name: string) => {
      const ys = inside.filter((edge) => edge.after === name).map((edge) => placed.get(edge.before)?.y).filter((y): y is number => y !== undefined);
      return ys.length ? ys.reduce((sum, y) => sum + y, 0) / ys.length : Number.MAX_SAFE_INTEGER;
    };
    const ordered = [...column].sort((a, b) => score(a) - score(b) || a.localeCompare(b, "ko"));
    const height = ordered.length * size.height + (ordered.length - 1) * size.rowGap;
    const top = size.align === "center" ? (span - height) / 2 : 0;
    ordered.forEach((name, row) => {
      placed.set(name, { name, course: byName.get(name)!, x: depth * (size.width + size.columnGap), y: offsetY + top + row * (size.height + size.rowGap), level: depth });
    });
  });
  const edges: GraphEdge[] = inside.flatMap((edge) => {
    const from = placed.get(edge.before);
    const to = placed.get(edge.after);
    return from && to ? [{ before: edge.before, after: edge.after, alternative: edge.alternative, path: curve(from.x + size.width, from.y + size.height / 2, to.x, to.y + size.height / 2) }] : [];
  });
  return { nodes: [...placed.values()], edges, width: columns.length * (size.width + size.columnGap) - size.columnGap, height: span };
};

export const layoutFullGraph = (courses: readonly Course[], prerequisites: readonly Prereq[], departments: readonly string[]): FullGraph => {
  const lanes: GraphLane[] = [];
  const nodes: GraphNode[] = [];
  let y = LANE_HEAD;
  let width = 0;
  for (const department of departments) {
    const scoped = courses.filter((course) => course.department === department);
    if (scoped.length === 0) continue;
    const graph = layoutGraph(scoped, prerequisites, DEFAULT_SIZE, y);
    lanes.push({ department, y, height: graph.height });
    nodes.push(...graph.nodes);
    width = Math.max(width, graph.width);
    y += graph.height + LANE_GAP + LANE_HEAD;
  }
  const byName = new Map(nodes.map((node) => [node.name, node]));
  const edges: GraphEdge[] = prerequisites.flatMap((edge) => {
    const from = byName.get(edge.before);
    const to = byName.get(edge.after);
    return from && to ? [{ before: edge.before, after: edge.after, alternative: edge.alternative, path: curve(from.x + NODE_WIDTH, from.y + NODE_HEIGHT / 2, to.x, to.y + NODE_HEIGHT / 2) }] : [];
  });
  return { nodes, edges, lanes, width, height: Math.max(0, y - LANE_GAP - LANE_HEAD) };
};

export const outsidePrereqs = (scoped: readonly Course[], prerequisites: readonly Prereq[]) => {
  const names = new Set(scoped.map((course) => course.name));
  const out = new Map<string, Prereq[]>();
  for (const edge of prerequisites) if (names.has(edge.after) && !names.has(edge.before)) out.set(edge.after, [...(out.get(edge.after) ?? []), edge]);
  return out;
};
export const prereqLine = (edges: readonly Prereq[]) => edges.map((edge) => edge.before).join(edges.some((edge) => edge.alternative) ? " 또는 " : ", ");
