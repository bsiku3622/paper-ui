# Element

The Element Primitive is the single first-order base, Box. Box is not "a div that can be anything" but a cell on the ground. It only says how much padding is inside, how large it is, and what to do when it overflows. Surface, border, corners, elevation and theme are applied by the Surface of [Paint](paint.md), and accent × variant by Paint, so Box has no colour at all. It does not choose text colour either: ink is decided by Text and by Atoms that have colour. Position and flex layout are not opened either.

| Component | Public axes | Default |
| --- | --- | --- |
| Box | `as` · padding / paddingX / paddingY · width / minWidth / maxWidth · height / minHeight / maxHeight · overflow / overflowX / overflowY | div. Padding, size and clipping are all opt-in |

## Box — one cell

| prop | Values | Source |
| --- | --- | --- |
| `padding` · `paddingX` · `paddingY` | xs · sm · md · lg · xl · 2xl · 3xl | Shape `inset.*` |
| `width` · `minWidth` · `maxWidth` | xs ~ xl · `measure.xs` ~ `measure.xl` · `container.content` · full · fit · min-content · max-content · CSS length · number | Names come from Shape `dimension.width.*` · `measure.*` and Layout `container.*` |
| `height` · `minHeight` · `maxHeight` | xs ~ xl · full · fit · min-content · max-content · viewport · CSS length · number | Names come from Shape `dimension.height.*`, viewport from Layout `viewport` |
| `overflow` · `overflowX` · `overflowY` | visible · hidden · clip · scroll · auto | Keywords only |
| `hideBelow` | sm · md · lg · xl | Layout `breakpoint.*`: not drawn in a window narrower than that breakpoint |

Named sizes (a dimension like `md`, `measure.md`, `container.content`, and keywords like `full` · `fit`) all become classes. So no named size is left in the inline style, and a consumer's className can override a named size. The `style` the caller passes wins over both named sizes and lengths.

Only CSS lengths that are not names (a value like `42ch`) and numbers go to inline style. It is the passage for dimensions that exist only on that screen.

`hideBelow` does not draw the cell in a window narrower than that breakpoint. It takes no room and assistive technology does not read it. The root of Stack · Inline · Grid also decides `display`, so this is written as an important declaration, and at the width of the breakpoint the cell is visible. The steps and boundaries are the same as Grid's, so the width at which the sidebar is dropped and the width at which the columns collapse into one do not drift apart.

`overflow` · `overflowX` · `overflowY` accept only five keywords and all become classes. They are not properties that take lengths, so there is no escape.

The padding axes (`padding` · `paddingX` · `paddingY`) come from one map (`BOX_STYLE`). The prop type, the list of props Box does not pass to the DOM, and the class all iterate the same keys, so adding an axis grows all three together.

Among size names, `xs ~ xl` are Shape's dimensions; the reading width of a block of text is called `measure.md` and the maximum width of the body grid `container.content`, with the family put in front. A dimension that exists only on that screen is given directly as a CSS length. When a surface or border is needed, do not add it onto Box; use [Surface](paint.md#surface--the-plane).

```tsx
<Box as="section" padding="lg">…</Box>
<Box maxWidth="container.content" width="full" paddingX="xl">…</Box>
```
