// Reorder — 목록의 한 줄을 끌어서 다른 줄 자리로 옮기게 하는 틀. Paper의 Draggable(손잡이로만 끌림)과 Droppable을 씁니다.
// 손잡이는 키보드로도 쓸 수 있습니다(Enter로 집고, Tab으로 자리를 옮기고, Enter로 놓습니다). 끄는 도구가 없는 사람을 위해
// 줄마다 위·아래 단추나 메뉴가 따로 있습니다.

import type { ReactNode } from "react";

import { Draggable, Droppable, Grid, Surface } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";

type Props = {
  // 같은 목록 안에서만 놓입니다. 목록마다 다른 이름을 줍니다.
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
