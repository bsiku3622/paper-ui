# Field

The Field Primitive is the second-order primitive that owns the connection of an input to its description and error. FormField links the IDs of label, input, description and error and puts on no colour. Unlike the Atom `Field` of the same name (the input box), this primitive draws no input and only creates the accessibility relations of an input.

| Component | Hook | Responsibility | Default |
| --- | --- | --- | --- |
| FormField | useFormField · useFormFieldControl | label, id, description, error, invalid, required, disabled, children (a node or a snapshot function) | div wrapper. Connects the label, description and error relations of one input through context |

## Input and description relations

FormField connects the IDs of label, input, description and error through context. When an input placed inside calls `useFormFieldControl`, the field's id, relations and state reach that input. The Field · Textarea · Select · Checkbox · Radio · Switch Atoms already call it, so they only need to be placed inside.

An example that connects an error to the accessible description of the input.

```tsx
<FormField label="Email" description="Address to contact you at" required
  invalid={invalid} error="Check the email format.">
  <Field type="email" />
</FormField>
```

Field gets `aria-invalid` and the error boundary by itself when FormField is invalid, so status is not passed separately. The `status` and `aria-invalid` of an input fill in from each other, and giving one of them is enough. Checkbox · Radio · Switch have only `error` as `status`, but they follow the same rule.

FormField renders label, children, description and error in a div. ClassName, style and ref point to the wrapper, and the id option decides the input ID. If omitted, a unique value is made with useId. The label's `htmlFor` points to that ID, and the input receives id · disabled · required · aria-invalid · aria-describedby. Description is included in the description ID only when it exists, and error only when it is invalid and exists. An external aria-describedby is also kept without duplicates. When the error is cleared, the message and the reference are removed together.

FormField is for one input. The input uses the field's id (giving another id is a development error and the field's id wins), disabled and required are the input's value plus the field's value (OR), and aria-describedby follows the input's own id with the field's id, without duplicates. Two inputs in one field is a development error. A field does not cross a Portal. An input moved by Portal, like a panel opened from a field, has no relation to that field, and a FormField inside a Portal binds its own input separately.

`aria-invalid` is the value the input gave directly if there is one (`aria-invalid={false}` wins too), and otherwise `true` when the status is error or the field is invalid. If neither, the attribute is absent. `controlProps` contains only keys that have a value, and no key is undefined. `useFormFieldControl` is the sole owner of this rule, so an Atom spreads its own props first and `controlProps` last, so that the spreading order does not decide aria-invalid.

An input built directly receives the same relations through `useFormFieldControl`.

```tsx
function PinInput({ status, ...props }: PinProps) {
  const { controlProps, visualStatus } = useFormFieldControl({ ...props, status });
  return <input {...props} {...controlProps} data-status={visualStatus} />;
}
```

`useFormFieldControl({ id, disabled, required, "aria-invalid", "aria-describedby", status })` returns `controlProps`, `isInvalid`, `visualStatus` and `isInField`. `isInvalid` is the result of the rule above, and `visualStatus` is the status the input should draw: `error` if invalid, otherwise the status it received. It works by the same rule outside FormField too (`isInField` is `false`).

children is either a node or a snapshot function `({ isDisabled, isInvalid, isRequired }) => node`. The snapshot is read-only, and is where to use values derived from the field's state, such as the input's status. FormField has a fixed structure, so it does not accept `as`.

The root of FormField stacks vertically and holds the spacing between label, input, description and error by itself (Layout `gap.xs`). There is no need to put another Stack inside.

The visible parts of FormField are drawn with Typography roles and named by `data-part`. The label is Text `label` (`data-part="label"`), the description is Text `caption` (`data-part="description"`), and the error is Text `caption` with error ink (`data-part="error"`). It is the same label role as the Label Atom, so the text does not diverge when they are placed side by side.

useFormField accepts the same FormFieldOptions and returns FormFieldResult (controlProps · labelProps · descriptionProps · errorProps) and makes no DOM. Use it to assemble the relations directly without FormField; its controlProps also contains only keys that have a value. Form is put in the name so that it does not collide with the Atom `Field` of the same name. The wrapper announces its own state with data-disabled · data-invalid · data-required. When using it directly, render the declared description/error with the corresponding IDs. Visual status, validation, value storage, submission and moving to an error summary are decided by the consumer, and asynchronous announcements use [LiveRegion](a11y.md#announcing-state-changes).
