import { useState } from "react";

import { Draggable, Droppable, Inline, Stack, Text, type DragItem, type DroppableProps } from "@studio-baeks/paper-ui";

import { glyph } from "../demo";
import { named } from "../jsx";
import { boolControl, defineSpec, flag } from "../schema";
import { dropTarget, handle, transfer } from "./examples.css";

export default defineSpec({
  name: "Droppable",
  blurb: "transfer drag 데이터를 받는 대상입니다. 수용 가능한 데이터 형식과 copy·move 작업을 결정하고 native 또는 키보드 drop을 처리합니다.",
  controls: [boolControl<DroppableProps, "disabled">("disabled", false, { target: "Droppable" })],
  defaults: { disabled: false },
  useHarness: () => {
    const [received, setReceived] = useState("");
    return { received, setReceived };
  },
  subject: (state, { received, setReceived }) => (
    <>
      <Draggable
        mode="transfer"
        activation="handle"
        className={transfer}
        aria-label="전달할 항목"
        getItems={named('() => [{ "text/plain": "Paper item" }]', (): DragItem[] => [{ "text/plain": "Paper item" }])}
      >
        <Inline gap="sm">
          <Draggable.Handle className={handle} aria-label="항목 전달">{glyph.grip}</Draggable.Handle>
          <Text>Paper item</Text>
        </Inline>
      </Draggable>
      <Droppable
        aria-label="항목 받기"
        className={dropTarget}
        disabled={flag(state, "disabled")}
        getDropOperation={named<NonNullable<DroppableProps["getDropOperation"]>>('(types, allowed) => (types.has("text/plain") && allowed.includes("copy") ? "copy" : "cancel")', (types, allowed) => (types.has("text/plain") && allowed.includes("copy") ? "copy" : "cancel"))}
        onDrop={named<NonNullable<DroppableProps["onDrop"]>>("handleDrop", async (event) => {
          const values = await Promise.all(event.items.map((item) => (item.kind === "text" && item.types.has("text/plain") ? item.getText("text/plain") : "")));
          setReceived(values.filter(Boolean).join(", "));
        })}
      >
        {named('({ isDropTarget }) => (isDropTarget ? "여기에 놓으세요" : received ? `받음: ${received}` : "항목을 받는 영역")', ({ isDropTarget }: { isDropTarget: boolean }) => (
          <Text>{isDropTarget ? "여기에 놓으세요" : received ? `받음: ${received}` : "항목을 받는 영역"}</Text>
        ))}
      </Droppable>
    </>
  ),
  Stage: ({ subject }) => (
    <Stack gap="lg" width="full">
      {subject}
      <Text variant="caption">손잡이에서 Enter로 시작하고 Tab으로 대상에 이동한 뒤 Enter로 놓습니다.</Text>
    </Stack>
  ),
});
