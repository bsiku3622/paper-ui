# Overview

Primitive는 Foundations의 값을 화면 구조로 옮기는 첫 컴포넌트입니다. 면과 배치, 글자와 아이콘, 입력 행동, 접근성 관계를 의견 없이 제공하고, Atom과 앱 화면은 이 위에서 조합합니다. 컴포넌트와 hook은 `@studio-baeks/paper-ui`에서, Foundations 값과 어휘(`tokens` · `Space` · `ControlSize` …)는 `@studio-baeks/paper-ui/tokens`에서 import합니다.

## 1차와 2차

Primitive는 두 차수로 나뉩니다. **1차**는 바탕입니다 — Box · Text · Icon · A11y로, 서로 기대지 않습니다. **2차**는 Box에 능력 하나를 더한 것입니다 — 색(Paint), 누르기(Press), 선택(Select), 떠 있는 층(Float), 끌기(Drag), 그룹 탐색(Focus), 입력 연결(Field), 배치(Layout) 가운데 하나씩만 맡습니다. Atom은 이 둘을 hook과 class 함수로 묶습니다. 2차끼리는 서로의 색이나 상태를 가져가지 않고, 묶는 일은 Atom이 합니다.

[contract:primitives.orders.first]: #
1차 파일은 2차 폴더를 import하지 않습니다.

[contract:primitives.orders.second]: #
2차 폴더끼리 서로 닿는 길은 아래 다섯 줄이 전부이고, 어느 2차 폴더든 1차 primitive를 import할 수 있습니다. Atom은 모든 Primitive를 import할 수 있습니다.

- Select → Press: Selectable과 SelectableGroup.Item은 눌리는 대상입니다. `useSelectable` 자체는 press를 import하지 않습니다.
- Select → Focus: SelectableGroup은 Tab 정지가 하나라 RovingFocus 위에 섭니다.
- Float → Press: Floating.Trigger와 Floating.Close는 눌리는 대상입니다.
- Float → Paint: modal의 backdrop이 쓰는 `scrimPaint` 하나뿐입니다.
- Drag → Press: transfer drag의 키보드 button입니다.

[contract:primitives.orders.colour]: #
색 규칙은 [Paint](paint.md) 층(`primitives/paint/`)에만 있습니다. `primitives/` 아래에서 `tokens.color`를 읽는 stylesheet는 그 폴더와 Icon의 잉크뿐이고, Box의 stylesheet도 읽지 않습니다.

| 분류 | 차수 | 컴포넌트 | Hook | 문서 |
| --- | --- | --- | --- | --- |
| Element | 1차 | Box | — | [Element](element.md) |
| Content | 1차 | Text · Icon | — | [Content](content.md) |
| A11y | 1차 | FocusScope · VisuallyHidden · Portal | useFocusRing · useFocusWithin | [A11y](a11y.md) |
| Paint | 2차 | Surface · Paint | — (class 함수 surfaceClass · paintClass, class 지도 elevation) | [Paint](paint.md) |
| Press | 2차 | Pressable | usePressable | [Press](press.md) |
| Select | 2차 | Selectable · SelectableGroup | useSelectable · useSelectableGroup | [Select](select.md) |
| Float | 2차 | Floating | useFloating · useFloatingContext | [Float](float.md) |
| Drag | 2차 | Draggable · Droppable | useDrag · useDrop | [Drag](drag.md) |
| Focus | 2차 | RovingFocus | useRovingFocusItem | [Focus](focus.md) |
| Field | 2차 | FormField | useFormField | [Field](field.md) |
| Layout | 2차 | Stack · Inline · Grid | — | [Layout](layout.md) |
| 합성 도구 (분류 밖) | — | — | mergeProps · mergeRefs · composeEventHandlers | [합성 도구](#합성-도구) |

`Draggable.Handle`은 Draggable의 anatomy라 따로 세지 않고, 합성 도구는 컴포넌트가 아니라서 위 열한 분류 밖에 따로 둡니다. 합계 19개입니다.

## 공통 계약

Box · Surface · Paint · Stack · Inline · Grid · Text는 `as`로 렌더 대상을 고르고, native props와 ref를 같은 요소로 전달합니다. Icon도 SVG ref와 native SVG props를 전달합니다. Pressable · Selectable · Draggable.Handle은 native button(`type="button"`)을, Draggable과 Droppable은 div를 렌더링합니다. 어느 것도 중첩 wrapper를 더하지 않습니다.

`as`는 대상과 ref를 바꿀 뿐 의미론을 만들지 않습니다. 아래 예시는 Stack을 면으로 만듭니다 — 요소는 하나이고, Stack의 prop(`gap`)과 Surface의 prop(`fill` · `border`)이 함께 타입으로 검사됩니다.

```tsx
<Surface as={Stack} fill="raised" border radius="md" padding="md" gap="sm">
  <Text variant="label">제목</Text>
  <Text variant="body">내용</Text>
</Surface>
```

Surface는 button 역할이나 Tab 정지를 자동으로 붙이지 않습니다. 행동의 의미에 맞는 native 요소와 접근성 이름은 쓰는 쪽이 고릅니다.

[contract:primitives.polymorphic.own-props-win]: #
`as`로 고른 요소의 native 속성 가운데 Primitive 자신의 prop과 이름이 겹치는 것은 타입에서 빠지고 자신의 prop이 이깁니다. `<Inline as="td" align="start">`의 `align`은 td의 native `align`이 아니라 Inline의 `align`입니다. Text는 `as`를 주지 않아도 variant가 그리는 태그(`label`은 span, `heading`은 h2)의 타입으로 ref를 받습니다.

입력·포커스·보조 기술의 이벤트 처리는 React Aria에 위임하고, Paper가 공개 API와 상태 연결을 소유합니다.

[contract:primitives.aria.boundary]: #
React Aria는 `src/internal/aria` 밖으로 나오지 않습니다. 어댑터가 Paper의 이름(`disabled` · `cancelOnPointerExit` · `focusable` …)을 React Aria의 옵션으로 옮기고 Paper가 선언한 타입을 돌려주므로, 공개 옵션 · 결과 · 이벤트 타입은 모두 Paper의 것입니다. lint가 그 밖의 import를 막고, 번들한 d.ts에 `@react-aria` · `@react-types` · `@react-stately` 경로가 남으면 빌드가 실패합니다.

패키지 스타일은 CSS class로 적용하고 토큰을 inline style로 넘기지 않습니다. 실행 중에 정해지는 값만 runtime style을 씁니다: Draggable 이동 좌표, Grid track, Floating rank 변수, Floating 앵커 위치, Floating 원본 변수 운반, 호출자가 넘긴 style.

## Hook의 공통 계약

[contract:primitives.hooks.result-shape]: #
DOM에 닿는 hook은 `{ <부분>Props, ...상태 }` 한 꼴로 돌려줍니다. 부분의 props에는 그 hook이 쓰는 callback ref와 상태 attribute가 이미 들어 있어서 hook은 ref를 인자로 받지 않고, 소비자는 `{...pressProps}`처럼 펼치거나 `mergeProps`로 다른 hook의 props와 합칩니다. 상태만 다루는 hook(`useSelectableGroup` · `useFloating` · `useFloatingContext`)은 상태와 동작만 돌려주고 DOM을 모릅니다.

| Hook | 돌려주는 props | 상태 attribute |
| --- | --- | --- |
| usePressable | pressProps | data-active · data-disabled |
| useFocusRing | focusProps | data-focused · data-focus-visible |
| useSelectable | selectProps | role이 정하는 aria 속성 하나 · data-selected |
| useDrag | dragProps · handleProps | data-dragging · data-disabled |
| useDrop | dropProps | data-drop-target · data-disabled · aria-disabled |
| useRovingFocusItem | itemProps | data-roving-item(값은 항목의 value) |
| FormField | (wrapper) | data-disabled · data-invalid · data-required, 부분은 data-part |
| Floating.Content | (panel) | data-placement |

상태 attribute의 이름은 `tokens/state.ts` 한 곳에서만 쓰고, hook은 `stateAttributes`로 내보냅니다. 상태는 값이 있는 동안 `"true"`이고 없으면 attribute 자체가 없습니다. 눌리는 동안의 순간 상태는 `active`입니다. `pressed`는 선택을 알리는 `aria-pressed`만 뜻하므로 같은 요소에서 두 뜻이 겹치지 않습니다. hover는 CSS이고 attribute로 내보내지 않습니다.

이름도 한 규칙을 따릅니다. 입력에는 `is` · `should`를 붙이지 않고(`disabled` · `selected` · `flip` · `focusable` · `textInput` · `cancelOnPointerExit` · `closeOnInteractOutside`), 출력은 `is*`입니다(`isActive` · `isSelected` · `isOpen` · `isFocusVisible` · `isDragging` · `isDropTarget`). 제어 상태는 `x` · `defaultX` · `onXChange` 셋이 한 벌입니다. 공개 hook마다 `XOptions`와 `XResult`가 있고, `XState`는 children 함수가 받는 읽기 전용 스냅샷의 이름입니다. press · drop · drag · 포커스 이벤트의 타입(`PressEvent` · `DropEvent` · `TransferDragEvent` · `Placement` …)도 Paper가 선언해 `@studio-baeks/paper-ui`에서 내보냅니다.

## 테마 도구

하위 트리 하나의 테마는 Surface의 `theme` 축이 정합니다. `light` · `dark`는 고정이고 `inverse`는 주변의 반대라, 밝은 화면 위의 어두운 판이나 어두운 화면 위의 밝은 판을 만듭니다. 별도 노드 없이 그 Surface 자신에 걸리고, 판(canvas)이 늘 깔리며, Portal로 그려지는 Floating도 열린 자리의 테마를 유지합니다([Paint](paint.md#surface--면)). 앱 전체의 테마는 `PaperProvider`가 `<html data-pui-theme>`에 걸어 저장하고, `useTheme` · `useResolvedTheme`이 그것을 읽습니다. 저장과 부팅 스크립트, hook의 규칙은 [Theming](../get-started/theming.md)에 있습니다.

## 합성 도구

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

`mergeRefs(...refs)`는 callback ref와 object ref를 한 callback으로 모아 같은 DOM에 연결합니다. 해제될 때 callback ref는 null로 호출되고, cleanup을 돌려준 callback ref는 null 대신 그 cleanup이 실행됩니다.

[contract:primitives.composition.compose-handlers]: #
`composeEventHandlers(caller, internal)`은 caller와 내부 동작을 잇는 유일한 규칙입니다. caller가 먼저 실행되고, `defaultPrevented`를 가진 취소할 수 있는 이벤트에서 caller가 preventDefault했을 때만 internal을 건너뜁니다. PressEvent는 취소할 수 없는 알림이라 internal이 늘 뒤따릅니다 — Selectable의 `onPress`는 `onSelectedChange`보다 먼저 실행됩니다. Floating.Trigger와 Close의 `onPress`, RovingFocus.Item과 SelectableGroup.Item의 `onFocus` · `onKeyDown`이 모두 이 규칙을 씁니다. Focus 이벤트의 preventDefault는 브라우저의 실제 focus 이동을 취소하지 않습니다.

Disabled는 행동마다 책임이 다릅니다. Pressable·Selectable·SelectableGroup.Item은 native button을 비활성화합니다. Hook을 직접 쓰면 native disabled·접근성 이름·역할을 함께 연결합니다. `as`는 대상과 ref를 바꾸지만 의미론을 자동으로 만들지 않습니다.

## 패키지가 멈추는 곳

```text
Foundations → Primitives → Atoms
```

패키지는 배치를 조합하는 Primitive와 단일 역할의 Atom까지만 제공합니다. 페이지 헤더·표·메뉴 같은 더 큰 조합은 실제 제품에서 같은 요구가 반복되어 공통 API의 경계가 분명해질 때까지 앱이 소유합니다. 앱에서 의미 있는 HTML이 필요하면 `<Box as="section">`처럼 Primitive의 `as`를 쓰거나 앱의 markup을 직접 씁니다.

동작 예제는 Playground의 [Primitives](/playground/box) 목록에서 확인합니다.
