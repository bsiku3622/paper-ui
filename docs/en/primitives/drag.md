# Drag

The Drag Primitive is the second-order primitive that owns drag-to-move and dropping. It chooses neither colour nor size; it exposes state through `data-*` attributes and children functions so that the consumer attaches styles. Input normalization and native drag and drop are delegated to React Aria, and Paper owns the public API and the connection to state (options, events and item types are all declared by Paper). The keyboard button of a transfer drag (Draggable.Handle) is a native button, and its press is handled directly by the drag hook.

| Component | Hook | Responsibility | Default |
| --- | --- | --- | --- |
| Draggable | useDraggable | mode, activation, disabled, move or transfer options | move / surface. Handle is a separate input target |
| Droppable | useDroppable | allowed operations and the onDrop lifecycle, disabled | keyboard-accessible div |

## Drag: move and transfer

Draggable · useDraggable state two contracts through mode.

| Mode | Responsibility | Required input |
| --- | --- | --- |
| move, the default | Moves by x/y coordinates | none |
| transfer | Data drag and drop | getItems() |

The two modes share disabled and activation=surface/handle. The default of activation is surface. When handle is chosen, both pointer and keyboard input start only from the handle. An example of a panel that uses a handle is as follows.

```tsx
<Draggable activation="handle" defaultPosition={{ x: 0, y: 0 }} aria-label="Movable panel">
  <Draggable.Handle aria-label="Move panel">⠿</Draggable.Handle>
  <Text>The whole box moves.</Text>
  <Button>Independent inner action</Button>
</Draggable>
```

Draggable is a div by default, and `as` chooses another tag. The children function receives `{ position, isDragging, isDisabled }` (`DraggableState`). A disabled Draggable stops only dragging and its inner content keeps working; it gets `data-disabled` and the projection that fits the target (`aria-disabled` on a div, native `disabled` on a button), and shows a not-allowed cursor.

Draggable.Handle (`DraggableHandleProps`) must be inside a parent Draggable and requires aria-label. It is a native button by default and `as` can choose another target, `disabled` follows the projection of the [shared contract](README.md#shared-contract), and the Handle's own `disabled` turns off all pointer and key input of that Handle even while the Draggable is alive. The Handle handles keyboard dragging directly with React Aria's press, so it is not wrapped in `Pressable` (if a click follows the press, the drag is cancelled). The input target is the Handle, and the target of measuring and moving is the whole Draggable. In surface mode too, input that starts on a child button · input · textarea · select · link · contenteditable · data-drag-ignore is not treated as a move. Arrow keys in an inner input do not move the parent either.

Move mode accepts position/defaultPosition/onPositionChange, axis=both/x/y, keyboardStep, and onDragStart/onDragMove/onDragEnd/onDragCancel. The event provides position, delta from the start point and pointerType. The component moves with CSS translate, and a hook user applies position to their own element. Arrow keys move it, and Escape during a pointer move returns to the start coordinates and calls onDragCancel. A switch to disabled also cancels a move in progress.

One arrow key press moves by `keyboardStep`. `keyboardStep` is a gap step name (`xs` · `sm` · `md` · `lg` …), the default is `sm` (8), and it is converted to pixels by measuring at the Draggable element's position when the key is pressed, so if a subtree overrides the gap scale, the step follows. A pointer move is as far as the pointer went, regardless of the step.

Free movement is a visual offset inside the layout. Reordering, collision handling, snapping, boundary limits and saving position are not provided, and the higher-level composition that needs them decides.

An example that separates the move target and the handle in the hook.

```tsx
const { dragProps, handleProps, position } = useDraggable({ activation: "handle" });

return (
  <div {...dragProps} style={{ translate: position.x + "px " + position.y + "px" }}>
    <button {...handleProps} type="button" aria-label="Move panel">⠿</button>
    <PanelContents />
  </div>
);
```

useDraggable returns dragProps · handleProps · position · isDragging · cancel. dragProps contains the move target's ref and data-dragging · data-disabled · aria-disabled, and handleProps contains data-dragging · data-disabled. To use them with external refs and events, merge them with `mergeProps`, and do not overwrite one side with an object spread. Draggable and Droppable connect the internal ref and the ref they were given together.

## Transfer and Drop

The getItems of transfer mode returns an array of records of MIME type and string data (`DragItem`). getAllowedDropOperations chooses the allowed move/copy/link operations (`DropOperation`), and onDragStart/onDragMove/onDragEnd receive the lifecycle (`TransferDragEvent`). The native drag preview uses the whole box. Even if only the Handle is registered, a keyboard and screen-reader path is provided with it.

Droppable · useDroppable accept getDropOperation(types, allowedOperations), getDropOperationForPoint, onDropEnter/onDropMove/onDropExit/onDropActivate/onDrop, and disabled. getDropOperation returns an allowed operation or cancel. useDroppable takes no ref argument. The result is dropProps (ref · data-drop-target · data-disabled · aria-disabled) and isDropTarget, and the events are Paper's own types such as `DropEvent` · `DropEnterEvent`.

An example that passes and reads text data.

```tsx
<Draggable mode="transfer" activation="handle"
  getItems={() => [{ "text/plain": "Paper item" }]}>
  <Draggable.Handle aria-label="Transfer item">⠿</Draggable.Handle>
  <Text>Item to transfer</Text>
</Draggable>

<Droppable aria-label="Receive item"
  getDropOperation={(types, allowed) =>
    types.has("text/plain") && allowed.includes("copy") ? "copy" : "cancel"}
  onDrop={async ({ items }) => {
    for (const item of items) {
      if (item.kind === "text") console.log(await item.getText("text/plain"));
    }
  }}>
  Area that receives the item
</Droppable>
```

A drop item delivers data from an engine that supports the text/file/directory forms. The accepted formats and the data change to apply are decided by the consumer. Droppable is a div by default and `as` chooses another target. The children function receives `{ isDropTarget, isDisabled }` (`DroppableState`), and data-drop-target is provided too. A disabled Droppable stops only receiving drops and its inner content keeps working; it gets `data-disabled` and the projection that fits the target, and shows a not-allowed cursor. The keyboard path starts at the source with Enter, moves between targets with Tab, and drops with Enter or cancels with Escape. The accessible label and product-specific alternative UI such as file selection or pasting are provided by the consumer.
