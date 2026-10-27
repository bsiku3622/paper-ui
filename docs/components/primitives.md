# Primitives

Paper UI의 Primitives는 배치·콘텐츠·입력 행동·접근성을 조합하는 기반입니다. Layout·Content·Interaction·A11y 네 분류를 사용하며, 모든 공개 이름은 `@studio-baeks/paper-ui`에서 import합니다.

| 분류 | 컴포넌트 | Hook |
| --- | --- | --- |
| Layout | Box, Stack, Inline, Grid | — |
| Content | Text, Icon | — |
| Interaction | Pressable, Hoverable, Toggleable, Draggable, Droppable, ToggleGroup, Overlay | usePress, useHover, useToggle, useDrag, useDrop, useToggleGroup, useOverlay |
| A11y | FocusScope, VisuallyHidden, RovingFocus, FormField | useFocusRing, useFocusWithin, useRovingFocusItem, useField |

`Draggable.Handle`은 Draggable의 anatomy입니다. ThemeScope·PaperProvider와 테마 hook은 별도의 테마 도구로 유지합니다.

## 공통 적용 계약

Box·Stack·Inline·Grid·Text·Hoverable은 `as`로 렌더 대상을 선택하고 native props와 ref를 같은 요소로 전달합니다. Box는 surface·spacing(padding은 Shape inset, gap은 Layout gap)·radius·elevation·dimension 계약을 갖습니다. Icon도 SVG ref와 native SVG props를 전달하며, 기존 size·ink·viewBox 기본값을 유지합니다.

Pressable·Toggleable·Draggable.Handle은 native button을 렌더링하고 type 기본값은 button입니다. Draggable과 Droppable은 div를 렌더링합니다. 이 요소들은 자신의 className·style·native props·ref를 받으며, 중첩 wrapper를 더하지 않습니다. Hoverable을 기존 Box에 합성하는 예시는 다음과 같습니다.

```tsx
<Hoverable as={Box} border radius="md" padding="md">
  {({ isHovered }) => isHovered ? "Hover 중" : "포인터를 올려보세요"}
</Hoverable>
```

Hoverable은 button 역할이나 tab stop을 자동으로 추가하지 않습니다. 인터랙션의 의미에 맞는 native 요소와 접근성 이름은 사용하는 컴포넌트가 선택합니다.

입력·포커스·보조 기술을 위한 이벤트 처리는 React Aria에 위임하고, Paper가 공개 API와 상태 연결을 소유합니다. 패키지의 컴포넌트 스타일은 CSS class를 사용합니다. Grid track이나 드래그 좌표처럼 실행 중 결정되는 값은 caller dimension과 같은 runtime style 통로를 사용합니다.

## Layout와 Content

| 컴포넌트 | 계약 |
| --- | --- |
| Box | surface·padding·gap·border·radius·elevation(z와 그림자를 함께)·inverse·dimension·overflow props |
| Stack | Box + 세로 flex, align=start/center/end/stretch |
| Inline | Box + 가로 flex, align=start/center/end/baseline, justify=start/center/end/between, wrap |
| Grid | Box + columns/rows, autoFlow, align/justify=start/center/end/stretch, rowGap/columnGap |
| Text | 기존 variant·family·ink·의미 태그 기본값 유지 |
| Icon | label/caption/body/subheading 크기(옆에 서는 Text 역할 이름)와 ink, native SVG 속성·ref 전달 |

Grid의 columns 기본값은 1입니다. columns·rows에 양의 정수를 주면 같은 폭의 track을 만들며, CSS track 문자열도 받습니다. gap·rowGap·columnGap은 공통 Space scale을 선택합니다. Style escape는 명시한 track을 덮어쓸 수 있습니다.

두 열 grid를 만드는 예시입니다.

```tsx
<Grid columns={2} gap="md" align="start">
  <Box border padding="md">첫 항목</Box>
  <Box border padding="md">둘째 항목</Box>
</Grid>
```

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

## Focus와 숨긴 콘텐츠

FocusScope는 contain·restoreFocus·autoFocus를 독립적으로 선택합니다. Contain은 기본으로 켜지지 않습니다. Scope가 해제되면 restoreFocus가 원래 요소로 포커스를 돌려줍니다. 유저가 명시적으로 연 화면에서 초기 포커스를 선택하는 예시는 다음과 같습니다.

```tsx
<FocusScope contain restoreFocus autoFocus>
  <Field aria-label="첫 입력" />
  <Button onClick={close}>닫기</Button>
</FocusScope>
```

useFocusRing은 focusProps·isFocused·isFocusVisible을 반환합니다. within 옵션으로 자식의 포커스도 포함합니다. useFocusWithin은 focusWithinProps·isFocusWithin과 focus 진입·이탈·변경 callback을 제공합니다.

VisuallyHidden은 콘텐츠를 시각적으로 숨기고 접근성 트리에 유지합니다. as 기본값은 span이며 isFocusable을 켜면 내부 포커스가 들어올 때 보이게 합니다. Icon button의 이름과 skip link에 사용하는 예시입니다.

```tsx
<Pressable>
  <Icon><path d="M12 4v16M4 12h16" /></Icon>
  <VisuallyHidden>새 항목 추가</VisuallyHidden>
</Pressable>

<VisuallyHidden isFocusable>
  <a href="#main-content">본문으로 건너뛰기</a>
</VisuallyHidden>
```

동작 예제는 Playground의 Layout·Content·Interaction·A11y 목록에서 확인합니다. 패키지의 입력·포커스 계약은 단위 테스트와 실제 브라우저의 pointer·keyboard·native transfer 경로로 검증합니다.

## 그룹 focus 탐색

RovingFocus는 등록한 항목 중 하나만 Tab 진입점으로 유지합니다. 방향키로 실제 DOM focus를 옮기며 Tab은 그룹 밖으로 나갑니다. FocusScope의 contain과는 다른 동작입니다. Item은 native button이며 as로 다른 요소나 ref를 전달하는 컴포넌트를 지정합니다.

Toolbar의 비활성 항목을 건너뛰고 양 끝에서 순환하는 예시입니다.

```tsx
<RovingFocus role="toolbar" aria-label="서식" loop>
  <RovingFocus.Item value="bold">굵게</RovingFocus.Item>
  <RovingFocus.Item value="italic" disabled>기울임</RovingFocus.Item>
  <RovingFocus.Item as={Pressable} value="underline">밑줄</RovingFocus.Item>
</RovingFocus>
```

| Root 옵션 | 기본값 | 계약 |
| --- | --- | --- |
| orientation | horizontal | horizontal / vertical / both |
| dir | ltr | ltr / rtl; 가로 방향 결정 |
| loop | false | 끝에서 반대쪽으로 순환 |
| disabled | false | 그룹 탐색과 기본 Item 비활성화 |
| currentValue / defaultCurrentValue | 첫 활성 항목 | controlled / uncontrolled Tab 진입점 |
| onCurrentValueChange | 없음 | focus된 항목의 value 전달 |

Value는 그룹 안에서 고유해야 합니다. Home·End는 첫·마지막 활성 항목으로 이동하고 순서는 현재 DOM을 따릅니다. 현재 항목이 제거되거나 비활성화되면 다음 이웃, 마지막 항목이었다면 이전 이웃으로 이동합니다. 모두 사라지면 root로 옮깁니다. 이미 바깥으로 옮긴 focus는 되돌리지 않습니다. CurrentValue를 외부에서 바꿔도 DOM focus를 강제로 빼앗지 않습니다.

useRovingFocusItem({ value, disabled })은 root 안에서 ref·tabIndex·onFocus·onKeyDown·data-roving-item을 반환합니다. Ref를 실제 focus 대상에 연결하고 외부 ref는 mergeRefs로 병합합니다. 기본 Item과 disabled를 받는 custom component에는 비활성 상태를 전달하며, 일반 div 같은 custom control의 실행 차단은 해당 구현이 담당합니다. 자손 입력에서 발생한 방향키와 수정키 조합은 가로채지 않습니다. 등록하지 않은 자손의 Tab 진입은 바꾸지 않습니다. Aria-activedescendant·typeahead·위젯별 선택 정책은 상위 컴포넌트가 연결합니다.

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

Root disabled는 전체 입력과 변경을 막고 Item disabled는 해당 버튼만 막습니다. Disabled는 기존 선택을 지우지 않습니다. 제거된 value는 정리하며 controlled 상태에서는 변경을 요청합니다. 중복 value를 사용하지 않습니다. Root의 orientation·dir·loop·currentValue 계약은 RovingFocus와 같습니다.

useToggleGroup은 같은 상태 옵션과 선택적인 values 목록을 받고 selectedValues·isSelected(value)·setSelected(value, boolean)·toggle(value)을 반환합니다. Values를 제공하면 없는 key를 정리합니다. Hook 자체는 DOM·role·focus를 만들지 않습니다.

## Overlay

Overlay는 열린 상태와 Trigger·Content·Close를 연결합니다. Root는 DOM wrapper를 만들지 않고 Content가 열릴 때 Portal과 focus 범위를 mount합니다. 기본값은 non-modal dialog overlay입니다. Content의 면·여백·테두리는 className으로 지정합니다.

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

Modal은 React Aria의 focus containment·배경 inert·스크롤 잠금을 사용합니다. 중첩 Overlay는 안쪽부터 Escape를 처리하고 각 이전 대상을 복원합니다. 중첩 깊이는 Layout z tier에서 파생한 CSS 변수로 반영합니다. 마지막 모달 해제 시 배경과 스크롤을 복원합니다. Dismissable과 Escape는 독립적입니다. 모두 끄면 명시적인 닫기 수단을 제공해야 합니다. 호출 버튼 제거 후의 제품별 목적지, 라우팅과 exit 애니메이션은 소비자가 결정합니다.

## 입력과 설명의 관계

FormField는 label·입력·설명·오류의 ID를 연결합니다. 기존 Field Atom의 input group 계약은 유지합니다. Children 함수의 controlProps를 native label을 받을 수 있는 실제 입력에 전달합니다.

오류를 입력창의 접근성 설명에 연결하는 예시입니다.

```tsx
<FormField label="이메일" description="연락받을 주소" required
  invalid={invalid} error="이메일 형식을 확인해주세요.">
  {({ controlProps }) => <Field {...controlProps} type="email"
    status={invalid ? "error" : "default"} />}
</FormField>
```

FormField는 div에 label·children·description·error를 렌더링합니다. ClassName·style·ref는 wrapper를 가리키며 id 옵션은 입력 ID를 정합니다. 생략하면 useId로 고유 값을 만듭니다. ControlProps는 id·disabled·required·aria-invalid·aria-describedby를 연결합니다. Description은 존재할 때만, error는 invalid이며 존재할 때만 설명 ID에 포함합니다. 외부 aria-describedby도 중복 없이 유지합니다. 오류 해제 시 메시지와 참조를 함께 제거합니다.

useField는 같은 FieldOptions와 controlProps·labelProps·descriptionProps·errorProps를 반환하며 DOM을 만들지 않습니다. 직접 사용할 때 선언한 description/error를 해당 ID로 렌더링해주세요. 시각적 status·validation·값 저장·제출·오류 요약 이동·비동기 알림은 소비자가 결정합니다.

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
