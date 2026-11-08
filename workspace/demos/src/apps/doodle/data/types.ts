// What the workspace holds. The shapes are the prototype's own (src/App.tsx): documents laid in a row, boxes put anywhere,
// pen strokes, to-dos and routines for the day, and dated events for the calendar.

export type Tool = "select" | "hand" | "text" | "image" | "video" | "pen";

export type Point = { x: number; y: number };

export type Doc = { id: string; title: string; markdown: string; x: number };

export type BlockKind = "text" | "image" | "video";
export type Block = { id: string; kind: BlockKind; x: number; y: number; content: string };

export type Stroke = { id: string; points: Point[] };

export type Task = { id: string; text: string; done: boolean };

export type CalendarEvent = { id: string; date: string; title: string };

export type Data = {
  docs: Doc[];
  blocks: Block[];
  strokes: Stroke[];
  todos: Task[];
  routines: Task[];
  events: CalendarEvent[];
};

export type Camera = { x: number; y: number; zoom: number };

export type Sync = "connected" | "saving" | "offline";
