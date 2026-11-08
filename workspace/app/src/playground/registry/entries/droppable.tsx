import { useState } from "react";

import { Draggable, Droppable, Inline, Stack, Text, type DragItem, type DroppableProps } from "@studio-baeks/paper-ui";

import { glyph } from "../demo";
import { named } from "../jsx";
import { boolControl, defineSpec, flag } from "../schema";
import { dropTarget, handle, transfer } from "./examples.css";
import { pick as inLocale, useWords } from "../../../site/locale";

const WORDS = {
  ko: { source: "전달할 항목", handle: "항목 전달", target: "항목 받기", over: "여기에 놓으세요", received: "받음: ", area: "항목을 받는 영역", note: "손잡이에서 Enter로 시작하고 Tab으로 대상에 이동한 뒤 Enter로 놓습니다." },
  en: { source: "Item to hand over", handle: "Hand over item", target: "Receive item", over: "Drop it here", received: "Received: ", area: "Area that receives an item", note: "Start with Enter on the handle, Tab to the target, then drop with Enter." },
};

export default defineSpec({
  name: "Droppable",
  blurb: { ko: "transfer drag 데이터를 받는 대상입니다. 수용 가능한 데이터 형식과 copy·move 작업을 결정하고 native 또는 키보드 drop을 처리합니다.", en: "The target that receives transfer drag data. It decides the accepted data types and the copy or move operation, and handles native or keyboard drops." },
  controls: [boolControl<DroppableProps, "disabled">("disabled", false, { target: "Droppable" })],
  defaults: { disabled: false },
  useHarness: () => {
    const [received, setReceived] = useState("");
    return { received, setReceived };
  },
  subject: (state, { received, setReceived }, locale) => {
    const w = inLocale(WORDS, locale);
    return (
    <>
      <Draggable
        mode="transfer"
        activation="handle"
        className={transfer}
        aria-label={w.source}
        getItems={named('() => [{ "text/plain": "Paper item" }]', (): DragItem[] => [{ "text/plain": "Paper item" }])}
      >
        <Inline gap="sm">
          <Draggable.Handle className={handle} aria-label={w.handle}>{glyph.grip}</Draggable.Handle>
          <Text>Paper item</Text>
        </Inline>
      </Draggable>
      <Droppable
        aria-label={w.target}
        className={dropTarget}
        disabled={flag(state, "disabled")}
        getDropOperation={named<NonNullable<DroppableProps["getDropOperation"]>>('(types, allowed) => (types.has("text/plain") && allowed.includes("copy") ? "copy" : "cancel")', (types, allowed) => (types.has("text/plain") && allowed.includes("copy") ? "copy" : "cancel"))}
        onDrop={named<NonNullable<DroppableProps["onDrop"]>>("handleDrop", async (event) => {
          const values = await Promise.all(event.items.map((item) => (item.kind === "text" && item.types.has("text/plain") ? item.getText("text/plain") : "")));
          setReceived(values.filter(Boolean).join(", "));
        })}
      >
        {named(`({ isDropTarget }) => (isDropTarget ? "${w.over}" : received ? \`${w.received}\${received}\` : "${w.area}")`, ({ isDropTarget }: { isDropTarget: boolean }) => (
          <Text>{isDropTarget ? w.over : received ? `${w.received}${received}` : w.area}</Text>
        ))}
      </Droppable>
    </>
    );
  },
  Stage: ({ subject }) => {
    const w = useWords(WORDS);
    return (
    <Stack gap="lg" width="full">
      {subject}
      <Text variant="caption">{w.note}</Text>
    </Stack>
    );
  },
});
