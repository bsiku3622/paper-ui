# Drag

Drag Primitive는 끌어 옮기기와 놓기를 맡는 2차 primitive입니다. 색과 크기는 고르지 않고, 상태를 `data-*` 속성과 children 함수로 노출해 소비자가 스타일을 붙이게 합니다. 입력 정규화와 native drag and drop은 React Aria에 위임하고, Paper가 공개 API와 상태 연결을 소유합니다(옵션 · 이벤트 · 항목 타입은 모두 Paper가 선언합니다). transfer drag의 키보드 버튼은 [Press](press.md) 위에 섭니다.

| 컴포넌트 | Hook | 책임 | 기본값 |
| --- | --- | --- | --- |
| Draggable | useDraggable | mode, activation, disabled, move 또는 transfer 옵션 | move / surface. Handle은 별도 입력 대상 |
| Droppable | useDrop | 허용 작업과 onDrop lifecycle, disabled | keyboard 접근 가능한 div |

## Drag: move와 transfer

Draggable·useDraggable는 mode로 두 계약을 명시합니다.

| 모드 | 책임 | 필수 입력 |
| --- | --- | --- |
| move, 기본값 | x/y 좌표 이동 | 없음 |
| transfer | 데이터 drag and drop | getItems() |

[contract:primitives.draggable.input-paths]: #
두 모드는 disabled와 activation=surface/handle을 공유합니다. Activation 기본값은 surface입니다. handle을 선택하면 포인터와 키보드 입력 모두 손잡이에서만 시작합니다. 손잡이를 쓰는 panel 예시는 다음과 같습니다.

```tsx
<Draggable activation="handle" defaultPosition={{ x: 0, y: 0 }} aria-label="이동 패널">
  <Draggable.Handle aria-label="패널 이동">⠿</Draggable.Handle>
  <Text>박스 전체가 움직입니다.</Text>
  <Button>독립적인 내부 액션</Button>
</Draggable>
```

Draggable.Handle(`DraggableHandleProps`)은 부모 Draggable 내부에 있어야 하며 aria-label이 필수입니다. Input 대상은 Handle, 측정과 이동 대상은 전체 Draggable입니다. Surface 모드도 자식 button·input·textarea·select·link·contenteditable·data-drag-ignore에서 시작한 입력은 이동으로 처리하지 않습니다. 내부 입력의 방향키도 부모를 이동시키지 않습니다.

Move 모드는 position/defaultPosition/onPositionChange, axis=both/x/y, onDragStart/onDragMove/onDragEnd/onDragCancel을 받습니다. Event는 position·시작점 기준 delta·pointerType을 제공합니다. 컴포넌트는 CSS translate로 이동하고, hook 사용자는 position을 자신의 요소에 적용합니다. 방향키로 이동하고, 포인터 이동 중 Escape는 시작 좌표로 복귀하며 onDragCancel을 호출합니다. Disabled 전환도 진행 중인 move를 취소합니다.

자유 이동은 layout 안의 visual offset입니다. 재정렬, 충돌 처리, snap, 경계 제한, 위치 저장은 제공하지 않으며 필요한 상위 조합이 결정합니다.

Hook에서 이동 대상과 손잡이를 분리하는 예시입니다.

```tsx
const { dragProps, handleProps, position } = useDraggable({ activation: "handle" });

return (
  <div {...dragProps} style={{ translate: position.x + "px " + position.y + "px" }}>
    <button {...handleProps} type="button" aria-label="패널 이동">⠿</button>
    <PanelContents />
  </div>
);
```

useDraggable는 dragProps·handleProps·position·isDragging·cancel을 반환합니다. dragProps에는 이동 대상의 ref와 data-dragging · data-disabled가 들어 있고, handleProps에는 data-dragging · data-disabled가 들어 있습니다. 외부 ref·이벤트와 함께 쓰려면 `mergeProps`로 병합하고, 객체 spread로 한쪽을 덮어쓰지 않습니다. 컴포넌트는 내부 ref와 전달받은 ref를 함께 연결합니다.

## Transfer와 Drop

Transfer 모드의 getItems는 MIME type과 문자열 데이터의 record(`DragItem`) 배열을 반환합니다. getAllowedDropOperations로 move/copy/link 허용 작업(`DropOperation`)을 선택하고 onDragStart/onDragMove/onDragEnd로 lifecycle(`TransferDragEvent`)을 받습니다. Native drag preview는 전체 박스를 사용합니다. Handle만 등록해도 키보드와 스크린리더 경로를 함께 제공합니다.

Droppable·useDrop은 getDropOperation(types, allowedOperations), getDropOperationForPoint, onDropEnter/onDropMove/onDropExit/onDropActivate/onDrop, disabled를 받습니다. getDropOperation은 허용한 작업 또는 cancel을 반환합니다. useDrop은 ref 인자를 받지 않습니다. 결과는 dropProps(ref · data-drop-target · data-disabled · aria-disabled)와 isDropTarget이며, 이벤트는 `DropEvent` · `DropEnterEvent` 같은 Paper의 타입입니다.

텍스트 데이터를 전달하고 읽는 예시입니다.

```tsx
<Draggable mode="transfer" activation="handle"
  getItems={() => [{ "text/plain": "Paper item" }]}>
  <Draggable.Handle aria-label="항목 전달">⠿</Draggable.Handle>
  <Text>전달할 항목</Text>
</Draggable>

<Droppable aria-label="항목 받기"
  getDropOperation={(types, allowed) =>
    types.has("text/plain") && allowed.includes("copy") ? "copy" : "cancel"}
  onDrop={async ({ items }) => {
    for (const item of items) {
      if (item.kind === "text") console.log(await item.getText("text/plain"));
    }
  }}>
  항목을 받는 영역
</Droppable>
```

[contract:primitives.droppable.input-paths]: #
Drop item은 text/file/directory 형태를 지원하는 엔진의 데이터를 전달합니다. 허용 형식과 적용할 데이터 변경은 소비자가 결정합니다. Droppable의 children 함수는 isDropTarget을 받고 data-drop-target도 제공됩니다. 키보드 경로는 source에서 Enter로 시작하고, Tab으로 대상 사이를 이동하고, Enter로 놓거나 Escape로 취소합니다. Accessible label과 파일 선택·붙여넣기 같은 제품별 대체 UI는 소비자가 제공합니다.
