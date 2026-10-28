# Overview

Primitive는 Foundations의 값을 화면 구조로 옮기는 첫 컴포넌트입니다. 면과 배치, 글자와 아이콘, 입력 행동, 접근성 관계를 의견 없이 제공하고, Atom과 앱 화면은 이 위에서 조합합니다. 컴포넌트와 hook은 `@studio-baeks/paper-ui`에서, Foundations 값과 어휘(`tokens` · `Space` · `ControlSize` …)는 `@studio-baeks/paper-ui/tokens`에서 import합니다.

| 분류 | 컴포넌트 | Hook | 문서 |
| --- | --- | --- | --- |
| Layout | Box · Stack · Inline · Grid | — | [Layout](layout.md) |
| Content | Text · Icon | — | [Content](content.md) |
| Interaction | Pressable · Hoverable · Toggleable · Draggable · Droppable · ToggleGroup · Overlay | usePress · useHover · useToggle · useDrag · useDrop · useToggleGroup · useOverlay | [Interaction](interaction.md) |
| A11y | FocusScope · VisuallyHidden · RovingFocus · FormField | useFocusRing · useFocusWithin · useRovingFocusItem · useField | [A11y](a11y.md) |

`Draggable.Handle`은 Draggable의 anatomy라 따로 세지 않고, `mergeProps` · `mergeRefs` · `composeEventHandlers`는 컴포넌트가 아닌 합성 도구입니다. 합계 17개입니다.

## 공통 계약

Box · Stack · Inline · Grid · Text · Hoverable은 `as`로 렌더 대상을 고르고, native props와 ref를 같은 요소로 전달합니다. Icon도 SVG ref와 native SVG props를 전달합니다. Pressable · Toggleable · Draggable.Handle은 native button(`type="button"`)을, Draggable과 Droppable은 div를 렌더링합니다. 어느 것도 중첩 wrapper를 더하지 않습니다.

`as`는 대상과 ref를 바꿀 뿐 의미론을 만들지 않습니다. 아래 예시는 Hoverable을 기존 Box에 합성합니다.

```tsx
<Hoverable as={Box} border radius="md" padding="md">
  {({ isHovered }) => isHovered ? "Hover 중" : "포인터를 올려보세요"}
</Hoverable>
```

Hoverable은 button 역할이나 Tab 정지를 자동으로 붙이지 않습니다. 행동의 의미에 맞는 native 요소와 접근성 이름은 쓰는 쪽이 고릅니다.

입력·포커스·보조 기술의 이벤트 처리는 React Aria에 위임하고, Paper가 공개 API와 상태 연결을 소유합니다. 패키지 스타일은 CSS class로 적용합니다. Grid track이나 드래그 좌표처럼 실행 중에 정해지는 값만 runtime style을 씁니다.

## 테마 도구

`PaperProvider`는 앱 전체의 테마(light · dark · system)를 `<html data-theme>`에 걸고, 고른 테마를 저장합니다. `ThemeScope`는 하위 트리 하나에 테마를 겁니다. `theme="inverse"`는 주변의 반대라, 밝은 화면 위의 어두운 판이나 어두운 화면 위의 밝은 판을 만듭니다. ThemeScope는 `display: contents`라 배치에 영향이 없고, Portal로 그려지는 Overlay도 열린 자리의 테마를 유지합니다. Box의 `inverse`는 같은 일을 별도 노드 없이 그 Box 자신에 합니다.

## 패키지가 멈추는 곳

```text
Foundations → Primitives → Atoms
```

패키지는 배치를 조합하는 Primitive와 단일 역할의 Atom까지만 제공합니다. 페이지 헤더·표·메뉴 같은 더 큰 조합은 실제 제품에서 같은 요구가 반복되어 공통 API의 경계가 분명해질 때까지 앱이 소유합니다. 앱에서 의미 있는 HTML이 필요하면 `<Box as="section">`처럼 Primitive의 `as`를 쓰거나 앱의 markup을 직접 씁니다.

동작 예제는 Playground의 [Primitives](/playground/box) 목록에서 확인합니다.
