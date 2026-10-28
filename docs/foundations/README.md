# Overview

Foundations는 화면에 쓰이는 모든 값을 정하는 다섯 시스템입니다. 색·글자·형태·배치·시간이 각자 하나의 시스템을 이루고, Primitive와 Atom은 이 값을 고르기만 합니다. 컴포넌트 안에 숫자나 색을 직접 쓰는 일은 없습니다.

## 다섯 시스템은 쌓인다

다섯 시스템은 정해진 순서로 쌓이고, 각 시스템은 자기보다 앞에 있는 시스템만 참조합니다.

```text
Color → Typography → Shape → Layout → Motion → Primitives → Atoms
```

| 시스템 | 정하는 것 | 앞 시스템에서 가져오는 것 | 원본 |
|---|---|---|---|
| [Color](color.md) | 면·잉크·경계·의미색·상태 overlay | — | `tokens/palette.ts` |
| [Typography](typography.md) | 서체·크기·굵기·행간·자간, 글자 역할 | 역할별 기본 잉크(Color) | `tokens/text.ts` |
| [Shape](shape.md) | 요소 하나의 곡률·선·포커스 링·크기·안쪽 여백 | 컨트롤 글자 줄(Typography) | `tokens/shape.ts` |
| [Layout](layout.md) | 형제 간격·페이지 틀·breakpoint·elevation | 길이 scale(Shape), 그림자 색(Color) | `tokens/layout.ts` |
| [Motion](motion.md) | 전이 시간·곡선·상황별 움직임 | 위 네 시스템이 바뀌는 방식 | `tokens/motion.ts` |

Shape와 Layout의 경계는 하나의 질문으로 가립니다. **빈 캔버스에 그 요소 하나만 놓아도 남는가.** 버튼의 곡률·높이·안쪽 여백은 버튼 하나만 있어도 보이므로 Shape이고, 형제 사이 간격이나 쌓임 순서는 두 번째 요소나 화면이 있어야 생기므로 Layout입니다.

## 원본 → 역할 → 조합

다섯 시스템은 모두 같은 세 단계로 짜여 있습니다. 숫자와 색은 원본에 한 번만 적고, 컴포넌트와 앱은 역할을 고르며, 역할을 묶어 컴포넌트 하나가 쓰는 완성형을 만듭니다.

| 시스템 | 원본 | 역할 | 조합 |
|---|---|---|---|
| Color | OKLCH Palette → HEX Palette Token | `bg` · `ink` · `border` · `accent` · `interaction` … | accent × variant profile |
| Typography | Typography Palette | `display` ~ `label` 글자 역할 | Control preset |
| Shape | `SHAPE_SOURCE` | `inset` · `radius` · `control` · `selection` … | Shape recipe |
| Layout | `LAYOUT_SOURCE` | `gap` · `gutter` · `container` · `elevation` | Box `elevation` |
| Motion | duration · easing · loop | `press` · `hover` · `state` · `enter` … | `stateTransition()` |

Playground의 [Foundations](/playground/foundations/color) 페이지가 이 순서 그대로 각 시스템을 보여줍니다. 위에서부터 원본, 역할, 조합 순서입니다.

## 값이 화면까지 가는 길

`tokens` 객체의 leaf는 값이 아니라 CSS 변수 참조입니다. `tokens.color.bg.raised`는 `#ffffff`가 아니라 `"var(--pui-color-bg-raised)"`이고, 실제 값은 `styles/theme.css.ts`가 `:root`와 테마 스코프에 한 번 굽습니다. 테마가 바뀌면 변수 값만 바뀌므로 소비처는 테마를 분기하지 않습니다.

```text
원본 values tree
   │  walkValues() / buildVarTree() — 같은 tree, 같은 이름 규칙
   ├──► styles/theme.css.ts   :root { --pui-color-ink-primary: … }
   └──► tokens 객체            tokens.color.ink.primary = "var(--pui-color-ink-primary)"
```

두 산출물이 같은 tree를 같은 헬퍼로 걷기 때문에 변수 이름과 TS 경로가 어긋날 수 없습니다. 축 목록을 손으로 나열하지 않고 tree를 통째로 걷는 것도 같은 이유입니다 — 나열하면 축이 늘 때 조용히 빠지고, 빠진 변수는 에러 없이 초기값으로 떨어집니다.

시스템마다 굽는 범위는 다릅니다.

- **Color**는 의미 역할 전체를 light·dark 두 벌로 굽고, 테마 스코프(`[data-theme]`)가 통째로 교체합니다.
- **Typography**는 Palette를 굽고, 글자 역할과 control preset은 Palette 변수를 조합한 class입니다.
- **Shape·Layout**은 원본만 굽습니다. 역할은 원본 변수의 별칭이거나 쓰이는 요소에서 계산되는 `calc()` 식이라, 하위 트리에서 원본 하나를 덮으면 그 위의 역할이 그 자리에서 모두 다시 계산됩니다. 그림자는 테마마다 색이 달라 조립된 값을 테마 스코프가 교체합니다.
- **Motion**은 변수로 굽지 않습니다. duration·easing·변위는 한 변수로 줄여 쓰기 어려워, stylesheet가 빌드 때 transition 문자열로 조립합니다.

## 앱에서 쓰기

앱은 패키지에서 `tokens`를 가져와 stylesheet에서 역할을 고릅니다. 아래 예시는 패널 하나를 만듭니다.

```ts
import { style } from "@vanilla-extract/css";
import { tokens } from "@studio-baeks/paper-ui";

export const panel = style({
  padding: tokens.shape.inset.lg,
  borderRadius: tokens.shape.radius.surface.lg,
  border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`,
  background: tokens.color.bg.raised,
  boxShadow: tokens.layout.elevation.overlay.shadow,
  transition: `background-color ${tokens.motion.role.hover.duration} ${tokens.motion.role.hover.easing}`,
});
```

안쪽 여백은 `tokens.shape.inset`, 형제 사이와 margin·위치 offset은 `tokens.layout.gap`, 그림자와 z는 `tokens.layout.elevation`에서 고릅니다. 미디어 쿼리는 CSS 변수를 읽지 못하므로 `tokens.layout.breakpoint`는 `"768px"` 같은 값입니다. 사이드바 폭이나 그리드 트랙처럼 그 화면에만 있는 치수는 앱이 직접 씁니다.

## 규칙은 빌드가 지킨다

원칙은 리뷰어의 기억이 아니라 eslint가 지킵니다.

1. **raw 색값 금지.** OKLCH source는 `palette.ts`, HEX 생성은 `color-ladder.ts`에만 있습니다. 소비처는 `tokens.color`만 참조하고 색을 계산하지 않습니다.
2. **원본 import 격리.** palette·ladder·shape·layout의 원본 모듈은 컴포넌트·resolver·앱이 import하지 않습니다. 원본을 그대로 보여주는 Foundations inspector만 예외입니다.
3. **패키지의 inline style로 토큰 주입 금지.** 패키지 스타일은 `.css.ts`의 className으로만 적용합니다.
4. **길이는 원본에만.** 패키지는 원본 파일 밖에서 길이 숫자를 쓰지 않습니다. 앱은 간격·형태·깊이(padding·margin·gap·offset·radius·선·그림자·z)를 역할로 고르고, 화면 고유의 치수만 직접 씁니다.

접근성도 같은 방식으로 지킵니다. `eslint-plugin-jsx-a11y`가 `as`로 바뀐 요소까지 읽도록 설정되어 있어, `<Box as="button">` 같은 경우도 검사합니다.
