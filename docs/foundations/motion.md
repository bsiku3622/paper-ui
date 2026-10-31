# Motion

Motion은 위 네 시스템의 값이 시간에 따라 어떻게 바뀌는지를 정하는 시스템입니다. 색이 바뀌는 속도, 버튼이 눌려 내려앉는 거리, overlay가 떠오르는 곡선이 여기에 속합니다. 자기 값이 거의 없고 다른 시스템의 변화를 다루므로 가장 마지막 층에 있습니다.

조용한 밀도의 시스템이라 움직임도 짧고 차분합니다. hover는 거의 즉각, 상태 전이는 130ms, 떠오르는 overlay만 살짝 깁니다. 튀는 전이는 없습니다.

## 원본

| 축 | 값 |
|---|---|
| `duration` | `instant` 0ms · `reduced` 0.01ms · `fast` 100ms · `base` 130ms · `moderate` 200ms · `slow` 300ms |
| `easing` | `linear` · `standard` (0.4, 0, 0.2, 1) · `decelerate` (0, 0, 0.2, 1) · `accelerate` (0.4, 0, 1, 1) · `overshoot` (0.22, 1, 0.36, 1) |
| `loop` | `spin` 900ms linear · `pulse` 1400ms standard |

`reduced`는 reduced-motion 환경에서 모든 전이에 거는 가장 작은 양수 duration입니다. `linear`는 반복 회전과 등속 진행에, `overshoot`은 떠오르는 overlay가 살짝 튀어 안착할 때 씁니다. `loop`는 전이와 별도인 반복입니다.

이 원본은 Motion의 파일 안에서만 읽습니다. 컴포넌트와 앱은 duration · easing · loop에 닿지 않고, 아래 역할을 고릅니다.

## 역할

[contract:foundations.motion.roles]: #
컴포넌트는 시간과 곡선을 따로 고르지 않고, 지금이 어떤 상황의 움직임인지(role)만 고릅니다. 역할은 아래 여섯이고, 각 역할을 쓰는 곳은 `MOTION_CONSUMERS`가 정합니다. 어휘는 `MOTION_ROLES`와 `MotionRole`로 나옵니다.

| 역할 | duration | easing | 변위 | 상황 | 쓰는 곳 |
|---|---|---|---|---|---|
| `press` | fast | standard | `stroke.border` 만큼 아래로 | 버튼을 누르는 순간 | Button · IconButton |
| `hover` | fast | standard | — | 포인터가 지나갈 때 바뀌는 테두리·글자색 | Button · IconButton · Field |
| `state` | base | standard | — | 켜짐·선택처럼 머무는 상태, 면·배경의 전이, 스위치 손잡이 | Button · IconButton · Field · Select · Textarea · Checkbox · Radio · Switch |
| `enter` | moderate | overshoot | `gap.xs` · scale 0.99 | 떠오르는 overlay | Floating |
| `exit` | fast | accelerate | — | 사라지는 overlay | Floating |
| `theme` | instant | linear | — | 테마 전환 — 모드가 바뀌는 프레임에 모든 전이가 즉시 끝남 | PaperProvider · Surface |

[contract:foundations.motion.consumers]: #
"쓰는 곳"에 적힌 Atom은 실제로 그 역할로 전이합니다. hover 반응에는 `hover`를, 켜진 채 머무는 상태와 면의 전이에는 `state`를 고릅니다. 한 요소가 둘을 함께 가질 수 있어서, Button은 테두리를 `hover`로, 배경과 글자색을 `state`로, 눌림을 `press`로 전이합니다.

포커스에는 역할이 없습니다. 포커스 링은 키보드가 닿는 자리를 알리는 신호라 지연 없이 나타나야 하므로, 아무것도 포커스에서 전이하지 않습니다.

[contract:foundations.motion.displacement]: #
변위는 길이라서 Motion이 갖지 않고 Shape·Layout의 역할을 가리킵니다. `press`의 변위는 `shape.stroke.border`, `enter`의 변위는 `layout.gap.xs`이고, 둘 다 `var(--pui-…)` 참조라 원본을 덮은 하위 트리에서는 그 자리에서 다시 계산됩니다. `scale`은 길이가 아니어서 Motion의 값입니다.

## 조합

역할 위에 세 가지 조합이 있습니다.

[contract:foundations.motion.transition]: #
`transition(role, …속성)`은 속성마다 역할의 duration과 easing을 이어 붙인 transition 문자열입니다. `transition("hover", "color")`는 `color 100ms cubic-bezier(0.4, 0, 0.2, 1)`이고, 속성이 여럿이면 쉼표로 잇습니다. 한 요소의 속성이 서로 다른 역할을 따르면 `transition()`을 속성 묶음마다 불러 쉼표로 합칩니다. `/tokens`에서 `MOTION_CONSUMERS`와 함께 나옵니다.

[contract:foundations.motion.compositions]: #
`presence`는 면의 등장과 퇴장입니다. `presence.surface`는 `data-presence`가 `entering`이면 `enter` 역할로 떠오르며 나타나고(opacity와 변위·scale), `exiting`이면 `exit` 역할로 같은 변위만큼 가라앉으며 사라진 채 남습니다. `presence.scrim`은 같은 타이밍에 opacity만 바꿉니다. 속성을 다는 것은 Floating의 일입니다 — 열릴 때 panel(modal이면 scrim과 panel)에 `entering`을 달고, 닫히면 `exiting`을 달아 애니메이션이 끝날 때까지 mount해 둡니다([Float](../primitives/float.md#열고-닫는-움직임)).

`loop`는 반복입니다. `loop.spin`은 900ms linear로 돌고, `loop.pulse`는 1400ms standard로 맥박칩니다. Spinner와 버튼의 로딩 표식은 `loop.spin`을 합성하며, 각자 keyframe을 갖지 않습니다.

`presence`와 `loop`는 class 지도라 `/tokens`가 아니라 컴포넌트 entry(`@studio-baeks/paper-ui`)에서 나옵니다. keyframe은 `styles/motion.css.ts` 한 곳에만 있습니다.

## 다른 시스템과 다른 점

[contract:foundations.motion.public-tree]: #
Motion은 CSS 변수로 굽지 않습니다. duration과 easing은 transition 문자열로 조립되는 값이라 한 변수로 줄여 쓰기 어렵고, 빌드 때 조립하는 편이 맞기 때문입니다. 그래서 `tokens.motion`은 `role` 하나이고, 역할이 시간과 곡선을 값으로 듭니다. 변위만은 예외가 아니라 Shape·Layout 변수의 참조입니다. `tokens.motion.duration`처럼 원본을 직접 읽는 경로는 없습니다.

stylesheet는 `transition()`으로 전이 문자열을 조립합니다. 아래 예시는 배경과 테두리 색이 `state` 역할의 시간과 곡선으로 바뀌게 합니다.

```ts
import { style } from "@vanilla-extract/css";
import { tokens, transition } from "@studio-baeks/paper-ui/tokens";

export const row = style({
  transition: transition("state", "background", "border-color"),
  selectors: { "&:active": { transform: `translateY(${tokens.motion.role.press.offset})` } },
});
```

`transition("state", "background", "border-color")`는 `background 130ms cubic-bezier(0.4, 0, 0.2, 1), border-color 130ms …`가 됩니다.

## Reduced motion

[contract:foundations.motion.reduced]: #
`prefers-reduced-motion: reduce`에서는 모든 transition과 유한한 animation이 즉시 끝납니다. `::before`와 `::after`도 같은 규칙을 받아 스위치 손잡이도 미끄러지지 않고 건너뜁니다. 컴포넌트가 따로 처리할 것은 없습니다. Floating은 퇴장도 한 순간에 끝나므로 닫는 즉시 내려갑니다.

반복은 멈추지 않고 정해진 맥박으로 바뀝니다. `loop.spin`은 회전 대신 `loop.pulse`(opacity 1 → 0.25 → 1)로 진행 중임을 알립니다. 화면을 가로질러 도는 움직임만 걷어내고 기다리는 중이라는 신호는 남깁니다. 진행 상태는 움직임에만 기대지 않도록 Spinner가 `role="status"`와 레이블로도 전달합니다.

이 정책은 레이어에서 갈립니다. `presence`와 `loop`는 `pui.utilities`에, 모든 요소에 거는 즉시 끝내기 규칙은 `pui.components`에 있습니다. 반복의 reduced 형태와 즉시 끝내기 규칙은 둘 다 `!important`이고, `!important`는 레이어 순서가 뒤집혀 앞선 레이어가 이기므로 반복의 맥박이 즉시 끝내기 규칙에 지지 않습니다. `presence`는 `!important`가 아니라서 즉시 끝내기 규칙에 지고 바로 끝납니다. 앱의 `!important`는 두 규칙 모두에 집니다.

Playground [Motion](/playground/foundations/motion)에서 원본, 역할의 실제 견본, 조합을 볼 수 있습니다. 견본은 역할을 쓰는 실제 컴포넌트와 `presence`·`loop` class입니다.
