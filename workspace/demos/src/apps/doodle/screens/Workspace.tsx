import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Badge, Button, Grid, Inline, Text } from "@studio-baeks/paper-ui";

import { Glyph, useStored } from "../../../kit";
import { Placed, SHEET, Stage, type StageHandle } from "../content/Stage";
import { makeSeed } from "../data/seed";
import type { BlockKind, Camera, Data, Doc, Sync, Tool } from "../data/types";
import { useNarrow } from "../lib/useMedia";
import { Ask, type Question } from "../parts/Ask";
import { useButtonFace } from "../parts/face";
import { AddTile } from "./AddTile";
import { BlockCard } from "./BlockCard";
import { DocSheet } from "./DocSheet";
import { Header } from "./Header";
import { MenuCard } from "./MenuCard";
import { ToolRail } from "./ToolRail";
import { TodayPanel } from "./TodayPanel";
import { ZoomBar } from "./ZoomBar";

const STORAGE = "doodle:workspace";

const HOME_TOP = 85;
const PANEL_SPACE = 310;
const SHEET_MIDDLE = SHEET.width / 2;

const HINTS: Record<Tool, string> = {
  select: "드래그하여 이동 · ⌘/Ctrl + 스크롤로 확대",
  hand: "드래그하여 이동 · ⌘/Ctrl + 스크롤로 확대",
  text: "캔버스를 눌러 추가하세요",
  image: "캔버스를 눌러 추가하세요",
  video: "캔버스를 눌러 추가하세요",
  pen: "캔버스에 그려보세요",
};

const isData = (value: unknown): value is Data => {
  const data = value as Partial<Data> | null;
  return Boolean(data && Array.isArray(data.docs) && Array.isArray(data.blocks) && Array.isArray(data.strokes) && Array.isArray(data.todos) && Array.isArray(data.routines) && Array.isArray(data.events));
};

const uid = () => crypto.randomUUID();

type Asked = Question & { run: (text: string) => void };

export const Workspace = () => {
  const narrow = useNarrow();
  const buttonFace = useButtonFace();
  const stage = useRef<StageHandle>(null);

  const [stored, setStored] = useStored<Data>(STORAGE, makeSeed);
  const data = useMemo(() => (isData(stored) ? stored : makeSeed()), [stored]);
  const change = useCallback((update: (previous: Data) => Data) => setStored((previous) => update(isData(previous) ? previous : makeSeed())), [setStored]);

  const [tool, setTool] = useState<Tool>("select");
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [asked, setAsked] = useState<Asked | null>(null);

  const [online, setOnline] = useState(() => navigator.onLine);
  const [saving, setSaving] = useState(false);
  const seen = useRef(data);
  useEffect(() => {
    if (seen.current === data) return;
    seen.current = data;
    setSaving(true);
    const timer = window.setTimeout(() => setSaving(false), 650);
    return () => window.clearTimeout(timer);
  }, [data]);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  const sync: Sync = !online ? "offline" : saving ? "saving" : "connected";

  const [camera, setCamera] = useState<Camera>({ x: 0, y: HOME_TOP, zoom: 1 });
  const home = useCallback(() => {
    const view = stage.current?.size();
    if (view) setCamera({ x: Math.max(108, (view.width - 320) / 2 - 300), y: HOME_TOP, zoom: 1 });
  }, []);
  useLayoutEffect(() => home(), [home]);

  const middle = useCallback(() => {
    const view = stage.current?.size();
    return view ? { x: (view.width - (panelOpen ? PANEL_SPACE : 0)) / 2, y: view.height / 2 } : undefined;
  }, [panelOpen]);
  const zoomBy = (step: number) => stage.current?.zoomTo(camera.zoom + step, middle());

  const changeDoc = useCallback((id: string, patch: Partial<Pick<Doc, "title" | "markdown">>) => change((previous) => ({ ...previous, docs: previous.docs.map((doc) => (doc.id === id ? { ...doc, ...patch } : doc)) })), [change]);
  const addDoc = useCallback((side: "left" | "right") => {
    const xs = data.docs.map((doc) => doc.x);
    const x = side === "left" ? Math.min(...xs) - SHEET.step : Math.max(...xs) + SHEET.step;
    const id = uid();
    change((previous) => ({ ...previous, docs: [...previous.docs, { id, x, title: "새 문서", markdown: "# 새 문서\n\n여기에 생각을 적어보세요." }] }));
    setEditing(id);
    const centre = middle();
    if (centre) setCamera((previous) => ({ ...previous, x: centre.x - (x + SHEET_MIDDLE) * previous.zoom, y: HOME_TOP - 2 }));
  }, [data.docs, change, middle]);

  const addBlock = (kind: BlockKind, x: number, y: number, content: string) => {
    const id = uid();
    change((previous) => ({ ...previous, blocks: [...previous.blocks, { id, kind, x, y, content }] }));
    setSelected(id);
    setTool("select");
  };
  const changeBlock = useCallback((id: string, content: string) => change((previous) => ({ ...previous, blocks: previous.blocks.map((block) => (block.id === id ? { ...block, content } : block)) })), [change]);
  const moveBlock = (id: string, x: number, y: number) => change((previous) => ({ ...previous, blocks: previous.blocks.map((block) => (block.id === id ? { ...block, x, y } : block)) }));
  const deleteBlock = useCallback((id: string) => {
    change((previous) => ({ ...previous, blocks: previous.blocks.filter((block) => block.id !== id) }));
    setSelected(null);
  }, [change]);

  const place = (x: number, y: number) => {
    if (tool === "text") {
      addBlock("text", x, y, "새로운 메모");
    } else if (tool === "image" || tool === "video") {
      const kind: BlockKind = tool;
      setAsked({ title: kind === "image" ? "이미지 URL을 입력하세요" : "동영상 URL을 입력하세요", placeholder: "https://", run: (text) => addBlock(kind, x, y, text) });
    }
  };

  const addStroke = (points: { x: number; y: number }[]) => change((previous) => ({ ...previous, strokes: [...previous.strokes, { id: uid(), points }] }));
  const toggleTask = (which: "todos" | "routines", id: string) => change((previous) => ({ ...previous, [which]: previous[which].map((task) => (task.id === id ? { ...task, done: !task.done } : task)) }));
  const addTask = (which: "todos" | "routines", text: string) => change((previous) => ({ ...previous, [which]: [...previous[which], { id: uid(), text, done: false }] }));
  const addEvent = (date: string) => setAsked({ title: `${date}에 추가할 일정`, run: (title) => change((previous) => ({ ...previous, events: [...previous.events, { id: uid(), date, title }] })) });

  const xs = data.docs.map((doc) => doc.x);
  const left = Math.min(...xs);
  const right = Math.max(...xs);

  const panel = panelOpen ? (
    <TodayPanel todos={data.todos} routines={data.routines} events={data.events} onToggle={toggleTask} onAddTask={addTask} onAddEvent={addEvent} onClose={() => setPanelOpen(false)} />
  ) : narrow ? undefined : (
    <Inline justify="end">
      <Button size="sm" {...buttonFace} onClick={() => setPanelOpen(true)}><Glyph name="arrow-left" />일정 열기</Button>
    </Inline>
  );

  return (
    <Grid rows="auto minmax(0, 1fr)" height="viewport">
      <Header sync={sync} narrow={narrow} panelOpen={panelOpen} onPanel={() => setPanelOpen((now) => !now)} />
      <Stage
        ref={stage}
        label="캔버스"
        camera={camera}
        onCamera={setCamera}
        tool={tool}
        strokes={data.strokes}
        onStroke={addStroke}
        onPlace={place}
        onBackground={() => setSelected(null)}
        rail={<ToolRail tool={tool} onTool={setTool} />}
        hint={
          <Inline gap="sm">
            <Badge dot variant="ghost" accent="primary" size="xs" aria-hidden />
            <Text as="span" variant="label" strong={false} ink="tertiary">{HINTS[tool]}</Text>
          </Inline>
        }
        menu={<MenuCard onHome={home} />}
        zoom={<ZoomBar zoom={camera.zoom} onOut={() => zoomBy(-0.1)} onIn={() => zoomBy(0.1)} />}
        panel={panel}
      >
        {data.docs.map((doc) => (
          <Placed key={doc.id} kind="sheet" x={doc.x} y={0} width={SHEET.width} minHeight={SHEET.height} onSelect={() => setSelected(null)}>
            <DocSheet doc={doc} editing={editing === doc.id} onEdit={setEditing} onChange={changeDoc} onAdd={addDoc} />
          </Placed>
        ))}
        <Placed kind="tool" x={left - 82} y={310} width={58}><AddTile side="left" onAdd={() => addDoc("left")} /></Placed>
        <Placed kind="tool" x={right + 635} y={310} width={58}><AddTile side="right" onAdd={() => addDoc("right")} /></Placed>
        {data.blocks.map((block) => (
          <Placed key={block.id} kind="block" x={block.x} y={block.y} width={210} movable selected={selected === block.id} onSelect={() => setSelected(block.id)} onMoved={(x, y) => moveBlock(block.id, x, y)}>
            <BlockCard block={block} selected={selected === block.id} onChange={changeBlock} onDelete={deleteBlock} />
          </Placed>
        ))}
      </Stage>
      <Ask question={asked} onClose={() => setAsked(null)} onAnswer={(text) => { asked?.run(text); setAsked(null); }} />
    </Grid>
  );
};
