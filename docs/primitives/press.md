# Press

Press Primitive는 누르기를 맡는 2차 primitive입니다. 마우스 · 터치 · 키보드 · 보조 기술의 입력을 press 이벤트 하나로 통합하고 native button의 의미론을 지킵니다. 색과 크기는 고르지 않고, 상태를 `data-*` 속성과 children 함수로 노출해 소비자가 스타일을 붙이게 합니다. 입력 정규화는 React Aria에 위임하고, Paper가 공개 API와 상태 연결을 소유합니다.

| 컴포넌트 | Hook | 책임 | 기본값 |
| --- | --- | --- | --- |
| Pressable | usePressable | onPress lifecycle, disabled, native button props | native button, type=button. pressed / focus-visible 상태 |

## Press

[contract:primitives.pressable.input-paths]: #
Pressable은 onPress·onPressStart·onPressEnd·onPressUp·onPressChange와 disabled를 받습니다. usePressable은 같은 옵션과 선택적인 ref를 받아 pressProps·isPressed를 반환합니다. Press 이벤트는 마우스·터치·키보드·보조 기술의 입력을 공통 계약으로 전달합니다. Bare button은 Paper의 색·크기·variant를 선택하지 않습니다.

Pressable의 children 함수는 isPressed·isFocused·isFocusVisible·isDisabled를 받습니다. 상태는 data-pressed·data-focused·data-focus-visible에도 반영합니다. 소비 앱은 data 속성에 연결된 class 스타일을 작성합니다. hover는 상태로 노출하지 않습니다 — hover 색은 CSS의 몫이고, 눌리는 자리에 색을 입히는 [Paint](paint.md#paint--accent--variant)의 `hoverable`이 그립니다.

직접 구현한 button에 press 행동을 연결하는 예시입니다.

```tsx
const ref = useRef<HTMLButtonElement>(null);
const { pressProps, isPressed } = usePressable({ onPress: save }, ref);

return <button {...pressProps} ref={ref} type="button" data-pressed={isPressed || undefined}>저장</button>;
```

Hook에는 native button의 의미론과 attribute 기본값이 포함되지 않습니다. 직접 조립하는 소비자가 native 태그·type·label을 연결합니다.
