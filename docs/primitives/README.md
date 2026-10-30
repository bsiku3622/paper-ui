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
| Paint | 2차 | Surface · Paint | — (class 함수 surfaceClass · paintClass) | [Paint](paint.md) |
| Press | 2차 | Pressable | usePressable | [Press](press.md) |
| Select | 2차 | Selectable · SelectableGroup | useSelectable · useSelectableGroup | [Select](select.md) |
| Float | 2차 | Floating | useFloating | [Float](float.md) |
| Drag | 2차 | Draggable · Droppable | useDrag · useDrop | [Drag](drag.md) |
| Focus | 2차 | RovingFocus | useRovingFocusItem | [Focus](focus.md) |
| Field | 2차 | FormField | useField | [Field](field.md) |
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

입력·포커스·보조 기술의 이벤트 처리는 React Aria에 위임하고, Paper가 공개 API와 상태 연결을 소유합니다. 패키지 스타일은 CSS class로 적용하고 토큰을 inline style로 넘기지 않습니다. 실행 중에 정해지는 값만 runtime style을 씁니다: Draggable 이동 좌표, Grid track, Floating 층 깊이 변수, Floating 앵커 위치, Floating 원본 변수 운반, 호출자가 넘긴 style.

## 테마 도구

하위 트리 하나의 테마는 Surface의 `theme` 축이 정합니다. `light` · `dark`는 고정이고 `inverse`는 주변의 반대라, 밝은 화면 위의 어두운 판이나 어두운 화면 위의 밝은 판을 만듭니다. 별도 노드 없이 그 Surface 자신에 걸리고, 판(canvas)이 늘 깔리며, Portal로 그려지는 Floating도 열린 자리의 테마를 유지합니다([Paint](paint.md#surface--면)). 앱 전체의 테마는 `PaperProvider`가 `<html data-pui-theme>`에 걸어 저장하고, `useTheme` · `useResolvedTheme`이 그것을 읽습니다. 저장과 부팅 스크립트, hook의 규칙은 [Theming](../get-started/theming.md)에 있습니다.

## 합성 도구

mergeProps·mergeRefs·composeEventHandlers는 위 열한 분류와 함께 사용하는 합성 도구입니다. MergeProps는 이벤트를 전달 순서대로 모두 실행하고 className을 합칩니다. 일반 속성은 뒤쪽 값이 우선하며 style을 깊게 병합하지 않습니다. 한 handler의 preventDefault가 뒤 handler 실행을 막는 계약도 아닙니다. Ref는 mergeRefs로 같은 DOM에 연결합니다.

여러 행동을 native button에 합성하는 예시입니다.

```tsx
<Box as="button" type="button"
  {...mergeProps(pressProps, focusProps)}
  ref={mergeRefs(localRef, forwardedRef)}>
  실행
</Box>
```

composeEventHandlers(caller, internal)은 caller 실행 뒤 defaultPrevented=false일 때만 internal을 실행합니다. RovingFocus.Item의 onKeyDown은 이 계약을 사용해 탐색을 대체하도록 합니다. Focus 이벤트의 preventDefault는 브라우저의 실제 focus 이동을 취소하지 않습니다. React Aria PressEvent에도 DOM 이벤트와 동일한 취소 계약을 가정하지 않습니다.

Disabled는 행동마다 책임이 다릅니다. Pressable·Selectable·SelectableGroup.Item은 native button을 비활성화합니다. Hook을 직접 쓰면 native disabled·접근성 이름·역할을 함께 연결합니다. `as`는 대상과 ref를 바꾸지만 의미론을 자동으로 만들지 않습니다.

## 패키지가 멈추는 곳

```text
Foundations → Primitives → Atoms
```

패키지는 배치를 조합하는 Primitive와 단일 역할의 Atom까지만 제공합니다. 페이지 헤더·표·메뉴 같은 더 큰 조합은 실제 제품에서 같은 요구가 반복되어 공통 API의 경계가 분명해질 때까지 앱이 소유합니다. 앱에서 의미 있는 HTML이 필요하면 `<Box as="section">`처럼 Primitive의 `as`를 쓰거나 앱의 markup을 직접 씁니다.

동작 예제는 Playground의 [Primitives](/playground/box) 목록에서 확인합니다.
