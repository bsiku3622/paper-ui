# Color architecture

Paper UI의 색은 raw 색상을 component에 직접 연결하지 않습니다. 모든 색은 아래 네 층을 순서대로 통과합니다.

```
L0 palette source       palette.ts
        ↓
L1 calibrated ladder    color-ladder.ts
        ↓
L2 semantic token       colors.ts
        ↓
L3 CSS variable          tokens/index.ts + theme.css.ts
        ↓
component / resolver / app
```

컴포넌트는 `blue[600]`이나 `amber[400]`을 알지 않습니다. public API와 소비 코드는 역할만 고릅니다. 그래서 palette의 색감 보정은 한 번의 ladder 조정으로 모든 사용처에 전파됩니다.

## L0 — Palette source

`tokens/palette.ts`는 neutral surface ramp와 accent의 hue identity를 둡니다. hue 이름은 implementation 내부에만 남고, public semantic 이름은 아래 map으로 고정합니다.

| accent | palette | 쓰임 |
|---|---|---|
| `primary` | neutral zinc | 기본 행동 |
| `info` | blue | 정보·focus·link |
| `success` | green | 성공 |
| `warning` | amber | 주의 |
| `error` | red | 오류·위험 |

## L1 — Calibrated ladder

`color-ladder.ts`는 모든 accent palette에 `50 / 100 / 200 / 300 / 400 / 500 / 600 / 700 / 800 / 900 / 950`의 11-step curve를 제공합니다. 숫자는 raw hue의 농도 순서이고, component가 직접 소비하지 않습니다.

| step | semantic 연결 |
|---|---|
| `50` | `wash` |
| `100` | `soft` |
| `200` | `edge` |
| `400` | `edgeStrong` |
| `600` | `solid` |

나머지 step은 palette 검토, 향후 대비 조정, 테마별 곡선 보정의 여유를 남깁니다. 특히 amber는 밝은 pigment라도 약한 색으로 취급하지 않습니다. Palette inspector의 light `400` 이상 label과 `600` solid 전경은 다른 accent처럼 밝은 전경으로 읽습니다.

## L2 — Semantic token

`colors.ts`부터는 hue와 step 번호가 사라집니다.

| token family | 책임 |
|---|---|
| `surface` | Box의 깊이 — raised/canvas/sunken/well |
| `content` | 본문·보조·placeholder 글자 위계 |
| `border` | 구조선과 neutral control border |
| `accent` | primary·info·success·warning·error pigment 역할 |
| `interaction` | hover/selected/active overlay |
| `focus` | keyboard focus ring |

모든 `accent`는 정확히 같은 다섯 slot을 공유합니다.

| slot | 책임 |
|---|---|
| `solid` | 채운 면과 일반 지면의 pigment text |
| `wash` | solid 위 전경, 아주 가벼운 tint |
| `soft` | soft variant의 면 |
| `edge` | hairline 경계 |
| `edgeStrong` | outline 경계 |

`ink`, `softInk`, `mutedInk`는 별도 semantic slot으로 두지 않습니다. 쨍한 accent palette에서는 이들이 같은 역할을 중복했기 때문에 `solid` 하나로 통일했습니다. `softMuted` 등 muted variant는 독립 pigment가 아니라 wash/soft 및 interaction의 조합으로 무게를 낮춥니다.

## L3 — CSS variable와 component API

`theme.css.ts`는 L2 semantic tree를 light/dark에서 동일한 CSS variable 이름으로 emit하고, `tokens`는 그 `var(...)` 참조만 제공합니다.

```ts
tokens.color.accent.warning.solid
tokens.color.accent.error.edgeStrong
```

색을 받는 component의 public prop은 `color`가 아니라 `accent`입니다.

```tsx
<Button accent="error">삭제</Button>
<Badge accent="success">완료</Badge>
<Alert accent="warning">…</Alert>
```

`status`는 Field·Select·Textarea처럼 validation 의미를 나타내는 prop으로만 유지됩니다. Form은 내부에서 같은 semantic accent token을 사용하지만, 호출자는 색이 아니라 validation 상태를 표현합니다.

## 색을 바꿀 때의 경로

1. hue identity가 문제면 `palette.ts`를 조정합니다.
2. 특정 밝기·채도·대비가 문제면 `color-ladder.ts`의 step을 조정합니다.
3. UI 역할의 배치가 문제면 `colors.ts` mapping을 조정합니다.
4. component에서 raw 색을 덮어쓰지 않습니다. Palette와 Tokens Playground에서 light/dark 결과를 함께 확인합니다.
