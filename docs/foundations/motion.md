# Motion

Motion은 값이 시간에 따라 어떻게 바뀌는지를 정하는 시스템입니다. 색이 바뀌는 속도, overlay가 떠오르는 곡선이 여기에 속합니다. 시간과 곡선만 갖는 [1차 시스템](README.md#1차와-2차)이고, 버튼이 눌려 내려앉는 거리처럼 길이가 드는 변위는 2차 Motion 변위가 더합니다.

조용한 밀도의 시스템이라 움직임도 짧고 차분합니다. hover는 거의 즉각, 상태 전이는 130ms, 떠오르는 overlay만 살짝 깁니다. 튀는 전이는 없습니다. 컴포넌트의 전이가 아니라 화면에 처음 들어오는 덩어리(제목 · 섹션 · 카드)만 `reveal`로 길게 — 700ms에 걸쳐 빠르게 떠서 길게 내려앉습니다.

## 원본

[contract:foundations.motion.source-table]: #

<!-- generated:motion-source -->
<!-- 이 블록은 생성됩니다 — pnpm docs:sync -->
| 축 | 값 |
| --- | --- |
| `duration` | `instant` 0ms · `reduced` 0.01ms · `fast` 100ms · `base` 130ms · `moderate` 200ms · `slow` 300ms · `scene` 700ms |
| `easing` | `linear` · `standard` (0.4, 0, 0.2, 1) · `decelerate` (0, 0, 0.2, 1) · `accelerate` (0.4, 0, 1, 1) · `overshoot` (0.22, 1, 0.36, 1) · `emphasized` (0.16, 1, 0.3, 1) |
| `loop` | `spin` 900ms linear · `pulse` 1400ms standard |
<!-- /generated:motion-source -->

`reduced`는 reduced-motion 환경에서 모든 전이에 거는 가장 작은 양수 duration입니다. `scene`은 장면의 시간이라 컴포넌트의 전이에는 쓰지 않고 `reveal`만 씁니다. `linear`는 반복 회전과 등속 진행에, `overshoot`은 떠오르는 overlay가 안착할 때, `emphasized`는 화면에 들어오는 덩어리가 처음에 거의 다 오고 남은 길을 길게 내려앉을 때 씁니다. `loop`는 전이와 별도인 반복입니다.

[contract:foundations.motion.easing-settles]: #
`overshoot`은 이름과 달리 목표를 지나치지 않습니다. 곡선의 y 값이 1을 넘지 않아, 빠르게 출발해 끝에서 부드럽게 멈춥니다. `emphasized`도 같습니다.

이 원본은 Motion의 파일 안에서만 읽습니다. 컴포넌트와 앱은 duration · easing · loop에 닿지 않고, 아래 역할을 고릅니다.

## 역할

[contract:foundations.motion.roles]: #
컴포넌트는 시간과 곡선을 따로 고르지 않고, 지금이 어떤 상황의 움직임인지(role)만 고릅니다. 역할은 아래 일곱이고, 각 역할을 쓰는 곳은 `MOTION_CONSUMERS`가 정합니다. 어휘는 `MOTION_ROLES`와 `MotionRole`로 나옵니다.

[contract:foundations.motion.role-table]: #

<!-- generated:motion-roles -->
<!-- 이 블록은 생성됩니다 — pnpm docs:sync -->
| 역할 | duration | easing | 변위 | 상황 | 쓰는 곳 |
| --- | --- | --- | --- | --- | --- |
| `press` | fast | standard | `stroke.border` 만큼 아래로 | 버튼을 누르는 순간 | Button · IconButton |
| `hover` | fast | standard | — | 포인터가 지나갈 때 바뀌는 hover tint·테두리·글자색 | Button · IconButton · Field · Select · Textarea · Surface |
| `state` | base | standard | — | 켜짐·선택처럼 머무는 상태, 면·배경의 전이, 스위치 손잡이 | Button · IconButton · Field · Select · Textarea · Checkbox · Radio · Switch · SegmentControl |
| `enter` | moderate | overshoot | `gap.xs` · scale 0.99 | 떠오르는 overlay | Floating |
| `exit` | fast | accelerate | — | 사라지는 overlay | Floating |
| `reveal` | scene | emphasized | `gap.lg` · 흐림 `gap.sm` | 화면에 처음 들어오는 덩어리 — 제목·섹션·카드 | 앱 화면 — `reveal` class |
| `theme` | instant | linear | — | 테마 전환 — 모드가 바뀌는 프레임에 모든 전이가 즉시 끝남 | PaperProvider · Surface |
<!-- /generated:motion-roles -->

[contract:foundations.motion.consumers]: #
"쓰는 곳"에 적힌 Atom은 실제로 그 역할로 전이합니다. `reveal`은 패키지에 쓰는 컴포넌트가 없습니다 — 컴포넌트는 등장하지 않고, 앱의 화면이 `reveal` class로 고릅니다. hover 반응에는 `hover`를, 켜진 채 머무는 상태와 면의 전이에는 `state`를 고릅니다. 한 요소가 둘을 함께 가질 수 있어서, Button은 hover tint(`--pui-state-tint`)와 테두리를 `hover`로, 배경색과 글자색을 `state`로, 눌림을 `press`로 전이합니다. 입력의 틀(Field · Select · Textarea)도 hover에 오르는 테두리를 `hover`로, 배경을 `state`로 전이합니다.

[contract:foundations.motion.no-focus-role]: #
포커스에는 역할이 없습니다. 포커스 링은 키보드가 닿는 자리를 알리는 신호라 지연 없이 나타나야 하므로, 아무것도 포커스에서 전이하지 않습니다.

[contract:foundations.motion.displacement]: #
변위는 길이라서 Motion이 갖지 않고, 2차인 `motion-recipes.ts`가 역할에 더하며 Shape·Layout의 역할을 가리킵니다. `press`의 변위는 `shape.stroke.border`, `enter`의 변위는 `layout.gap.xs`, `reveal`의 변위는 `layout.gap.lg`이고 흐림은 `layout.gap.sm`입니다. 모두 `var(--pui-…)` 참조라 원본을 덮은 하위 트리에서는 그 자리에서 다시 계산됩니다. `scale`은 길이가 아니어서 Motion의 값이고, `reveal`이 형제 사이에 두는 걸음은 시간이라 duration 사다리의 `fast`입니다.

## 조합

역할 위에 네 가지 조합이 있습니다.

[contract:foundations.motion.transition]: #
`transition(role, …속성)`은 속성마다 역할의 duration과 easing을 이어 붙인 transition 문자열입니다. `transition("hover", "color")`는 `color 100ms cubic-bezier(0.4, 0, 0.2, 1)`이고, 속성이 여럿이면 쉼표로 잇습니다. 한 요소의 속성이 서로 다른 역할을 따르면 `transition()`을 속성 묶음마다 불러 쉼표로 합칩니다. `/tokens`에서 `MOTION_CONSUMERS`와 함께 나옵니다.

[contract:foundations.motion.compositions]: #
`presence`는 면의 등장과 퇴장입니다. `presence.surface`는 `data-presence`가 `entering`이면 `enter` 역할로 떠오르며 나타나고(opacity와 변위·scale), `exiting`이면 `exit` 역할로 같은 변위만큼 가라앉으며 사라진 채 남습니다. `presence.scrim`은 같은 타이밍에 opacity만 바꿉니다. 속성을 다는 것은 Floating의 일입니다 — 열릴 때 panel(modal이면 scrim과 panel)에 `entering`을 달고, 닫히면 `exiting`을 달아 애니메이션이 끝날 때까지 mount해 둡니다([Float](../primitives/float.md#열고-닫는-움직임)).

[contract:foundations.motion.loops]: #
`loop`는 반복입니다. `loop.spin`은 900ms linear로 돌고, `loop.pulse`는 1400ms standard로 맥박칩니다. Spinner와 버튼의 로딩 표식(같은 Spinner입니다)은 `loop.spin`을 합성하며, 각자 keyframe을 갖지 않습니다.

[contract:foundations.motion.reveal]: #
`reveal`은 화면에 처음 들어오는 덩어리입니다. 제자리보다 `gap.lg` 아래에서, `gap.sm`만큼 흐린 채, 투명하게 시작해 `reveal` 역할(`scene` 700ms · `emphasized`)로 제자리에 섭니다. `reveal.load`는 마운트될 때 한 번, `reveal.scroll`은 요소가 화면에 들어오기 시작해 다 들어올 때까지 그 요소의 view timeline을 따라 풀립니다. 함께 들어오는 형제는 `revealAfter[n]`으로 n 걸음(`fast` 100ms씩) 늦게 시작합니다. 두 형태 모두 움직임을 줄이지 않은 환경(`prefers-reduced-motion: no-preference`)에서만 움직이고, `reveal.scroll`은 view timeline이 있는 브라우저에서만 움직입니다. 그 밖에서는 처음부터 제자리에 지연 없이 섭니다. 지연을 주는 `revealAfter`가 이기도록 `reveal`은 `animation` 단축 속성을 쓰지 않습니다.

[contract:foundations.motion.class-maps-in-root]: #
`presence` · `loop` · `reveal` · `revealAfter`는 class 지도라 `/tokens`가 아니라 컴포넌트 entry(`@studio-baeks/paper-ui`)에서 나옵니다. keyframe은 `styles/motion.css.ts` 한 곳에만 있습니다.

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

## 앱에서

앱도 시간과 곡선을 숫자로 쓰지 않습니다. 전이는 `transition(role, …속성)`으로, 면의 등장과 반복은 `presence` · `loop` class로, 화면에 처음 들어오는 덩어리는 `reveal` · `revealAfter` class로 고르고, 앱 stylesheet의 `transition` · `animation`에 `130ms`나 `cubic-bezier(…)`를 적으면 `paper/source-numbers`가 막습니다. 새 움직임이 필요하면 역할을 더하는 일이지 앱의 값을 더하는 일이 아닙니다.

## Reduced motion

[contract:foundations.motion.reduced]: #
`prefers-reduced-motion: reduce`에서는 모든 transition과 유한한 animation이 즉시 끝납니다. `reveal`은 이 정책을 기다리지 않고 아예 재생되지 않아, 지연 없이 처음부터 제자리에 섭니다. `::before`와 `::after`도 같은 규칙을 받아 스위치 손잡이도 미끄러지지 않고 건너뜁니다. 컴포넌트가 따로 처리할 것은 없습니다. Floating은 퇴장도 한 순간에 끝나므로 닫는 즉시 내려갑니다.

[contract:foundations.motion.reduced-loops]: #
반복은 멈추지 않고 정해진 맥박으로 바뀝니다. `loop.spin`은 회전 대신 `loop.pulse`(opacity 1 → 0.25 → 1)로 진행 중임을 알립니다. 화면을 가로질러 도는 움직임만 걷어내고 기다리는 중이라는 신호는 남깁니다. 진행 상태는 움직임에만 기대지 않도록 Spinner가 `role="progressbar"`와 레이블로도 전달합니다.

[contract:foundations.motion.reduced-layers]: #
이 정책은 레이어에서 갈립니다. `presence`와 `loop`는 `pui.utilities`에, 모든 요소에 거는 즉시 끝내기 규칙은 `pui.components`에 있습니다. 반복의 reduced 형태와 즉시 끝내기 규칙은 둘 다 `!important`이고, `!important`는 레이어 순서가 뒤집혀 앞선 레이어가 이기므로 반복의 맥박이 즉시 끝내기 규칙에 지지 않습니다. `presence`는 `!important`가 아니라서 즉시 끝내기 규칙에 지고 바로 끝납니다. 앱의 `!important`는 두 규칙 모두에 집니다.

Playground [Motion](/playground/foundations/motion)에서 원본, 역할의 실제 견본, 조합을 볼 수 있습니다. 견본은 역할을 쓰는 실제 컴포넌트와 `presence`·`loop` class입니다.
