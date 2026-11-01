import { useState, type ReactNode } from "react";

import { Draggable, Droppable } from "@studio-baeks/paper-ui";

const Panel = ({ id, children }: { id: string; children: ReactNode }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [starts, setStarts] = useState(0);
  return (
    <Draggable activation="handle" position={position} onPositionChange={setPosition} onDragStart={() => setStarts((count) => count + 1)}
      data-testid={`${id}-panel`} data-x={position.x} data-starts={starts}>
      {children}
    </Draggable>
  );
};

const SIZE = { display: "block", width: 40, height: 40 };

// Panels that move by their handle, showing where they are and how many drags began: one live handle, then a handle
// switched off by itself, as the native button and as a tag that cannot be disabled natively.
export const DragCase = () => (
  <>
    <TransferCase />
    <Panel id="live"><Draggable.Handle aria-label="live" data-testid="live" style={SIZE} /></Panel>
    <Panel id="off-button"><Draggable.Handle aria-label="off button" data-testid="off-button" style={SIZE} disabled /></Panel>
    <Panel id="off-div"><Draggable.Handle as="div" aria-label="off div" data-testid="off-div" style={SIZE} disabled /></Panel>
  </>
);

const TARGET = { display: "block", width: 80, height: 40, margin: 8 };

// One text item to drop on three targets: one that copies it, one whose getDropOperation cancels it, and one that is
// switched off. Each counts the drops it took, in data-drops.
const Target = ({ id, operation, disabled }: { id: string; operation: "copy" | "cancel"; disabled?: boolean }) => {
  const [drops, setDrops] = useState(0);
  return (
    <Droppable aria-label={id} data-testid={id} data-drops={drops} style={TARGET} disabled={disabled} getDropOperation={() => operation} onDrop={() => setDrops((count) => count + 1)}>
      {id}
    </Droppable>
  );
};

const LIFECYCLE = { display: "block", width: 160, height: 40, margin: 8 };

// A target that writes its lifecycle down in data-events, keeps the last point it was told in data-point and what the drag
// allows in data-allowed, and lets the point decide: the left half copies, the right half cancels.
const LifecycleTarget = () => {
  const [events, setEvents] = useState<string[]>([]);
  const [point, setPoint] = useState("");
  const [allowed, setAllowed] = useState("");
  const note = ({ type, x, y }: { type: string; x: number; y: number }) => {
    setEvents((current) => [...current, type]);
    setPoint(`${x},${y}`);
  };
  return (
    <Droppable aria-label="lifecycle" data-testid="lifecycle" data-events={events.join(" ")} data-point={point} data-allowed={allowed} style={LIFECYCLE}
      getDropOperationForPoint={(_types, operations, x) => {
        setAllowed(operations.join(" "));
        return x < LIFECYCLE.width / 2 ? "copy" : "cancel";
      }}
      onDropEnter={note} onDropMove={note} onDropExit={note} onDropActivate={note} onDrop={note}>
      lifecycle
    </Droppable>
  );
};

// The item writes its own drag down in data-events, and says what a drop may do with it.
export const TransferCase = () => {
  const [events, setEvents] = useState<string[]>([]);
  const note = ({ type, dropOperation }: { type: string; dropOperation?: string }) => setEvents((current) => [...current, dropOperation ? `${type}:${dropOperation}` : type]);
  return (
    <>
      <Draggable mode="transfer" activation="handle" aria-label="item" data-testid="item" data-events={events.join(" ")} getItems={() => [{ "text/plain": "item" }]}
        getAllowedDropOperations={() => ["copy", "link"]} onDragStart={note} onDragMove={note} onDragEnd={note}>
        <Draggable.Handle aria-label="send" data-testid="send" style={SIZE} />
      </Draggable>
      <Target id="takes" operation="copy" />
      <Target id="refuses" operation="cancel" />
      <Target id="off" operation="copy" disabled />
      <LifecycleTarget />
    </>
  );
};
