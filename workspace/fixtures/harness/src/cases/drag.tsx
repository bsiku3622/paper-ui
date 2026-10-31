import { useState, type ReactNode } from "react";

import { Draggable } from "@studio-baeks/paper-ui";

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
    <Panel id="live"><Draggable.Handle aria-label="live" data-testid="live" style={SIZE} /></Panel>
    <Panel id="off-button"><Draggable.Handle aria-label="off button" data-testid="off-button" style={SIZE} disabled /></Panel>
    <Panel id="off-div"><Draggable.Handle as="div" aria-label="off div" data-testid="off-div" style={SIZE} disabled /></Panel>
  </>
);
