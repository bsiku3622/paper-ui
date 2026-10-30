# Field

Field Primitive는 입력과 그 설명 · 오류의 연결을 맡는 2차 primitive입니다. FormField는 label · 입력 · 설명 · 오류의 ID를 이어 주고 색은 입히지 않습니다. 같은 이름의 Atom `Field`(입력 상자)와 달리 이 primitive는 입력을 그리지 않고 입력의 접근성 관계만 만듭니다.

| 컴포넌트 | Hook | 책임 | 기본값 |
| --- | --- | --- | --- |
| FormField | useField | label, id, description, error, invalid, required, disabled, children 함수 | div wrapper. 실제 입력의 label · 설명 · 오류 관계 연결 |

## 입력과 설명의 관계

FormField는 label·입력·설명·오류의 ID를 연결합니다. 기존 Field Atom의 input group 계약은 유지합니다. Children 함수의 controlProps를 native label을 받을 수 있는 실제 입력에 전달합니다.

오류를 입력창의 접근성 설명에 연결하는 예시입니다.

```tsx
<FormField label="이메일" description="연락받을 주소" required
  invalid={invalid} error="이메일 형식을 확인해주세요.">
  {({ controlProps }) => <Field {...controlProps} type="email"
    status={invalid ? "error" : undefined} />}
</FormField>
```

[contract:primitives.form-field.relations]: #
FormField는 div에 label·children·description·error를 렌더링합니다. ClassName·style·ref는 wrapper를 가리키며 id 옵션은 입력 ID를 정합니다. 생략하면 useId로 고유 값을 만듭니다. ControlProps는 id·disabled·required·aria-invalid·aria-describedby를 연결합니다. Description은 존재할 때만, error는 invalid이며 존재할 때만 설명 ID에 포함합니다. 외부 aria-describedby도 중복 없이 유지합니다. 오류 해제 시 메시지와 참조를 함께 제거합니다.

[contract:primitives.form-field.parts]: #
FormField의 보이는 부분은 Typography 역할로 그려지고 `data-part`로 이름이 붙습니다. label은 Text `label`(`data-part="label"`), 설명은 Text `caption`(`data-part="description"`), 오류는 Text `caption`에 error 잉크를 입힌 것(`data-part="error"`)입니다. Label Atom과 같은 label 역할이라 나란히 놓아도 글자가 갈라지지 않습니다.

useField는 같은 FieldOptions와 controlProps·labelProps·descriptionProps·errorProps를 반환하며 DOM을 만들지 않습니다. 직접 사용할 때 선언한 description/error를 해당 ID로 렌더링해주세요. 시각적 status·validation·값 저장·제출·오류 요약 이동·비동기 알림은 소비자가 결정합니다.
