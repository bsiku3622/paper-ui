# Layout

Layout Primitive는 자식을 늘어놓는 방식을 제공합니다. Stack · Inline · Grid는 Box의 prop(`as` · 안쪽 여백 · 크기 · 잘림)을 그대로 받으면서 한 축 또는 두 축의 배치를 더합니다. 배치만 맡고 면이나 테두리, 색은 갖지 않습니다. "여백 있는 카드가 내용을 세로로 쌓는다"는 `<Surface as={Stack} …>`로, 요소 하나에 모읍니다([Paint](paint.md#surface--면)).

| 컴포넌트 | 공개 축 | 기본값 |
| --- | --- | --- |
| Stack | Box 전체 + `gap` · `align` start / center / end / stretch · `justify` start / center / end / between | 세로 flex. align을 주지 않으면 CSS stretch |
| Inline | Box 전체 + `gap` / `rowGap` / `columnGap` · `align` start / center / end / stretch / baseline · `justify` start / center / end / between · `wrap` | 가로 flex, align=center, nowrap |
| Grid | Box 전체 + columns / rows · autoFlow · `gap` / `rowGap` / `columnGap` · `align` · `justify` · `justifyItems` | columns=1, align · justify · justifyItems는 CSS 기본 |

[contract:primitives.layout.axis-classes]: #
Stack · Inline · Grid는 정렬 어휘 하나를 나눠 씁니다. `align`은 교차축 정렬(`align-items`, 값은 `ALIGNS`)이고, `justify`는 주축 분배(`justify-content`, 값은 `JUSTIFIES`)입니다. Grid에서 `justify`는 track 묶음의 분배이고, 각 칸 안에서 항목을 놓는 일은 Grid만 가진 `justifyItems`(`JUSTIFY_ITEMS`)가 맡습니다. 기본값은 root가 갖고, prop은 줄 때만 class가 됩니다. 그래서 prop을 주지 않은 컨테이너에는 정렬 class가 붙지 않습니다.

[contract:primitives.layout.gap-family]: #
`gap` · `rowGap` · `columnGap`은 자식을 늘어놓는 Stack · Inline · Grid가 갖고, Box는 갖지 않습니다. 세 컴포넌트는 같은 지도에서 class를 고르고, `gap`을 먼저 선언해 둔 덕에 `rowGap`이나 `columnGap`을 함께 주면 그쪽이 이깁니다. Inline은 `wrap`으로 여러 줄이 되므로 줄 사이(`rowGap`)와 칸 사이(`columnGap`)를 따로 줄 수 있습니다.

[contract:primitives.layout.root-min-width]: #
Stack · Inline · Grid의 root는 `min-width: 0`을 특정도 0으로 갖습니다. 긴 내용이 flex · grid 항목을 부모 밖으로 밀어내지 않게 하는 값이고, 특정도가 0이라 `minWidth`를 주면 이름 있는 크기든 CSS 길이든 선언 순서와 무관하게 그쪽이 이깁니다.

## Stack · Inline

Stack은 위에서 아래로, Inline은 시작에서 끝으로 자식을 놓습니다. Stack의 `justify`는 세로 분배라서 Stack에 높이가 있을 때 보입니다. Inline은 기본으로 가운데 정렬합니다 — 아이콘 · 글자 · 배지가 한 줄에 서는 경우가 대부분이기 때문입니다. 숫자가 섞인 한 줄은 `align="baseline"`으로 글자 기준선을 맞춥니다.

```tsx
<Surface as={Stack} fill="raised" border radius="md" padding="md" gap="sm">
  <Inline justify="between"><Text variant="label">최대 풍속</Text><Badge>태풍급</Badge></Inline>
  <Text variant="title">165 kt</Text>
</Surface>
```

## Grid

Grid의 columns 기본값은 1입니다. columns · rows에 양의 정수를 주면 같은 폭의 track을 만들고, CSS track 문자열도 받습니다. gap · rowGap · columnGap은 Layout gap 단계를 고릅니다. track 정의는 실행 중에 정해지는 배치라 inline style로 가고, 간격은 class로 갑니다. `align`은 칸 안의 세로 정렬, `justify`는 track이 컨테이너를 다 채우지 않을 때의 가로 분배, `justifyItems`는 칸 안의 가로 정렬입니다.

두 열 grid를 만드는 예시입니다.

```tsx
<Grid columns={2} gap="md" align="start">
  <Surface border padding="md">첫 항목</Surface>
  <Surface border padding="md">둘째 항목</Surface>
</Grid>
```
