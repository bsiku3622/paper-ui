# Field

Field Primitive는 입력과 그 설명 · 오류의 연결을 맡는 2차 primitive입니다. FormField는 label · 입력 · 설명 · 오류의 ID를 이어 주고 색은 입히지 않습니다. 같은 이름의 Atom `Field`(입력 상자)와 달리 이 primitive는 입력을 그리지 않고 입력의 접근성 관계만 만듭니다.

| 컴포넌트 | Hook | 책임 | 기본값 |
| --- | --- | --- | --- |
| FormField | useFormField · useFormFieldControl | label, id, description, error, invalid, required, disabled, children(노드 또는 스냅샷 함수) | div wrapper. 입력 하나의 label · 설명 · 오류 관계를 context로 연결 |

## 입력과 설명의 관계

FormField는 label · 입력 · 설명 · 오류의 ID를 context로 연결합니다. 안에 둔 입력이 `useFormFieldControl`을 부르면 field의 id와 관계, 상태가 그 입력에 닿습니다. Field · Textarea · Select · Checkbox · Radio · Switch Atom은 이미 부르고 있어서, 안에 두기만 하면 됩니다.

오류를 입력창의 접근성 설명에 연결하는 예시입니다.

```tsx
<FormField label="이메일" description="연락받을 주소" required
  invalid={invalid} error="이메일 형식을 확인해주세요.">
  <Field type="email" />
</FormField>
```

Field는 FormField가 invalid일 때 `aria-invalid`와 error 경계를 스스로 얻으므로 status를 따로 넘기지 않습니다. 입력의 `status`와 `aria-invalid`는 서로에게서 채워지고, 둘 중 하나만 주면 됩니다.

[contract:primitives.form-field.relations]: #
FormField는 div에 label · children · description · error를 렌더링합니다. ClassName · style · ref는 wrapper를 가리키며 id 옵션은 입력 ID를 정합니다. 생략하면 useId로 고유 값을 만듭니다. label의 `htmlFor`는 그 ID를 가리키고, 입력은 id · disabled · required · aria-invalid · aria-describedby를 받습니다. Description은 존재할 때만, error는 invalid이며 존재할 때만 설명 ID에 포함합니다. 외부 aria-describedby도 중복 없이 유지합니다. 오류 해제 시 메시지와 참조를 함께 제거합니다.

[contract:primitives.form-field.control]: #
FormField는 입력 하나를 위한 것입니다. 입력은 field의 id를 쓰고(다른 id를 주면 개발 오류이고 field의 id가 이깁니다), disabled와 required는 입력의 값과 field의 값을 더한 것(OR)이며, aria-describedby는 입력 자신의 id 뒤에 field의 id를 중복 없이 잇습니다. 한 field 안에 입력이 둘이면 개발 오류입니다. field는 Portal을 넘지 않습니다. field에서 연 패널처럼 Portal로 옮겨진 입력은 그 field와 관계가 없고, Portal 안의 FormField는 자기 입력을 따로 묶습니다.

[contract:primitives.form-field.invalid]: #
`aria-invalid`는 입력이 직접 준 값이 있으면 그 값이고(`aria-invalid={false}`도 이깁니다), 없으면 error status이거나 field가 invalid일 때 `true`입니다. 어느 쪽도 아니면 속성이 없습니다. `controlProps`에는 값이 있는 키만 들어 있고 undefined인 키는 없습니다. `useFormFieldControl`이 이 규칙의 유일한 주인이라, Atom은 자기 props를 먼저 펼치고 `controlProps`를 마지막에 펼쳐 펼치는 순서가 aria-invalid를 정하지 않게 합니다.

직접 만든 입력은 `useFormFieldControl`로 같은 관계를 받습니다.

```tsx
function PinInput({ status, ...props }: PinProps) {
  const { controlProps, visualStatus } = useFormFieldControl({ ...props, status });
  return <input {...props} {...controlProps} data-status={visualStatus} />;
}
```

`useFormFieldControl({ id, disabled, required, "aria-invalid", "aria-describedby", status })`는 `controlProps`, `isInvalid`, `visualStatus`, `isInField`를 돌려줍니다. `isInvalid`는 위 규칙의 결과이고, `visualStatus`는 입력이 그려야 할 status입니다 — invalid이면 `error`, 아니면 받은 status입니다. FormField 밖에서도 같은 규칙으로 동작합니다(`isInField`는 `false`).

[contract:primitives.form-field.snapshot]: #
children은 노드이거나 스냅샷 함수 `({ isDisabled, isInvalid, isRequired }) => 노드`입니다. 스냅샷은 읽기 전용이고, 입력의 status처럼 field의 상태에서 파생하는 값을 쓰는 곳입니다. FormField는 구조가 고정되어 있어 `as`를 받지 않습니다.

[contract:primitives.form-field.parts]: #
FormField의 보이는 부분은 Typography 역할로 그려지고 `data-part`로 이름이 붙습니다. label은 Text `label`(`data-part="label"`), 설명은 Text `caption`(`data-part="description"`), 오류는 Text `caption`에 error 잉크를 입힌 것(`data-part="error"`)입니다. Label Atom과 같은 label 역할이라 나란히 놓아도 글자가 갈라지지 않습니다.

useFormField는 같은 FormFieldOptions를 받아 FormFieldResult(controlProps · labelProps · descriptionProps · errorProps)를 반환하며 DOM을 만들지 않습니다. FormField 없이 관계만 직접 조립할 때 쓰고, 그 controlProps에도 값이 있는 키만 들어 있습니다. 같은 이름의 Atom `Field`와 겹치지 않도록 이름에 Form을 붙였습니다. wrapper는 data-disabled · data-invalid · data-required로 자기 상태를 알립니다. 직접 사용할 때 선언한 description/error를 해당 ID로 렌더링해주세요. 시각적 status · validation · 값 저장 · 제출 · 오류 요약 이동은 소비자가 결정하고, 비동기 알림은 [LiveRegion](a11y.md#상태-변화-알리기)을 씁니다.
