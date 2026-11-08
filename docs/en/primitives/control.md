# Control

Control is the second-order Primitive that adds size to Box. A single `size` decides height, padding, corners, text and the size of the icon inside together, and `anatomy` decides what is drawn with that size. The form of every Atom that has a size comes from here. An Atom is Control (size), Paint (colour) and a behaviour (Press · Select · Field) put together.

| Component | Public axes | Default |
| --- | --- | --- |
| Control | the whole of Box + `size` · `anatomy` · `shape` · `fontSize` · `strong` · `gap` · `align` · `justify` · `iconSize` | md · label · rounded. No colour or line |

Atoms reach the control size through one class function, `controlClass({ size, anatomy, shape, fontSize, strong, gap, align, justify, iconSize })`. `Control` is a single Box that wears that class, and it accepts `as`, the ref and the props of Box as they are.

## Size and shape

Size only decides values, and shape only reads those values. So fixing one size makes every shape follow, and adding one shape does not require writing it out again for each size. The same holds when each shape has a different ladder of values: size decides one more variable and the shape just picks it. The values come from the roles of [Shape](../foundations/shape.md#control) and the formula of [second-order Control](../foundations/README.md#control).

| `anatomy` | What it draws | Used by |
| --- | --- | --- |
| `label` | The text decides the box. Height and generous padding, content centred | Button |
| `icon` | A square whose side is the height. It does not shrink even in a full row | IconButton |
| `input` | The box exists first and the text sits inside it | Field |
| `frame` | Decides only the height. The padding belongs to the inner element | Select |
| `area` | The height is decided by the number of lines. Decides only the padding | Textarea |
| `mark` | A square the size of a selection box. It stands next to text, so it does not follow the control height | Checkbox · Radio |
| `track` | A bar derived from the selection box. Its height is the handle plus the rim and its width is twice the height | Switch |
| `badge` | A box that holds one word. Height and padding are its own source, and the text is fixed regardless of size | Badge |
| `spinner` | A diameter the size of the control's icon | Spinner |
| `segment` | A track of the control height. The row of cells inset by `inset.xs` decides the width | SegmentControl |
| `slider` | A bar that fills the whole width. Its height is the same as the Switch track | Slider |

`shape="pill"` turns the corners into a pill. The text preset is chosen by the anatomy: `label` · `icon` · `segment` use button, `input` and `frame` use field, `area` uses textarea, `badge` uses badge, and `mark` · `track` · `spinner` · `slider` have no text. Corners follow the anatomy too. A box has the control curve that fits its size, and the corners of `mark` · `track` · `spinner` are decided by each Atom.

## Content arrangement

`gap` · `align` · `justify` are how the content inside the box is laid out, and they are chosen separately from the size. The vocabulary is the same as Inline's: `SPACES` · `ALIGNS` · `JUSTIFIES`. When not given, the anatomy's default is used. `label` and `icon` are centred both ways with `control.gap`, `badge` is vertically centred and packed to the start with an `xs` gap, and the gap of `input` is `control.gap`. They have meaning in the anatomies that lay out content (`label` · `icon` · `badge` · `input`). Among Atoms, Button and Badge accept all three, and Field accepts only the `gap` between the adornment, the input and the action. The input fills the remaining width, so there is no `justify`, and the text alignment of the input value is another axis called `textAlign`.

Control paints no colour and draws no line. Colour and line belong to [Paint](paint.md), and pressing to [Press](press.md). Assembling a single line is done by [Line](../foundations/README.md#line).

The size is decided by CSS variables, so inner elements read the same values. That is the case for the arrow and the place where the value stops in Select, the line box of a Field input value, and the Icon inside. The variables are declared on the control itself, so even if a source is overridden above, they are recalculated in that place.

```tsx
import { Control, Icon, Paint } from "@studio-baeks/paper-ui";

export const Row = () => (
  <Control as={Paint} accent="primary" variant="soft" size="sm" justify="start">
    <Icon><path d="M12 5v14M5 12h14" /></Icon>
    Add item
  </Control>
);
```
