# Typography

Typography는 서체·크기·굵기·행간·자간을 정하는 시스템입니다. 컴포넌트는 크기를 숫자로 고르지 않고 **역할**로 고릅니다 — 페이지 제목인지, 본문인지, 짧은 이름인지. Color 다음 층이라, 역할마다 기본 잉크를 Color에서 가져옵니다.

Typography도 세 단계입니다. 원본 수치인 **Typography Palette**, 그것을 조합한 **글자 역할**, 반복되는 컨트롤 글자를 묶은 **Control preset**입니다. 역할과 preset은 Palette의 변수를 조합할 뿐, 숫자를 새로 쓰지 않습니다. 토큰 경로는 Palette가 `tokens.typography.palette`, 역할이 `tokens.typography.role`, preset이 `tokens.typography.preset`입니다. 이 값들을 화면에 적용하는 선언은 한 곳, `tokens/typography-recipes.ts`가 만듭니다([역할을 적용하는 단위](#역할을-적용하는-단위)).

## Typography Palette — 원본

| 축 | 값 |
|---|---|
| `fontSize` | 12 · 13 · 14 · 16 · 20 · 24 · 32, 유동 단계 `hero` |
| `leading` | 16 · 20 · 24 · 28 · 32 · 40, 단위 없는 `hero` 1.04 |
| `weight` | `regular` 400 · `normal` 450 · `medium` 500 · `semibold` 600 · `strong` 650 · `bold` 700 |
| `tracking` | `mono` −0.04em · `tighter` −0.035em · `tight` −0.02em · `snug` −0.01em · `normal` 0 · `wide` 0.01em |
| `family` | `sans` · `mono` |
| `decoration` | `underlineOffset` 0.2em |
| `monoSizeScale` | 0.95 |
| `codeScale` | `inline` 0.85 · `compact` 0.8 |

크기와 행간은 실제 px 값을 이름으로 씁니다(`tokens.typography.palette.fontSize.14`). 서로 다른 단계 이름을 억지로 짝짓지 않기 위해서입니다. 450은 작은 sans 글자가 Retina에서 힘이 빠지지 않도록 둔 입력값용 보정이고, 650은 채워진 버튼처럼 강조가 필요한 라벨에 씁니다. 밑줄 offset은 글자의 장식이라 글자 크기(em)를 따릅니다. `codeScale`은 문장 속 코드가 둘러싼 글자에서 줄어드는 비율입니다.

**고정 사다리의 선언된 예외는 `hero` 하나입니다.** `hero`의 크기는 뷰포트 폭을 따라 36px과 60px 사이에서 자라는 `clamp(2.25rem, 6vw, 3.75rem)`이고, 행간은 px이 아니라 단위 없는 비율 1.04입니다. 랜딩 첫 화면의 헤드라인처럼 화면 폭에 따라 크기가 달라져야 하는 한 자리만 이 예외를 씁니다. 다른 모든 크기와 행간은 px 고정값입니다.

## 서체

| family | 서체 | 쓰는 곳 |
|---|---|---|
| `sans` | Pretendard Variable → 시스템 sans | 모든 글 |
| `mono` | ui-monospace · SF Mono · Menlo · Consolas → D2Coding | 코드, 토큰 이름, 식별자 |

Pretendard를 맨 앞에 둡니다. 라틴과 한글을 한 몸으로 그려, 섞인 문장도 굵기와 리듬이 갈라지지 않습니다. `-apple-system`을 앞에 두면 라틴만 San Francisco로, 한글은 Apple SD Gothic Neo로 갈라져 같은 굵기에서도 한글이 얇아 보입니다.

서체는 Typography 계약의 일부입니다. 굵기 사다리(400 · 450 · 500 · 600 · 650 · 700)는 Pretendard Variable이 있다고 전제하고 세워져 있고, 서체가 없으면 시스템 폰트가 가까운 굵기로 접습니다 — Windows(Segoe UI·맑은 고딕)는 450·500이 400으로, 600·650이 700으로, Android(Roboto)는 450이 500으로, 600·650이 700으로 접힙니다. macOS는 대부분의 단계를 그대로 유지합니다. 행간이 px 고정값이라 접혀도 기하는 바뀌지 않습니다. 불러올 두 스타일시트의 주소는 `FONT_STYLESHEETS`(`/tokens`)이고, 그대로 옮긴 스니펫은 [설치 › 폰트](../get-started/install.md#폰트)에 있습니다.

mono는 위계가 아니라 **family 축**입니다. `<Text family="mono">`로 어느 역할에도 얹고, 기술적인 자리에만 씁니다. 표의 숫자 열은 mono로 바꾸지 않고 sans에 `tabular-nums`만 줍니다. mono는 같은 px에서 sans보다 크게 읽혀 크기에 `monoSizeScale`(0.95)을 곱하고, 역할별 자간 대신 `tracking.mono`(−0.04em) 하나를 씁니다 — SF Mono와 D2Coding은 글자 폭이 넓어 UI에서 벌어져 보이기 때문입니다. 한글 mono를 쓰려면 앱이 D2Coding을 불러와야 합니다.

## 글자 역할

| 역할 | 크기 / 행간 | 굵기 | 자간 | 기본 잉크 | 기본 태그 | 쓰는 곳 |
|---|---|---|---|---|---|---|
| `hero` | 36–60 유동 / 1.04 | 700 | tighter | primary | h1 | 랜딩 헤드라인 |
| `display` | 32 / 40 | 700 | tight | primary | h1 | 큰 제목 |
| `title` | 24 / 32 | 700 | snug | primary | h1 | 페이지 제목 |
| `heading` | 20 / 28 | 600 | normal | primary | h2 | 섹션 제목 |
| `subheading` | 16 / 24 | 600 | normal | primary | h3 | 작은 제목 |
| `body` | 14 / 20 | 500 | normal | primary | p | 본문 (기본값) |
| `caption` | 13 / 16 | 400 | normal | secondary | p | 보조 정보·메타 |
| `label` | 12 / 16 | 600 | wide | secondary | span | 필드 라벨·표 머리·짧은 이름 |

본문은 14px입니다. 복잡한 웹앱의 표준 밀도라 16px 본문 variant는 두지 않습니다. 제목은 크기로 위계를 만들고, `label`은 대문자나 mono가 아닌 sentence case semibold입니다. `hero`는 크기가 뷰포트를 따라 자라는 유일한 역할입니다([Palette](#typography-palette--원본)).

`variant`와 태그는 따로 정합니다. `title`이 어떤 페이지에서는 `h1`, 대화상자 안에서는 `h2`가 될 수 있습니다. 잉크는 `ink`로 한 번 덮어쓸 수 있고, 색면 위에서는 `ink="inherit"`로 면의 글자색을 그대로 받습니다.

```tsx
<Text as="h1" variant="title">웹사이트 리뉴얼</Text>
<Text variant="caption">마지막 수정 · 오늘 오전 10:42</Text>
<Text variant="body" family="mono">WEB-24</Text>
```

날짜, 담당, 소속 프로젝트처럼 곁에 붙는 정보는 `body`의 잉크만 낮추지 않고 `caption`으로 적고, 섹션 머리와 표 머리는 대문자가 아니라 `label`로 적습니다. Demo가 이렇게 그립니다.

## 역할을 적용하는 단위

역할을 화면에 적용하는 길은 둘이고, 둘 다 같은 선언 하나에서 나옵니다. 컴포넌트는 `Text`를 쓰고, 앱의 stylesheet는 `/tokens`의 규칙 함수로 같은 선언을 가져옵니다.

| 규칙 | 만드는 선언 | 쓰는 곳 |
|---|---|---|
| `typographyRule(variant, { family })` | 역할의 서체 · 크기 · 굵기 · 행간 · 자간 · 줄바꿈 | `Text`, body 요소, 제목처럼 역할을 따르는 stylesheet |
| `monoRule()` | 어느 역할 안에서든 문장 속 mono 조각 — 크기는 둘러싼 글자의 `monoSizeScale`배 | 역할 안의 식별자 |
| `codeRule('inline' \| 'compact' \| 'block')` | 코드. `inline`은 문단 속 0.85배, `compact`는 표 칸 속 0.8배이고 둘 다 자간과 줄바꿈을 정하지 않아 둘러싼 글자를 따릅니다. `block`은 mono 13 / 20 · 450이고 mono로 끊습니다 | 문서의 인라인 코드, 표 칸, 코드 블록 |
| `presetRule(preset, size, weight)` | 컨트롤 preset. Button은 크기와 굵기, Field · Textarea는 크기, Badge는 크기와 무관 | 컨트롤을 직접 그리는 stylesheet |
| `emphasisRule(emphasis)` | 굵기 하나. `regular` · `medium` · `semibold` · `bold`는 Palette의 이름이라 `regular`는 언제나 400입니다 | 문장 속 강조, 역할 밖의 가벼운 글자 |

[contract:foundations.typography.body-role]: #
body 요소는 body 역할 전체를 받습니다. 크기와 행간뿐 아니라 굵기 500과 줄바꿈까지 포함하므로, Text 밖의 글자(링크, 목록, 문서 본문)도 `<Text variant="body">`와 같은 글자로 그려집니다.

앱은 Palette를 직접 읽지 않습니다. 굵기는 `emphasisRule`로, 나머지는 위 규칙으로 고릅니다. `Text`에는 굵기 prop이 없습니다.

### 줄바꿈

줄바꿈은 서체가 정하고, 역할은 서체를 따라 갑니다.

[contract:foundations.typography.line-breaking]: #

| family | `word-break` | `overflow-wrap` | 뜻 |
|---|---|---|---|
| `sans` | `keep-all` | `break-word` | 한글은 어절 사이에서만 끊고, 한 어절이 줄보다 길 때만 그 안에서 끊습니다. |
| `mono` | `normal` | `anywhere` | 식별자와 경로는 어디서든 끊습니다. |

문장 속 코드 조각(`codeRule`의 `inline` · `compact`)은 서체 규칙이 아니라 둘러싼 글자의 줄바꿈을 따릅니다. 표 칸 안의 식별자가 어디서든 끊겨 칸의 최소 폭을 줄이면 표가 식별자를 가로로 자르며 좁아지기 때문에, 칸이 좁으면 표가 자기 wrapper 안에서 스크롤합니다.

한 줄에 서야 하는 라벨은 preset이 정합니다. Button과 Badge의 preset은 `white-space: nowrap`을 함께 담고, 입력은 값이 줄을 정하므로 담지 않습니다.

## Control preset

조작 문구는 읽기 위계가 아니라 **컨트롤 크기**를 따릅니다. 같은 size의 Button·Field·Select가 같은 줄에 서면 글자 높이도 맞아야 하기 때문입니다. preset은 완성 class 하나로 제공되고, package의 Atom이 안에서 그 class를 고릅니다. 컨트롤을 직접 그리는 stylesheet는 `/tokens`의 `presetRule(preset, size, weight)`로 같은 선언을 가져옵니다.

| preset | sm | md | lg | 쓰는 Atom |
|---|---|---|---|---|
| `button.medium` | 13 / 16 · 500 | 13 / 16 · 500 | 14 / 16 · 500 | Button·IconButton (solid 외) |
| `button.strong` | 13 / 16 · 650 | 13 / 16 · 650 | 14 / 16 · 650 | solid Button |
| `field` | 13 / 16 · 450 · 입력 줄상자 20 | 13 / 16 · 450 · 입력 줄상자 20 | 14 / 16 · 450 · 입력 줄상자 20 | Field · Select |
| `textarea` | 13 / 20 · 450 | 13 / 20 · 450 | 14 / 20 · 450 | Textarea |
| `badge` | 12 / 16 · 500 (크기 무관) | | | Badge |

컨트롤 글자 줄(행간 16)은 Shape이 컨트롤의 안쪽 여백을 계산하는 입력이기도 합니다 — 입력칸 inset은 (컨트롤 높이 − 16) / 2입니다. Badge 글자는 배지가 작아져도 12px에서 내려가지 않습니다. 밀도(높이)와 가독성(글자 크기)은 다른 축이기 때문입니다.

[contract:foundations.typography.input-line]: #
Field의 입력값은 글자 줄(16)이 아니라 preset의 `inputLeading`(20) 줄상자에 앉습니다. 16px 줄상자에서는 브라우저 caret와 한글 fallback glyph가 눌려 위아래가 잘릴 수 있기 때문입니다. Select는 같은 field preset이어도 값을 그리는 줄상자를 따로 두지 않아 글자 줄 16을 그대로 씁니다.

[contract:foundations.typography.font-size-escape]: #
`fontSize` prop은 글자 크기만 다른 역할로 바꾸는 탈출구입니다. 컨트롤 상자가 담을 수 있는 `label` · `caption` · `body`만 받고(`CONTROL_FONT_SIZES`), 그보다 큰 역할은 타입이 막습니다. 크기를 바꿔도 행간은 preset에 남으므로 geometry는 고른 size의 preset을 기준으로 유지됩니다.

## 앱에서

앱이 글자를 고르는 길은 역할입니다. 컴포넌트에서는 `Text`의 `variant` · `ink` · `family` · `numeric`으로, stylesheet에서는 `typographyRule(variant, { family })`와 `codeRule` · `presetRule` · `emphasisRule`로 고르고, 값을 직접 읽어야 하는 자리는 `tokens.typography.role.<variant>`(`size` · `weight` · `leading` · `tracking`)와 `tokens.typography.preset.<preset>`입니다. `fontSize` · `fontWeight` · `lineHeight` · `letterSpacing`에 숫자나 단위 값을 적지 않고, Palette(`tokens.typography.palette`)는 읽지 않습니다. 굵기 하나만 바꾸는 강조는 `emphasisRule`, 코드는 `codeRule`입니다. eslint `paper/source-numbers`의 앱 범위가 이를 막고, Palette를 보여 주는 Typography inspector만 예외입니다. 컨트롤 글자 크기를 한 단계 바꾸는 탈출구는 컨트롤의 `fontSize` prop입니다.

Playground [Typography](/playground/foundations/typography)에서 Palette·역할·preset을 실제 글자로 볼 수 있습니다.
