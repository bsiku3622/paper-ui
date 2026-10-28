import { useState } from "react";

import { Button, Draggable, Inline, Stack, Text, type DraggableProps, type DraggableState, type MoveDragOptions } from "@studio-baeks/paper-ui";

import { glyph } from "../demo";
import { named } from "../jsx";
import { boolControl, defineSpec, enumControl, flag, local, pick } from "../schema";
import { handle, moving, stage } from "./examples.css";

const BODY = `({ position }) => (
  <Stack gap="sm">
    <Inline gap="sm">
      <Draggable.Handle aria-label="패널 이동">{grip}</Draggable.Handle>
      <Text>이동할 박스</Text>
    </Inline>
    <Text variant="caption">손잡이를 끌거나 방향키로 이동합니다. Escape는 이동을 취소합니다.</Text>
    <Text as="output" variant="caption" family="mono">x: {Math.round(position.x)}, y: {Math.round(position.y)}</Text>
    <Button size="sm" variant="hairline" onClick={bump}>내부 버튼: {count}</Button>
  </Stack>
)`;

export default defineSpec({
  name: "Draggable",
  blurb: "move 모드의 자유 이동과 transfer 모드의 데이터 전달을 구분합니다. Handle은 입력 대상이고 전체 박스가 drag 대상입니다.",
  preview: "flush",
  controls: [
    boolControl<DraggableProps, "disabled">("disabled"),
    enumControl<DraggableProps, "activation">("activation", local<DraggableProps, "activation">()(["handle", "surface"], "Draggable's own two ways to start a drag"), { initial: "handle" }),
    enumControl<MoveDragOptions, "axis">("axis", local<MoveDragOptions, "axis">()(["both", "x", "y"], "the axes a move drag can be limited to"), { behaviorOnly: "the axis limits the pointer path, which a static render does not show" }),
  ],
  defaults: { disabled: false, activation: "surface", axis: "both" },
  useHarness: () => {
    const [count, setCount] = useState(0);
    return { count, bump: () => setCount((value) => value + 1) };
  },
  subject: (state, { count, bump }) => (
    <Draggable
      className={moving}
      aria-label="이동 패널"
      data-testid="moving-panel"
      disabled={flag(state, "disabled")}
      activation={pick<NonNullable<DraggableProps["activation"]>>(state, "activation")}
      axis={pick<NonNullable<MoveDragOptions["axis"]>>(state, "axis")}
    >
      {named(BODY, ({ position }: DraggableState) => (
        <Stack gap="sm">
          <Inline gap="sm">
            <Draggable.Handle className={handle} aria-label="패널 이동">{glyph.grip}</Draggable.Handle>
            <Text>이동할 박스</Text>
          </Inline>
          <Text variant="caption">손잡이를 끌거나 방향키로 이동합니다. Escape는 이동을 취소합니다.</Text>
          <Text as="output" variant="caption" family="mono" data-testid="position">x: {Math.round(position.x)}, y: {Math.round(position.y)}</Text>
          <Button size="sm" variant="hairline" onClick={bump}>내부 버튼: {count}</Button>
        </Stack>
      ))}
    </Draggable>
  ),
  Stage: ({ subject }) => <div className={stage}>{subject}</div>,
});
