# Dialog

"새로 만들기"를 `Modal` 안에 폼을 담아 처리합니다. 앞의 [폼 한 벌](/docs/recipes/form)과 [필터 + 데이터 표](/docs/recipes/data-view)를 잇는 조각입니다 — 표에서 "새 이슈"를 누르면 뜨는 그 화면.

## 열림 상태

`Modal`은 자기 열림을 들지 않습니다 — `open` 불리언을 여러분이 `useState`로 들고, `onOpenChange`로 바깥 상태와 연결합니다. Esc와 배경 클릭, `Modal.Close`는 모두 같은 통로로 닫힙니다. `size`는 시각 강조가 아니라 담는 일의 폭입니다. 확인 한 줄은 `sm`, 일반 form은 기본 `md`, 비교나 복합 form은 `lg`를 고릅니다.

```tsx
const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>새 이슈</Button>

<Modal open={open} onOpenChange={setOpen} size="md">
  <Modal.Header>
    <Modal.Title>새 이슈</Modal.Title>
    <Modal.Description>새 작업의 제목과 분류를 정합니다.</Modal.Description>
  </Modal.Header>
  <Modal.Body>{/* 본문 — 폼 */}</Modal.Body>
  <Modal.Footer>
    <Modal.Close variant="quiet">취소</Modal.Close>
    <Modal.Close>만들기</Modal.Close>
  </Modal.Footer>
</Modal>
```

`Header · Title · Description · Body · Footer · Close`가 구조를 드러냅니다. Title과 Description의 접근성 id는 자동으로 dialog에 연결됩니다. 1차 액션은 검정 `solid`(기본값), 물러나는 액션은 `quiet`로 조용히 둡니다 — 둘의 무게 차이가 눈을 만들 곳으로 이끕니다.

## 본문에 폼을 담는다

Modal 본문은 `Modal.Body` 안에 [폼 한 벌](/docs/recipes/form)의 조각을 그대로 넣습니다. 좁은 다이얼로그라 한 컬럼 `Stack`이 자연스럽고, 두 필드를 나란히 두려면 `Inline`으로 감싸 각각 `flex: 1`을 줍니다.

```tsx
<Modal.Body><Stack gap="lg">
  <TextField label="제목" placeholder="무엇을 해야 하나요" />
  <Inline gap="md" align="start">
    <Stack gap="xs" style={{ flex: 1 }}>
      <Label htmlFor="state">상태</Label>
      <Select id="state" options={[
        { value: "todo", label: "할 일" },
        { value: "doing", label: "진행" },
      ]} />
    </Stack>
    <Stack gap="xs" style={{ flex: 1 }}>
      <Label htmlFor="priority">우선순위</Label>
      <Select id="priority" options={[
        { value: "normal", label: "보통" },
        { value: "high", label: "높음" },
      ]} />
    </Stack>
  </Inline>
</Stack></Modal.Body>
```

## 되돌릴 수 없는 확인

삭제처럼 되돌릴 수 없는 흐름은 1차 액션을 `color="error"`로 물들입니다 — 이 색은 "이건 위험하다"는 뜻을 질 때만 씁니다. 옆에 `Alert`를 얹어 결과를 미리 말해두면 더 분명합니다.

```tsx
<Modal open={open} onOpenChange={setOpen} size="sm">
  <Modal.Header><Modal.Title>이슈 삭제</Modal.Title></Modal.Header>
  <Modal.Body>
    <Alert color="error">
      <Alert.Title>되돌릴 수 없습니다</Alert.Title>
      <Alert.Description>이 이슈와 하위 댓글이 모두 지워집니다.</Alert.Description>
    </Alert>
  </Modal.Body>
  <Modal.Footer>
    <Modal.Close variant="quiet">취소</Modal.Close>
    <Button color="error" onClick={remove}>삭제</Button>
  </Modal.Footer>
</Modal>
```

## 왜 이렇게

`Modal`은 열림·Esc·배경 클릭·그림자·진입 애니메이션과 header/body/footer의 고정·스크롤 관계까지 다 정합니다 — 떠 있는 것만 그림자를 갖는다는 규칙(원칙 4)을 여러분이 지키지 않아도, Modal이 대신 지킵니다. 여러분이 정하는 것은 *무엇을 만들지*(본문 폼)와 *액션의 무게*(footer의 solid/quiet/error)뿐입니다.
