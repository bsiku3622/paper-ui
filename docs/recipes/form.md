# Form

입력 화면 하나를 짓습니다. 라벨·입력·선택·토글·버튼을 어떻게 앉히고, 검증 표시가 어디서 오는지를 봅니다. 핵심은 하나입니다 — **정렬과 상태 색은 시스템이 정하고, 여러분은 배치와 의미만 고릅니다.**

## 한 컬럼 폼

세로로 쌓는 폼은 `Stack`으로 묶고, 라벨이 붙는 모든 입력은 `FormField`로 냅니다. Field·Select·Textarea가 같은 compound 구조를 공유하며, Root가 id와 설명 관계를 연결하므로 손으로 `htmlFor`를 잇지 않아도 됩니다.

```tsx
<Stack gap="lg" style={{ maxWidth: "22rem" }}>
  <FormField>
    <FormField.Label>이름</FormField.Label>
    <FormField.Control><Field placeholder="홍길동" /></FormField.Control>
  </FormField>

  <FormField>
    <FormField.Label>이메일</FormField.Label>
    <FormField.Control><Field type="email" placeholder="you@example.com" /></FormField.Control>
    <FormField.Hint>로그인에 씁니다.</FormField.Hint>
  </FormField>

  <FormField>
    <FormField.Label>역할</FormField.Label>
    <FormField.Control><Select>
      <Select.Option value="dev">개발</Select.Option>
      <Select.Option value="design">디자인</Select.Option>
      <Select.Option value="pm">기획</Select.Option>
    </Select></FormField.Control>
  </FormField>

  <Inline as="label" gap="sm" align="center">
    <Checkbox />
    <Text variant="body" as="span">약관에 동의합니다</Text>
  </Inline>

  <Inline gap="sm">
    <Button>저장</Button>
    <Button variant="quiet">취소</Button>
  </Inline>
</Stack>
```

hint나 error part를 추가하면 Root가 `aria-describedby`와 `aria-invalid`까지 연결합니다. Root의 `align`은 Label·Control·메시지 묶음의 정렬이고, Field의 `align`은 입력값의 정렬이라 서로 다른 축입니다. `Checkbox`·`Switch`는 라벨과 나란히 두어 `Inline as="label"`로 감싸면 글자를 눌러도 토글됩니다.

## 검증은 status로

틀린 입력의 시각 상태는 control의 `status` 축으로, 설명은 FormField의 Error part로 말합니다. FormField는 어떤 control도 받을 수 있어 pigment를 추측하지 않고 접근성 관계만 공통으로 소유합니다.

```tsx
<FormField>
  <FormField.Label>비밀번호</FormField.Label>
  <FormField.Control>
    <Field type="password" status="error" />
  </FormField.Control>
  <FormField.Error>8자 이상이어야 합니다.</FormField.Error>
</FormField>
```

`status="error"`가 테두리를 빨갛게 하고, FormField.Error가 `aria-invalid`와 설명 id를 함께 세웁니다. 포커스하면 상태 색보다 파란 포커스 링이 이깁니다(지금 무엇을 만지는지가 먼저입니다).

```tsx
<Field status="error" placeholder="필수 항목" />
```

## 왜 이렇게

컨트롤 높이는 여러분이 맞추는 게 아닙니다. `Field`·`Button`·`Select`가 같은 `height.md.interaction`(34px)을 토큰에서 읽어 한 줄에 나란히 두면 baseline이 저절로 맞습니다. FormField의 `align`은 특별한 중앙·끝 정렬이 필요할 때만 바꾸며 기본 `stretch`에서는 control이 가용 폭을 채웁니다. 폼에서 여러분이 정하는 것은 *무엇을 묻는가*(라벨)와 *어떻게 배치하는가*(Stack/Inline)뿐입니다.
