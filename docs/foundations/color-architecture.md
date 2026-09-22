# Color architecture

색은 하나의 큰 객체가 아니라, 역할이 다른 네 층을 순서대로 통과합니다. 이 구조는 Studio UI의 palette → slot curve → semantic token 방식을 Paper UI의 surface·content·status 어휘에 맞춘 것입니다.

```
L0 palette identity       palette.ts
        ↓ hue · 기준 chroma
L1 calibrated ladder      color-ladder.ts
        ↓ theme별 tone step
L2 semantic token         colors.ts
        ↓ 화면 역할
L3 CSS variable reference tokens/index.ts + theme.css.ts
        ↓
component / resolver / app
```

각 레이어는 바로 아래 레이어만 압니다. 컴포넌트가 `blue[600]`처럼 색상이나 tone step을 직접 고르면, 색을 보정할 때 사용처마다 다른 파랑이 남습니다. 화면은 `tokens.color.status.info.ink`처럼 **의미와 역할**만 고릅니다.

## L0 — Palette identity

`tokens/palette.ts`는 zinc·blue·green·amber·red의 기준 chroma와 light/dark별 calibrated hue를 가진 registry입니다. 다크에서 같은 hue가 눈에 같은 색감으로 읽히지 않으므로, 이를 하나의 각도로 평탄화하지 않습니다. 이것은 public color API도, CSS 변수도 아닙니다. 새 색 family를 추가할 때 먼저 이곳에 색의 정체성을 선언하고, 다음 ladder에서 양 테마의 실제 곡선을 잡습니다.

`info`, `success`, `warning`, `error`는 hue 이름이 아니라 semantic 이름입니다. 현재는 아래처럼 palette에 연결됩니다.

| status | palette | 쓰임 |
|---|---|---|
| `info` | `blue` | 정보·focus·link |
| `success` | `green` | 성공 |
| `warning` | `amber` | 주의 |
| `error` | `red` | 위험 |

이 map 덕분에 warning의 pigment를 조정하거나 새 palette를 열어도 Field·Badge·Banner의 API와 resolver는 바뀌지 않습니다.

## L1 — Calibrated ladder

`tokens/color-ladder.ts`는 실제 색값의 유일한 자리입니다. neutral ladder는 surface·content·border·primary action을, accent ladder는 각 palette의 `50 / 100 / 200 / 400 / 600 / 700` 역할을 제공합니다.

| accent step | 역할 |
|---|---|
| `50` | `wash` — 가장 가벼운 pigment, solid 위 글자 |
| `100` | `soft` — 가벼운 색면 |
| `200` | `edge` — hairline·보조 경계 |
| `400` | `edgeStrong` — 단독 outline 경계 |
| `600` | `solid`·`mutedInk` — 의미 면·절제된 글자 |
| `700` | `ink`·`softInk` — 지면 위 일반 글자 |

Ladder는 palette의 hue를 기준으로 하되, 모든 색에 같은 숫자 ramp를 기계적으로 적용하지 않습니다. green·amber처럼 본래 밝기가 높은 색은 같은 step이라도 가독성과 화면 무게가 맞도록 별도 L/C 곡선을 가집니다. light와 dark도 값의 순서가 아니라 **같은 UI 역할**을 공유합니다.

## L2 — Semantic token

`tokens/colors.ts`는 ladder의 번호를 화면 역할로 번역합니다. 이 파일부터 hue와 step 번호가 사라집니다.

| token family | 대표 경로 | 책임 |
|---|---|---|
| surface | `color.surface.raised` | Box의 깊이 — raised/canvas/sunken/well |
| content | `color.content.primary` | 본문·보조·placeholder 글자 위계 |
| border | `color.border.base` | 구조선·강한 선·form hover 선 |
| action | `color.action.primary.base` | 검정 primary action |
| status | `color.status.error.ink` | 의미색 면·글자·경계 |
| interaction | `color.interaction.hover` | neutral hover/selected/active overlay |
| focus | `color.focus.ring` | 키보드 focus ring |

`soft`와 `softMuted`의 차이는 이름만 바뀌는 채도 효과가 아닙니다. normal은 `soft` 면과 700 `ink`를, muted는 더 옅은 `wash` 면과 600 `mutedInk`를 사용합니다. 그래서 색이 들어간 UI에서도 muted가 실제로 한 단계 물러납니다. outlineMuted는 strong border를 유지하고 글자만 muted로 낮춥니다 — 형태가 사라지지 않는 것이 우선이기 때문입니다.

## L3 — CSS variable와 소비

`theme.css.ts`는 L2의 light/dark semantic tree를 같은 CSS variable 이름으로 emit합니다. `tokens` 객체는 그 변수의 `var(...)` 참조 tree입니다.

```ts
tokens.color.content.primary
tokens.color.action.primary.base
tokens.color.status.error.edgeStrong
```

컴포넌트는 위 참조 또는 resolver의 `color`·`variant` API만 사용합니다. palette와 ladder의 raw 값은 component·resolver·app에서 import할 수 없게 lint가 막습니다.

## 색을 바꿀 때의 경로

1. 색 family 자체가 달라졌다면 `palette.ts`에서 identity를 조정합니다.
2. 실제 light/dark tone 또는 대비가 문제면 `color-ladder.ts`의 해당 step을 보정합니다.
3. 역할 배치가 잘못됐다면 `colors.ts`에서 semantic mapping을 바꿉니다.
4. component마다 값을 덮어쓰지 않고, Playground Tokens에서 light/dark와 shared variant를 함께 확인합니다.

이 순서를 지키면 “warning만 너무 시트러스하다”와 “모든 form hover가 너무 진하다”가 서로 다른 레이어의 문제로 분리됩니다.
