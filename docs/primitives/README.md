# Overview

Primitive는 Foundations의 값을 화면 구조로 옮기는 첫 컴포넌트입니다. 면과 배치, 글자와 아이콘, 입력 행동, 접근성 관계를 의견 없이 제공하고, Atom과 앱 화면은 이 위에서 조합합니다. 컴포넌트와 hook은 `@studio-baeks/paper-ui`에서, Foundations 값과 어휘(`tokens` · `Space` · `ControlSize` …)는 `@studio-baeks/paper-ui/tokens`에서 import합니다.

## 1차와 2차

Primitive는 두 차수로 나뉩니다. **1차**는 바탕입니다 — Box · Text · Icon · A11y로, 서로 기대지 않습니다. **2차**는 Box에 능력 하나를 더한 것입니다 — 색(Paint), 누르기(Press), 선택(Select), 떠 있는 층(Float), 끌기(Drag), 그룹 탐색(Focus), 입력 연결(Field), 배치(Layout) 가운데 하나씩만 맡습니다. Atom은 이 둘을 hook과 class 함수로 묶습니다. 2차끼리는 서로 기대지 않고(예외는 아래 둘뿐입니다), 묶는 일은 Atom이 합니다. 누르기는 부품이 안에 두지 않습니다 — 부품(Selectable · SelectableGroup.Item · Floating.Trigger · Floating.Close · RovingFocus.Item)은 `onClick`을 받는 native button이고, 누르기 장치가 필요하면 `<Pressable as={부품}>`으로 올립니다.

[contract:primitives.orders.first]: #
1차 파일은 2차 폴더를 import하지 않습니다.

[contract:primitives.orders.second]: #
2차 폴더끼리 서로 기대지 않습니다. 소유자가 승인한 예외는 아래 둘이고, 어느 2차 폴더든 1차 primitive를 import할 수 있습니다. Atom은 모든 Primitive를 import할 수 있습니다.

[contract:primitives.orders.allowed-edges]: #
- Select → Focus: SelectableGroup은 Tab 정지가 하나라 RovingFocus 위에 섭니다.
- Float → Paint: modal의 backdrop이 쓰는 `scrimPaint` 하나뿐입니다.

[contract:primitives.orders.press-reach]: #
Atom과 호출자 말고는 아무도 Press에 닿지 않습니다. 부품에 press가 필요하면 호출자가 `<Pressable as={Selectable}>`처럼 올리고, press 한 번이 늘 click 한 번이라([Press](press.md)) 그 요소의 press 장치는 하나입니다.

[contract:primitives.orders.colour]: #
색 규칙은 [Paint](paint.md) 층(`primitives/paint/`)에만 있습니다. `primitives/` 아래에서 `tokens.color`를 읽는 stylesheet는 그 폴더와 Icon의 잉크뿐이고, Box의 stylesheet도 읽지 않습니다. Atom의 stylesheet(`atoms/`와 그 recipe)도 읽지 않고, 선택 표식 · 점 · 선 · 링크 · 스피너의 색은 그 폴더의 `recipes.css.ts`(`markPaint` · `dotPaint` · `linePaint` · `linkPaint` · `spinnerPaint`)에서 빌려 씁니다.

<!-- generated:inventory.primitives -->
<!-- 이 블록은 생성됩니다 — pnpm docs:sync -->
| 분류 | 차수 | 컴포넌트 | Hook | 문서 |
| --- | --- | --- | --- | --- |
| Element | 1차 | Box | — | [Element](element.md) |
| Content | 1차 | Text · Icon | — | [Content](content.md) |
| A11y | 1차 | FocusScope · VisuallyHidden · Portal · LiveRegion | useFocusRing · useFocusWithin (함수 announce · clearAnnouncements) | [A11y](a11y.md) |
| Paint | 2차 | Surface · Paint | — (class 함수 surfaceClass · paintClass, class 지도 elevation) | [Paint](paint.md) |
| Press | 2차 | Pressable | usePressable | [Press](press.md) |
| Select | 2차 | Selectable · SelectableGroup | useSelectable · useSelectableGroup | [Select](select.md) |
| Float | 2차 | Floating | useFloating · useFloatingContext | [Float](float.md) |
| Drag | 2차 | Draggable · Droppable | useDraggable · useDroppable | [Drag](drag.md) |
| Focus | 2차 | RovingFocus | useRovingFocusItem | [Focus](focus.md) |
| Field | 2차 | FormField | useFormField · useFormFieldControl | [Field](field.md) |
| Layout | 2차 | Stack · Inline · Grid | — | [Layout](layout.md) |
| 합성 도구 (분류 밖) | — | — | mergeProps · mergeRefs · composeEventHandlers | [합성 도구](#합성-도구) |

`Draggable.Handle`은 Draggable의 anatomy라 따로 세지 않고, 합성 도구와 `announce` · `clearAnnouncements`는 컴포넌트가 아니라서 위 열한 분류 밖에 따로 둡니다. 합계 20개입니다.
<!-- /generated:inventory.primitives -->

## 공통 계약

[contract:primitives.polymorphic.default-tags]: #
`as`로 렌더 대상을 고르는 것은 <!-- generated:polymorphic --><!-- 이 블록은 생성됩니다 — pnpm docs:sync -->Box · Surface · Paint · Stack · Inline · Grid · Text · VisuallyHidden · Pressable · Selectable · SelectableGroup.Item · Floating.Trigger · Floating.Close · Draggable · Draggable.Handle · Droppable · RovingFocus.Item · Button · IconButton · Link입니다. native props와 ref는 같은 요소로 전달합니다.<!-- /generated:polymorphic --> Pressable의 `as`에는 부품도 올 수 있습니다(`<Pressable as={Selectable}>`). 부품(Pressable · Selectable · SelectableGroup.Item · Floating.Trigger · Floating.Close · RovingFocus.Item · Draggable · Draggable.Handle · Droppable)과 VisuallyHidden도 `as`를 받고, 기본 태그는 Pressable · Selectable · Floating.Trigger · Floating.Close · Draggable.Handle · RovingFocus.Item이 button, Draggable과 Droppable이 div, VisuallyHidden이 span입니다. Icon도 SVG ref와 native SVG props를 전달합니다. 어느 것도 중첩 wrapper를 더하지 않습니다. 부품의 `as`는 모두 같은 규칙으로 `disabled`를 대상에 옮깁니다(`internal/render-target.ts`의 `targetProps`가 유일한 투영입니다).

[contract:primitives.target.projection]: #
대상은 두 종류입니다. **control**은 입력을 받는 대상(Pressable · Selectable · Floating.Trigger · Floating.Close · Draggable · Draggable.Handle · Droppable · RovingFocus.Item)이고, **region**은 자리만 차지하는 대상(VisuallyHidden)입니다. 비활성은 모든 경우 `data-disabled`를 달아 같은 selector로 스타일되고, 나머지는 대상이 무엇이냐에 따라 갈립니다.

[contract:primitives.target.table]: #

| 대상 | control: 활성 | control: 비활성 | region: 비활성 |
| --- | --- | --- | --- |
| button | `type="button"`(`type`을 주면 그 값) | native `disabled` | native `disabled` |
| input · select · textarea · fieldset · optgroup · option | 없음 | native `disabled` | native `disabled` |
| a[href] | tabIndex 0 | `aria-disabled`, tabIndex −1, 클릭 차단 | `data-disabled`만 |
| 그 밖의 태그(div …) | `role="button"`, tabIndex 0 | `aria-disabled`, tabIndex −1, 클릭 차단 | `data-disabled`만 |
| Paper 부품 · pressable Atom | `type`은 줄 때만 | `disabled` | `disabled` |
| 그 밖의 컴포넌트 | `type`은 줄 때만 | `aria-disabled`, tabIndex −1, 클릭 차단 | `disabled` |

[contract:primitives.target.focusable]: #
`focusable`을 주면 비활성 control이 Tab 정지에 남습니다. button은 native `disabled` 대신 `aria-disabled`를 달고, 다른 태그와 컴포넌트는 tabIndex 0을 유지하며, Paper 부품도 `disabled`를 받는 대신 `aria-disabled`와 클릭 차단으로 막힙니다(로딩 중인 Button처럼 포커스를 잃으면 안 되는 대상). native input · select는 언제나 native `disabled`입니다. 클릭 차단은 대상의 `onClick`과 조상의 handler가 클릭을 듣기 전에 멈추고 가운데 버튼 클릭도 함께 막으므로, 비활성 링크 컴포넌트는 이동하지 않습니다. 브라우저 컨텍스트 메뉴의 '새 탭에서 열기'는 막지 못합니다. 호출자가 준 `role` · `tabIndex`는 투영을 이깁니다. hover는 CSS이고 비활성 대상에는 뜨지 않으며, hover만 따로 끄는 스위치는 없습니다. Atom의 모습을 부품에 입히는 길은 `<Button as={부품}>`입니다. 반대로 부품이나 Pressable의 `as`에 Button · IconButton을 주면(`<Floating.Trigger as={Button}>`) 한 요소에 press 장치가 둘이 되므로, 개발 모드 오류를 한 번 내고 Button이 부품을 받는 모양을 안내합니다.

[contract:primitives.target.own-keys]: #
Selectable · SelectableGroup.Item · Floating.Trigger · Floating.Close는 press 장치가 없는 부품이라, `role="button"`을 받은 태그 위에서는 button의 키를 스스로 갖습니다. Enter와 Space가 클릭을 냅니다. 비활성이면 받지 않고, 안쪽 입력에서 올라온 키는 그 입력의 것이며, 호출자의 `onKeyDown`이 먼저 실행되어 `preventDefault()`를 부르면 누르지 않습니다. Pressable의 키는 press가, Draggable · Draggable.Handle · Droppable의 키는 키보드 끌기가 맡습니다. a[href]와 native 태그, 컴포넌트 대상은 자기 키를 그대로 씁니다.

[contract:primitives.target.exceptions]: #
표를 그대로 따르지 않는 곳이 있습니다. Draggable 루트와 Droppable의 비활성은 끌기·놓기만 멈추므로 클릭 차단이 없고, 안쪽 내용의 클릭은 그대로 동작합니다. Draggable 루트의 role과 Tab 정지는 끌기를 시작하는 방식(activation)이 정합니다. RovingFocus.Item은 button이 아닌 태그에 role을 주지 않고(역할은 호출자가 정합니다), tabIndex는 그룹의 Tab 정지 규칙이 정합니다.

[contract:primitives.hooks.disabled]: #
이 표는 컴포넌트의 `disabled`입니다. Hook의 `disabled`는 그 행동만 끕니다. `usePressable({ disabled })`은 press를 멈추고 `data-disabled`를 달 뿐 native `disabled`도 `aria-disabled`도 쓰지 않으므로, 요소를 막는 일은 hook을 쓰는 쪽이 합니다. `useDraggable` · `useDroppable`도 끌기·놓기만 멈춥니다. dragProps · dropProps에는 hook으로 직접 만든 요소를 위한 `aria-disabled`가, handleProps에는 native `disabled`가 들어 있고, 컴포넌트는 그 `aria-disabled` 대신 위 표를 따릅니다.

[contract:primitives.snapshots.children]: #
children 함수는 읽기 전용 스냅샷을 받습니다 — Pressable `{ isActive, isFocused, isFocusVisible, isDisabled }`, Selectable `{ isSelected, isDisabled }`, SelectableGroup `{ selectedValues, isDisabled }`, RovingFocus `{ currentValue, isDisabled }`, Draggable `{ position, isDragging, isDisabled }`, Droppable `{ isDropTarget, isDisabled }`, Floating.Content `{ isOpen, presentation, placement, elevation }`, FormField `{ isDisabled, isInvalid, isRequired }`. 스냅샷은 상태를 읽을 뿐 바꾸지 못합니다. Floating.Content 안의 부품이 열고 닫으려면 `useFloatingContext()`를 씁니다. Floating.Content와 FormField는 구조가 고정된 부품이라 `as`를 받지 않습니다.

[contract:primitives.polymorphic.target-and-ref]: #
`as`는 대상과 ref를 바꿀 뿐 의미론을 만들지 않습니다. 아래 예시는 Stack을 면으로 만듭니다 — 요소는 하나이고, Stack의 prop(`gap`)과 Surface의 prop(`fill` · `border`)이 함께 타입으로 검사됩니다.

```tsx
<Surface as={Stack} fill="raised" border radius="md" padding="md" gap="sm">
  <Text variant="label">제목</Text>
  <Text variant="body">내용</Text>
</Surface>
```

[contract:primitives.surface.no-role]: #
Surface는 button 역할이나 Tab 정지를 자동으로 붙이지 않습니다. 행동의 의미에 맞는 native 요소와 접근성 이름은 쓰는 쪽이 고릅니다.

[contract:primitives.polymorphic.own-props-win]: #
`as`로 고른 요소의 native 속성 가운데 Primitive 자신의 prop과 이름이 겹치는 것은 타입에서 빠지고 자신의 prop이 이깁니다. `<Inline as="td" align="start">`의 `align`은 td의 native `align`이 아니라 Inline의 `align`입니다. Text는 `as`를 주지 않아도 variant가 그리는 태그(`label`은 span, `heading`은 h2)의 타입으로 ref를 받습니다.

입력·포커스·보조 기술의 이벤트 처리는 React Aria에 위임하고, Paper가 공개 API와 상태 연결을 소유합니다.

[contract:primitives.aria.boundary]: #
React Aria는 `src/internal/aria` 밖으로 나오지 않습니다. 어댑터가 Paper의 이름(`disabled` · `cancelOnPointerExit` · `focusable` …)을 React Aria의 옵션으로 옮기고 Paper가 선언한 타입을 돌려주므로, 공개 옵션 · 결과 · 이벤트 타입은 모두 Paper의 것입니다. lint가 그 밖의 import를 막고, 번들한 d.ts에 `@react-aria` · `@react-types` · `@react-stately` 경로가 남으면 빌드가 실패합니다.

패키지 스타일은 CSS class로 적용하고 토큰을 inline style로 넘기지 않습니다. 실행 중에 정해지는 값만 runtime style을 씁니다: Draggable 이동 좌표, Grid track, Floating rank 변수, Floating 앵커 위치, Floating 원본 변수 운반, 호출자가 넘긴 style.

[contract:primitives.errors.prefix]: #
개발자에게 하는 오류는 늘 영어이고 `[paper-ui] `로 시작합니다. 부품을 부모 밖에서 쓰면 어느 부품인지 이름을 댑니다.

## Hook의 공통 계약

[contract:primitives.hooks.result-shape]: #
DOM에 닿는 hook은 `{ <부분>Props, ...상태 }` 한 꼴로 돌려줍니다. 부분의 props에는 그 hook이 쓰는 callback ref와 상태 attribute가 이미 들어 있어서 hook은 ref를 인자로 받지 않고, 소비자는 `{...pressProps}`처럼 펼치거나 `mergeProps`로 다른 hook의 props와 합칩니다. 상태만 다루는 hook(`useSelectableGroup` · `useFloating` · `useFloatingContext`)은 상태와 동작만 돌려주고 DOM을 모릅니다.

[contract:primitives.hooks.attribute-table]: #

| Hook | 돌려주는 props | 상태 attribute |
| --- | --- | --- |
| usePressable | pressProps | data-active · data-disabled |
| useFocusRing | focusProps | data-focused · data-focus-visible |
| useFocusWithin | focusWithinProps | data-focus-within |
| useSelectable | selectProps | role이 정하는 aria 속성 하나 · data-selected |
| useDraggable | dragProps · handleProps | data-dragging · data-disabled, dragProps에 aria-disabled |
| useDroppable | dropProps | data-drop-target · data-disabled · aria-disabled |
| useRovingFocusItem | itemProps | data-roving-item(값은 항목의 value) |
| useFormFieldControl | controlProps | id · disabled · required · aria-invalid · aria-describedby, 값이 있는 키만 |
| FormField | (wrapper) | data-disabled · data-invalid · data-required, 부분은 data-part |
| Floating.Content | (panel) | data-presentation · data-placement(popover) · data-presence(`entering` · `exiting`, 서 있는 동안은 없음) |

[contract:primitives.hooks.naming]: #
이름도 한 규칙을 따릅니다. 입력에는 `is` · `should`를 붙이지 않고(`disabled` · `selected` · `flip` · `focusable` · `textInput` · `cancelOnPointerExit` · `closeOnInteractOutside`), 출력은 `is*`입니다(`isActive` · `isSelected` · `isOpen` · `isFocusVisible` · `isDragging` · `isDropTarget`). 제어 상태는 `x` · `defaultX` · `onXChange` 셋이 한 벌입니다. 공개 hook마다 `XOptions`와 `XResult`가 있고(옵션을 받지 않는 `useFloatingContext`는 `useFloating`의 `FloatingResult`를 돌려줍니다), `XState`는 children 함수가 받는 읽기 전용 스냅샷의 이름입니다. press · drop · drag · 포커스 이벤트의 타입(`PressEvent` · `DropEvent` · `TransferDragEvent` · `Placement` …)도 Paper가 선언해 `@studio-baeks/paper-ui`에서 내보냅니다.

## 상태 속성

[contract:primitives.state.attributes]: #
상태 attribute의 이름은 `tokens/state.ts` 한 곳에서만 쓰고, hook은 `stateAttributes`로 내보냅니다. 상태는 값이 있는 동안 `"true"`이고 없으면 attribute 자체가 없습니다.

[contract:primitives.state.emitters]: #

| 속성 | 켜지는 때 | 내는 컴포넌트 |
| --- | --- | --- |
| data-active | 누르는 동안 | Pressable · usePressable |
| data-focused | focus가 있는 동안 | Pressable · useFocusRing |
| data-focus-visible | focus를 보여줘야 하는 동안(키보드로 옮긴 focus) | Pressable · useFocusRing, 그리고 링을 그리는 Atom의 틀(Field · Select의 wrapper, Textarea 자신) |
| data-focus-within | focus가 요소 안에 있는 동안 | useFocusWithin |
| data-selected | 선택된 동안 | Selectable · SelectableGroup.Item · useSelectable |
| data-disabled | 비활성인 동안 | [공통 계약](#공통-계약)의 투영을 따르는 모든 부품과 VisuallyHidden · FormField · usePressable · useDraggable · useDroppable |
| data-invalid | `invalid`인 동안 | FormField, 그리고 오류인 Field · Textarea · Select의 틀 |
| data-required | 필수인 동안 | FormField |
| data-dragging | 끄는 동안 | Draggable · Draggable.Handle · useDraggable |
| data-drop-target | 끌던 것이 위에 있는 동안 | Droppable · useDroppable |

[contract:primitives.state.active-not-pressed]: #
눌리는 동안의 순간 상태는 `active`입니다. `pressed`는 선택을 알리는 `aria-pressed`만 뜻하므로 같은 요소에서 두 뜻이 겹치지 않습니다. hover는 CSS이고 attribute로 내보내지 않습니다.

## 테마와 언어

하위 트리 하나의 테마는 Surface의 `theme` 축이 정합니다. `light` · `dark`는 고정이고 `inverse`는 주변의 반대라, 밝은 화면 위의 어두운 판이나 어두운 화면 위의 밝은 판을 만듭니다. 별도 노드 없이 그 Surface 자신에 걸리고, 판(canvas)이 늘 깔리며, Portal로 그려지는 Floating도 열린 자리의 테마를 유지합니다([Paint](paint.md#surface--면)). 앱 전체의 테마는 `PaperProvider`가 `<html data-pui-theme>`에 걸어 저장하고, `useTheme` · `useResolvedTheme`이 그것을 읽습니다. 저장과 부팅 스크립트, hook의 규칙은 [Theming](../get-started/theming.md)에 있습니다.

`PaperProvider`는 언어도 정합니다. `locale`(BCP 47 태그)과 `messages`(Atom이 스스로 말하는 문구)를 받고, 둘 다 생략할 수 있습니다.

[contract:primitives.locale.resolution]: #
locale은 Provider의 `locale`, 없으면 `<html lang>`, 그것도 없으면 `en`으로 정해집니다. 밑줄로 쓴 태그(`ko_KR`)는 대시(`ko-KR`)로 읽고, `Intl`이 받지 않는 태그는 영어로 읽습니다. Paper는 브라우저의 언어(`navigator.language`)를 읽지 않습니다. 안쪽 Provider가 `locale`이나 `messages`를 주지 않으면 바깥 Provider의 값을 이어받고, `<html lang>`이 나중에 바뀌면 Provider 없이도 따라갑니다. 서버 렌더는 `<html>`을 읽지 못하므로 받은 `locale`이나 `en`으로 답합니다. 정해진 locale은 React Aria에도 전달되어 방향키와 배치가 페이지의 언어를 따릅니다.

[contract:primitives.locale.messages]: #
문구 목록은 `PaperMessages`(`clear` · `showPassword` · `loading`)이고 영어와 한국어 목록이 있습니다. locale의 언어 subtag(첫 대시나 밑줄 앞)로 목록을 고르고, 없는 언어는 영어입니다. Provider의 `messages`는 키마다 목록 위에 덮입니다. Atom이 스스로 말하는 문구는 모두 prop이고 이 목록이 그 기본값이며, 개발자 오류는 늘 영어입니다.

[contract:primitives.locale.document]: #
`<html lang>`과 `<html dir>`은 Provider에 `locale`을 줄 때만 씁니다. `dir`은 그 언어의 쓰는 방향(`ar` · `fa` · `he` · `ur` · `ps` · `sd` · `ckb` · `dv` · `yi`는 `rtl`, 나머지는 `ltr`)이고, Provider가 사라지면 쓰기 전의 값으로 돌아갑니다. `locale`을 주지 않으면 두 속성을 건드리지 않습니다.

## 합성 도구

[contract:primitives.composition.own-tools]: #
`mergeProps` · `mergeRefs` · `composeEventHandlers`는 위 열한 분류와 함께 쓰는 합성 도구이고, 계약은 React Aria가 아니라 Paper의 것입니다. 소비자가 hook이 돌려준 props를 한 요소에 합칠 때 같은 도구를 쓰도록 `primitives/composition.ts` 하나가 정의합니다.

[contract:primitives.composition.merge-props]: #
`mergeProps(...sets)`는 prop 묶음을 왼쪽부터 합치고, 규칙은 다섯입니다. `on[A-Z]*` handler는 모두 인자 순서대로 실행합니다. `className`은 이어 붙입니다. `style`은 키별로 합치고 뒤쪽 키가 이깁니다. `ref`는 `mergeRefs`로 하나로 만들고, null ref는 앞의 ref를 지우지 못합니다. 나머지 키는 undefined가 아닌 마지막 값을 쓰므로 undefined는 앞의 값을 지우지 못하고, `id`도 따로 합치지 않습니다. 한 handler의 preventDefault가 뒤 handler를 막지는 않습니다.

여러 행동을 native button에 합성하는 예시입니다.

```tsx
const { pressProps } = usePressable({ onPress: save });
const { focusProps } = useFocusRing();

<Box as="button" type="button"
  {...mergeProps(pressProps, focusProps, { ref: forwardedRef })}>
  저장
</Box>
```

[contract:primitives.composition.merge-refs]: #
`mergeRefs(...refs)`는 callback ref와 object ref를 한 callback으로 모아 같은 DOM에 연결합니다. 해제될 때 callback ref는 null로 호출되고, cleanup을 돌려준 callback ref는 null 대신 그 cleanup이 실행됩니다.

[contract:primitives.composition.compose-handlers]: #
`composeEventHandlers(caller, internal)`은 caller와 내부 동작을 잇는 유일한 규칙입니다. caller가 먼저 실행되고, `defaultPrevented`를 가진 취소할 수 있는 이벤트에서 caller가 preventDefault했을 때만 internal을 건너뜁니다. Selectable의 `onClick`은 `onSelectedChange`보다 먼저 실행되고 `preventDefault()`를 부르면 선택이 바뀌지 않으며, Floating.Trigger와 Close의 `onClick`도 열기·닫기보다 먼저 실행되어 같은 규칙으로 취소됩니다. RovingFocus.Item과 SelectableGroup.Item의 `onFocus` · `onKeyDown`도 이 규칙을 씁니다. PressEvent는 취소할 수 없는 알림이라 `onPress`에는 취소가 없고, 취소는 `onClick`에서 합니다. Focus 이벤트의 preventDefault는 브라우저의 실제 focus 이동을 취소하지 않습니다. 그래서 입력 Atom(Field · Textarea · Select · Checkbox · Radio · Switch)의 `onFocus` · `onBlur`도 caller가 먼저 실행되고, 그 뒤의 포커스 판정은 이미 일어난 이동을 적는 일이라 preventDefault로 건너뛰지 않습니다. Field의 `onChange`도 caller가 먼저 실행되고, 지우기 버튼을 정하는 값은 caller가 남긴 값입니다.

## 패키지가 멈추는 곳

```text
Foundations → Primitives → Atoms
```

패키지는 배치를 조합하는 Primitive와 단일 역할의 Atom까지만 제공합니다. 페이지 헤더·표·메뉴 같은 더 큰 조합은 실제 제품에서 같은 요구가 반복되어 공통 API의 경계가 분명해질 때까지 앱이 소유합니다. 앱에서 의미 있는 HTML이 필요하면 `<Box as="section">`처럼 Primitive의 `as`를 쓰거나 앱의 markup을 직접 씁니다.

동작 예제는 Playground의 [Primitives](/playground/box) 목록에서 확인합니다.
