# Calendar · DatePicker

Calendar is the Component that chooses one date on a month grid, and DatePicker is the Component whose button, in the shape of an input frame, opens a Calendar as a popup. The scope is one date: a field to type a date in, a range, a time and several months at once are not in this version. Keyboard movement, focus and calendar arithmetic are left to the React Aria calendar ([the React Aria boundary](../primitives/a11y.md)), and Paper does all the drawing.

| Component | Main props | Default | Responsibility |
| --- | --- | --- | --- |
| Calendar | value · defaultValue · onValueChange · min · max · isDateUnavailable · marked · size · shape · disabled · focusOnMount | size xs / shape rounded, no value | The month grid, paging, choosing a day, the keyboard. It puts on no face |
| DatePicker | the value props of Calendar · placeholder · name · form · status · size · fontSize · shape · variant · fill · shadow · disabled · required | size md / shape rounded / hairline, empty | The button, the popup, focus back on close, the form value |

## Value

A date is a `"YYYY-MM-DD"` string. `value` is controlled and `defaultValue` uncontrolled (`null` is an empty value), and choosing a day calls `onValueChange(value)` with a string of the same form. A string that cannot be read is read as no value. The chosen day takes a primary solid face, today takes one hairline and bold text with no face, and every other day is a faceless ghost. Cells outside the shown month stay empty. The month shown first is the value's, or today's when there is none.

Days outside `min` and `max` (the same strings) and days that `isDateUnavailable(date)` calls unavailable are drawn disabled and cannot be pressed. The previous and next buttons are disabled too on the side of a month that `min` or `max` shuts. The disabled look is the same disabled state as the other controls.

`marked` is a list of date strings, and a small dot sits under the number of each. The dot takes the paint of the Badge `dot` and follows the text colour, so it reads on the chosen day too. A dot only tells the eye (`aria-hidden`), so a screen that has to read out what it means writes it as text beside the day.

## Keyboard and locale

One day is the tab stop, and inside it the arrow keys move by a day or a week, PageUp and PageDown by a month, and Home and End to the first and last day of the month. Enter and Space choose. Crossing a month takes the shown month along, and the header with the previous and next buttons is reached with Tab.

Month names, weekday names, the first day of the week and the labels of the days (`aria-label`) follow the `locale` of [PaperProvider](../primitives/README.md), or the document's `lang` without one. `ko` starts on Sunday and `en-GB` on Monday. The names of the previous and next buttons are locale words too, and they are not in the `messages` list of Paper. `Intl` decides how a date is written.

## Form

A day is a Control icon anatomy, so it follows the ladder of `size`: xs (32) by default, and the previous and next `IconButton` (`muted`) in the header have the same size. `shape` follows the app's [controlShape](../foundations/shape.md) and is rounded by default. Calendar is a grid that puts on no face, so on a card the parent decides the face (the popup of DatePicker is a raised face). `ref` goes to the outer element, and `className`, `data-testid` and the other attributes go to the same element. With `disabled` every day and button is disabled.

## DatePicker

The button writes the chosen day in the locale's medium date (`Intl.DateTimeFormat`, such as `Nov 20, 2026` or `2026. 11. 20.`) in the same input frame as [Field and Select](../atoms/README.md#common-axes), with a calendar icon on the right. With no value it writes the `placeholder` in tertiary ink, and stays empty without one. The button announces `aria-haspopup="dialog"` and `aria-expanded`, and once open `aria-controls` points at the popup's id. The popup is named by the button's `aria-label` or the text of its `<label>`. When it opens, focus goes to the chosen day of the Calendar, or today without one.

The popup is a popover of [Floating](../primitives/float.md) (role dialog) holding the Calendar on a raised face. Choosing a day sets the value, calls `onValueChange`, closes the popup and returns focus to the button. Escape and a press outside close it without changing the value. `min`, `max`, `isDateUnavailable` and `marked` go to the Calendar. With `value` the app holds the value and the chosen day is told only through `onValueChange`.

With `name`, a hidden input sends the ISO value with the form (`form` can attach it to another form), and the value is an empty string when there is none. A required empty DatePicker is a missing value to the form check, and the focus a browser points at goes to the button. When the form resets it returns to `defaultValue`. With `disabled` it does not open and sends no value. Inside a [FormField](../primitives/field.md) it takes `id`, `disabled`, `required`, `aria-invalid`, `aria-describedby` and the status edge as Field does.

`status`, `size`, `fontSize`, `shape`, `variant`, `fill` and `shadow` are the same axes as in Field and Select and mean the same. `ref` goes to the button, and `className`, `style` and `data-testid` to the input frame (the outer element). The width fills the parent, so the app decides it.

```tsx
<DatePicker
  aria-label="Due date"
  name="due"
  min="2026-11-01"
  marked={["2026-11-12"]}
  onValueChange={save}
/>
```
