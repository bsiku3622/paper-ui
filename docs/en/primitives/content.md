# Content

The Content Primitive draws what is read on screen: text and icons. Neither takes a size as a number; both take the role names of Typography.

| Component | Public axes | Default |
| --- | --- | --- |
| Text | `as` · variant · ink · family=sans/mono · strong · numeric · truncate | variant=body, family=sans. Default tag: hero · headline · display · title=h1, heading=h2, subheading=h3, body · caption=p, label=span |
| Icon | size=label/caption/body/subheading · ink · SVG children · className · aria-label · aria-labelledby | size=body (inside a control, that control's `control.icon`). The artboard is Shape's icon ladder, viewBox 24, default currentColor |

## Text

`variant` decides size, weight, line height, letter spacing and default ink at once, and the tag is decided separately by `as`. Without `as`, it renders the default tag in the table above. Visual hierarchy and semantic tag are orthogonal, so the same `title` can be an `h1` on a page and an `h2` inside a dialog. The values for each role are in [Typography](../foundations/typography.md).

There is no prop to choose the size separately. `ink` can override the variant's default once.

| ink | Meaning |
| --- | --- |
| primary · secondary · tertiary | Same names as Color `ink.*` |
| info · success · warning · error | The `ink` of that status colour |
| inherit | Does not decide its own colour and takes the text colour of the parent surface: text on a coloured surface |

The names of the first three lines are the same as `INKS` in `/tokens`, and the `ink` of Icon uses the same vocabulary.

`family="mono"` can be put on any variant to switch to a monospaced typeface. Use it only for code, tokens and identifiers; for number columns, align the places with `numeric` instead of mono.

`numeric` draws only the numeric glyphs monospaced (`tabular-nums`). It leaves the typeface and alignment as they are, so use it where places must line up, such as number columns in tables or versions.

`strong` is one beat of emphasis. Omitted, it is the role's weight; `true` is the emphasis weight decided by the role ("Emphasis" in the [role table](../foundations/typography.md)); `false` is regular. Size, line height and letter spacing stay at the role's values. There is no prop to choose a weight name, so text of the same role does not split into several weights from screen to screen. A row heading in a table is `<Text strong>`, and 12px secondary text is `<Text variant="label" strong={false}>`.

`truncate` cuts to a single line instead of wrapping and draws overflowing text as an ellipsis. It releases the minimum width so that the cell can shrink, so it truncates inside the cells of Inline · Grid too. Assistive technology reads the text that was not truncated.

Line breaking is decided by the typeface. sans (the default) breaks Korean only between words (`keep-all`), and mono breaks anywhere (`anywhere`). The policy and its reasons are in [Typography › Line breaking](../foundations/typography.md#line-breaking).

```tsx
<Text as="h1" variant="title">Website renewal</Text>
<Text variant="caption">Last edited · today 10:42 AM</Text>
<Text variant="body" family="mono" ink="secondary">WEB-24</Text>
<Text variant="caption" ink="secondary" numeric>v0.1.0</Text>
```

## Icon

The system does not own an icon set. The app passes paths of a 24-unit viewBox as children (Lucide and others), and Paper UI decides size and stroke width. Size names are a subset of the Text role names and are tied together by type (`IconSize` is part of `TextVariant`). Next to `label` text use `size="label"` (14), and next to body text `body` (18). The stroke width is Shape's `stroke.icon` (1.75).

Without `size`, an Icon inside a control uses that control's `control.icon` (Shape), and elsewhere it uses body. The size a control decides comes down as a CSS variable that the inner Icon reads, and an explicit `size` always wins over it.

Without `ink`, it follows the parent's text colour (currentColor).

With `aria-label` or `aria-labelledby` it becomes a named image with `role="img"`, and with neither it is decoration and hidden from assistive technology.

```tsx
<Icon><path d="M12 5v14M5 12h14" /></Icon>
<Icon size="label" ink="secondary"><circle cx="12" cy="12" r="8" /></Icon>
<Icon aria-label="Warning" ink="warning"><path d="M12 8v5M12 16h.01" /></Icon>
```
