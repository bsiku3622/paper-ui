import { useState } from "react";

import { Button, Draggable, Inline, Stack, Text, type DraggableProps, type DraggableState, type MoveDragOptions } from "@studio-baeks/paper-ui";

import { glyph } from "../demo";
import { named } from "../jsx";
import { boolControl, defineSpec, enumControl, flag, local, pick, subset } from "../schema";
import { handle, moving, stage } from "./examples.css";
import { pick as inLocale } from "../../../site/locale";

const WORDS = {
  ko: { move: "패널 이동", box: "이동할 박스", note: "손잡이를 끌거나 방향키로 이동합니다. Escape는 이동을 취소합니다.", inner: "내부 버튼: ", panel: "이동 패널" },
  en: { move: "Move panel", box: "Box to move", note: "Drag the handle or use the arrow keys to move. Escape cancels the move.", inner: "Inner button: ", panel: "Movable panel" },
};

const bodyCode = (w: (typeof WORDS)["ko"]) => `({ position }) => (
  <Stack gap="sm">
    <Inline gap="sm">
      <Draggable.Handle aria-label="${w.move}">{grip}</Draggable.Handle>
      <Text>${w.box}</Text>
    </Inline>
    <Text variant="caption">${w.note}</Text>
    <Text as="output" variant="caption" family="mono">x: {Math.round(position.x)}, y: {Math.round(position.y)}</Text>
    <Button size="sm" variant="hairline" onClick={bump}>${w.inner}{count}</Button>
  </Stack>
)`;

export default defineSpec({
  name: "Draggable",
  blurb: { ko: "move 모드의 자유 이동과 transfer 모드의 데이터 전달을 구분합니다. Handle은 입력 대상이고 전체 박스가 drag 대상입니다.", en: "Tells free movement in move mode from data transfer in transfer mode. The Handle is the input target and the whole box is the drag target." },
  preview: "flush",
  controls: [
    boolControl<DraggableProps, "disabled">("disabled"),
    enumControl<DraggableProps, "activation">("activation", local<DraggableProps, "activation">()(["handle", "surface"], "Draggable's own two ways to start a drag"), { initial: "handle" }),
    enumControl<MoveDragOptions, "axis">("axis", local<MoveDragOptions, "axis">()(["both", "x", "y"], "the axes a move drag can be limited to"), { behaviorOnly: "the axis limits the pointer path, which a static render does not show" }),
    enumControl<MoveDragOptions, "keyboardStep">("keyboardStep", subset("SPACES", ["xs", "sm", "md", "lg"], "xl and above are page distances, too far for one arrow press"), { behaviorOnly: "the step is how far an arrow key moves the box, which a static render does not show" }),
  ],
  defaults: { disabled: false, activation: "surface", axis: "both", keyboardStep: "sm" },
  useHarness: () => {
    const [count, setCount] = useState(0);
    return { count, bump: () => setCount((value) => value + 1) };
  },
  subject: (state, { count, bump }, locale) => {
    const w = inLocale(WORDS, locale);
    return (
    <Draggable
      className={moving}
      aria-label={w.panel}
      data-testid="moving-panel"
      disabled={flag(state, "disabled")}
      activation={pick<NonNullable<DraggableProps["activation"]>>(state, "activation")}
      axis={pick<NonNullable<MoveDragOptions["axis"]>>(state, "axis")}
      keyboardStep={pick<NonNullable<MoveDragOptions["keyboardStep"]>>(state, "keyboardStep")}
    >
      {named(bodyCode(w), ({ position }: DraggableState) => (
        <Stack gap="sm">
          <Inline gap="sm">
            <Draggable.Handle className={handle} aria-label={w.move}>{glyph.grip}</Draggable.Handle>
            <Text>{w.box}</Text>
          </Inline>
          <Text variant="caption">{w.note}</Text>
          <Text as="output" variant="caption" family="mono" data-testid="position">x: {Math.round(position.x)}, y: {Math.round(position.y)}</Text>
          <Button size="sm" variant="hairline" onClick={bump}>{w.inner}{count}</Button>
        </Stack>
      ))}
    </Draggable>
    );
  },
  Stage: ({ subject }) => <div className={stage}>{subject}</div>,
});
