# Interaction

Interaction Primitive는 누르기·올려두기·켜고 끄기·끌어 옮기기·선택 그룹·overlay처럼 입력에 반응하는 행동을 제공합니다. 색과 크기는 고르지 않고, 상태를 `data-*` 속성과 children 함수로 노출해 소비자가 스타일을 붙이게 합니다. 입력 정규화와 포커스·overlay·native drag and drop은 React Aria에 위임하고, Paper가 공개 API와 상태 연결을 소유합니다.

| 컴포넌트 | Hook | 책임 | 기본값 |
| --- | --- | --- | --- |
| Pressable | usePress | onPress lifecycle, disabled, native button props | native button, type=button. pressed/hovered/focus-visible 상태 |
| Hoverable | useHover | hover lifecycle, disabled, `as` | div, 별도 button 역할·tab stop 없음 |
| Toggleable | useToggle | selected/defaultSelected/onSelectedChange + Pressable | false, native aria-pressed 및 data-selected |
| Draggable | useDrag | mode, activation, disabled, move 또는 transfer 옵션 | move / surface. Handle은 별도 입력 대상 |
| Droppable | useDrop | 허용 작업과 onDrop lifecycle, disabled | keyboard 접근 가능한 div |
| ToggleGroup | useToggleGroup | selectionMode, selectedValues 계열, selectionRequired, disabled | single / 빈 선택. focus와 선택 분리 |
| Overlay | useOverlay | open/defaultOpen/onOpenChange, modal | non-modal. Trigger·Content·Close로 Portal·배치·닫기·focus 연결 |

## Press와 Hover

Pressable은 onPress·onPressStart·onPressEnd·onPressUp·onPressChange와 disabled를 받습니다. usePress는 같은 옵션과 선택적인 ref를 받아 pressProps·isPressed를 반환합니다. Press 이벤트는 마우스·터치·키보드·보조 기술의 입력을 공통 계약으로 전달합니다. Bare button은 Paper의 색·크기·variant를 선택하지 않습니다.

Pressable의 children 함수는 isPressed·isHovered·isFocused·isFocusVisible·isDisabled를 받습니다. 상태는 data-pressed·data-hovered·data-focused·data-focus-visible에도 반영합니다. 소비 앱은 data 속성에 연결된 class 스타일을 작성합니다.

Hoverable·useHover는 disabled·onHoverStart·onHoverEnd·onHoverChange를 받습니다. Hook은 hoverProps·isHovered, 컴포넌트의 children 함수는 isHovered·isDisabled를 제공합니다. Touch의 모의 mouse 이벤트를 걸러내며 hover를 유일한 조작 경로로 사용하지 않습니다.

직접 구현한 button에 press 행동을 연결하는 예시입니다.

```tsx
const ref = useRef<HTMLButtonElement>(null);
const { pressProps, isPressed } = usePress({ onPress: save }, ref);

return <button {...pressProps} ref={ref} type="button" data-pressed={isPressed || undefined}>저장</button>;
```

Hook에는 native button의 의미론과 attribute 기본값이 포함되지 않습니다. 직접 조립하는 소비자가 native 태그·type·label을 연결합니다.

## Toggle

Toggleable은 유지되는 boolean 선택 상태를 native toggle button에 연결합니다. selected가 있으면 controlled, defaultSelected를 주면 uncontrolled이며 기본값은 false입니다. 변경 요청은 onSelectedChange(boolean)로 전달합니다. Disabled일 때 입력과 상태 변경을 막습니다.

useToggle은 ToggleOptions를 받아 toggleProps·isSelected·isPressed·setSelected(boolean)·toggle()을 반환합니다. isSelected는 유지되는 선택이고 isPressed는 누르는 동안의 상태입니다. 컴포넌트 children 함수에는 Pressable 상태와 isSelected를 함께 전달합니다. aria-pressed와 data-selected는 선택 상태를 따릅니다.

Controlled toggle을 만드는 예시입니다.

```tsx
<Toggleable selected={selected} onSelectedChange={setSelected}>
  {({ isSelected }) => isSelected ? "선택됨" : "선택 안 됨"}
</Toggleable>
```

이 기반은 toggle button의 의미론입니다. Checkbox·Radio·Tab·Option 등 다른 위젯에 확장할 때는 해당 native 의미론·그룹 선택 정책을 별도로 연결합니다. 각 Atom을 자동으로 toggle button으로 바꾸지 않습니다.

## Drag: move와 transfer

Draggable·useDrag는 mode로 두 계약을 명시합니다.

| 모드 | 책임 | 필수 입력 |
| --- | --- | --- |
| move, 기본값 | x/y 좌표 이동 | 없음 |
| transfer | 데이터 drag and drop | getItems() |

두 모드는 disabled와 activation=surface/handle을 공유합니다. Activation 기본값은 surface입니다. handle을 선택하면 포인터와 키보드 입력 모두 손잡이에서만 시작합니다. 손잡이를 쓰는 panel 예시는 다음과 같습니다.

```tsx
<Draggable activation="handle" defaultPosition={{ x: 0, y: 0 }} aria-label="이동 패널">
  <Draggable.Handle aria-label="패널 이동">⠿</Draggable.Handle>
  <Text>박스 전체가 움직입니다.</Text>
  <Button>독립적인 내부 액션</Button>
</Draggable>
```

Draggable.Handle은 부모 Draggable 내부에 있어야 하며 aria-label이 필수입니다. Input 대상은 Handle, 측정과 이동 대상은 전체 Draggable입니다. Surface 모드도 자식 button·input·textarea·select·link·contenteditable·data-drag-ignore에서 시작한 입력은 이동으로 처리하지 않습니다. 내부 입력의 방향키도 부모를 이동시키지 않습니다.

Move 모드는 position/defaultPosition/onPositionChange, axis=both/x/y, onDragStart/onDragMove/onDragEnd/onDragCancel을 받습니다. Event는 position·시작점 기준 delta·pointerType을 제공합니다. 컴포넌트는 CSS translate로 이동하고, hook 사용자는 position을 자신의 요소에 적용합니다. 방향키로 이동하고, 포인터 이동 중 Escape는 시작 좌표로 복귀하며 onDragCancel을 호출합니다. Disabled 전환도 진행 중인 move를 취소합니다.

자유 이동은 layout 안의 visual offset입니다. 재정렬, 충돌 처리, snap, 경계 제한, 위치 저장은 제공하지 않으며 필요한 상위 조합이 결정합니다.

Hook에서 이동 대상과 손잡이를 분리하는 예시입니다.

```tsx
const { draggableProps, handleProps, position } = useDrag({ activation: "handle" });

return (
  <div {...draggableProps} style={{ translate: position.x + "px " + position.y + "px" }}>
    <button {...handleProps} type="button" aria-label="패널 이동">⠿</button>
    <PanelContents />
  </div>
);
```

Hook의 draggableProps·handleProps에는 각 ref가 포함됩니다. 외부 ref·이벤트와 함께 쓰려면 병합하고, 객체 spread로 한쪽을 덮어쓰지 않습니다. 컴포넌트는 내부 ref와 전달받은 ref를 함께 연결합니다.

## Transfer와 Drop

Transfer 모드의 getItems는 MIME type과 문자열 데이터의 record 배열을 반환합니다. getAllowedDropOperations로 move/copy/link 허용 작업을 선택하고 onDragStart/onDragMove/onDragEnd로 lifecycle을 받습니다. Native drag preview는 전체 박스를 사용합니다. Handle만 등록해도 키보드와 스크린리더 경로를 함께 제공합니다.

Droppable·useDrop은 getDropOperation(types, allowedOperations), getDropOperationForPoint, onDropEnter/onDropMove/onDropExit/onDropActivate/onDrop, disabled를 받습니다. getDropOperation은 허용한 작업 또는 cancel을 반환합니다. useDrop의 두 번째 인수는 선택적인 target ref입니다. 결과에는 dropProps·ref·isDropTarget이 있습니다.

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

Drop item은 text/file/directory 형태를 지원하는 엔진의 데이터를 전달합니다. 허용 형식과 적용할 데이터 변경은 소비자가 결정합니다. Droppable의 children 함수는 isDropTarget을 받고 data-drop-target도 제공됩니다. 키보드 경로는 source에서 Enter로 시작하고, Tab으로 대상 사이를 이동하고, Enter로 놓거나 Escape로 취소합니다. Accessible label과 파일 선택·붙여넣기 같은 제품별 대체 UI는 소비자가 제공합니다.

## 선택 그룹

ToggleGroup은 Toggleable들의 선택 상태와 RovingFocus를 연결합니다. Item은 aria-pressed를 가진 toggle button입니다. 방향키는 focus만 이동하고 선택은 press로 변경합니다. Radio·Tab·Option의 의미론을 toggle button으로 대체하지 않습니다.

Controlled 단일 선택 그룹을 만드는 예시입니다.

```tsx
<ToggleGroup aria-label="정렬" selectedValues={alignment}
  onSelectedValuesChange={setAlignment} selectionRequired>
  <ToggleGroup.Item value="left">왼쪽</ToggleGroup.Item>
  <ToggleGroup.Item value="center">가운데</ToggleGroup.Item>
</ToggleGroup>
```

selectionMode는 single / multiple이며 기본값은 single입니다. selectedValues/defaultSelectedValues는 문자열 배열이고 onSelectedValuesChange는 다음 배열을 받습니다. Single은 최대 하나를 선택합니다. selectionRequired는 사용자가 마지막 선택을 해제하는 것을 막으며 초기 항목을 자동 선택하지는 않습니다. 선택 항목 자체를 제거하면 빈 선택도 허용합니다.

Root disabled는 전체 입력과 변경을 막고 Item disabled는 해당 버튼만 막습니다. Disabled는 기존 선택을 지우지 않습니다. 제거된 value는 정리하며 controlled 상태에서는 변경을 요청합니다. 중복 value를 사용하지 않습니다. Root의 orientation·dir·loop·currentValue 계약은 [RovingFocus](a11y.md#그룹-focus-탐색)와 같습니다.

useToggleGroup은 같은 상태 옵션과 선택적인 values 목록을 받고 selectedValues·isSelected(value)·setSelected(value, boolean)·toggle(value)을 반환합니다. Values를 제공하면 없는 key를 정리합니다. Hook 자체는 DOM·role·focus를 만들지 않습니다.

## Overlay

Overlay는 열린 상태와 Trigger·Content·Close를 연결합니다. Root는 DOM wrapper를 만들지 않고 Content가 열릴 때 Portal과 focus 범위를 mount합니다. 기본값은 non-modal dialog overlay입니다. Content의 면·여백·테두리는 className으로 지정합니다. 앱이 넘긴 class는 로드 순서가 아니라 레이어로 패키지 스타일을 이깁니다([우선순위](../get-started/install.md#우선순위)).

명시적으로 연 모달에 이름과 닫기 버튼을 제공하는 예시입니다.

```tsx
<Overlay modal>
  <Overlay.Trigger>설정 열기</Overlay.Trigger>
  <Overlay.Content aria-label="설정" className={dialogClass}>
    <Field aria-label="표시 이름" />
    <Overlay.Close>닫기</Overlay.Close>
  </Overlay.Content>
</Overlay>
```

Root의 open/defaultOpen/onOpenChange는 controlled·uncontrolled 상태를 선택합니다. useOverlay는 같은 옵션과 isOpen·setOpen·open·close·toggle을 제공하는 상태 hook입니다. DOM 동작은 Content가 연결합니다. Trigger·Close는 Pressable의 native button·ref·onPress 계약을 유지합니다. Trigger의 aria-haspopup=dialog·aria-expanded·aria-controls가 Content에 연결됩니다.

Content role은 dialog / alertdialog이며 기본값은 dialog입니다. aria-label 또는 aria-labelledby로 이름을 제공해주세요. Modal에만 aria-modal=true가 붙습니다. Menu·Tooltip 등의 의미론은 이 API에 임의로 부여하지 않습니다.

| Content 옵션 | 기본값 | 계약 |
| --- | --- | --- |
| dismissable | true | 바깥 pointer 조작으로 닫기 |
| keyboardDismissDisabled | false | true이면 Escape 닫기 해제 |
| closeOnBlur | false | focus 이탈 시 닫기 요청 |
| autoFocus / restoreFocus | true / true | 진입 / 해제 후 복원 |
| initialFocusRef | 없음 | 내부의 명시적 focus 대상 |
| anchored | non-modal이면 true | Trigger 기준 배치 |
| placement | bottom start | 방향·정렬 |
| offset / crossOffset | 0 / 0 | 실행 중 계산하는 배치 간격 |
| shouldFlip | true | 공간이 부족하면 방향 전환 |
| portalContainer | document.body | Portal을 붙일 Element |
| shouldCloseOnInteractOutside | 없음 | 바깥 조작 필터 |
| underlayClassName | 없음 | Modal scrim class |

초기 focus는 initialFocusRef, 첫 내부 대상, 대상이 없는 경우 Content 순서입니다. 제목에 명시적으로 이동하려면 tabIndex=-1을 제공해주세요. AutoFocus=false이면 자동 이동을 하지 않습니다. Portal에서도 Paper의 해석된 theme를 유지합니다. 임의의 지역 CSS 상속이 필요하면 portalContainer를 지정합니다.

Modal은 React Aria의 focus containment·배경 inert·스크롤 잠금을 사용합니다. 중첩 Overlay는 안쪽부터 Escape를 처리하고 각 이전 대상을 복원합니다. 중첩 깊이는 Layout의 elevation 층(overlay·modal)에서 파생한 z로 반영합니다 — 깊이마다 한 tier씩 올라갑니다. 마지막 모달 해제 시 배경과 스크롤을 복원합니다. Dismissable과 Escape는 독립적입니다. 모두 끄면 명시적인 닫기 수단을 제공해야 합니다. 호출 버튼 제거 후의 제품별 목적지, 라우팅과 exit 애니메이션은 소비자가 결정합니다.

## 이벤트와 ref 합성

mergeProps·mergeRefs·composeEventHandlers는 기존 네 분류와 함께 사용하는 합성 도구입니다. MergeProps는 이벤트를 전달 순서대로 모두 실행하고 className을 합칩니다. 일반 속성은 뒤쪽 값이 우선하며 style을 깊게 병합하지 않습니다. 한 handler의 preventDefault가 뒤 handler 실행을 막는 계약도 아닙니다. Ref는 mergeRefs로 같은 DOM에 연결합니다.

여러 행동을 native button에 합성하는 예시입니다.

```tsx
<Box as="button" type="button"
  {...mergeProps(pressProps, hoverProps, focusProps)}
  ref={mergeRefs(localRef, forwardedRef)}>
  실행
</Box>
```

composeEventHandlers(caller, internal)은 caller 실행 뒤 defaultPrevented=false일 때만 internal을 실행합니다. RovingFocus.Item의 onKeyDown은 이 계약을 사용해 탐색을 대체하도록 합니다. Focus 이벤트의 preventDefault는 브라우저의 실제 focus 이동을 취소하지 않습니다. React Aria PressEvent에도 DOM 이벤트와 동일한 취소 계약을 가정하지 않습니다.

Disabled는 행동마다 책임이 다릅니다. Pressable·Toggleable·ToggleGroup.Item은 native button을 비활성화합니다. Hoverable disabled는 hover 추적을 끄며 임의의 as 대상의 실행·Tab 진입을 차단하지 않습니다. Hook을 직접 쓰면 native disabled·접근성 이름·역할을 함께 연결합니다. Layout as는 대상과 ref를 바꾸지만 의미론을 자동으로 만들지 않습니다.
