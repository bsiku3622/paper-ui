# Motion

Motion은 위 네 시스템의 값이 시간에 따라 어떻게 바뀌는지를 정하는 시스템입니다. 색이 바뀌는 속도, 버튼이 눌려 내려앉는 거리, overlay가 떠오르는 곡선이 여기에 속합니다. 자기 값이 거의 없고 다른 시스템의 변화를 다루므로 가장 마지막 층에 있습니다.

조용한 밀도의 시스템이라 움직임도 짧고 차분합니다. hover는 거의 즉각, 상태 전이는 130ms, 떠오르는 overlay만 살짝 깁니다. 튀는 전이는 없습니다.

## 원본

| 축 | 값 |
|---|---|
| `duration` | `instant` 0ms · `reduced` 0.01ms · `fast` 100ms · `base` 130ms · `moderate` 200ms · `slow` 300ms |
| `easing` | `linear` · `standard` (0.4, 0, 0.2, 1) · `decelerate` (0, 0, 0.2, 1) · `accelerate` (0.4, 0, 1, 1) · `overshoot` (0.22, 1, 0.36, 1) |
| `loop` | `spin` 900ms · `pulse` 1400ms |

`reduced`는 reduced-motion 환경에서 모든 전이에 거는 가장 작은 양수 duration입니다. `linear`는 반복 회전과 등속 진행에, `overshoot`은 떠오르는 overlay가 살짝 튀어 안착할 때 씁니다. `loop`는 전이와 별도인 반복 주기입니다.

## 역할

컴포넌트는 시간과 곡선을 따로 고르지 않고, 지금이 어떤 상황의 움직임인지(role)만 고릅니다.

| 역할 | duration | easing | 변위 | 쓰는 곳 |
|---|---|---|---|---|
| `press` | fast | standard | 1px 아래로 | 버튼을 누르는 순간 |
| `hover` | fast | standard | — | 면·글자색의 짧은 반응, 표 행 배경 |
| `focus` | fast | standard | — | 포커스 표시 |
| `state` | base | standard | — | background·color·border 상태 전이, 스위치 손잡이 |
| `enter` | moderate | overshoot | 6px · scale 0.99 | 떠오르는 overlay |
| `exit` | fast | accelerate | — | 사라지는 overlay |
| `theme` | instant | linear | — | 테마 전환 — 모드가 바뀌는 프레임에 모든 전이가 즉시 끝남 |

## 다른 시스템과 다른 점

Motion은 CSS 변수로 굽지 않습니다. duration·easing·변위 세 값을 한 변수로 줄여 쓰기 어렵고, transition 문자열은 빌드 때 조립하는 편이 맞기 때문입니다. 그래서 `tokens.motion`은 변수 참조가 아니라 값을 직접 듭니다.

stylesheet는 `stateTransition()`으로 상태 전이 문자열을 조립합니다. 아래 예시는 배경과 테두리 색이 `state` 역할의 시간과 곡선으로 바뀌게 합니다.

```ts
import { style } from "@vanilla-extract/css";
import { stateTransition, tokens } from "@studio-baeks/paper-ui/tokens";

export const row = style({
  transition: stateTransition("background", "border-color"),
  selectors: { "&:active": { transform: `translateY(${tokens.motion.role.press.offset})` } },
});
```

`stateTransition("background", "border-color")`는 `background 130ms cubic-bezier(0.4, 0, 0.2, 1), border-color 130ms …`가 됩니다.

## Reduced motion

`prefers-reduced-motion: reduce`에서는 전역 규칙이 모든 transition과 animation의 duration을 `reduced`로 바꿉니다. 컴포넌트가 따로 처리하지 않아도 움직임이 즉시 끝납니다. Spinner처럼 회전이 의미를 전달하는 표식도 같은 규칙을 따르므로, 진행 상태는 움직임이 아니라 `role="status"`와 레이블로도 전달합니다.

Playground [Motion](/playground/foundations/motion)에서 각 duration과 곡선을 포인터로 움직여 볼 수 있습니다.
