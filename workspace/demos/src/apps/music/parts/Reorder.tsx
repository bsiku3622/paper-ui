import type { ReactNode } from "react";

import { Draggable, Droppable, Grid, Surface } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";

type Props = {
  list: string;
  index: number;
  label: string;
  onMove: (from: number, to: number) => void;
  children: ReactNode;
};

export const Reorder = ({ list, index, label, onMove, children }: Props) => {
  const type = `application/x-music-${list}`;
  return (
    <Droppable
      getDropOperation={(types) => (types.has(type) ? "move" : "cancel")}
      onDrop={async ({ items }) => {
        const item = items.find((entry) => entry.kind === "text");
        if (item?.kind !== "text") return;
        const from = Number(await item.getText(type));
        if (Number.isInteger(from) && from !== index) onMove(from, index);
      }}
    >
      {({ isDropTarget }) => (
        <Surface radius="md" hoverable selected={isDropTarget}>
          <Draggable mode="transfer" activation="handle" getItems={() => [{ [type]: String(index) }]}>
            <Grid columns="auto minmax(0, 1fr)" gap="xs" align="center">
              <Draggable.Handle aria-label={`${label} 순서 바꾸기`}><Glyph name="grip-vertical" ink="tertiary" /></Draggable.Handle>
              {children}
            </Grid>
          </Draggable>
        </Surface>
      )}
    </Droppable>
  );
};
