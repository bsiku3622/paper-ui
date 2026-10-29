# Layout

Layout Primitive는 면 하나와, 그 면이 자식을 늘어놓는 방식을 제공합니다. Box가 면이고, Stack · Inline · Grid는 Box의 모든 prop을 그대로 받으면서 한 축 또는 두 축의 배치를 더합니다. 그래서 "여백 있는 카드가 내용을 세로로 쌓는다"가 요소 하나로 끝납니다.

| 컴포넌트 | 공개 축 | 기본값 |
| --- | --- | --- |
| Box | `as` · surface · padding / paddingX / paddingY · border · radius · elevation · theme · width / minWidth / maxWidth · height / minHeight / maxHeight · overflow / overflowX / overflowY | div. 면·여백·모서리·높이는 모두 opt-in |
| Stack | Box 전체 + `gap` · `align` start / center / end / stretch · `justify` start / center / end / between | 세로 flex. align을 주지 않으면 CSS stretch |
| Inline | Box 전체 + `gap` / `rowGap` / `columnGap` · `align` start / center / end / stretch / baseline · `justify` start / center / end / between · `wrap` | 가로 flex, align=center, nowrap |
| Grid | Box 전체 + columns / rows · autoFlow · `gap` / `rowGap` / `columnGap` · `align` · `justify` · `justifyItems` | columns=1, align·justify·justifyItems는 CSS 기본 |

[contract:primitives.layout.axis-classes]: #
Stack · Inline · Grid는 정렬 어휘 하나를 나눠 씁니다. `align`은 교차축 정렬(`align-items`, 값은 `ALIGNS`)이고, `justify`는 주축 분배(`justify-content`, 값은 `JUSTIFIES`)입니다. Grid에서 `justify`는 track 묶음의 분배이고, 각 칸 안에서 항목을 놓는 일은 Grid만 가진 `justifyItems`(`JUSTIFY_ITEMS`)가 맡습니다. 기본값은 root가 갖고, prop은 줄 때만 class가 됩니다. 그래서 prop을 주지 않은 컨테이너에는 정렬 class가 붙지 않습니다.

[contract:primitives.layout.gap-family]: #
`gap` · `rowGap` · `columnGap`은 자식을 늘어놓는 Stack · Inline · Grid가 갖고, Box는 갖지 않습니다. 세 컴포넌트는 같은 지도에서 class를 고르고, `gap`을 먼저 선언해 둔 덕에 `rowGap`이나 `columnGap`을 함께 주면 그쪽이 이깁니다. Inline은 `wrap`으로 여러 줄이 되므로 줄 사이(`rowGap`)와 칸 사이(`columnGap`)를 따로 줄 수 있습니다.

[contract:primitives.layout.root-min-width]: #
Stack · Inline · Grid의 root는 `min-width: 0`을 특정도 0으로 갖습니다. 긴 내용이 flex · grid 항목을 부모 밖으로 밀어내지 않게 하는 값이고, 특정도가 0이라 `minWidth`를 주면 이름 있는 크기든 CSS 길이든 선언 순서와 무관하게 그쪽이 이깁니다.

## Box — 면 하나

Box는 "무엇이든 되는 div"가 아니라 지면 위의 칸입니다. 어떤 면 위에 있는지(surface), 경계가 있는지(border), 모서리가 얼마나 둥근지(radius), 얼마나 떠 있는지(elevation), 안쪽 여백이 얼마인지를 말합니다. 글자색은 고르지 않습니다 — 잉크는 Text와 색을 가진 Atom이 정합니다. position과 flex 배치도 열지 않습니다.

| prop | 값 | 출처 |
| --- | --- | --- |
| `surface` | canvas · raised · sunken | Color `bg.*` — 다크에서 sunken = canvas라, canvas 위에서는 border와 함께 |
| `border` | boolean | Color `border.base`, Shape `stroke.border` |
| `radius` | sm · md · lg · full (`BOX_RADII`) | Shape `radius.surface.*` · `radius.full` |
| `padding` · `paddingX` · `paddingY` | xs · sm · md · lg · xl · 2xl · 3xl | Shape `inset.*` |
| `elevation` | raised · sticky · overlay · modal · toast | Layout `elevation.*` — z와 그림자를 함께 |
| `width` · `minWidth` · `maxWidth` | xs ~ xl · `measure.xs` ~ `measure.xl` · `container.content` · full · fit · min-content · max-content · CSS 길이 · number | 이름은 Shape `dimension.width.*` · `measure.*`와 Layout `container.*` |
| `height` · `minHeight` · `maxHeight` | xs ~ xl · full · fit · min-content · max-content · CSS 길이 · number | 이름은 Shape `dimension.height.*` |
| `overflow` · `overflowX` · `overflowY` | visible · hidden · clip · scroll · auto | 키워드만 받습니다 |
| `theme` | light · dark · inverse | Color 모드 — 이 면과 안쪽만 그 모드. `inverse`는 주변 모드의 반대 |

[contract:primitives.box.theme]: #
`theme`을 준 Box는 자기 요소에 그 모드의 고유 역할을 걸고 안쪽을 그 모드로 읽게 합니다. `light` · `dark`는 주변과 무관하게 그 모드이고 `inverse`는 주변 모드의 반대라, 안쪽에 또 `inverse`를 두면 다시 뒤집힙니다. `surface`를 주지 않아도 그 모드의 `canvas`를 깔아 판이 늘 있고, 안쪽 글자 · Icon · Pressable과 Overlay가 여는 층의 내용은 그 모드의 잉크를 받습니다. Box 자신의 포커스 링과 그림자는 서 있는 바깥 지면의 모드로 그려집니다. Stack · Inline · Grid도 같은 prop을 받고, 앱 전체의 테마는 [Theming](../get-started/theming.md)이 정합니다.

[contract:primitives.box.named-size-class]: #
이름 있는 크기(`md` 같은 dimension, `measure.md`, `container.content`, `full` · `fit` 같은 키워드)는 모두 class가 됩니다. 그래서 inline style에는 이름 있는 크기가 남지 않고, 소비자의 className이 이름 있는 크기를 덮을 수 있습니다.

[contract:primitives.box.length-escape]: #
이름이 아닌 CSS 길이(`42ch` 같은 값)와 number만 inline style로 갑니다. 그 화면에만 있는 치수를 위한 통로입니다.

[contract:primitives.box.overflow-class]: #
`overflow` · `overflowX` · `overflowY`는 키워드 다섯 개만 받고, 모두 class가 됩니다. 길이를 받는 속성이 아니라 escape가 없습니다.

면과 안쪽 여백 축(`surface` · `padding` · `paddingX` · `paddingY`)은 지도 하나(`BOX_STYLE`)에서 나옵니다. prop 타입, Box가 DOM으로 넘기지 않을 prop의 목록, class가 같은 키를 돌아 축을 더하면 셋이 함께 늘어납니다.

여백과 곡률은 이름으로 짝을 맞추면 자연스럽습니다. 카드는 `padding="md" radius="md"`, 패널은 `padding="lg" radius="lg"`처럼 씁니다. `elevation`은 그림자만이 아니라 쌓임 순서도 바꾸므로, 실제로 겹쳐 떠 있는 면에만 줍니다. 크기 이름 가운데 `xs ~ xl`은 Shape의 dimension이고, 글 덩어리의 읽기 폭은 `measure.md`, 본문 격자의 최대 폭은 `container.content`처럼 가족을 앞에 붙여 부릅니다. 그 화면에만 있는 치수는 CSS 길이로 직접 줍니다.

```tsx
<Box as="section" surface="raised" border radius="lg" padding="lg">…</Box>
<Box maxWidth="container.content" width="full" paddingX="xl">…</Box>
```

## Stack · Inline

Stack은 위에서 아래로, Inline은 시작에서 끝으로 자식을 놓습니다. Stack의 `justify`는 세로 분배라서 Stack에 높이가 있을 때 보입니다. Inline은 기본으로 가운데 정렬합니다 — 아이콘·글자·배지가 한 줄에 서는 경우가 대부분이기 때문입니다. 숫자가 섞인 한 줄은 `align="baseline"`으로 글자 기준선을 맞춥니다.

```tsx
<Stack surface="raised" border radius="md" padding="md" gap="sm">
  <Inline justify="between"><Text variant="label">최대 풍속</Text><Badge>태풍급</Badge></Inline>
  <Text variant="title">165 kt</Text>
</Stack>
```

## Grid

Grid의 columns 기본값은 1입니다. columns·rows에 양의 정수를 주면 같은 폭의 track을 만들고, CSS track 문자열도 받습니다. gap·rowGap·columnGap은 Layout gap 단계를 고릅니다. track 정의는 실행 중에 정해지는 배치라 inline style로 가고, 간격은 class로 갑니다. `align`은 칸 안의 세로 정렬, `justify`는 track이 컨테이너를 다 채우지 않을 때의 가로 분배, `justifyItems`는 칸 안의 가로 정렬입니다.

두 열 grid를 만드는 예시입니다.

```tsx
<Grid columns={2} gap="md" align="start">
  <Box border padding="md">첫 항목</Box>
  <Box border padding="md">둘째 항목</Box>
</Grid>
```
