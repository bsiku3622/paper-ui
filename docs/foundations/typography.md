# Typography

Typography는 서체·크기·굵기·행간·자간을 정하는 시스템입니다. 컴포넌트는 크기를 숫자로 고르지 않고 **역할**로 고릅니다 — 페이지 제목인지, 본문인지, 짧은 이름인지. Color 다음 층이라, 역할마다 기본 잉크를 Color에서 가져옵니다.

Typography도 세 단계입니다. 원본 수치인 **Typography Palette**, 그것을 조합한 **글자 역할**, 반복되는 컨트롤 글자를 묶은 **Control preset**입니다. 역할과 preset은 Palette의 변수를 조합할 뿐, 숫자를 새로 쓰지 않습니다.

## Typography Palette — 원본

| 축 | 값 |
|---|---|
| `fontSize` | 12 · 13 · 14 · 16 · 20 · 24 · 32 |
| `leading` | 16 · 20 · 24 · 28 · 32 · 40 |
| `weight` | `regular` 400 · `normal` 450 · `medium` 500 · `semibold` 600 · `strong` 650 · `bold` 700 |
| `tracking` | `mono` −0.04em · `tight` −0.02em · `snug` −0.01em · `normal` 0 · `wide` 0.01em |
| `family` | `sans` · `mono` |
| `decoration` | `underlineOffset` 0.2em |
| `monoSizeScale` | 0.95 |

크기와 행간은 실제 px 값을 이름으로 씁니다(`tokens.text.palette.fontSize.14`). 서로 다른 단계 이름을 억지로 짝짓지 않기 위해서입니다. 450은 작은 sans 글자가 Retina에서 힘이 빠지지 않도록 둔 입력값용 보정이고, 650은 채워진 버튼처럼 강조가 필요한 라벨에 씁니다. 밑줄 offset은 글자의 장식이라 글자 크기(em)를 따릅니다.

## 서체

| family | 서체 | 쓰는 곳 |
|---|---|---|
| `sans` | Pretendard Variable → 시스템 sans | 모든 글 |
| `mono` | ui-monospace · SF Mono · Menlo · Consolas → D2Coding | 코드, 토큰 이름, 식별자 |

Pretendard를 맨 앞에 둡니다. 라틴과 한글을 한 몸으로 그려, 섞인 문장도 굵기와 리듬이 갈라지지 않습니다. `-apple-system`을 앞에 두면 라틴만 San Francisco로, 한글은 Apple SD Gothic Neo로 갈라져 같은 굵기에서도 한글이 얇아 보입니다.

mono는 위계가 아니라 **family 축**입니다. `<Text family="mono">`로 어느 역할에도 얹고, 기술적인 자리에만 씁니다. 표의 숫자 열은 mono로 바꾸지 않고 sans에 `tabular-nums`만 줍니다. mono는 같은 px에서 sans보다 크게 읽혀 크기에 `monoSizeScale`(0.95)을 곱하고, 역할별 자간 대신 `tracking.mono`(−0.04em) 하나를 씁니다 — SF Mono와 D2Coding은 글자 폭이 넓어 UI에서 벌어져 보이기 때문입니다. 한글 mono를 쓰려면 앱이 D2Coding을 불러와야 합니다 — 버전을 고정한 스니펫은 [설치 › 폰트](../get-started/install.md#폰트)에 있습니다.

## 글자 역할

| 역할 | 크기 / 행간 | 굵기 | 자간 | 기본 잉크 | 기본 태그 | 쓰는 곳 |
|---|---|---|---|---|---|---|
| `display` | 32 / 40 | 700 | tight | primary | h1 | 랜딩 헤드라인 |
| `title` | 24 / 32 | 700 | snug | primary | h1 | 페이지 제목 |
| `heading` | 20 / 28 | 600 | normal | primary | h2 | 섹션 제목 |
| `subheading` | 16 / 24 | 600 | normal | primary | h3 | 작은 제목 |
| `body` | 14 / 20 | 500 | normal | primary | p | 본문 (기본값) |
| `caption` | 13 / 16 | 400 | normal | secondary | p | 보조 정보·메타 |
| `label` | 12 / 16 | 600 | wide | secondary | span | 필드 라벨·표 머리·짧은 이름 |

본문은 14px입니다. 복잡한 웹앱의 표준 밀도라 16px 본문 variant는 두지 않습니다. 제목은 크기로 위계를 만들고, `label`은 대문자나 mono가 아닌 sentence case semibold입니다.

`variant`와 태그는 따로 정합니다. `title`이 어떤 페이지에서는 `h1`, 대화상자 안에서는 `h2`가 될 수 있습니다. 잉크는 `ink`로 한 번 덮어쓸 수 있고, 색면 위에서는 `ink="inherit"`로 면의 글자색을 그대로 받습니다.

```tsx
<Text as="h1" variant="title">웹사이트 리뉴얼</Text>
<Text variant="caption">마지막 수정 · 오늘 오전 10:42</Text>
<Text variant="body" family="mono">WEB-24</Text>
```

## Control preset

조작 문구는 읽기 위계가 아니라 **컨트롤 크기**를 따릅니다. 같은 size의 Button·Field·Select가 같은 줄에 서면 글자 높이도 맞아야 하기 때문입니다. preset은 완성 class 하나로 제공되고, `resolveControlTypography(role, size)`로 고릅니다.

| preset | sm | md | lg | 쓰는 Atom |
|---|---|---|---|---|
| `button.regular` | 13 / 16 · 500 | 13 / 16 · 500 | 14 / 16 · 500 | Button·IconButton (solid 외) |
| `button.strong` | 13 / 16 · 650 | 13 / 16 · 650 | 14 / 16 · 650 | solid Button |
| `field` | 13 / 16 · 450 | 13 / 16 · 450 | 14 / 16 · 450 | Field · Select |
| `textarea` | 13 / 20 · 450 | 13 / 20 · 450 | 14 / 20 · 450 | Textarea |
| `badge` | 12 / 16 · 500 (크기 무관) | | | Badge |

컨트롤 글자 줄(행간 16)은 Shape이 컨트롤의 안쪽 여백을 계산하는 입력이기도 합니다 — 입력칸 inset은 (컨트롤 높이 − 16) / 2입니다. Badge 글자는 배지가 작아져도 12px에서 내려가지 않습니다. 밀도(높이)와 가독성(글자 크기)은 다른 축이기 때문입니다.

`fontSize` prop은 글자 크기만 다른 역할로 바꾸는 탈출구입니다. 크기를 바꿔도 geometry는 고른 size의 preset을 기준으로 유지됩니다.

Playground [Typography](/playground/foundations/typography)에서 Palette·역할·preset을 실제 글자로 볼 수 있습니다.
