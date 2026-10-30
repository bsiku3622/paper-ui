# Element

Element Primitive는 1차 바탕인 Box 하나입니다. Box는 "무엇이든 되는 div"가 아니라 지면 위의 칸입니다. 안쪽 여백이 얼마인지, 크기가 얼마인지, 넘치면 어떻게 하는지만 말합니다. 면 · 테두리 · 모서리 · 높이 · 테마는 [Paint](paint.md)의 Surface가, accent × variant는 Paint가 입히므로 Box에는 어떤 색도 없습니다. 글자색도 고르지 않습니다 — 잉크는 Text와 색을 가진 Atom이 정합니다. position과 flex 배치도 열지 않습니다.

| 컴포넌트 | 공개 축 | 기본값 |
| --- | --- | --- |
| Box | `as` · padding / paddingX / paddingY · width / minWidth / maxWidth · height / minHeight / maxHeight · overflow / overflowX / overflowY | div. 여백 · 크기 · 잘림은 모두 opt-in |

## Box — 칸 하나

| prop | 값 | 출처 |
| --- | --- | --- |
| `padding` · `paddingX` · `paddingY` | xs · sm · md · lg · xl · 2xl · 3xl | Shape `inset.*` |
| `width` · `minWidth` · `maxWidth` | xs ~ xl · `measure.xs` ~ `measure.xl` · `container.content` · full · fit · min-content · max-content · CSS 길이 · number | 이름은 Shape `dimension.width.*` · `measure.*`와 Layout `container.*` |
| `height` · `minHeight` · `maxHeight` | xs ~ xl · full · fit · min-content · max-content · CSS 길이 · number | 이름은 Shape `dimension.height.*` |
| `overflow` · `overflowX` · `overflowY` | visible · hidden · clip · scroll · auto | 키워드만 받습니다 |

[contract:primitives.box.named-size-class]: #
이름 있는 크기(`md` 같은 dimension, `measure.md`, `container.content`, `full` · `fit` 같은 키워드)는 모두 class가 됩니다. 그래서 inline style에는 이름 있는 크기가 남지 않고, 소비자의 className이 이름 있는 크기를 덮을 수 있습니다.

[contract:primitives.box.length-escape]: #
이름이 아닌 CSS 길이(`42ch` 같은 값)와 number만 inline style로 갑니다. 그 화면에만 있는 치수를 위한 통로입니다.

[contract:primitives.box.overflow-class]: #
`overflow` · `overflowX` · `overflowY`는 키워드 다섯 개만 받고, 모두 class가 됩니다. 길이를 받는 속성이 아니라 escape가 없습니다.

안쪽 여백 축(`padding` · `paddingX` · `paddingY`)은 지도 하나(`BOX_STYLE`)에서 나옵니다. prop 타입, Box가 DOM으로 넘기지 않을 prop의 목록, class가 같은 키를 돌아 축을 더하면 셋이 함께 늘어납니다.

크기 이름 가운데 `xs ~ xl`은 Shape의 dimension이고, 글 덩어리의 읽기 폭은 `measure.md`, 본문 격자의 최대 폭은 `container.content`처럼 가족을 앞에 붙여 부릅니다. 그 화면에만 있는 치수는 CSS 길이로 직접 줍니다. 면이나 테두리가 필요하면 Box에 얹지 않고 [Surface](paint.md#surface--면)를 씁니다.

```tsx
<Box as="section" padding="lg">…</Box>
<Box maxWidth="container.content" width="full" paddingX="xl">…</Box>
```
