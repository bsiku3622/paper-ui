# Press

Press Primitive는 누르기를 맡는 2차 primitive입니다. 마우스 · 터치 · 키보드 · 보조 기술의 입력을 press 이벤트 하나로 통합하고 native button의 의미론을 지킵니다. 색과 크기는 고르지 않고, 상태를 `data-*` 속성과 children 함수로 노출해 소비자가 스타일을 붙이게 합니다. 입력 정규화는 React Aria에 위임하고, Paper가 공개 API와 상태 연결을 소유합니다(옵션 · 이벤트 타입 · 결과 모두 Paper가 선언합니다).

| 컴포넌트 | Hook | 책임 | 기본값 |
| --- | --- | --- | --- |
| Pressable | usePressable | onPress lifecycle, disabled, native button props | native button, type=button. active / focus-visible 상태 |

## Press

[contract:primitives.pressable.input-paths]: #
Pressable은 onPress·onPressStart·onPressEnd·onPressUp·onPressChange와 disabled를 받고, 그 밖에 preventFocusOnPress · cancelOnPointerExit · allowTextSelection을 고를 수 있습니다. usePressable은 같은 옵션만 받고(ref 인자는 없습니다) pressProps·isActive를 반환합니다. Press 이벤트(`PressEvent`)는 마우스·터치·키보드·보조 기술의 입력을 공통 계약으로 전달하고, 한 요소가 처리하면 부모로 올라가지 않습니다 — 받지 않으려면 `continuePropagation()`을 부릅니다. 마우스·터치로 누른 요소는 누름이 끝날 때 focus를 받습니다(Safari는 눌린 button에 focus를 주지 않으므로 Paper가 맞춥니다). `preventFocusOnPress`가 이를 끕니다. Bare button은 Paper의 색·크기·variant를 선택하지 않습니다.

Pressable의 children 함수는 isActive·isFocused·isFocusVisible·isDisabled를 받습니다. 상태는 data-active·data-focused·data-focus-visible·data-disabled에도 반영합니다. 눌리는 동안의 순간 상태는 `active`라고 부릅니다 — `pressed`는 선택을 알리는 aria-pressed만 뜻합니다. 소비 앱은 data 속성에 연결된 class 스타일을 작성합니다. hover는 상태로 노출하지 않습니다 — hover 색은 CSS의 몫이고, 눌리는 자리에 색을 입히는 [Paint](paint.md#paint--accent--variant)의 `hoverable`이 그립니다.

[contract:primitives.pressable.one-click]: #
press 한 번은 입력과 플랫폼에 상관없이 대상의 click 한 번입니다. React Aria는 자신이 처리하는 키에서 브라우저의 click을 막습니다. `type=button`의 Space와 Mac이 아닌 플랫폼의 Enter가 그렇습니다. Pressable은 이렇게 막힌 click과, 키 활성화가 없는 요소가 받지 못하는 click을 대신 냅니다. 그래서 대상의 `onClick`은 마우스 · 터치 · 키보드 · 보조 기술 어느 입력에서나 한 번 실행됩니다. submit 버튼과 링크의 click은 브라우저가 내므로 겹치지 않습니다.

직접 구현한 button에 press 행동을 연결하는 예시입니다. pressProps에 ref와 상태 attribute가 들어 있어 따로 쓰지 않습니다.

```tsx
const { pressProps, isActive } = usePressable({ onPress: save });

return <button {...pressProps} type="button">{isActive ? "저장 중…" : "저장"}</button>;
```

Hook에는 native button의 의미론과 attribute 기본값이 포함되지 않습니다. 직접 조립하는 소비자가 native 태그·type·label을 연결합니다. 다른 hook의 props와는 `mergeProps`로 합칩니다([합성 도구](README.md#합성-도구)).
