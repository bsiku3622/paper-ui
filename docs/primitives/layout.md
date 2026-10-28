# Layout

Layout Primitive는 면 하나와, 그 면이 자식을 늘어놓는 방식을 제공합니다. Box가 면이고, Stack · Inline · Grid는 Box의 모든 prop을 그대로 받으면서 한 축 또는 두 축의 배치를 더합니다. 그래서 "여백 있는 카드가 내용을 세로로 쌓는다"가 요소 하나로 끝납니다.

| 컴포넌트 | 공개 축 | 기본값 |
| --- | --- | --- |
| Box | `as` · surface · padding / paddingX / paddingY · gap · border · radius · elevation · inverse · width / minWidth / maxWidth · height / minHeight / maxHeight · overflow / overflowX / overflowY | div. 면·여백·모서리·높이는 모두 opt-in |
| Stack | Box 전체 + `align` start / center / end / stretch | 세로 flex. align을 주지 않으면 CSS stretch |
| Inline | Box 전체 + `align` start / center / end / baseline · `justify` start / center / end / between · `wrap` | 가로 flex, align=center, nowrap |
| Grid | Box 전체 + columns / rows · autoFlow · align / justify · rowGap / columnGap | columns=1, align·justify=stretch |

## Box — 면 하나

Box는 "무엇이든 되는 div"가 아니라 지면 위의 칸입니다. 어떤 면 위에 있는지(surface), 경계가 있는지(border), 모서리가 얼마나 둥근지(radius), 얼마나 떠 있는지(elevation), 안쪽 여백과 자식 사이 간격이 얼마인지를 말합니다. 글자색은 고르지 않습니다 — 잉크는 Text와 색을 가진 Atom이 정합니다. position과 flex 배치도 열지 않습니다.

| prop | 값 | 출처 |
| --- | --- | --- |
| `surface` | canvas · raised · sunken | Color `bg.*` |
| `border` | boolean | Color `border.base`, Shape `stroke.border` |
| `radius` | sm · md · lg · full | Shape `radius.surface.*` · `radius.full` |
| `padding` · `paddingX` · `paddingY` | xs · sm · md · lg · xl · 2xl · 3xl | Shape `inset.*` |
| `gap` | xs ~ 3xl | Layout `gap.*` |
| `elevation` | raised · sticky · overlay · modal · toast | Layout `elevation.*` — z와 그림자를 함께 |
| `width` · `height` 계열 | xs ~ xl · full · fit · min-content · max-content · CSS 길이 · number | 이름은 Shape `dimension.*` |
| `inverse` | boolean | 이 면만 주변의 반대 테마 |

여백과 곡률은 이름으로 짝을 맞추면 자연스럽습니다. 카드는 `padding="md" radius="md"`, 패널은 `padding="lg" radius="lg"`처럼 씁니다. `elevation`은 그림자만이 아니라 쌓임 순서도 바꾸므로, 실제로 겹쳐 떠 있는 면에만 줍니다. 크기 이름(xs ~ xl)은 Shape의 이름 있는 크기이고, 그 화면에만 있는 치수는 CSS 길이로 직접 줍니다.

```tsx
<Box as="section" surface="raised" border radius="lg" padding="lg">…</Box>
```

## Stack · Inline

Stack은 위에서 아래로, Inline은 시작에서 끝으로 자식을 놓습니다. Inline은 기본으로 가운데 정렬합니다 — 아이콘·글자·배지가 한 줄에 서는 경우가 대부분이기 때문입니다. 숫자가 섞인 한 줄은 `align="baseline"`으로 글자 기준선을 맞춥니다.

```tsx
<Stack surface="raised" border radius="md" padding="md" gap="sm">
  <Inline justify="between"><Text variant="label">최대 풍속</Text><Badge>태풍급</Badge></Inline>
  <Text variant="title">165 kt</Text>
</Stack>
```

## Grid

Grid의 columns 기본값은 1입니다. columns·rows에 양의 정수를 주면 같은 폭의 track을 만들고, CSS track 문자열도 받습니다. gap·rowGap·columnGap은 Layout gap 단계를 고릅니다. track 정의는 실행 중에 정해지는 배치라 inline style로 가고, 간격은 class로 갑니다.

두 열 grid를 만드는 예시입니다.

```tsx
<Grid columns={2} gap="md" align="start">
  <Box border padding="md">첫 항목</Box>
  <Box border padding="md">둘째 항목</Box>
</Grid>
```
