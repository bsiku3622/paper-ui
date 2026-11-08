// The manual fallback: four handles on the photo, with a magnifier while one moves, because a finger hides exactly the spot
// it is placing. Paper has no drag-to-position handle and no magnifier; the handles are buttons placed by percentage over the
// kit's picture.

import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";

import { Surface } from "@studio-baeks/paper-ui";
import { tokens } from "@studio-baeks/paper-ui/tokens";

import { clampPt, inDrawing, latticePath, quadIsValid } from "../model/geometry";
import type { Photo, Pt, Quad, Win } from "../model/types";
import { capped, cross as crossClass, editorFrame, handle, knob, knobBase, loupe } from "./content.css";
import { Lines, SourcePhoto } from "./Photo";

const NAMES = ["왼쪽 위", "오른쪽 위", "오른쪽 아래", "왼쪽 아래"];
// The magnifier shows this share of the photo's width.
const LOUPE_SHARE = 0.08;

const Loupe = ({ photo, at, right }: { photo: Photo; at: Pt; right: boolean }) => {
  const [cx, cy] = inDrawing(photo.win, at);
  const half = ((photo.win[2] - photo.win[0]) * LOUPE_SHARE) / 2;
  const win: Win = [cx - half, cy - half, cx + half, cy + half];
  const cross = { fill: "none", stroke: tokens.color.interaction.focus, vectorEffect: "non-scaling-stroke" as const };
  return (
    <Surface aria-hidden="true" border radius="md" width="md" className={right ? loupe.end : loupe.start}>
      <SourcePhoto photo={photo} win={win} aspect={1}>
        <svg viewBox="0 0 1 1" preserveAspectRatio="none" className={crossClass}>
          <path d="M0.5 0V1M0 0.5H1" {...cross} />
        </svg>
      </SourcePhoto>
    </Surface>
  );
};

const Handle = ({ at, name, active, onDown, onMove, onUp, onKey }: { at: Pt; name: string; active: boolean; onDown: (event: PointerEvent<HTMLButtonElement>) => void; onMove: (event: PointerEvent<HTMLButtonElement>) => void; onUp: () => void; onKey: (event: KeyboardEvent<HTMLButtonElement>) => void }) => (
  <button
    type="button"
    aria-label={`${name} 모서리. 방향키로 옮길 수 있습니다.`}
    onPointerDown={onDown}
    onPointerMove={onMove}
    onPointerUp={onUp}
    onPointerCancel={onUp}
    onKeyDown={onKey}
    className={handle}
    data-active={active}
    style={{ "--gp-x": at.x, "--gp-y": at.y } as CSSProperties}
  >
    <span className={`${knobBase} ${active ? knob.active : knob.rest}`} />
  </button>
);

export const CornerEditor = ({ photo, quad, cols, rows, onQuad }: { photo: Photo; quad: Quad; cols: number; rows: number; onQuad: (quad: Quad) => void }) => {
  const frame = useRef<HTMLDivElement>(null);
  const grab = useRef({ dx: 0, dy: 0 });
  const [active, setActive] = useState<number | null>(null);
  const path = useMemo(() => (quadIsValid(quad) ? latticePath(quad, cols, rows) : ""), [quad, cols, rows]);

  const move = (index: number, x: number, y: number) => onQuad(quad.map((corner, i) => (i === index ? clampPt({ x, y }) : corner)) as Quad);

  const down = (index: number) => (event: PointerEvent<HTMLButtonElement>) => {
    const box = frame.current?.getBoundingClientRect();
    if (!box) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    // Keep the offset from where the handle was grabbed, so it does not jump under the finger.
    grab.current = { dx: quad[index]!.x - (event.clientX - box.left) / box.width, dy: quad[index]!.y - (event.clientY - box.top) / box.height };
    setActive(index);
  };

  const drag = (index: number) => (event: PointerEvent<HTMLButtonElement>) => {
    if (active !== index) return;
    const box = frame.current?.getBoundingClientRect();
    if (!box) return;
    move(index, (event.clientX - box.left) / box.width + grab.current.dx, (event.clientY - box.top) / box.height + grab.current.dy);
  };

  const key = (index: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 10 : 1;
    const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
    const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
    if (dx === 0 && dy === 0) return;
    event.preventDefault();
    move(index, quad[index]!.x + dx / photo.width, quad[index]!.y + dy / photo.height);
  };

  return (
    <div ref={frame} className={`${editorFrame} ${capped}`} style={{ "--gp-aspect": photo.ratio } as CSSProperties}>
      <SourcePhoto photo={photo} label="네 모서리를 맞출 사진" />
      <Lines paths={[{ d: path, strong: cols === 1 && rows === 1 }]} />
      {quad.map((corner, index) => (
        <Handle key={index} at={corner} name={NAMES[index]!} active={active === index} onDown={down(index)} onMove={drag(index)} onUp={() => setActive(null)} onKey={key(index)} />
      ))}
      {/* Stay out from under the finger: the magnifier takes the side away from the handle. */}
      {active !== null ? <Loupe photo={photo} at={quad[active]!} right={quad[active]!.x < 0.5} /> : null}
    </div>
  );
};
