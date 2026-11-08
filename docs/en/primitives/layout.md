# Layout

The Layout Primitive provides ways to lay out children. Stack · Inline · Grid accept Box's props (`as` · padding · size · clipping) as they are and add layout on one axis or two. They own layout only and have no surface, border or colour. "A card with padding that stacks its content vertically" is gathered into one element with `<Surface as={Stack} …>` ([Paint](paint.md#surface--the-plane)).

| Component | Public axes | Default |
| --- | --- | --- |
| Stack | the whole of Box + `gap` · `align` start / center / end / stretch · `justify` start / center / end / between | Vertical flex. Without align, CSS stretch |
| Inline | the whole of Box + `gap` / `rowGap` / `columnGap` · `align` start / center / end / stretch / baseline · `justify` start / center / end / between · `wrap` | Horizontal flex, align=center, nowrap |
| Grid | the whole of Box + columns / rows (including steps that give a value per width) · autoFlow · `gap` / `rowGap` / `columnGap` · `align` · `justify` · `justifyItems` | columns=1, align · justify · justifyItems are the CSS defaults |

Stack · Inline · Grid share one alignment vocabulary. `align` is cross-axis alignment (`align-items`, values from `ALIGNS`), and `justify` is main-axis distribution (`justify-content`, values from `JUSTIFIES`). In Grid, `justify` distributes the set of tracks, and placing items inside each cell is done by `justifyItems` (`JUSTIFY_ITEMS`), which only Grid has. The root holds the defaults, and a prop becomes a class only when given. So a container whose props are not given has no alignment class.

`gap` belongs to Stack · Inline · Grid, which lay out children, `rowGap` · `columnGap`, which split rows and columns, belong only to Inline · Grid, and Box has neither. The three components choose their classes from the same map, and because `gap` is declared first, giving `rowGap` or `columnGap` together makes that one win. Inline becomes several lines with `wrap`, so the space between lines (`rowGap`) and between cells (`columnGap`) can be given separately.

The `gap` of Grid is a token step. The `column-gap` and `row-gap` the container computes equal the length that step points to (`tokens.layout.gap`) and do not change when the number of tracks changes. Giving `rowGap` · `columnGap` for one axis separately changes only that axis to that step.

A Stack · Inline · Grid rendered with `as="ul"` or `as="ol"` drops the browser's indentation and markers. Spacing is decided by `gap`. This rule is in the reset layer, so giving `paddingX` makes that win.

The root of Stack · Inline · Grid has `min-width: 0` at specificity 0. It keeps long content from pushing a flex or grid item out of its parent, and because the specificity is 0, giving `minWidth` makes it win, whether as a named size or a CSS length, regardless of declaration order.

## Stack · Inline

Stack puts children from top to bottom, and Inline from start to end. The `justify` of Stack is vertical distribution, so it shows when the Stack has a height. Inline centres by default, because in most cases an icon, text and a badge stand on one line. A line mixed with numbers uses `align="baseline"` to align the text baselines.

```tsx
<Surface as={Stack} fill="raised" border radius="md" padding="md" gap="sm">
  <Inline justify="between"><Text variant="label">Max wind speed</Text><Badge>Typhoon</Badge></Inline>
  <Text variant="title">165 kt</Text>
</Surface>
```

## Grid

The default of Grid's columns is 1. Giving a positive integer to columns · rows makes tracks of equal width, and CSS track strings are accepted too. A number that is not a positive integer is a `RangeError`. gap · rowGap · columnGap choose a Layout gap step. Track definitions are layout decided at run time, so they go to inline style, and spacing goes by class. `align` is vertical alignment inside a cell, `justify` is horizontal distribution when the tracks do not fill the container, and `justifyItems` is horizontal alignment inside a cell.

columns · rows accept a different value per width. Write it like `{ base: 1, md: "auto minmax(0, 1fr)" }`, where `base` is the narrowest window and a named step (`sm` · `md` · `lg` · `xl`) runs from its breakpoint to the next step. Without a `base`, columns defaults to 1 and rows to auto. Values, whether integers or track strings, follow the same rule, and the value of a step crosses over as a variable that the class reads in a media query.

An example that makes a two-column grid.

```tsx
<Grid columns={{ base: 1, md: 2 }} gap="md" align="start">
  <Surface border padding="md">First item</Surface>
  <Surface border padding="md">Second item</Surface>
</Grid>
```
