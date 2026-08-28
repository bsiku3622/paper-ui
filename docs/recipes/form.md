# Form

입력 화면 하나를 짓습니다. 라벨·입력·선택·토글·버튼을 어떻게 앉히고, 검증 표시가 어디서 오는지를 봅니다. 핵심은 하나입니다 — **정렬과 상태 색은 시스템이 정하고, 여러분은 배치와 의미만 고릅니다.**

## 한 컬럼 폼

세로로 쌓는 폼은 `Stack`으로 묶고, 라벨이 붙는 입력은 `TextField`로 냅니다. `TextField`가 Label + Field + 도움말을 한 묶음으로 내고 id 연결까지 대신하므로, 손으로 `htmlFor`를 잇지 않아도 됩니다.

```tsx
<Stack gap="lg" style={{ maxWidth: "22rem" }}>
  <TextField label="이름" placeholder="홍길동" />
  <TextField label="이메일" type="email" placeholder="you@example.com" hint="로그인에 씁니다" />

  <Stack gap="xs">
    <Label htmlFor="role">역할</Label>
    <Select id="role" options={[
      { value: "dev", label: "개발" },
      { value: "design", label: "디자인" },
      { value: "pm", label: "기획" },
    ]} />
  </Stack>

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

`Select`는 라벨을 스스로 갖지 않으므로, 라벨이 필요하면 `Label` + `Select`를 `Stack gap="xs"`로 묶습니다. `Checkbox`·`Switch`는 라벨과 나란히 두어 `Inline as="label"`로 감싸면 글자를 눌러도 토글됩니다.

## 검증은 status로

틀린 입력은 boolean을 흩뿌리지 않고 `status` 축 하나로 말합니다. `TextField`는 `error` 문구를 주면 그것만으로 error 상태가 되어 — 테두리가 빨개지고 문구가 빨간 caption으로 붙습니다. 상태를 두 번 적지 않습니다.

```tsx
<TextField
  label="비밀번호"
  type="password"
  error="8자 이상이어야 합니다"
/>
```

`Field`를 직접 쓸 때도 같은 축입니다 — `status="error"`가 테두리를 빨갛게 하고 `aria-invalid`를 함께 세웁니다. 포커스하면 상태 색보다 파란 포커스 링이 이깁니다(지금 무엇을 만지는지가 먼저입니다).

```tsx
<Field status="error" placeholder="필수 항목" />
```

## 왜 이렇게

정렬은 여러분이 맞추는 게 아닙니다. `Field`·`Button`·`Select`가 같은 `height.md.interaction`(34px)을 토큰에서 읽어, 한 줄에 나란히 두면 baseline이 저절로 맞습니다. 상태 색도 `status` 하나로 모든 입력이 같은 규칙을 돌기 때문에, Field와 TextField의 error 상태가 조용히 달라질 수 없습니다. 폼에서 여러분이 정하는 것은 *무엇을 묻는가*(라벨)와 *어떻게 배치하는가*(Stack/Inline)뿐입니다.
